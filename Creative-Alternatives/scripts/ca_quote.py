"""
Creative Alternatives — Quoting Engine (SKELETON)

Turns an inbound request ("60 tees + 60 sweatshirts for Camp X") into a DRAFT
quote, using CA's own 27-year pricing history + the per-product anchors in
config/ca_quote.yaml. It does NOT send anything and does NOT set final prices —
it produces a Kenny-ready draft with the judgment calls flagged as [KENNY: ...].

Why this exists: the GTM pressure-test found the reply->quote->close path is the
real bottleneck — HOT deals stall because every quote waits on Kenny to hand-price
it. This removes the blank-page problem: Kenny opens a draft that already has
comparable pricing, a margin-floor check, and the customer's history attached, and
just confirms/edits the judgment calls.

STATUS: skeleton. What works today (below) vs. what's stubbed for later phases is
documented in pillars/1-operations/quoting-automation-spec.md.

Usage:
    # from a JSON request file
    .venv/bin/python scripts/ca_quote.py --request path/to/request.json
    # or inline
    .venv/bin/python scripts/ca_quote.py --customer "Camp Becket" \
        --items "tee:60, sweatshirt:60"

Request JSON shape:
    {
      "customer": "Camp Becket",
      "category": "Camp",            # optional — inferred from history if omitted
      "rush": false,                 # optional
      "items": [{"product": "tee", "qty": 60}, {"product": "sweatshirt", "qty": 60}]
    }
"""

import argparse
import json
import re
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
from llm import llm_complete  # noqa: E402
from cost_lookup import lookup_cost, sell_from_cost, full_breakdown  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "data" / "data.db"
CONFIG_PATH = ROOT / "config" / "ca_quote.yaml"
OUT_DIR = ROOT / "outputs" / "quotes"


def load_config():
    with open(CONFIG_PATH) as f:
        return yaml.safe_load(f)


def resolve_product(raw, cfg):
    """Free-text product word -> canonical price_anchors key (or None)."""
    key = raw.strip().lower()
    key = cfg["aliases"].get(key, key)
    if key in cfg["price_anchors"]:
        return key
    # loose contains-match against anchor keys and aliases
    for alias, target in cfg["aliases"].items():
        if alias in key:
            return target
    for anchor in cfg["price_anchors"]:
        if anchor.replace("_", " ") in key or anchor in key:
            return anchor
    return None


def infer_category(conn, customer):
    """Most common category on this customer's ledger history."""
    row = conn.execute(
        """SELECT category, COUNT(*) n FROM sales_ledger
           WHERE customer LIKE ? AND category IS NOT NULL AND category != ''
           GROUP BY category ORDER BY n DESC LIMIT 1""",
        (f"%{customer}%",),
    ).fetchone()
    return row["category"] if row else None


def customer_history(conn, customer, cfg):
    """Recent clean orders for this customer — context for the human."""
    c = cfg["comparables"]
    rows = conn.execute(
        """SELECT date, manufacturer, retail, profit,
                  CASE WHEN retail>0 THEN profit*1.0/retail END AS margin
           FROM sales_ledger
           WHERE customer LIKE ? AND retail >= ?
             AND date >= date('now', ?)
           ORDER BY date DESC LIMIT 8""",
        (f"%{customer}%", c["min_retail"], f"-{c['lookback_years']} years"),
    ).fetchall()
    out = []
    for r in rows:
        m = r["margin"]
        if m is None or m > c["max_margin_abs"] or m < c["min_margin_abs"]:
            continue
        out.append(dict(r))
    return out


def customer_typical_margin(history, floor):
    """Blended margin from the customer's clean recent history, else the floor."""
    vals = [h["margin"] for h in history if h["margin"] is not None]
    if not vals:
        return None
    return sum(vals) / len(vals)


def price_line(conn, product_key, display, qty, cfg, target_margin, use_web=True):
    """
    Produce a draft price line for one item.
    Phase 2b: cost-first. Look up the blank cost (ledger history → web estimate),
    then sell = cost / (1 - target margin). Falls back to the config anchor
    (blended avg selling price) only when no cost data exists.
    """
    anchor = cfg["price_anchors"].get(product_key)
    info = lookup_cost(conn, cfg, product_key, display=display, use_web=use_web) if target_margin else {"cost": None}
    cost = info.get("cost")
    # Full cost breakdown: blank + decoration + freight → sell at target margin.
    bd = full_breakdown(product_key, qty, cost, cfg, target_margin) if cost else None
    unit = bd["sell"] if bd and bd.get("sell") else (sell_from_cost(cost, target_margin) if cost else anchor)
    ext = round(unit * qty, 2) if unit else None
    if bd and bd.get("unit_cost"):
        basis = (f"cost ${bd['unit_cost']:.2f} all-in ({info['source']}) → sell @ {target_margin*100:.0f}%")
    elif cost and unit:
        basis = f"cost ${cost:.2f} ({info['source']}) → sell @ {target_margin*100:.0f}% margin"
    else:
        basis = "config anchor (blended avg — NO cost data; Kenny supplies blank cost)"
    return {
        "product": product_key,
        "qty": qty,
        "unit_price": unit,
        "extended": ext,
        "unit_cost": bd["unit_cost"] if bd else cost,
        "breakdown": bd,
        "cost_source": info.get("source"),
        "cost_confidence": info.get("confidence"),
        "cost_note": info.get("note"),
        "competitor_price": info.get("competitor_price"),
        "basis": basis,
    }


def category_comps(conn, category, cfg, limit=8):
    """Recent clean orders in this vertical across ALL customers — what similar
    accounts actually paid and the margins Kenny actually took. This is the
    Phase 2a upgrade: draft lines priced from real comparable orders, not just
    the blended config anchor."""
    c = cfg["comparables"]
    rows = conn.execute(
        """SELECT date, customer, manufacturer, retail, profit,
                  CASE WHEN retail>0 THEN profit*1.0/retail END AS margin
           FROM sales_ledger
           WHERE category = ? AND retail >= ?
             AND date >= date('now', ?)
           ORDER BY date DESC LIMIT 40""",
        (category, c["min_retail"], f"-{c['lookback_years']} years"),
    ).fetchall()
    out = []
    for r in rows:
        m = r["margin"]
        if m is None or m > c["max_margin_abs"] or m < c["min_margin_abs"]:
            continue
        out.append(dict(r))
        if len(out) >= limit:
            break
    return out


def llm_quote_notes(quote, comps, cfg):
    """The reasoning layer. Hands the LLM the request + this customer's history
    + vertical comps + the floor, and gets back: a suggested price per line
    (with reasoning), the right margin posture, upsell suggestions, and the
    exact judgment calls Kenny still has to make. Returns None on failure so
    the engine degrades to anchors-only (never blocks a draft)."""
    lines_desc = "\n".join(
        f"- {l['qty']}x {l['product']}: sell ${l['unit_price']}/unit (ext ${l['extended']})"
        + (f" | blank cost ${l['unit_cost']} ({l.get('cost_source')}, {l.get('cost_confidence')})" if l.get("unit_cost") else " | NO cost data")
        + (f" | competitor retail ${l['competitor_price']}" if l.get("competitor_price") else "")
        for l in quote["lines"]
    )
    unknown = ("\n- Unpriced items (no anchor): " + ", ".join(quote["unknown_items"])) if quote["unknown_items"] else ""
    hist = ("\n".join(
        f"  {h['date']} | {h['manufacturer']} | ${h['retail']:.0f} retail | {h['margin']*100:.0f}% margin"
        for h in quote["history"]
    ) or "  (no clean history — new account)")[:1500]
    comp_desc = ("\n".join(
        f"  {cp['date']} | {cp['customer']} | {cp['manufacturer']} | ${cp['retail']:.0f} | {cp['margin']*100:.0f}% margin"
        for cp in comps
    ) or "  (no vertical comps)")[:1500]

    prompt = f"""You are the pricing analyst inside Creative Alternatives' quoting engine, a 27-year promotional-products company. You prepare a DRAFT for Kenny (the founder, the only person who can set final prices). You never invent costs; when the true cost is unknown you say so and anchor off the data below.

CA'S PRICING POSTURE (non-negotiable): CA wins on VALUE — cheaper than premium corporate vendors at the same quality. The line prices below are already computed cost-first at the target margin ({quote.get('target_margin', quote['margin_floor'])*100:.0f}%). Your job is NOT to push prices up. Your job is to sanity-check them: flag any line that would LOSE to a competitor's retail, any line where the estimated cost looks wrong, and any deal-level risk. Suggest a lower price only when it still clears the floor ({quote['margin_floor']*100:.0f}%).

REQUEST
Customer: {quote['customer']}  (vertical: {quote['category']}, margin floor {quote['margin_floor']*100:.0f}%, target {quote.get('target_margin', quote['margin_floor'])*100:.0f}%)
Items (already priced cost-first):
{lines_desc}{unknown}

THIS CUSTOMER'S RECENT HISTORY
{hist}

RECENT COMPARABLE ORDERS IN THIS VERTICAL (all customers)
{comp_desc}

RULES
- Per line: say OK or FLAG. Flag only if (a) our sell is ABOVE the competitor retail shown, (b) the cost estimate looks wrong for the item, or (c) the margin is below floor. One short clause each.
- If a line beats competitor retail, say by how much — that's the selling point.
- Suggest 2-3 concrete upsell items only if visible in comps/history, naming the comp row. If none, write "none visible in comps" — do NOT invent items.
- End with the exact judgment calls Kenny must make, as a bracketed [KENNY: ...] list. Be specific (exact blank, decoration method, setup count, freight). Never assert a cost you didn't see — say "unknown, get supplier quote."
Plain text, compact, no fluff. Every number must trace to the data above or be flagged an estimate."""

    return llm_complete(prompt, label="quote-notes")


def build_quote(req, cfg, conn):
    customer = req["customer"]
    category = req.get("category") or infer_category(conn, customer) or "default"
    floor = cfg["margin_floors"].get(category, cfg["margin_floors"]["default"])
    # CA's posture: win on value. Target the floor (the aggressive end), not
    # the comp-range top. Kenny can always quote UP from a floor-based price;
    # he never wants the engine quoting him out of a deal.
    target_margin = cfg.get("pricing_posture", {}).get("target_margin_by_vertical", {}).get(category, floor)
    history = customer_history(conn, customer, cfg)
    typ_margin = customer_typical_margin(history, floor)

    lines, unknown = [], []
    for item in req["items"]:
        key = resolve_product(item["product"], cfg)
        if not key:
            unknown.append(item["product"])
            continue
        lines.append(price_line(conn, key, item["product"], int(item["qty"]), cfg,
                                target_margin, use_web=req.get("use_llm", True)))

    subtotal = round(sum(l["extended"] for l in lines if l["extended"]), 2)

    # Setup charges: one per item as a placeholder (Kenny confirms colors/locations)
    setup = round(cfg["addons"]["setup_charge_per_color"] * len(lines), 2)
    rush = round(subtotal * cfg["addons"]["rush_surcharge_pct"], 2) if req.get("rush") else 0.0
    total = round(subtotal + setup + rush, 2)

    quote = {
        "customer": customer,
        "category": category,
        "margin_floor": floor,
        "target_margin": target_margin,
        "typical_margin": typ_margin,
        "history": history,
        "lines": lines,
        "unknown_items": unknown,
        "subtotal": subtotal,
        "setup": setup,
        "rush": rush,
        "total": total,
        "rush_requested": bool(req.get("rush")),
    }

    # Phase 2a: vertical comps + LLM reasoning layer (degrades gracefully)
    quote["comps"] = category_comps(conn, category, cfg)
    if req.get("use_llm", True):
        quote["llm_notes"] = llm_quote_notes(quote, quote["comps"], cfg)
    else:
        quote["llm_notes"] = None
    return quote


def render(q):
    def money(v):
        return f"${v:,.2f}" if v is not None else "—"

    L = []
    L.append(f"# DRAFT QUOTE — {q['customer']}")
    L.append("")
    L.append(f"> **DRAFT — not sent.** Generated {datetime.now(timezone.utc):%Y-%m-%d %H:%M UTC} by ca_quote.py.")
    L.append(f"> Vertical: **{q['category']}** · pricing at target margin **{q.get('target_margin', q['margin_floor'])*100:.0f}%** (floor {q['margin_floor']*100:.0f}%)"
             + (f" · this customer's typical margin **{q['typical_margin']*100:.0f}%**" if q['typical_margin'] is not None else " · no clean history on file"))
    L.append("")
    L.append("## Line items (cost → sell)")
    L.append("")
    L.append("| Product | Qty | Blank cost | Unit sell | Extended | Competitor | Basis |")
    L.append("|---------|----:|-----------:|----------:|---------:|-----------:|-------|")
    for l in q["lines"]:
        cost = money(l.get("unit_cost")) if l.get("unit_cost") else "unknown"
        comp = (f"{money(l['competitor_price'])} ✅" if l.get("competitor_price") and l.get("unit_price") and l["unit_price"] < l["competitor_price"]
                else money(l.get("competitor_price")) if l.get("competitor_price") else "—")
        L.append(f"| {l['product']} | {l['qty']} | {cost} | {money(l['unit_price'])} | {money(l['extended'])} | {comp} | {l['basis']} |")
    L.append("")
    low_conf = [l for l in q["lines"] if l.get("cost_confidence") == "low"]
    if low_conf:
        L.append("> ⚠ **ESTIMATE-tier costs** (verify on supplier portal before sending): "
                 + ", ".join(f"{l['product']} ({l.get('cost_note','')})" for l in low_conf))
        L.append("")

    bd_lines = [l for l in q["lines"] if l.get("breakdown") and l["breakdown"].get("unit_cost")]
    if bd_lines:
        L.append("## Full cost breakdown (per unit)")
        L.append("")
        L.append("| Product | Blank | Decoration | Freight | All-in cost | Sell @ target | Margin |")
        L.append("|---------|------:|-----------:|--------:|------------:|--------------:|-------:|")
        for l in bd_lines:
            b = l["breakdown"]
            dec = "bundled" if b["decoration"]["bundled"] else money(b["decoration"]["per_piece"])
            L.append(f"| {l['product']} | {money(b['blank_cost'])} | {dec} ({b['decoration']['method']}) | "
                     f"{money(b['freight_per_piece'])} | {money(b['unit_cost'])} | {money(b['sell'])} | "
                     f"{b['margin_at_sell']*100:.0f}% |")
        L.append("")
        flags = []
        for l in bd_lines:
            b = l["breakdown"]
            if not b["decoration"]["bundled"] and "CONFIRM" in b["decoration"].get("note", ""):
                flags.append(f"decoration cost on **{l['product']}** is a QBO-charge proxy — get the Diamond/Viking rate card")
        L.append("> Cost sources: blank = supplier/estimate per line basis · decoration = QBO charge × cost factor "
                 "`[CONFIRM: rate card]` · freight = QBO shipment averages. "
                 + (" ".join(sorted(set(flags))) if flags else ""))
        L.append("")
    L.append(f"- Subtotal: **{money(q['subtotal'])}**")
    L.append(f"- Setup charges (est., {len(q['lines'])} × per-color placeholder): {money(q['setup'])}  ` [KENNY: # colors/locations per item] `")
    if q["rush_requested"]:
        L.append(f"- Rush surcharge (placeholder 15%): {money(q['rush'])}  ` [KENNY: confirm real rush policy] `")
    L.append(f"- **Draft total: {money(q['total'])}**")
    L.append("")

    if q["unknown_items"]:
        L.append("## ⚠ Products I couldn't price")
        L.append("These weren't in the anchor list — add them to `config/ca_quote.yaml` or price by hand:")
        for u in q["unknown_items"]:
            L.append(f"- `{u}`  ` [KENNY: price this] `")
        L.append("")

    L.append("## Kenny's judgment calls (the gaps this skeleton can't fill)")
    L.append("- ` [KENNY: supplier + exact blank] ` — anchor prices are blended averages; the real margin depends on the specific garment and decorator you choose. Confirm the blank and its cost per line.")
    L.append("- ` [KENNY: volume break] ` — quantities may earn a better blank/decoration price than the blended anchor. Apply real qty pricing.")
    L.append("- ` [KENNY: decoration ] ` — screenprint vs embroidery vs DTF changes cost materially. Note method per item.")
    L.append("- ` [MARGIN CHECK] ` — once real costs are in, confirm blended margin ≥ the "
             f"{q['margin_floor']*100:.0f}% floor for {q['category']}. If below, requote — don't absorb it.")
    L.append("")

    if q.get("llm_notes"):
        L.append("## 🤖 AI pricing analysis (draft — Kenny verifies)")
        L.append("")
        L.append(q["llm_notes"])
        L.append("")

    if q.get("comps"):
        L.append(f"## Comparable {q['category']} orders (what similar accounts paid)")
        L.append("")
        L.append("| Date | Customer | Vendor | Retail | Margin |")
        L.append("|------|----------|--------|-------:|-------:|")
        for cp in q["comps"]:
            mm = f"{cp['margin']*100:.0f}%" if cp["margin"] is not None else "—"
            L.append(f"| {cp['date']} | {cp['customer'][:24]} | {(cp['manufacturer'] or '')[:28]} | {money(round(cp['retail']))} | {mm} |")
        L.append("")

    if q["history"]:
        L.append("## What this customer has ordered (context)")
        L.append("")
        L.append("| Date | Vendor | Retail | Margin |")
        L.append("|------|--------|-------:|-------:|")
        for h in q["history"]:
            mm = f"{h['margin']*100:.0f}%" if h["margin"] is not None else "—"
            L.append(f"| {h['date']} | {(h['manufacturer'] or '')[:34]} | {money(round(h['retail']))} | {mm} |")
        L.append("")
    else:
        L.append("## What this customer has ordered")
        L.append("_No clean order history on file — treat as a new account and price conservatively._")
        L.append("")

    L.append("---")
    L.append("_Next: Kenny fills the `[KENNY: …]` gaps, confirms the margin check, then this becomes a QuickBooks estimate (see quoting-automation-spec.md, Phase 2)._")
    return "\n".join(L)


def parse_items_arg(s):
    items = []
    for part in s.split(","):
        part = part.strip()
        if not part:
            continue
        m = re.match(r"(.+?):\s*(\d+)", part)
        if m:
            items.append({"product": m.group(1).strip(), "qty": int(m.group(2))})
    return items


def main():
    ap = argparse.ArgumentParser(description="CA quoting engine (skeleton) — drafts only, never sends.")
    ap.add_argument("--request", help="path to a request JSON file")
    ap.add_argument("--customer", help="customer name (inline mode)")
    ap.add_argument("--items", help='inline items, e.g. "tee:60, sweatshirt:60"')
    ap.add_argument("--category", help="override vertical (else inferred)")
    ap.add_argument("--rush", action="store_true")
    ap.add_argument("--no-llm", action="store_true", help="skip the AI analysis layer (anchors only)")
    ap.add_argument("--out", help="write draft to this path (else outputs/quotes/)")
    args = ap.parse_args()

    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}. Run: .venv/bin/python scripts/collect.py", file=sys.stderr)
        sys.exit(1)

    if args.request:
        with open(args.request) as f:
            req = json.load(f)
    elif args.customer and args.items:
        req = {"customer": args.customer, "items": parse_items_arg(args.items)}
        if args.category:
            req["category"] = args.category
        if args.rush:
            req["rush"] = True
    else:
        ap.error("provide --request FILE, or both --customer and --items")

    if args.no_llm:
        req["use_llm"] = False

    if not req.get("items"):
        print("No parseable items in the request.", file=sys.stderr)
        sys.exit(1)

    cfg = load_config()
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    quote = build_quote(req, cfg, conn)
    conn.close()

    md = render(quote)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    safe = re.sub(r"[^a-z0-9]+", "-", req["customer"].lower()).strip("-")
    out_path = Path(args.out) if args.out else OUT_DIR / f"{datetime.now(timezone.utc):%Y-%m-%d}-{safe}.md"
    out_path.write_text(md)
    print(md)
    print(f"\n[draft written to {out_path}]", file=sys.stderr)


if __name__ == "__main__":
    main()

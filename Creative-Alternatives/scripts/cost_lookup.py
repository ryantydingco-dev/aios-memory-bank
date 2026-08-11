"""Cost lookup for the CA quoting engine — pluggable sources, MVP tier live.

Why this exists: the first Miller Johnson draft priced a Yeti Rambler 20oz off a
$32 anchor I made up. Ryan's correction: "we come in cheaper than premium
corporate vendors at the same quality." To price that way, the engine needs the
real blank COST first, then computes sell = cost / (1 - target margin) — never
a guessed sell price.

Architecture (sources tried in order; first hit wins):

  Tier 1 — supplier APIs (STUBBED, needs Kenny's keys)
      S&S Activewear REST (self-serve key from his account page), SanMar,
      alphabroder, SAGE. Returns CA's actual negotiated cost + live inventory.
      See pillars/2-customer-acquisition/reactivation/SUPPLIER-PRODUCT-APIS.md.

  Tier 2 — ledger cost history (LIVE)
      data/data.db sales_ledger has cost + retail on 25,662 orders. If CA has
      sold this product (or close) before, the blended cost from our own books
      is the best cost basis there is.

  Tier 3 — web-estimate via LLM + web search (LIVE, MVP)
      Wholesale blank prices for brand items (Yeti etc.) are semi-public on
      supplier storefronts. An LLM with a web-grounded prompt estimates the
      cost range. Every Tier-3 number is labeled ESTIMATE — Kenny verifies on
      the supplier portal before the quote goes out. This is the tier that
      burns OpenRouter credit (~$0.0005/lookup).

  Tier 4 — config anchor fallback (always available)
      The old behavior: blended avg selling price from QBO. Kept so the engine
      always produces a draft, and clearly labeled as selling-price (not cost).

Usage:
    from cost_lookup import lookup_cost
    result = lookup_cost(conn, cfg, "yeti_rambler_20oz", display="Yeti Rambler 20oz travel mug")
    # -> {"cost": 22.50, "source": "web_estimate", "confidence": "low", "note": "...", "competitor_price": 24.95}
"""

import re

from llm import llm_complete


# ---------------------------------------------------------------- Tier 2: ledger
def _ledger_cost(conn, product_key, aliases):
    """Blended unit cost from CA's own order history for this product, if any.
    Matches on the manufacturer/product words we track per anchor key."""
    words = _ledger_words(product_key)
    if not words:
        return None
    like = " OR ".join("LOWER(manufacturer) LIKE ?" for _ in words)
    rows = conn.execute(
        f"""SELECT COUNT(*) n, SUM(cost) cost, SUM(retail) retail
            FROM sales_ledger
            WHERE ({like}) AND cost > 0 AND retail > 0
              AND date >= date('now','-4 years')""",
        tuple(f"%{w}%" for w in words),
    ).fetchone()
    if not rows or not rows["n"] or rows["n"] < 2:
        return None
    # we don't store per-unit qty on the ledger, so express as cost ratio
    ratio = rows["cost"] / rows["retail"] if rows["retail"] else None
    return {"orders": rows["n"], "cost_ratio": round(ratio, 3) if ratio else None}


def _ledger_words(product_key):
    """Which manufacturer/vendor words in the ledger mean this product."""
    table = {
        "yeti_rambler_20oz": ["yeti"],
        "tumbler": ["yeti", "h2go", "drinkware"],
        "padfolio": ["journal", "portfolio", "leed"],
        "portfolio": ["journal", "portfolio", "leed"],
        "journal_book": ["journal"],
    }
    return table.get(product_key, [])


# ------------------------------------------------------- Tier 3: web estimate
def _web_estimate(product_key, display):
    """LLM estimates the current wholesale blank cost range from its knowledge
    of supplier storefront pricing (S&S, SanMar etc.). Labeled ESTIMATE."""
    prompt = f"""You are the sourcing analyst for Creative Alternatives, a 27-year promotional-products distributor.

Product: {display} (internal key: {product_key})

Give the current US wholesale/blank distributor cost range for ONE unit of this item (the price a distributor like us pays S&S Activewear / SanMar / alphabroder before decoration). Brand-name blanks (Yeti etc.) have well-known distributor price points.

Rules:
- Give a LOW-HIGH range for the undecorated blank, in USD.
- If the brand is sold at wholesale with decoration bundled, say so and give the net blank-equivalent.
- Also give the typical RETAIL price a buyer would see on a competitor site (AnyPromo, 4imprint) for the decorated single item at qty 60.
- Be honest about uncertainty: if you don't have a confident price point, say RANGE UNKNOWN and give your best guess labeled as such.
- Format exactly:
BLANK_COST_LOW: $X.XX
BLANK_COST_HIGH: $X.XX
COMPETITOR_RETAIL_AT_60: $X.XX
NOTE: one sentence on source/uncertainty."""

    text = llm_complete(prompt, label=f"cost-estimate:{product_key}", max_tokens=250)
    if not text:
        return None
    def money(tag):
        m = re.search(rf"{tag}:\s*\$?([\d,]+(?:\.\d+)?)", text)
        return float(m.group(1).replace(",", "")) if m else None
    low, high, comp = money("BLANK_COST_LOW"), money("BLANK_COST_HIGH"), money("COMPETITOR_RETAIL_AT_60")
    vals = [v for v in (low, high) if v is not None]
    if not vals:
        return None
    cost = round(sum(vals) / len(vals), 2)
    note_m = re.search(r"NOTE:\s*(.+)", text)
    return {
        "cost": cost,
        "cost_range": [low, high],
        "source": "web_estimate",
        "confidence": "low",
        "competitor_price": comp,
        "note": (note_m.group(1).strip() if note_m else "LLM estimate — verify on supplier portal"),
    }


# ------------------------------------------------------------------ Tier 1: stub
def _supplier_api(product_key):
    """Tier 1 — live supplier cost. STUBBED pending Kenny's API keys.
    When keys land: S&S Activewear REST first (self-serve, JSON), then SanMar
    via PSRESTful. Returns {"cost": ..., "source": "s&s_activewear", "confidence": "high"}."""
    return None


# -------------------------------------------------------------------- orchestrate
def lookup_cost(conn, cfg, product_key, display=None, use_web=True):
    """Try sources in order. Always returns a dict with at least a 'source' key;
    'cost' may be None when nothing better than the config anchor exists."""
    display = display or product_key.replace("_", " ")

    hit = _supplier_api(product_key)
    if hit:
        return hit

    ledger = _ledger_cost(conn, product_key, cfg.get("aliases", {}))
    if ledger and ledger.get("cost_ratio"):
        anchor = cfg["price_anchors"].get(product_key)
        if anchor:
            return {
                "cost": round(anchor * ledger["cost_ratio"], 2),
                "source": "ledger_cost_history",
                "confidence": "medium",
                "note": f"CA's own cost/retail ratio ({ledger['cost_ratio']*100:.0f}%) across {ledger['orders']} recent orders, applied to the current anchor.",
                "competitor_price": None,
            }

    if use_web:
        hit = _web_estimate(product_key, display)
        if hit:
            return hit

    return {"cost": None, "source": "config_anchor_only", "confidence": "none",
            "note": "No cost data — priced from blended QBO average selling price.",
            "competitor_price": None}


def sell_from_cost(cost, target_margin):
    """The core formula: sell = cost / (1 - margin)."""
    if not cost:
        return None
    return round(cost / (1 - target_margin), 2)


# ------------------------------------------------------- full cost breakdown
def decoration_cost(product_key, cfg):
    """Per-piece decoration cost for a product: method from config defaults,
    price = QBO charge × cost_factor (what CA likely pays). Returns dict with
    method, per-piece cost, and whether decoration is vendor-bundled."""
    d = cfg.get("decoration_costs", {})
    if product_key in d.get("bundled_products", []):
        return {"method": "vendor_bundled", "per_piece": 0.0, "bundled": True,
                "note": "decoration usually included in vendor blank price"}
    method = d.get("default_method_by_product", {}).get(product_key, "screenprint_1c")
    charge = d.get("per_piece", {}).get(method, 0.0)
    factor = d.get("cost_factor", 0.60)
    return {"method": method, "per_piece": round(charge * factor, 2),
            "charge_to_customer": charge, "bundled": False,
            "note": f"QBO {method} charge ${charge}/pc × {factor} cost factor [CONFIRM rate card]"}


def freight_share(product_key, qty, cfg):
    """Estimated freight per piece for this line, from QBO shipment averages.
    Assumes the whole line ships as one parcel; heavy items use the bulk rate."""
    f = cfg.get("freight", {})
    heavy = any(k in product_key.lower() for k in f.get("heavy_keywords", []))
    per_shipment = f.get("est_heavy_per_shipment" if heavy else "avg_per_shipment", 21.23)
    return round(per_shipment / max(qty, 1), 2)


def full_breakdown(product_key, qty, blank_cost, cfg, target_margin):
    """All four components → suggested sell. Every number labeled with source."""
    dec = decoration_cost(product_key, cfg)
    fr = freight_share(product_key, qty, cfg)
    blank = blank_cost or 0.0
    unit_cost = round(blank + dec["per_piece"] + fr, 2)
    sell = sell_from_cost(unit_cost, target_margin) if unit_cost else None
    setup = round(cfg.get("decoration_costs", {}).get("setup_per_color", 21.59), 2) if not dec["bundled"] else 0.0
    return {
        "blank_cost": blank_cost,
        "decoration": dec,
        "freight_per_piece": fr,
        "unit_cost": unit_cost if blank_cost else None,
        "sell": sell,
        "setup_per_order": setup,
        "margin_at_sell": round((sell - unit_cost) / sell, 3) if sell and unit_cost else None,
    }


if __name__ == "__main__":
    import sqlite3
    from pathlib import Path
    import yaml
    root = Path(__file__).resolve().parent.parent
    cfg = yaml.safe_load(open(root / "config" / "ca_quote.yaml"))
    conn = sqlite3.connect(str(root / "data" / "data.db"))
    conn.row_factory = sqlite3.Row
    r = lookup_cost(conn, cfg, "yeti_rambler_20oz", display="Yeti Rambler 20oz travel mug")
    print(r)
    if r["cost"]:
        for m in (0.25, 0.28, 0.32):
            print(f"  sell @ {m*100:.0f}% margin: ${sell_from_cost(r['cost'], m)}")

#!/usr/bin/env python3
"""
CA reactivation + referral engine — the master customer table + segments.

Merges the two QuickBooks exports (contacts + sales-by-customer-by-year) into ONE
queryable customer table, then splits it into the outreach segments. This is the
foundation of the warm-outreach engine — no cold data, just CA's own 27-year base.

Reality (verified 2026-07): QuickBooks only holds ~2025-2026 order history; the
1999-2024 history lives in spreadsheets (Phase 2 enrichment, not required to launch).
So "reactivation" here = a customer on file, has email, but NO order in the last 2
years. That's already ~980 reachable win-backs.

Usage:
  python scripts/ca_reactivation.py build \
      --contacts context/import/qb_customer_contacts.csv \
      --sales    context/import/qb_sales_by_customer_by_year.csv \
      --out      outputs/reactivation/<date>

Emits:
  customers_master.csv       every contact + merged recency/frequency/monetary + segment
  segment_reactivation.csv    has email, no 2025-2026 order  (win-back)   — priority: total_spend desc
  segment_active.csv          ordered 2025-2026, has email   (referral+reorder) — priority: repeat/value
  segment_phone_only.csv      no email, has phone            (call lane)
  summary.json                counts per segment
"""
import argparse
import csv
import json
import os
import re

RECENT_YEARS = (2025, 2026)


def norm(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def parse_sales(path):
    """QB 'Sales by Customer Summary' → {norm_name: {last, n_years, total, by_year}}."""
    rows = list(csv.reader(open(path, newline="")))
    hdr_i = next(i for i, r in enumerate(rows) if r and r[0] == "" and any(c == "2015" for c in r))
    hdr = rows[hdr_i]
    year_cols = {int(c): j for j, c in enumerate(hdr) if c.isdigit()}
    out = {}
    for r in rows[hdr_i + 1:]:
        if not r or not r[0] or r[0].strip().lower() in ("total", "total sales"):
            continue
        by_year = {}
        for y, j in year_cols.items():
            v = (r[j].replace(",", "").strip() if j < len(r) else "")
            try:
                fv = float(v) if v else 0.0
            except ValueError:
                fv = 0.0
            if fv:
                by_year[y] = fv
        active = sorted(by_year)
        out[norm(r[0])] = {
            "last_order_year": (max(active) if active else ""),
            "n_years": len(active),
            "total_spend": round(sum(by_year.values()), 2),
            "recent": any(y in by_year for y in RECENT_YEARS),
        }
    return out


def parse_contacts(path):
    """QB 'Customer Contact List' → list of {name, email, phone}."""
    rows = list(csv.reader(open(path, newline="")))
    hdr_i = next(i for i, r in enumerate(rows) if r and r[0].startswith("Customer full name"))
    out = []
    for r in rows[hdr_i + 1:]:
        if not r or not r[0].strip():
            continue
        out.append({
            "name": r[0].strip(),
            "phone": (r[1].strip() if len(r) > 1 else "").replace("\n", " "),
            "email": (r[2].strip() if len(r) > 2 else ""),
        })
    return out


def build(contacts_path, sales_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    sales = parse_sales(sales_path)
    contacts = parse_contacts(contacts_path)

    master = []
    for c in contacts:
        s = sales.get(norm(c["name"]), {})
        has_email = "@" in c["email"]
        recent = bool(s.get("recent"))
        if recent:
            seg = "active"
        elif has_email:
            seg = "reactivation"
        elif c["phone"]:
            seg = "phone_only"
        else:
            seg = "no_contact"
        master.append({
            "name": c["name"],
            "email": c["email"],
            "phone": c["phone"],
            "last_order_year": s.get("last_order_year", ""),
            "total_spend": s.get("total_spend", ""),
            "n_years": s.get("n_years", ""),
            "segment": seg,
        })

    cols = ["name", "email", "phone", "last_order_year", "total_spend", "n_years", "segment"]

    def write(rows, fname):
        with open(os.path.join(out_dir, fname), "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=cols)
            w.writeheader()
            w.writerows(rows)

    def spend(r):
        try:
            return float(r["total_spend"])
        except (TypeError, ValueError):
            return 0.0

    write(master, "customers_master.csv")

    reactivation = sorted([r for r in master if r["segment"] == "reactivation"],
                          key=lambda r: -spend(r))
    active = sorted([r for r in master if r["segment"] == "active"],
                    key=lambda r: (-(r["n_years"] or 0), -spend(r)))
    phone_only = [r for r in master if r["segment"] == "phone_only"]

    write(reactivation, "segment_reactivation.csv")
    write(active, "segment_active.csv")
    write(phone_only, "segment_phone_only.csv")

    summary = {
        "total_contacts": len(master),
        "segment_reactivation": len(reactivation),
        "segment_active": len(active),
        "segment_phone_only": len(phone_only),
        "segment_no_contact": sum(1 for r in master if r["segment"] == "no_contact"),
        "active_repeat_2plus": sum(1 for r in active if (r["n_years"] or 0) >= 2),
        "reactivation_with_known_spend": sum(1 for r in reactivation if spend(r) > 0),
        "note": "QB holds only ~2025-2026 history; reactivation = on-file + email + no recent order. "
                "Digitize 1999-2024 spreadsheets (Phase 2) to add lapsed history + find deeply-lapsed big spenders.",
    }
    with open(os.path.join(out_dir, "summary.json"), "w") as f:
        json.dump(summary, f, indent=2)
    print(json.dumps(summary, indent=2))
    print(f"\nWrote master + 3 segments → {out_dir}")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("build")
    b.add_argument("--contacts", default="context/import/qb_customer_contacts.csv")
    b.add_argument("--sales", default="context/import/qb_sales_by_customer_by_year.csv")
    b.add_argument("--out", required=True)
    a = ap.parse_args()
    if a.cmd == "build":
        build(a.contacts, a.sales, a.out)


if __name__ == "__main__":
    main()

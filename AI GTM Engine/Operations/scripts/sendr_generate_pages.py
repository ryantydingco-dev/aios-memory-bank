#!/usr/bin/env python3
"""Generate personalized Sendr pages for every row of a lead CSV.

Reads a lead list (Vibe Prospecting export format), calls the Sendr API to
generate one personalized landing page per prospect (their name/company in the
page text, their website as the dynamic video background), and writes the same
CSV back with sendr_page_url / sendr_page_preview / sendr_warnings columns.

Resumable: rows in the output file that already have a sendr_page_url are
skipped on re-run, so a crash or Ctrl-C never wastes credits.

Usage:
  export SENDR_API_KEY="skprod_..."
  python3 sendr_generate_pages.py input.csv output.csv --template-id 1234 \
      [--limit 25] [--dry-run] [--valid-only]
"""

import argparse
import csv
import json
import os
import sys
import time
import urllib.error
import urllib.request

API_BASE = "https://api.sendr.io"

# CSV column -> Sendr template variable tag. Edit here if the template's tags change.
VARIABLE_MAP = {
    "first_name": "firstname",
    "company": "company",
}
WEBSITE_COLUMN = "website"          # used as the dynamic video background
KEY_COLUMN = "email"                # row identity for resume/skip logic
OUTPUT_COLUMNS = ["sendr_page_url", "sendr_page_preview", "sendr_warnings"]


def api_post(path, payload, api_key, retries=3):
    body = json.dumps(payload).encode()
    for attempt in range(retries):
        req = urllib.request.Request(
            API_BASE + path,
            data=body,
            headers={"X-API-Key": api_key, "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors="replace")[:300]
            if e.code in (429, 500, 502, 503) and attempt < retries - 1:
                wait = 5 * (attempt + 1)
                print(f"    HTTP {e.code}, retrying in {wait}s... {detail}")
                time.sleep(wait)
                continue
            raise RuntimeError(f"HTTP {e.code}: {detail}") from e
        except urllib.error.URLError as e:
            if attempt < retries - 1:
                time.sleep(5)
                continue
            raise


def normalize_url(url):
    url = (url or "").strip()
    if not url:
        return None
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("input_csv")
    p.add_argument("output_csv")
    p.add_argument("--template-id", type=int, required=True)
    p.add_argument("--limit", type=int, default=None, help="max NEW pages this run")
    p.add_argument("--dry-run", action="store_true", help="print payloads, no API calls")
    p.add_argument("--valid-only", action="store_true",
                   help="only rows where email_status == 'valid'")
    p.add_argument("--sleep", type=float, default=1.5, help="seconds between calls")
    args = p.parse_args()

    api_key = os.environ.get("SENDR_API_KEY")
    if not api_key and not args.dry_run:
        sys.exit("SENDR_API_KEY not set. export SENDR_API_KEY=...")

    with open(args.input_csv, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        sys.exit("Input CSV is empty.")

    missing = [c for c in list(VARIABLE_MAP) + [KEY_COLUMN] if c not in rows[0]]
    if missing:
        sys.exit(f"Input CSV missing columns: {missing}")

    # resume: load already-generated pages from a previous output file
    done = {}
    if os.path.exists(args.output_csv):
        with open(args.output_csv, newline="", encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                if r.get("sendr_page_url"):
                    done[r.get(KEY_COLUMN, "")] = {c: r.get(c, "") for c in OUTPUT_COLUMNS}
        if done:
            print(f"Resuming: {len(done)} pages already generated.")

    fieldnames = list(rows[0].keys()) + [c for c in OUTPUT_COLUMNS if c not in rows[0]]
    generated = skipped = failed = 0

    with open(args.output_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()

        for i, row in enumerate(rows, 1):
            key = row.get(KEY_COLUMN, "").strip()

            if key in done:
                row.update(done[key])
                writer.writerow(row)
                skipped += 1
                continue
            if args.valid_only and row.get("email_status", "").strip().lower() != "valid":
                writer.writerow(row)
                skipped += 1
                continue
            if args.limit is not None and generated >= args.limit:
                writer.writerow(row)
                continue

            payload = {
                "templateId": args.template_id,
                "variablesValues": {
                    tag: row.get(col, "").strip()
                    for col, tag in VARIABLE_MAP.items()
                    if row.get(col, "").strip()
                },
            }
            website = normalize_url(row.get(WEBSITE_COLUMN))
            if website:
                payload["videoBackgroundUrl"] = website
                payload["videoBackgroundType"] = "scroll"

            label = f"[{i}/{len(rows)}] {row.get('first_name','?')} @ {row.get('company','?')}"
            if args.dry_run:
                print(f"{label} -> {json.dumps(payload)}")
                generated += 1
                writer.writerow(row)
                continue

            try:
                resp = api_post("/api/v1/enrichment/sendr-page", payload, api_key)
                row["sendr_page_url"] = resp.get("pageUrl", "")
                row["sendr_page_preview"] = resp.get("pagePreviewUrl", "")
                row["sendr_warnings"] = "; ".join(resp.get("warnings") or [])
                generated += 1
                warn = f"  ⚠ {row['sendr_warnings']}" if row["sendr_warnings"] else ""
                print(f"{label} -> {row['sendr_page_url']}{warn}")
            except Exception as e:
                failed += 1
                row["sendr_warnings"] = f"ERROR: {e}"
                print(f"{label} -> FAILED: {e}")

            writer.writerow(row)
            f.flush()
            time.sleep(args.sleep)

    print(f"\nDone. {generated} generated, {skipped} skipped, {failed} failed.")
    print(f"Output: {args.output_csv}")
    if failed:
        print("Re-run the same command to retry failed rows (successes are skipped).")


if __name__ == "__main__":
    main()

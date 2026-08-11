#!/usr/bin/env python3
"""Proof Page Generator — the interactive proof loop, no artist required.

Takes a proof manifest (JSON) + mockup images and produces ONE self-contained
HTML file (images embedded as base64) the customer can open anywhere. Each
mockup gets Approve / Request-a-change buttons that open a pre-filled email
back to CA with structured feedback — no email-chain archaeology, no $75
artist sessions per round.

Manifest format (proofs/<client>/proof.json):
{
  "client": "Miller Johnson",
  "contact_name": "Wil",
  "project": "Client Gift Program",
  "round": 1,
  "reply_to": "maclaine@creativealternatives.com",
  "items": [
    {"id": "hoodie", "title": "Premium Hoodie — Navy", "img": "hoodie.png",
     "note": "Left-chest embroidery, PMS 289"},
    ...
  ]
}
Image paths are relative to the manifest file. PNG/JPG/SVG/WebP supported.

Usage:
    python scripts/proof_page.py proofs/miller-johnson/proof.json
    → writes proofs/miller-johnson/proof-round-1.html
"""
import base64
import json
import mimetypes
import sys
from pathlib import Path
from string import Template

PAGE = Template("""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>$project — Proof Round $round · Creative Alternatives</title>
<style>
  :root { --ink:#1a1a2e; --accent:#c0392b; --ok:#1e7d4e; --paper:#faf8f5; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Georgia,'Times New Roman',serif; background:var(--paper); color:var(--ink); line-height:1.5; }
  .wrap { max-width:760px; margin:0 auto; padding:32px 20px 64px; }
  header { border-bottom:3px solid var(--ink); padding-bottom:16px; margin-bottom:8px; }
  .brand { font-size:13px; letter-spacing:.18em; text-transform:uppercase; }
  h1 { font-size:26px; margin-top:6px; }
  .meta { font-family:Helvetica,Arial,sans-serif; font-size:13px; color:#555; margin-top:4px; }
  .hello { margin:20px 0 4px; font-size:16px; }
  .card { background:#fff; border:1px solid #e2ddd4; border-radius:10px; margin-top:24px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.05); }
  .card img { width:100%; display:block; background:#fff; }
  .card .body { padding:16px 18px 18px; }
  .card h2 { font-size:18px; }
  .card .note { font-family:Helvetica,Arial,sans-serif; font-size:13px; color:#666; margin-top:2px; }
  .actions { display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; }
  .btn { font-family:Helvetica,Arial,sans-serif; font-size:14px; font-weight:700; text-decoration:none; padding:10px 16px; border-radius:7px; display:inline-block; }
  .approve { background:var(--ok); color:#fff; }
  .change { background:#fff; color:var(--accent); border:2px solid var(--accent); }
  textarea { width:100%; margin-top:12px; padding:10px; font-family:Helvetica,Arial,sans-serif; font-size:14px; border:1px solid #ccc; border-radius:7px; min-height:60px; display:none; }
  .all { text-align:center; margin-top:36px; }
  .all .btn { font-size:16px; padding:14px 28px; }
  .fine { font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#888; text-align:center; margin-top:28px; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="brand">Creative Alternatives · Est. 1999</div>
    <h1>$project</h1>
    <div class="meta">Proof for $client · Round $round · Reply-by button, not by memory</div>
  </header>
  <p class="hello">Hi $contact_name — here's round $round. Tap a button on each piece; it opens an email to us already filled in. Change rounds are free and same-day, so be picky.</p>
  $cards
  <div class="all">
    <a class="btn approve" href="$approve_all_href">✓ Approve everything — let's go</a>
  </div>
  <p class="fine">Visual proof — final production art will match the approved layout; colors matched to PMS on press.<br>
  Creative Alternatives · family-run for 27 years · creativealternatives.com</p>
</div>
<script>
  function chg(id, title) {
    var ta = document.getElementById('ta-' + id);
    if (ta.style.display !== 'block') { ta.style.display = 'block'; ta.focus(); return false; }
    var body = 'CHANGE REQUEST — ' + title + ' (round $round)%0D%0A%0D%0A' + encodeURIComponent(ta.value || '(describe the change here)');
    location.href = 'mailto:$reply_to?subject=' + encodeURIComponent('Change request: $project — ' + title) + '&body=' + body;
    return false;
  }
</script>
</body>
</html>
""")

CARD = Template("""  <div class="card">
    <img src="$src" alt="$title">
    <div class="body">
      <h2>$title</h2>
      <div class="note">$note</div>
      <div class="actions">
        <a class="btn approve" href="mailto:$reply_to?subject=$appr_subject&body=$appr_body">✓ Approve this one</a>
        <a class="btn change" href="#" onclick="return chg('$id', '$title_js')">✎ Request a change</a>
      </div>
      <textarea id="ta-$id" placeholder="What should change? (placement, color, size, product…) Then tap Request a change again."></textarea>
    </div>
  </div>
""")


def embed(path):
    mime = mimetypes.guess_type(str(path))[0] or "image/png"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def enc(s):
    from urllib.parse import quote
    return quote(s, safe="")


def main():
    if len(sys.argv) != 2:
        sys.exit("Usage: proof_page.py path/to/proof.json")
    manifest_path = Path(sys.argv[1]).resolve()
    m = json.loads(manifest_path.read_text())
    base = manifest_path.parent

    cards = []
    for item in m["items"]:
        img = base / item["img"]
        cards.append(CARD.substitute(
            src=embed(img),
            title=item["title"],
            title_js=item["title"].replace("'", "\\'"),
            note=item.get("note", ""),
            id=item["id"],
            reply_to=m["reply_to"],
            appr_subject=enc(f"APPROVED: {m['project']} — {item['title']} (round {m['round']})"),
            appr_body=enc(f"Approved as shown in round {m['round']}. — {m.get('contact_name','')}"),
        ))

    html = PAGE.substitute(
        project=m["project"], client=m["client"], round=m["round"],
        contact_name=m.get("contact_name", "there"), reply_to=m["reply_to"],
        cards="\n".join(cards),
        approve_all_href=f"mailto:{m['reply_to']}?subject={enc(f'APPROVED ALL: {m['project']} (round {m['round']})')}&body={enc('All pieces approved as shown. Ready for production.')}",
    )
    out = base / f"proof-round-{m['round']}.html"
    out.write_text(html)
    kb = out.stat().st_size // 1024
    print(f"Proof page written: {out} ({kb} KB, fully self-contained — attach or host it)")


if __name__ == "__main__":
    main()

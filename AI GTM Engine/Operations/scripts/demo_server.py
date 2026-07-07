#!/usr/bin/env python3
"""End-to-end LIVE demo for the AI Contact Form (IdeaBrowser #7856).

A real smart contact form -> live buyer-profile enrichment -> real CRM push,
all running locally. This is the "show me it working" demo you screen-share on a call.

Flow:
  GET  /         the smart contact form (what sits on a client's "Talk to Sales" page)
  POST /submit   enriches the lead LIVE (company + person), renders the rep dossier,
                 appends it to the local CRM (demo_leads.jsonl), AND upserts a real
                 contact + note into HubSpot when HUBSPOT_TOKEN is set.
  GET  /crm      the rep's inbox — every lead that's landed, newest first

Env: FIRECRAWL_API_KEY, ANTHROPIC_API_KEY (required), HUBSPOT_TOKEN (optional, real push).
Load them first, e.g.:
  set -a; source /Users/ryantydingco/Documents/AIOS/aios-starter-kit/.env; set +a
  export HUBSPOT_TOKEN=$(grep -E '^HUBSPOT_TOKEN=' /Users/ryantydingco/Documents/AIOS/dealthread-agents/.env | cut -d= -f2-)
  python3 demo_server.py        # -> http://localhost:8754
"""
import html
import json
import os
import sys
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, quote, urlparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import buyer_profile_enricher as bpe  # noqa: E402

# Railway (and most PaaS) inject $PORT; its presence is our "we're hosted/public" signal.
PORT = int(os.environ.get("PORT") or os.environ.get("DEMO_PORT") or "8754")
HOST = "0.0.0.0" if os.environ.get("PORT") else "127.0.0.1"
PUBLIC = bool(os.environ.get("PORT"))
CRM_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "demo_leads.jsonl")
ICP = "mid-market B2B, $10k+ ACV, sales-led, real inbound demand"
HUBSPOT = os.environ.get("HUBSPOT_TOKEN", "")
_PORTAL = {"id": None}

# Public-link safety: every submit spends a few cents of API credit, so bound it.
MAX_PER_IP_HR = int(os.environ.get("MAX_PER_IP_HR", "6"))
MAX_PER_DAY = int(os.environ.get("MAX_PER_DAY", "150"))
_hits = {}            # ip -> [epoch, ...]
_day = {"date": "", "n": 0}


def rate_ok(ip):
    now = time.time()
    today = time.strftime("%Y-%m-%d")
    if _day["date"] != today:
        _day["date"], _day["n"] = today, 0
    if _day["n"] >= MAX_PER_DAY:
        return False, "This demo's daily cap was reached. Try again tomorrow, or ask me for a live walk-through."
    xs = [t for t in _hits.get(ip, []) if now - t < 3600]
    if len(xs) >= MAX_PER_IP_HR:
        return False, "Easy there — a few submissions per hour. Try again shortly."
    xs.append(now)
    _hits[ip] = xs
    _day["n"] += 1
    return True, ""


def esc(x):
    return html.escape(str(x)) if x else ""


def domain_from(website, email):
    """Best domain to enrich: explicit website field, else the email's domain."""
    w = (website or "").strip().lower()
    w = w.replace("https://", "").replace("http://", "").replace("www.", "").strip("/")
    if w:
        return w.split("/")[0]
    if email and "@" in email:
        dom = email.split("@", 1)[1].lower()
        free = {"gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "proton.me"}
        if dom not in free:
            return dom
    return ""


# ---------------------------------------------------------------- HubSpot push
def _hs(method, path, body=None):
    req = urllib.request.Request(
        "https://api.hubapi.com" + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {HUBSPOT}", "Content-Type": "application/json"},
        method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read().decode("utf-8", "replace") or "{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8", "replace") or "{}")
    except Exception as e:  # noqa: BLE001
        return 0, {"error": repr(e)[:120]}


def _portal_id():
    if _PORTAL["id"] is None and HUBSPOT:
        st, d = _hs("GET", "/account-info/v3/details")
        _PORTAL["id"] = str(d.get("portalId", "")) if st == 200 else ""
    return _PORTAL["id"] or ""


def push_hubspot(name, email, prof):
    """Upsert a contact by email + attach the buyer profile as a note. Honest about outcome."""
    if not HUBSPOT:
        return {"mode": "stub", "detail": "HUBSPOT_TOKEN not set — contact NOT pushed (would upsert by email + attach profile note)"}
    if not email:
        return {"mode": "skip", "detail": "no email on form — nothing to upsert"}
    person = prof.get("person") or {}
    first, _, last = (person.get("full_name") or name or "").partition(" ")
    props = {
        "email": email,
        "firstname": first or name or "",
        "lastname": last or "",
        "company": prof.get("company", ""),
        "jobtitle": person.get("title", ""),
        "website": prof.get("domain", ""),
        "hs_lead_status": "NEW",
    }
    props = {k: v for k, v in props.items() if v}
    st, d = _hs("POST", "/crm/v3/objects/contacts", {"properties": props})
    if st == 409:  # already exists -> patch by email
        st, d = _hs("PATCH", f"/crm/v3/objects/contacts/{quote(email)}?idProperty=email", {"properties": props})
        action = "updated"
    else:
        action = "created"
    if st not in (200, 201):
        return {"mode": "error", "detail": f"HubSpot {st}: {(d.get('message') or json.dumps(d))[:140]}"}
    cid = str(d.get("id", ""))
    out = {"mode": "live", "action": action, "contact_id": cid}
    pid = _portal_id()
    if pid and cid:
        out["url"] = f"https://app.hubspot.com/contacts/{pid}/record/0-1/{cid}"
    # attach the dossier as a note
    note_body = note_text(name, email, prof)
    nst, nd = _hs("POST", "/crm/v3/objects/notes", {
        "properties": {"hs_note_body": note_body, "hs_timestamp": int(time.time() * 1000)},
        "associations": [{"to": {"id": cid}, "types": [
            {"associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 202}]}],
    })
    out["note"] = "attached" if nst in (200, 201) else f"note failed ({nst})"
    return out


def note_text(name, email, prof):
    person = prof.get("person") or {}
    L = [f"BUYER PROFILE (auto-built on form submit) — {prof.get('company','?')}"]
    if person.get("full_name"):
        seat = person.get("title", "title unknown")
        L.append(f"WHO: {person['full_name']} — {seat} ({person.get('role_in_buying','role unknown')}, match {person.get('person_confidence','?')})")
        if person.get("linkedin_url"):
            L.append(f"LinkedIn: {person['linkedin_url']}")
    L.append(f"COMPANY: {prof.get('what_they_do','?')}")
    L.append(f"Size: {prof.get('company_size','?')} | Funding: {prof.get('funding','?')} | Industry: {prof.get('industry','?')}")
    ts = prof.get("tech_stack_hints") or []
    if ts:
        L.append("Tech: " + ", ".join(str(t) for t in ts[:10]))
    fit = prof.get("icp_fit") or {}
    L.append(f"ICP fit: {fit.get('verdict','?')} — {fit.get('why','')}")
    if prof.get("rep_brief"):
        L.append(f"REP BRIEF: {prof['rep_brief']}")
    gaps = prof.get("data_gaps") or []
    if gaps:
        L.append("Still unknown: " + "; ".join(str(g) for g in gaps[:6]))
    return "\n".join(L)


# ----------------------------------------------------------------------- pages
FORM_PAGE = """<!DOCTYPE html><html lang=en><head><meta charset=UTF-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>Talk to Sales — demo</title><style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#0f172a;
color:#0f172a;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}}
.card{{background:#fff;border-radius:18px;max-width:460px;width:100%;padding:34px 32px;box-shadow:0 20px 60px rgba(0,0,0,.35)}}
.badge{{font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#0d9488}}
h1{{font-size:23px;font-weight:800;letter-spacing:-.5px;margin:6px 0 4px}}
.sub{{color:#64748b;font-size:14px;margin-bottom:22px}}
label{{display:block;font-size:12.5px;font-weight:700;color:#334155;margin:14px 0 5px}}
input,textarea{{width:100%;border:1px solid #cbd5e1;border-radius:9px;padding:11px 12px;font-size:14px;font-family:inherit}}
input:focus,textarea:focus{{outline:none;border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,.15)}}
textarea{{resize:vertical;min-height:64px}}
button{{margin-top:20px;width:100%;background:#0d9488;color:#fff;border:none;border-radius:10px;padding:13px;
font-size:15px;font-weight:700;cursor:pointer}}button:hover{{background:#0f766e}}
.foot{{margin-top:16px;font-size:11.5px;color:#94a3b8;text-align:center}}
.foot a{{color:#0d9488;text-decoration:none}}
#ov{{display:none;position:fixed;inset:0;background:rgba(15,23,42,.92);color:#e2e8f0;
flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;z-index:9}}
#ov.on{{display:flex}}.spin{{width:42px;height:42px;border:4px solid #334155;border-top-color:#0d9488;
border-radius:50%;animation:s 1s linear infinite;margin-bottom:18px}}@keyframes s{{to{{transform:rotate(360deg)}}}}
#ov h2{{font-size:18px;margin-bottom:8px}}#ov p{{font-size:13.5px;color:#94a3b8;max-width:320px}}
</style></head><body>
<div class=card>
  <div class=badge>● Demo — live enrichment</div>
  <h1>Talk to our sales team</h1>
  <div class=sub>Tell us a bit about you and we'll be in touch. (This form quietly builds your full buyer profile on submit.)</div>
  <form method=POST action=/submit onsubmit="document.getElementById('ov').classList.add('on')">
    <label>Full name</label><input name=name placeholder="Jane Rivera" required>
    <label>Work email</label><input name=email type=email placeholder="jane@company.com" required>
    <label>Company website</label><input name=website value="{webval}" placeholder="company.com">
    <label>What are you looking for?</label><textarea name=message placeholder="Evaluating options, ~30 seats, timeline this quarter"></textarea>
    <input type=text name=nickname tabindex=-1 autocomplete=off style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" aria-hidden=true>
    <button type=submit>Request a call →</button>
  </form>
  <div class=foot>Rep inbox: <a href=/crm>/crm</a> · {hub}</div>
</div>
<div id=ov><div class=spin></div><h2>Building your buyer profile…</h2>
<p>Scraping the company, finding the person, assembling the rep brief. ~20–35 seconds — this is the work that normally takes a rep 20 minutes.</p></div>
</body></html>"""


def result_page(name, email, message, prof, crm):
    person = prof.get("person") or {}
    tech = prof.get("tech_stack_hints") or []
    dms = prof.get("likely_decision_makers") or []
    fit = prof.get("icp_fit") or {}
    gaps = prof.get("data_gaps") or []
    tech_html = "".join(f'<span class=chip>{esc(str(t).split("(")[0].strip())}</span>' for t in tech[:10])
    dm_html = "".join(f"<li>{esc(bpe._dm_str(d))}</li>" for d in dms) or "<li class=thin>none surfaced</li>"
    gap_html = "".join(f"<li>{esc(str(g))}</li>" for g in gaps[:7])

    pblock = ""
    if person.get("full_name"):
        sub = []
        if person.get("role_in_buying") and person["role_in_buying"] != "unknown":
            sub.append(esc(person["role_in_buying"]))
        if person.get("linkedin_url"):
            sub.append(f'<a href="{esc(person["linkedin_url"])}" target=_blank>LinkedIn ↗</a>')
        pblock = (f'<div class=person><div class=plab>Who actually filled out the form '
                  f'<span class=conf>match: {esc(person.get("person_confidence","?"))}</span></div>'
                  f'<div class=pname>{esc(person.get("full_name"))}'
                  f'{" — " + esc(person.get("title")) if person.get("title") else ""}</div>'
                  f'<div class=thin>{" · ".join(sub)}</div>'
                  f'{("<div class=pnote>" + esc(person.get("person_notes")) + "</div>") if person.get("person_notes") else ""}</div>')

    # CRM/HubSpot status line — honest about live vs stub
    if crm.get("mode") == "live":
        link = f' · <a href="{esc(crm.get("url"))}" target=_blank>open in HubSpot ↗</a>' if crm.get("url") else ""
        crm_html = f'<div class="crm ok">✓ Pushed to HubSpot — contact {esc(crm.get("action"))} (#{esc(crm.get("contact_id"))}), profile note {esc(crm.get("note"))}{link}</div>'
    elif crm.get("mode") == "stub":
        crm_html = f'<div class="crm stub">○ {esc(crm.get("detail"))}</div>'
    else:
        crm_html = f'<div class="crm err">⚠ CRM push: {esc(crm.get("detail"))}</div>'

    return f"""<!DOCTYPE html><html lang=en><head><meta charset=UTF-8>
<meta name=viewport content="width=device-width,initial-scale=1"><title>Lead dossier — {esc(prof.get('company','?'))}</title><style>
*{{box-sizing:border-box;margin:0;padding:0}}body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
background:#f1f5f9;color:#0f172a;line-height:1.5;padding:30px 18px 70px}}.wrap{{max-width:760px;margin:0 auto}}
.top{{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}}
.badge{{font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#0d9488}}
.back{{font-size:13px;color:#64748b;text-decoration:none}}
h1{{font-size:24px;font-weight:800;letter-spacing:-.5px;margin:2px 0}}
.crm{{border-radius:10px;padding:11px 14px;font-size:13px;font-weight:600;margin:14px 0 4px}}
.crm.ok{{background:#ecfdf5;color:#065f46;border:1px solid #6ee7b7}}.crm.ok a{{color:#047857}}
.crm.stub{{background:#fffbeb;color:#92400e;border:1px solid #fcd34d}}
.crm.err{{background:#fef2f2;color:#991b1b;border:1px solid #fca5a5}}
.grid{{display:grid;grid-template-columns:1fr 1.5fr;gap:14px;margin:16px 0}}
@media(max-width:620px){{.grid{{grid-template-columns:1fr}}}}
.panel{{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px}}
.before{{background:#f8fafc}}.plabel{{font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:800;color:#64748b;margin-bottom:10px}}
.f{{font-size:13.5px;margin:7px 0;color:#475569}}.f b{{color:#0f172a}}.thin{{color:#94a3b8;font-style:italic;font-size:13px}}
.person{{background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:14px 16px;margin-bottom:12px}}
.plab{{font-size:11px;text-transform:uppercase;letter-spacing:.6px;font-weight:800;color:#0f766e;margin-bottom:5px}}
.conf{{font-weight:600;color:#64748b;text-transform:none;letter-spacing:0}}
.pname{{font-size:16px;font-weight:750}}.pnote{{font-size:12.5px;color:#475569;margin-top:6px}}
.chip{{display:inline-block;background:#0f172a;color:#e2e8f0;border-radius:5px;padding:2px 8px;font-size:11.5px;
margin:3px 4px 0 0;font-family:ui-monospace,monospace}}.dms{{margin:4px 0 0 18px;font-size:13px;color:#475569}}
.brief{{background:#0f172a;color:#e2e8f0;border-radius:12px;padding:16px 18px;margin:14px 0;font-size:14px}}
.brief .plabel{{color:#5eead4}}.gaps{{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 16px;margin:14px 0}}
.gaps .plabel{{color:#b45309}}.gaps ul{{margin:4px 0 0 18px;font-size:13px;color:#78350f}}
</style></head><body><div class=wrap>
<div class=top><span class=badge>● Lead dossier — built live in {esc(str(prof.get('_secs','?')))}s</span><a class=back href=/>← new submission</a></div>
<h1>{esc(prof.get('company','?'))}</h1>
{crm_html}
{pblock}
<div class=grid>
  <div class="panel before"><div class=plabel>What the form captured</div>
    <div class=f><b>Name:</b> {esc(name)}</div><div class=f><b>Email:</b> {esc(email)}</div>
    <div class=f><b>Message:</b> {esc(message) or '<span class=thin>—</span>'}</div></div>
  <div class=panel><div class=plabel>What the system built</div>
    <div class=f><b>{esc(prof.get('company','?'))}</b> — {esc(prof.get('what_they_do',''))}</div>
    <div class=f><b>Size:</b> {esc(prof.get('company_size','?'))}</div>
    <div class=f><b>Industry:</b> {esc(prof.get('industry','?'))}</div>
    <div class=f><b>Funding:</b> {esc(prof.get('funding','?'))}</div>
    <div class=f><b>Tech:</b><br>{tech_html or '<span class=thin>none detected</span>'}</div>
    <div class=f><b>Decision-makers:</b><ul class=dms>{dm_html}</ul></div>
    <div class=f><b>ICP fit:</b> {esc(fit.get('verdict','?'))} — {esc(fit.get('why',''))}</div></div>
</div>
{f'<div class=brief><div class=plabel>Rep call-prep brief</div>{esc(prof.get("rep_brief",""))}</div>' if prof.get('rep_brief') else ''}
{f'<div class=gaps><div class=plabel>⚠ What it still cannot tell you</div><ul>{gap_html}</ul></div>' if gap_html else ''}
</div></body></html>"""


def crm_page():
    rows = []
    if os.path.exists(CRM_FILE):
        rows = [json.loads(l) for l in open(CRM_FILE) if l.strip()][::-1]
    items = ""
    for r in rows:
        p = r.get("profile", {})
        per = p.get("person") or {}
        who = esc(per.get("full_name") or r.get("name") or "?")
        title = esc(per.get("title") or "")
        items += (f'<div class=row><div><b>{who}</b>{" — " + title if title else ""}'
                  f'<div class=sm>{esc(p.get("company","?"))} · {esc(p.get("company_size","?"))} · fit {esc((p.get("icp_fit") or {}).get("verdict","?"))}</div></div>'
                  f'<div class=sm>{esc(r.get("ts",""))}<br>{esc(r.get("crm",{}).get("mode","?"))}</div></div>')
    return f"""<!DOCTYPE html><html><head><meta charset=UTF-8><title>Rep inbox</title><style>
body{{font-family:-apple-system,Arial,sans-serif;background:#f1f5f9;padding:30px 18px}}.w{{max-width:680px;margin:0 auto}}
h1{{font-size:22px;margin-bottom:4px}}.s{{color:#64748b;font-size:13px;margin-bottom:18px}}.s a{{color:#0d9488}}
.row{{background:#fff;border:1px solid #e2e8f0;border-radius:11px;padding:14px 16px;margin-bottom:9px;display:flex;
justify-content:space-between;gap:12px;font-size:14px}}.sm{{font-size:12px;color:#94a3b8;text-align:right}}
.row .sm{{text-align:right}}.row div .sm{{text-align:left;margin-top:3px}}
</style></head><body><div class=w><h1>Rep inbox — enriched leads</h1>
<div class=s>{len(rows)} lead(s), newest first · <a href=/>+ new submission</a></div>
{items or '<div class=s>No leads yet — submit the form.</div>'}</div></body></html>"""


# --------------------------------------------------------------------- server
class H(BaseHTTPRequestHandler):
    def _send(self, body, code=200):
        b = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def log_message(self, *a):
        pass

    def do_GET(self):
        if self.path.startswith("/crm"):
            self._send(crm_page())
        elif self.path.split("?")[0] in ("/", "/index.html"):
            hub = "HubSpot: LIVE push" if HUBSPOT else "HubSpot: stubbed (set HUBSPOT_TOKEN)"
            q = parse_qs(urlparse(self.path).query)
            webval = esc((q.get("website") or q.get("d") or [""])[0]).replace('"', "")
            self._send(FORM_PAGE.format(hub=hub, webval=webval))
        else:
            self._send("<p>not found · <a href=/>form</a></p>", 404)

    def do_POST(self):
        if self.path != "/submit":
            self._send("not found", 404)
            return
        n = int(self.headers.get("Content-Length", "0") or "0")
        q = parse_qs(self.rfile.read(n).decode("utf-8", "replace"))
        name = (q.get("name", [""])[0]).strip()
        email = (q.get("email", [""])[0]).strip()
        website = (q.get("website", [""])[0]).strip()
        message = (q.get("message", [""])[0]).strip()
        # honeypot: real users never fill this hidden field; bots do.
        if (q.get("nickname", [""])[0]).strip():
            self._send("<p>Thanks — we'll be in touch. <a href=/>back</a></p>")
            return
        # rate limit (real client IP if behind Railway's proxy)
        ip = (self.headers.get("X-Forwarded-For", "") or self.client_address[0]).split(",")[0].strip()
        ok, why = rate_ok(ip)
        if not ok:
            self._send(f"<!DOCTYPE html><meta charset=utf-8><div style='font-family:system-ui;max-width:460px;"
                       f"margin:80px auto;text-align:center;color:#334155'><h2>One sec ⏳</h2><p>{esc(why)}</p>"
                       f"<p><a href=/ style='color:#0d9488'>← back to the form</a></p></div>", 429)
            return
        domain = domain_from(website, email)
        print(f"[submit] {name} <{email}> domain={domain or '(none)'}")
        t0 = time.time()
        if domain:
            prof = bpe.enrich(domain, name, email, message, ICP)
        else:
            prof = {"company": "(unknown — personal email, no website)", "domain": "",
                    "what_they_do": "Could not enrich: lead used a free email and gave no company website.",
                    "icp_fit": {"verdict": "unknown", "why": "no company to assess"},
                    "person": bpe.enrich_person(name, email, "", ""),
                    "data_gaps": ["company identity (no work domain provided)"]}
        prof["_secs"] = int(time.time() - t0)
        crm = push_hubspot(name, email, prof)
        rec = {"ts": time.strftime("%Y-%m-%d %H:%M"), "name": name, "email": email,
               "message": message, "domain": domain, "profile": prof, "crm": crm}
        with open(CRM_FILE, "a") as f:
            f.write(json.dumps(rec) + "\n")
        print(f"[done] {prof.get('company','?')} in {prof['_secs']}s · CRM={crm.get('mode')}")
        self._send(result_page(name, email, message, prof, crm))


def main():
    if not bpe.FIRECRAWL or not bpe.ANTHROPIC:
        print("WARNING: FIRECRAWL_API_KEY / ANTHROPIC_API_KEY not in env — enrichment will be empty.", file=sys.stderr)
    where = f"http://localhost:{PORT}" if not PUBLIC else f"0.0.0.0:{PORT} (public)"
    print(f"AI Contact Form demo → {where}")
    print(f"  HubSpot: {'LIVE (real contacts will be created)' if HUBSPOT else 'STUBBED (set HUBSPOT_TOKEN to push)'}")
    print(f"  Mode: {'PUBLIC — rate-limited ' + str(MAX_PER_IP_HR) + '/ip/hr, ' + str(MAX_PER_DAY) + '/day' if PUBLIC else 'LOCAL'}")
    print(f"  CRM file: {CRM_FILE}")
    HTTPServer((HOST, PORT), H).serve_forever()


if __name__ == "__main__":
    main()

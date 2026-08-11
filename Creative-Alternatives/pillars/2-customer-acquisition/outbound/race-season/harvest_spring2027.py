#!/usr/bin/env python3
import json, re, csv, time, sys, urllib.parse, urllib.request, html

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
BASE = "https://runsignup.com/rest/races"

STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","WV","WI","WY","VA","WA"]

WINDOWS = [("2027-01-01","2027-01-31"),("2027-02-01","2027-02-28"),("2027-03-01","2027-03-31"),
           ("2027-04-01","2027-04-30"),("2027-05-01","2027-05-31")]

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
BAD_EMAIL = re.compile(r"(runsignup\.com|example\.com|sentry|wixpress|\.png$|\.jpg$|\.gif$)", re.I)

def fetch(params, retries=4):
    url = BASE + "?" + urllib.parse.urlencode(params)
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read().decode("utf-8", "replace"))
        except Exception as e:
            time.sleep(5 * (i + 1))
    return None

def extract_email(desc):
    if not desc:
        return ""
    d = html.unescape(desc)
    d = d.replace("&#64;", "@").replace("(at)", "@").replace(" at ", " at ")
    m = None
    for cand in EMAIL_RE.findall(d):
        cand = cand.rstrip(".")
        if BAD_EMAIL.search(cand):
            continue
        m = cand
        break
    return m or ""

def extract_contact_name(desc, email):
    if not desc:
        return ""
    d = re.sub(r"<[^>]+>", " ", html.unescape(desc))
    if email:
        i = d.find(email)
        if i > 0:
            window = d[max(0, i - 120):i]
            m = re.search(r"(?:contact|email|reach out to|director[,:]?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-zA-Z'\-]+){1,2})\s*(?:at|:|\(|,|\s)*$", window.strip(), re.I)
            if m:
                name = m.group(1).strip()
                if name.lower() not in ("race director", "the race"):
                    return name
    m = re.search(r"[Rr]ace [Dd]irector[,:\s]+([A-Z][a-z]+\s+[A-Z][a-zA-Z'\-]+)", d)
    if m:
        return m.group(1)
    return ""

def main():
    path = "/private/tmp/claude-501/-Users-ryantydingco-Documents-AIOS/83239217-a1b8-48bf-a612-99533ca28eb2/scratchpad/event-swag/races/races_spring2027.csv"
    states = sys.argv[1:] or STATES
    out = {}
    import os
    if not os.path.exists(path):
        with open(path, "w", newline="") as f:
            csv.writer(f).writerow(["race_name", "date", "city", "state", "contact_name", "contact_email", "website"])
    else:
        with open(path, newline="") as f:
            rd = csv.reader(f); next(rd, None)
            for row in rd:
                out[(row[0].lower(), row[1])] = None
    stats = {"queries": 0, "capped": []}
    new_rows = []
    for st in states:
        for (s, e) in WINDOWS:
            windows = [(s, e)]
            while windows:
                ws, we = windows.pop(0)
                params = {"format": "json", "results_per_page": 1000, "page": 1,
                          "start_date": ws, "end_date": we, "country_code": "US",
                          "state": st, "event_type": "running_race"}
                data = fetch(params)
                stats["queries"] += 1
                if not data or "races" not in data:
                    print(f"FAIL {st} {ws}..{we}", file=sys.stderr)
                    continue
                races = data["races"]
                if len(races) >= 1000:
                    # split window in half by day
                    from datetime import date, timedelta
                    d1 = date.fromisoformat(ws); d2 = date.fromisoformat(we)
                    if (d2 - d1).days >= 1:
                        mid = d1 + (d2 - d1) // 2
                        windows.insert(0, ((mid + timedelta(days=1)).isoformat(), we.__str__()))
                        windows.insert(0, (ws, mid.isoformat()))
                        continue
                    else:
                        stats["capped"].append(f"{st} {ws}")
                for r in races:
                    rc = r["race"]
                    name = (rc.get("name") or "").strip()
                    if "virtual" in name.lower():
                        continue
                    date_ = rc.get("next_date") or rc.get("last_date") or ""
                    addr = rc.get("address") or {}
                    if (addr.get("country_code") or "US") != "US":
                        continue
                    key = (name.lower(), date_)
                    if key in out:
                        continue
                    desc = rc.get("description") or ""
                    email = extract_email(desc)
                    cname = extract_contact_name(desc, email)
                    website = rc.get("external_race_url") or rc.get("url") or ""
                    row = [name, date_, addr.get("city") or "", addr.get("state") or "",
                           cname, email, website]
                    out[key] = row
                    new_rows.append(row)
                time.sleep(0.6)
        with open(path, "a", newline="") as f:
            csv.writer(f).writerows(new_rows)
        print(f"{st} done, +{len(new_rows)} rows (cumulative keys {len(out)})", flush=True)
        new_rows = []

    print(f"CHUNK DONE, {stats['queries']} queries, capped: {stats['capped']}")

if __name__ == "__main__":
    main()

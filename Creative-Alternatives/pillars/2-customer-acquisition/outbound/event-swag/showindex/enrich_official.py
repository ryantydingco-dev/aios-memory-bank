#!/usr/bin/env python3
import json, re, os, sys, html
import scrape_tfd as s

D = os.path.dirname(os.path.abspath(__file__))
recs = {}
for l in open(os.path.join(D, 'tfd_raw.jsonl')):
    e = json.loads(l)
    recs[(e['name'], e['start'])] = e

done = {}
p = os.path.join(D, 'official.jsonl')
if os.path.exists(p):
    for l in open(p):
        try:
            e = json.loads(l); done[(e['name'], e['start'])] = e
        except Exception: pass

fh = open(p, 'a')
todo = [k for k in recs if k not in done]
print('todo', len(todo), 'done', len(done), flush=True)
for i, k in enumerate(todo):
    e = recs[k]
    h = s.get(e['tfd'])
    site = ''
    m = re.search(r'title="Exhibition website"[^>]*>([^<]+)</span>', h)
    if not m:
        m = re.search(r'class="gothere"[^>]*>\s*([A-Za-z0-9.\-]+\.[a-z]{2,})\s*</span>', h)
    if m:
        site = html.unescape(m.group(1)).strip().strip('/')
    out = dict(e); out['site'] = site
    fh.write(json.dumps(out) + '\n'); fh.flush()
    if (i+1) % 25 == 0:
        print(i+1, len(todo), site, flush=True)
fh.close()
print('DONE')

import json,csv,re,sys
src,dst=sys.argv[1],sys.argv[2]
d=json.load(open(src))
hits=d['DATA']['results']['exhibitor']['hit']
seen=set();rows=[]
for h in hits:
    f=h['fields']
    eid=f.get('exhid_l') or f.get('exhname_t')
    if eid in seen: continue
    seen.add(eid)
    booth='; '.join(b for b in f.get('boothsdisplay_la',[]) if 'randomstring' not in b)
    desc=re.sub(r'\s+',' ',(f.get('exhdesc_t') or '')).strip()
    rows.append([(f.get('exhname_t') or '').strip(),booth,desc])
rows.sort(key=lambda r:r[0].lower())
with open(dst,'w',newline='') as fh:
    w=csv.writer(fh);w.writerow(['company','booth','description']);w.writerows(rows)
print(len(rows))

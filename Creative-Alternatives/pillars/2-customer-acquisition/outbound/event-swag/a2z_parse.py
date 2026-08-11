import re,html,csv,sys
s=open(sys.argv[1],encoding='utf-8',errors='replace').read()
rows=[];seen=set()
for tr in re.findall(r'<tr>(.*?)</tr>',s,re.S):
    m=re.search(r'class="exhibitorName"[^>]*>(.*?)</a>',tr,re.S)
    if not m: continue
    name=html.unescape(re.sub(r'<[^>]+>','',m.group(1))).strip()
    b=re.search(r'class="boothLabel aa-mapIt"[^>]*>(.*?)</a>',tr,re.S)
    booth=html.unescape(re.sub(r'<[^>]+>','',b.group(1))).strip() if b else ''
    k=name.lower()
    if not name or k in seen: continue
    seen.add(k); rows.append([name,booth,''])
rows.sort(key=lambda r:r[0].lower())
w=csv.writer(open(sys.argv[2],'w',newline=''));w.writerow(['company','booth','description']);w.writerows(rows)
print(len(rows))

#!/usr/bin/env python3
import json, re, os, collections

D = os.path.dirname(os.path.abspath(__file__))

STATE = {
 'las vegas':'NV','orlando':'FL','chicago':'IL','atlanta':'GA','new york city':'NY','new york':'NY',
 'anaheim':'CA','san diego':'CA','dallas':'TX','houston':'TX','nashville':'TN','denver':'CO','phoenix':'AZ',
 'boston':'MA','los angeles':'CA','san francisco':'CA','miami':'FL','miami beach':'FL','indianapolis':'IN',
 'louisville':'KY','detroit':'MI','minneapolis':'MN','seattle':'WA','philadelphia':'PA','washington':'DC',
 'washington dc':'DC','new orleans':'LA','san antonio':'TX','austin':'TX','charlotte':'NC','baltimore':'MD',
 'cleveland':'OH','columbus':'OH','kansas city':'MO','salt lake city':'UT','portland':'OR','st. louis':'MO',
 'st louis':'MO','tampa':'FL','fort worth':'TX','fort lauderdale':'FL','ft. lauderdale':'FL','long beach':'CA',
 'sacramento':'CA','san jose':'CA','pittsburgh':'PA','milwaukee':'WI','cincinnati':'OH','raleigh':'NC',
 'richmond':'VA','oklahoma city':'OK','memphis':'TN','reno':'NV','tucson':'AZ','albuquerque':'NM','omaha':'NE',
 'des moines':'IA','grand rapids':'MI','providence':'RI','hartford':'CT','buffalo':'NY','rochester':'NY',
 'jacksonville':'FL','birmingham':'AL','greenville':'SC','savannah':'GA','myrtle beach':'SC','palm springs':'CA',
 'scottsdale':'AZ','honolulu':'HI','anchorage':'AK','boise':'ID','spokane':'WA','tulsa':'OK','wichita':'KS',
 'little rock':'AR','lexington':'KY','knoxville':'TN','chattanooga':'TN','mobile':'AL','jackson':'MS',
 'shreveport':'LA','baton rouge':'LA','springfield':'MO','peoria':'IL','madison':'WI','green bay':'WI',
 'duluth':'MN','fargo':'ND','sioux falls':'SD','lincoln':'NE','colorado springs':'CO','ontario':'CA',
 'pasadena':'CA','santa clara':'CA','oakland':'CA','bellevue':'WA','tacoma':'WA','eugene':'OR','fresno':'CA',
 'riverside':'CA','west palm beach':'FL','daytona beach':'FL','naples':'FL','sarasota':'FL','fort myers':'FL',
 'national harbor':'MD','arlington':'VA','alexandria':'VA','norfolk':'VA','virginia beach':'VA',
 'greensboro':'NC','winston-salem':'NC','durham':'NC','columbia':'SC','charleston':'SC','augusta':'GA',
 'macon':'GA','huntsville':'AL','montgomery':'AL','tallahassee':'FL','costa mesa':'CA','san mateo':'CA',
 'rosemont':'IL','schaumburg':'IL','novi':'MI','dearborn':'MI','akron':'OH','dayton':'OH','toledo':'OH',
 'fort wayne':'IN','south bend':'IN','evansville':'IN','overland park':'KS','branson':'MO','frisco':'TX',
 'plano':'TX','irving':'TX','galveston':'TX','corpus christi':'TX','el paso':'TX','amarillo':'TX',
 'lubbock':'TX','midland':'TX','odessa':'TX','sandy':'UT','park city':'UT','aurora':'CO','fort collins':'CO',
 'cheyenne':'WY','billings':'MT','bend':'OR','salem':'OR','tempe':'AZ','mesa':'AZ','glendale':'AZ',
 'chandler':'AZ','henderson':'NV','monterey':'CA','santa barbara':'CA','ventura':'CA','carlsbad':'CA',
 'palm desert':'CA','indian wells':'CA','napa':'CA','concord':'CA','pleasanton':'CA','fremont':'CA',
 'sunnyvale':'CA','palo alto':'CA','burbank':'CA','irvine':'CA','newport beach':'CA','pomona':'CA',
 'atlantic city':'NJ','edison':'NJ','secaucus':'NJ','oaks':'PA','hershey':'PA','allentown':'PA',
 'ogden':'UT','provo':'UT','st. paul':'MN','saint paul':'MN','ann arbor':'MI','lansing':'MI',
 'kissimmee':'FL','deerfield beach':'FL','hollywood':'FL','st. petersburg':'FL','gaylord':'MI',
 'grapevine':'TX','round rock':'TX','the woodlands':'TX','sugar land':'TX','allen':'TX',
}

def norm(n):
    n = n.lower()
    n = re.sub(r'\b(20\d\d|the)\b', ' ', n)
    n = re.sub(r'[^a-z0-9]+', ' ', n).strip()
    return n

# small consumer / low-exhibitor patterns to drop
DROP = re.compile(r"(?i)^(?!.*(international|national)).*("
    r"home show|home \+ (garden|remodel|patio|landscape|improvement)|home (and|&) garden|"
    r"remodel(ing)? (expo|show)|garden show|home building|home improvement|patio show|"
    r"bridal|wedding expo|quinceanera|psychic|tattoo (expo|convention)|gun show|"
    r"craft (fair|show)|flea market|holiday (boutique|market)|christmas show|"
    r"job fair|career fair|college fair|home & remodeling)")

def load():
    out = {}
    # TSNN first (has exhibitor counts + urls + state)
    for l in open(os.path.join(D, 'tsnn_raw.jsonl')):
        e = json.loads(l)
        k = (norm(e['name']), e['start'])
        out[k] = {'name': e['name'], 'start': e['start'], 'city': e['city'],
                  'state': e.get('state',''), 'industry': '', 'exh': e.get('exh',''),
                  'site': e.get('site',''), 'src': 'tsnn'}
    # TFD adds industry + fills gaps
    if os.path.exists(os.path.join(D, 'official.jsonl')):
        for l in open(os.path.join(D, 'official.jsonl')):
            e = json.loads(l)
            k = (norm(e['name']), e['start'])
            if k in out:
                if not out[k]['industry']: out[k]['industry'] = e.get('industry','')
                if not out[k]['site']: out[k]['site'] = e.get('site','')
                out[k]['src'] = 'tsnn+tfd'
            else:
                out[k] = {'name': e['name'], 'start': e['start'], 'city': e['city'],
                          'state': STATE.get(e['city'].lower(),''), 'industry': e.get('industry',''),
                          'exh': '', 'site': e.get('site',''), 'src': 'tfd',
                          'venue': e.get('venue','')}
    return out

def main():
    m = load()
    rows = []
    dropped = 0
    for k, e in m.items():
        if DROP.search(e['name']):
            # keep if published exhibitor count >= 150
            try:
                if int(e['exh'] or 0) >= 150:
                    pass
                else:
                    dropped += 1; continue
            except Exception:
                dropped += 1; continue
        if not e.get('state'):
            e['state'] = STATE.get(e['city'].lower(), '')
        rows.append(e)
    rows.sort(key=lambda r: (r['start'], r['name']))
    json.dump(rows, open(os.path.join(D, 'merged.json'), 'w'), indent=0)
    print('merged', len(m), 'dropped', dropped, 'kept', len(rows))
    print('with site', sum(1 for r in rows if r['site']))
    print('with exh', sum(1 for r in rows if r['exh']))
    print('with state', sum(1 for r in rows if r['state']))
    print(collections.Counter(r['start'][:7] for r in rows).most_common())

if __name__ == '__main__':
    main()

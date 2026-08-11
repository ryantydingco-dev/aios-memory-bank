#!/usr/bin/env python3
import json, re, os, csv, collections, sys, urllib.parse

D = os.path.dirname(os.path.abspath(__file__))

RULES = [
 ("Medical/Healthcare", r"medic|health|hospital|clinic|nurs|surg|cardio|onco|derma|radiolog|patholog|orthoped|anesthe|pediatric|psychiatr|neuro|ophthalm|urolog|physician|md&m|healthcare|emergency medicine|hospice|pharmacy|pharma|biotech|life science|lab |laborator|diagnostic|telehealth|ehr|imaging|MRI"),
 ("Dental", r"dental|dentist|orthodont|oral health"),
 ("Veterinary/Pet", r"\bvet\b|veterinar|\bpet\b|pets|animal health|groom|equine|aquarium|zoo"),
 ("Food & Beverage", r"food|beverage|restaurant|culinary|bakery|baking|coffee|tea |wine|beer|brew|spirits|distill|grocer|supermarket|dairy|meat|seafood|produce|snack|confection|candy|chocolate|catering|foodservice|nutrition|natural products|specialty food|pizza|fancy food"),
 ("Agriculture", r"agri|farm|crop|livestock|cattle|poultry|swine|dairy expo|seed|irrigat|grain|horticultur|greenhouse|nursery|turf|hemp|forestry|timber|tractor|ranch"),
 ("Cannabis", r"cannabis|marijuana|\bmj\b|hemp expo|cbd"),
 ("Construction/Building", r"construct|build|contractor|roof|concrete|masonry|hvac|plumb|electric contract|remodel|renovat|architect|design build|infrastructure|paving|asphalt|demolition|steel|lumber|window|door |flooring|tile|kitchen & bath|kbis|insulat|drywall|siding|deck|fence|glass|hardware|nahb|world of concrete"),
 ("Manufacturing/Industrial", r"manufactur|industrial|machin|fabricat|tooling|metal|weld|automation|robot|cnc|precision|assembly|foundry|plastics|injection mold|composite|additive|3d print|mro|maintenance|bearing|hydraulic|pneumat|motion control|imts|fabtech|process expo"),
 ("Automotive", r"auto|automotive|car |vehicle|truck|tire|collision|dealer|motorcycle|powersport|aftermarket|sema|aapex|fleet|ev |electric vehicle|transmission|body shop|towing"),
 ("Aviation/Aerospace", r"aviation|aerospace|aircraft|airport|airline|drone|uav|space |satellite|helicopter|avionics|flight"),
 ("Marine/Boating", r"boat|marine|yacht|nautical|sail|maritime|shipping|port |workboat|dive |scuba"),
 ("Energy/Utilities", r"energy|solar|wind |power |utility|utilities|oil |gas |petroleum|drilling|nuclear|renewable|electric power|grid|battery|hydrogen|geothermal|distributech|coal|pipeline"),
 ("Technology/IT", r"tech|software|cloud|data |cyber|security tech|\bai\b|artificial intelligence|digital|saas|developer|devops|blockchain|crypto|semiconductor|electronics|computing|network|telecom|5g|iot|quantum|ces|nab show|infocomm|it "),
 ("Security/Public Safety", r"security|police|law enforcement|fire |firefight|ems |emergency|first respond|homeland|surveillance|guard|isc east|isc west|safety|forensic|corrections|defense|military|tactical"),
 ("Apparel/Fashion", r"apparel|fashion|footwear|shoe|textile|garment|sewing|knit|denim|magic |sourcing|accessories|jewelry|watch|handbag|uniform|workwear|imprint|embroider|screen print|promotional product|ppai|asi "),
 ("Gift/Home Goods", r"gift|home goods|housewares|tabletop|souvenir|stationery|greeting card|candle|home decor|furniture|furnishing|homegoods|shoppe object|nynow|market week"),
 ("Beauty/Wellness", r"beauty|cosmetic|salon|spa |skincare|hair |nail |barber|esthetic|makeup|fragrance|massage|wellness|aesthetic"),
 ("Fitness/Sports", r"fitness|gym|athletic|sport|outdoor retailer|golf|ski |snow show|bike|cycling|running|hunting|fishing|archery|shot show|shooting|firearm|recreation|surf|skate"),
 ("Hospitality/Travel", r"hotel|hospitality|lodging|travel|tourism|resort|casino|gaming|restaurant show|bar & |nightclub|cruise|meetings|incentive|imex|destination|rv |campground|theme park|attractions"),
 ("Education", r"educat|school|teacher|university|college|academ|learning|student|k-12|edtech|curricul|library|childcare|early childhood|training|campus"),
 ("Government/Nonprofit", r"government|municipal|public works|county|city manager|nonprofit|association|chamber|civic|transit|transportation|planning|water works|waste|recycling|solid waste"),
 ("Franchise/Business", r"franchise|small business|entrepreneur|startup|business expo|b2b |procurement|supply chain|logistics|warehouse|distribution|freight|trucking|3pl|packaging|pack expo|material handling|modex|promat"),
 ("Retail/Ecommerce", r"retail|ecommerce|e-commerce|shop|store|merchandis|point of sale|convenience store|c-store|nacs|grocery|licensing|nrf"),
 ("Finance/Insurance", r"financ|bank|credit union|insur|invest|mortgage|accounting|tax |wealth|fintech|payments|risk manage"),
 ("Real Estate", r"real estate|realtor|property|apartment|multifamily|facility|facilities|building owner|self storage|hoa |community association"),
 ("Print/Graphics/Signage", r"print|graphic|sign |signage|imaging|photo|label|converting|packaging print|wide format|isa sign|printing united"),
 ("Media/Entertainment", r"media|broadcast|film|music|entertainment|audio|video|theater|theatre|production|streaming|podcast|gaming expo|comic|anime|toy fair|licensing expo"),
 ("Marketing/Events", r"marketing|advertis|event |trade show|exhibit|conference|meeting profession|experiential|digimarcon|techspo|pr |communications|brand"),
 ("HR/Workforce", r"human resource|\bhr\b|workforce|talent|recruit|staffing|payroll|benefits|employment"),
 ("Chemicals/Materials", r"chemical|coating|adhesive|polymer|paint|resin|lubricant|rubber|glass tech|ceramic|nano"),
 ("Waste/Environment", r"environment|sustainab|green |climate|waste|recycl|water |wastewater|stormwater|air quality|remediation|erosion"),
 ("Mining/Materials", r"mining|quarry|aggregate|minerals|drilling|excavat"),
 ("Landscaping/Green Industry", r"landscape|lawn|irrigation|nursery|garden|arborist|tree care|hardscape|equip expo"),
 ("Funeral/Death Care", r"funeral|cemetery|death care|cremation"),
 ("Legal", r"legal|law |attorney|bar association|litigation|paralegal"),
 ("Religion/Faith", r"church|ministry|faith|christian|catholic|jewish|religio|worship"),
 ("Craft/Hobby", r"craft|quilt|hobby|scrapbook|bead|needle|yarn|woodwork|model |rc |collector|antique|coin|stamp|gem|mineral show"),
 ("Science/Research", r"science|research|chemistry|physics|biology|geolog|astronom|microscop|analytic|spectro|neuroscience|genom"),
]
COMPILED = [(n, re.compile(p, re.I)) for n, p in RULES]

def industry(name, tfd_ind, desc=""):
    t = name + " " + desc + " " + (tfd_ind or "")
    for n, rx in COMPILED:
        if rx.search(t):
            return n
    return tfd_ind or "Other/General"

EXTRA_STATE = {'san jos': 'CA', 'harrisburg': 'PA', 'arlington county': 'VA', 'ladson': 'SC', 'murfreesboro': 'TN', 'puyallup': 'WA', 'san juan': 'PR', 'las cruces': 'NM', 'kalamazoo': 'MI', 'montrose': 'CO', 'st. george': 'UT', 'appleton': 'WI', 'dandridge': 'TN', 'high point': 'NC', 'tallmadge': 'OH', 'filer': 'ID', 'farmington': 'NM', 'nampa': 'ID', 'fayetteville': 'AR', 'cedar rapids': 'IA', 'spanish fork': 'UT'}

def fix_state(city, st):
    if st: return st
    c = city.lower().strip()
    c = c.replace("\u00e9","e").replace("\u00f3","o")
    for k, v in EXTRA_STATE.items():
        if c.startswith(k): return v
    return ""

def clean_url(u):
    if not u: return ""
    if "safelinks.protection.outlook.com" in u:
        q = urllib.parse.parse_qs(urllib.parse.urlparse(u).query)
        if q.get("url"): u = q["url"][0]
    u = u.strip().strip('"\'').rstrip('\\')
    u = re.sub(r"[),;]+$", "", u)
    return u

def note(r):
    bits = []
    if r.get("venue"): bits.append(r["venue"])
    if r.get("access"): bits.append(r["access"])
    p = r.get("platform")
    if p == "mapyourshow":
        m = re.search(r"https?://([a-z0-9\-]+)\.mapyourshow\.com", clean_url(r.get("directory_url","")))
        if m: bits.append("MYS showcode=" + m.group(1))
    if p == "smallworldlabs":
        m = re.search(r"https?://([a-z0-9\-]+)\.smallworldlabs\.com", clean_url(r.get("directory_url","")))
        if m: bits.append("SWL tenant=" + m.group(1))
    if p == "a2z": bits.append("a2zinc POST module=organizations_organization_list")
    if p == "expocad": bits.append("try exhibitor_shows.xml")
    if p == "locked": bits.append("login/JS/CF gate")
    du = clean_url(r.get("directory_url",""))
    for vend, lab in [("conferenceharvester","vendor=ConferenceHarvester"),
                      ("map-dynamics","vendor=MapDynamics"),("mapdynamics","vendor=MapDynamics"),
                      ("eventscribe","vendor=eventScribe"),("swapcard","vendor=Swapcard"),
                      ("cvent","vendor=Cvent"),("expofp","vendor=ExpoFP"),
                      ("goexposoftware","vendor=GoExpo"),("ungerboeck","vendor=Ungerboeck"),
                      ("exhibitorsonline","vendor=ExhibitorsOnline"),("boothsbydesign","vendor=BoothsByDesign")]:
        if vend in du.lower():
            bits.append(lab); break
    bits.append("src=" + r.get("src", ""))
    return "; ".join(b for b in bits if b)

def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "probed.jsonl"
    rows = [json.loads(l) for l in open(os.path.join(D, src))]
    seen = set(); out = []
    for r in rows:
        k = (re.sub(r"[^a-z0-9]", "", r["name"].lower()), r["start"])
        if k in seen: continue
        seen.add(k)
        off = r.get("official") or (("https://" + r["site"]) if r.get("site") else "")
        out.append({
            "show_name": r["name"],
            "start_date": r["start"],
            "city": r["city"],
            "state": fix_state(r.get("city",""), r.get("state", "")),
            "industry": industry(r["name"], r.get("industry", ""), r.get("desc", "")),
            "est_exhibitors": r.get("exh", "") or "",
            "official_url": off,
            "directory_url": clean_url(r.get("directory_url", "")),
            "platform": r.get("platform", "unknown") or "unknown",
            "notes": note(r),
        })
    out.sort(key=lambda x: (x["start_date"], x["show_name"].lower()))
    p = os.path.join(D, "shows.csv")
    with open(p, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["show_name","start_date","city","state","industry",
                                          "est_exhibitors","official_url","directory_url","platform","notes"])
        w.writeheader(); w.writerows(out)
    print("rows", len(out))
    print("platform", collections.Counter(x["platform"] for x in out).most_common())
    print("month", sorted(collections.Counter(x["start_date"][:7] for x in out).items()))
    print("with dir", sum(1 for x in out if x["directory_url"]))
    print("industries", len(set(x["industry"] for x in out)))
    print(p)

if __name__ == "__main__":
    main()

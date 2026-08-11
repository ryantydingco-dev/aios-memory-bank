# Camp Inbound Staging Preview

Responsive, noindex staging build for the first Creative Alternatives owned demand asset.

## Pages

- `index.html` - summer camp merchandise commercial page
- `planning-calendar.html` - camp merchandise planning calendar
- `store-vs-bulk.html` - camp store versus bulk-order decision guide

## Run locally

```bash
python3 -m http.server 4173 --directory staging/camp-inbound
```

Open `http://127.0.0.1:4173/index.html`.

## Source of truth

The public copy and launch controls remain in:

- `pillars/3-online-presence/inbound/page-copy/summer-camp-merchandise.md`
- `pillars/3-online-presence/inbound/resource-copy/camp-merchandise-planning-calendar.md`
- `pillars/3-online-presence/inbound/resource-copy/camp-store-vs-bulk-order.md`
- `config/ca_inbound.yaml`
- `config/ca_inbound_assets.yaml`

This preview is a visual QA artifact. It deliberately uses `noindex,nofollow`, does not submit form data, and uses current gallery images only as review candidates. Do not publish those images on a new page until the permission gates in `config/ca_inbound_assets.yaml` are cleared.

The live Squarespace build should use the section and asset mapping in `outputs/inbound/implementation/squarespace-page-build.csv` and replace the preview form with the approved HubSpot embed.

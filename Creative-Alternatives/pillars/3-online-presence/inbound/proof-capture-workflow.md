# Proof Capture And Permission Workflow

This workflow turns real Creative Alternatives work into approved page proof without assuming that an existing website image, customer logo, testimonial, or old relationship can be reused in a new campaign.

Nothing in this file authorizes outreach or publication. Ryan, Kenny, or Maclaine reviews every request before it is sent.

## Fastest proof order

1. **Camps:** review the Camp Alvernia and Crestwood candidates, then capture one bulk program and one store or parent-ordering story.
2. **Racquet clubs:** review Open Squash, US Squash, and StreetSquash candidates plus the four current testimonials.
3. **Law firms:** confirm the Michele Mirman testimonial and capture a permission-cleared recruiting, retreat, or gifting flat lay.
4. **Services hub:** use approved examples from the first three niches, then add one gifting and one unusual-product example.
5. **Schools:** do not reuse student images until the school confirms the required organization, photographer, student, and parent or guardian permissions.
6. **Private clubs, corporate programs, and events:** capture new projects from the production briefs rather than stretching unrelated proof into these niches.

This order follows current evidence and does not make later niches look more proven than they are.

## Permission record

Record these facts before setting an asset or proof record to `approved`:

- Asset or proof ID from `config/ca_inbound_assets.yaml`
- Customer or organization
- Named approver and role
- Exact photograph, logo, quote, screenshot, or case-study text covered
- Approved channels: website, email, organic social, paid advertising, YouTube, or a narrower set
- Whether names, roles, logos, people, minors, locations, results, and project details may be shown
- Photographer or creator rights
- Expiration, withdrawal, or review date if applicable
- Date permission was received
- Where the written evidence is retained `[CONFIRM approved evidence location]`
- Any required attribution or crop restriction

Existing publication on the CA site is useful source evidence, but it is not the dated reuse evidence required by the launch gate.

## Status flow

`confirm_reuse -> requested -> approved | rejected | expired`

- `confirm_reuse`: candidate exists but no new-use decision has been recorded.
- `requested`: a human sent the approved request and is waiting.
- `approved`: the covered use and evidence are recorded.
- `rejected`: do not use the material in the new inbound system.
- `expired`: stop use until permission is renewed.

The page slot remains `candidate` or `brief_ready` until its final crop, alt text, claims, and supporting permission are reviewed. A page can move to `approved` only after every required slot is approved.

## Request draft - current photo or testimonial

**Subject:** Quick permission check for Creative Alternatives

Hi [Name],

We are improving the Creative Alternatives website and would like to feature [the attached photo / a short excerpt from your current testimonial] on our [specific page] page.

The proposed use is limited to [website / email / organic social / paid advertising - select only what is actually requested]. We would identify [organization, person, role, and logo - list the exact items] and use the material to show the real work behind the relationship.

Could you confirm whether Creative Alternatives has permission to use these specific materials for those purposes? If a photographer, parent or guardian, organization, or another rights holder also needs to approve, please let us know before we publish anything.

We will send the final crop and wording for review if you would like.

Thanks,
[Kenny / Maclaine / Ryan]

## Request draft - case study

**Subject:** Could we document this Creative Alternatives project?

Hi [Name],

We would like to turn the [project or program] we completed together into a short, practical example for the Creative Alternatives website.

The draft would cover the business need, the audience, the merchandise or ordering model, how approvals and delivery were handled, and only the outcome language you approve. We would not publish pricing, recipient information, private artwork, or internal details.

Would you be open to a short review? We can prepare the first draft from the project history and send every word and image for approval before anything goes live.

Thanks,
[Kenny / Maclaine / Ryan]

## Request draft - school, camp, or minors

**Subject:** Permission check for project photographs

Hi [Name],

We are considering the attached [school / camp / youth-program] photograph for a Creative Alternatives page about [specific use]. Because people under 18 may appear, we will not reuse it without a clear permission record.

Can you confirm whether your organization is authorized to approve this use and whether the photographer, subjects, and parents or guardians have provided the permissions required for [list the exact channels]? If not, we can use a product-only photograph or create a new image without identifiable participants.

Please do not send student, camper, order, address, or other private data in the reply.

Thanks,
[Kenny / Maclaine / Ryan]

## Request draft - store or workflow screenshot

**Subject:** Approval for a merchandise-store example

Hi [Name],

We would like to show a cropped example of the [store / ordering workflow] Creative Alternatives supported for [organization]. The image would demonstrate the ordering model without showing customer names, emails, addresses, order details, payment information, analytics, or private pricing.

Could you approve the attached redacted crop and the proposed caption for use on [specific page and channels]? We will not use the screenshot until the final version is approved.

Thanks,
[Kenny / Maclaine / Ryan]

## Case-study capture questions

Keep the interview to the facts needed for a useful buyer story:

1. What event, season, audience, or business need started the project?
2. What was difficult about the old process or the initial request?
3. Which product, store, gifting, or fulfillment model was selected, and why?
4. Who needed to approve the products, artwork, budget, and delivery plan?
5. What did Creative Alternatives handle?
6. Which details were unusual or easy to get wrong?
7. What changed for the buyer, staff, members, families, or attendees?
8. What exact outcome can be stated publicly and supported?
9. What should another buyer plan earlier next time?
10. Which name, role, quote, logo, images, dates, and channels are approved?

Do not turn convenience language into an unsupported result. If there is no verifiable number, describe the approved process improvement plainly.

## Capture shot list

For each new project, capture:

- One wide context image showing the merchandise in its real use
- One clean product grouping with readable decoration
- Two detail images showing material, placement, packaging, personalization, or unusual sourcing
- One process image such as proof review, packing, store assortment, or venue handoff
- One vertical crop for social use
- One 1200x630 crop candidate for sharing metadata
- A product-only alternative when people or location permissions are difficult

Avoid cluttered warehouse snapshots, generic supplier mockups, exposed addresses, order paperwork, private artwork, customer data, and screenshots with live account details.

## File and evidence handling

- Keep original files outside the public website library until approved.
- Preserve the original creator filename and capture date.
- Use a stable working name: `YYYYMMDD_niche_customer_project_view_status.ext`.
- Store the final approved crop separately from the original.
- Record the final alt text after the crop is selected.
- Link the permission evidence in `approval_evidence`; do not place private email content or personal data in the repository.
- Re-render the implementation package after every status change.

## Weekly proof review

Run a 20-minute review with Ryan and the relationship owner:

1. Open `outputs/inbound/implementation/asset-readiness.md`.
2. Review only the current priority pages: services, camp, racquet, then law.
3. Move approved requests to evidence capture; move declined requests to `rejected` immediately.
4. Assign no more than three permission or capture actions per owner for the week.
5. Re-render and confirm the approved-slot count changed for the intended page only.
6. Keep the page blocked until its copy claims, form, tracking, responsive QA, and every asset slot also pass.

Commands:

```bash
.venv/bin/python scripts/ca_inbound.py validate
.venv/bin/python scripts/ca_inbound.py render
```

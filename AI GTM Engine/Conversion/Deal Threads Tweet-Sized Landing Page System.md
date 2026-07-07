# Deal Threads Tweet-Sized Landing Page System

Last updated: 2026-06-01  
Offer: The Dead Form Audit  
Primary goal: email opt-in  
Secondary funnel step: ask for the prospect's form URL after opt-in  
Related HTML: `Conversion/deal-threads-tslp.html`

## Strategy

The TSLP should not sell Deal Threads directly. It should sell the smallest useful realization:

> My contact form is giving sales homework.

The opt-in offer is **The Dead Form Audit**, a short worksheet/checklist that helps founder-led B2B teams see whether their demo/contact form is giving sales a buyer profile or just a name and email.

After opt-in, the email sequence asks for the form URL and moves the prospect into the free Dead Form Teardown funnel.

## Business Context

- Business name: Deal Threads.
- Creator/personality: Ryan.
- Core offer: The Dead Form Audit.
- Audience: founder-led B2B teams, 5-40 employees, high-value deals, real demo/contact form, no mature RevOps.
- Transformation: know what buyer context your form is missing before sales follows up.
- Voice: practical, casual, slightly cheeky, anti-corporate, proof-first.
- Personal touch: casual Ryan photo, not a polished corporate headshot.

## Primary TSLP Copy

Character count: 230 characters.

```text
Hi, I'm Ryan and this is:
The Dead Form Audit
A 20-min worksheet to see if your form gives sales a buyer profile - or homework.
- score your form
- find missing buyer context
- see what to enrich
Get it free (for now, not forever)
```

Recommended form:

- Email placeholder: `work email`
- Button: `Send it`
- Tiny reassurance: `No spam. Just the audit.`

Total visible non-photo text including placeholder/button/reassurance stays under the TSLP spirit and remains ultra-minimal.

## Alternate Copy Variants

### Variant B: More Direct

Character count: 229 characters.

```text
Hi, I'm Ryan and this is:
The Dead Form Audit
Most forms give sales a name + email. This shows what buyer context they're missing.
- score your form
- spot hidden lead gaps
- know what to enrich
Get it free (for now, not forever)
```

### Variant C: Founder-Led

Character count: 215 characters.

```text
Hi, I'm Ryan and this is:
The Dead Form Audit
A tiny worksheet for B2B founders tired of calling inbound leads blind.
- score your form
- find missing context
- map the CRM handoff
Get it free (for now, not forever)
```

## Personality Injection Strategy

### Photo Direction

Use a casual, real photo of Ryan:

- laptop open, messy desk, coffee, notes, or screen in background.
- looking like a builder, not a SaaS executive.
- natural lighting.
- no suit, no stock-office pose.
- slightly imperfect is good.

Photo vibe:

> "I built this because boring forms are quietly wasting good leads."

If no photo is available yet, use a temporary candid phone shot. The point is trust, not polish.

### Voice Rules

Use:

- short lines.
- plain language.
- "homework" instead of "manual enrichment burden."
- "calling leads blind" instead of "suboptimal sales engagement."
- "unknown stays unknown" in follow-up content.

Avoid:

- AI-powered revenue acceleration jargon.
- vague SaaS category language.
- words like seamless, unlock, leverage, revolutionize, transform your pipeline.
- a corporate hero section.

### Quirky Authentic Elements

Optional micro-details for future variants:

- "I got tired of forms acting like name + email was enough."
- "Some forms are spiritually just a shoebox with a submit button."
- "Your CRM deserves better than a shrug."

Do not put all of these on the TSLP at once. Use them in follow-up emails or social posts.

## Visual Design Brief

### Layout

Desktop:

- two-column split.
- left: Ryan photo.
- right: copy and email opt-in.
- no navigation.
- no logo-heavy header.
- no footer links except optional privacy later.

Mobile:

- photo on top.
- copy and form below.
- button full width.
- no elements below the fold that matter.

### Color Scheme

Recommended palette:

- background: `#f7f3ec`
- text: `#171717`
- muted text: `#6b645c`
- accent/button: `#111827`
- button hover: `#0f766e`
- card/panel: `#fffaf2`

Reason:

Warm, human, simple, not the dark-blue B2B SaaS default.

### Typography

Use system fonts:

- `Inter`, `ui-sans-serif`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`

Style:

- 28-42px main title depending on viewport.
- 16-18px supporting lines.
- generous line height.
- no negative letter spacing.

### Button

Button text:

`Send it`

Style:

- high contrast.
- large touch target.
- full width on mobile.
- 44px+ height.
- slight radius, not overly rounded.

## Technical Implementation

HTML file created:

`Conversion/deal-threads-tslp.html`

Implementation notes:

- Static HTML/CSS.
- No external font dependency.
- No navigation.
- Mobile-first responsive layout.
- Form action is a placeholder and should be wired to the email tool.
- Replace `ryan-photo.jpg` with a real local/web image path before publishing.
- Analytics hooks are included as comments/placeholders.

Recommended form integrations:

- ConvertKit.
- Beehiiv.
- HubSpot form.
- Tally + Zapier/Make.
- Buttondown.

Minimum fields:

- email only.

Hidden fields to add:

- source.
- campaign.
- page variant.
- UTM parameters.

## A/B Testing Strategy

Do not test everything at once. Run one variable per 100-200 meaningful visits or 20+ opt-ins.

### Test 1: Copy Angle

Variants:

- A: buyer profile or homework.
- B: name + email is not enough.
- C: calling inbound leads blind.

Metric:

- visitor-to-email opt-in rate.

### Test 2: Photo

Variants:

- casual desk photo.
- selfie with laptop.
- screenshot/demo in background.

Metric:

- opt-in rate and bounce rate.

### Test 3: CTA Button

Variants:

- `Send it`
- `Get the audit`
- `Show me the gap`

Metric:

- form submit rate.

### Test 4: Lead Magnet Name

Variants:

- The Dead Form Audit.
- The Buyer Profile Gap Checklist.
- Stop Calling Leads Blind.

Metric:

- opt-in quality and replies to follow-up email.

## Distribution Strategy

### Primary Traffic Sources

LinkedIn:

- add TSLP link to profile featured section.
- post before/after form examples.
- CTA: "grab the audit."
- DM engaged founders with the page.

Cold email:

- PS line: "I made a tiny Dead Form Audit if you want to score your form: [link]"

Webinar:

- send no-shows to the TSLP.
- send cold traffic to the TSLP before asking for webinar attendance.

Partner:

- give HubSpot/Webflow/RevOps partners the TSLP as a simple free resource to share.

### Social Post To Drive Traffic

```text
Most demo forms collect the easy stuff:

name
email
company
"tell us more"

Then sales rebuilds the actual buyer profile by hand.

I made a tiny Dead Form Audit to score the gap.
Free for now: [link]
```

### Follow-Up Strategy

Email 1: deliver audit.

Subject:

`The Dead Form Audit`

CTA:

Reply with your score.

Email 2: ask for URL.

Subject:

`Want me to score your form?`

CTA:

Send the form URL.

Email 3: move to free teardown.

Subject:

`I can show the before/after`

CTA:

Request the free Dead Form Teardown.

## Success Metrics

Early targets:

- cold traffic opt-in: 5-12%.
- warm LinkedIn traffic opt-in: 15-30%.
- opt-in to reply with form URL: 10-25%.
- form URL to teardown delivered: 80%+.
- teardown delivered to call booked: 25-40%.

The metric that matters most:

> email opt-ins that become form URLs submitted.

## Quality Checklist

- Copy is under 280 characters.
- One CTA only.
- Email opt-in only.
- No nav.
- No second offer.
- No corporate stock photo.
- Human photo or visual.
- Mobile-friendly.
- Loads fast.
- Follow-up email asks for the form URL.
- UTM/source tracking exists before traffic is sent.

# Revenova — Dead Form Teardown

## Prospect
- Company: Revenova
- Site: https://revenova.com/
- Demo CTA: https://revenova.com/request-a-demo/
- Segment: Salesforce-powered TMS for 3PLs, freight brokers, trucking companies, shipping departments
- Fit score: 92
- Status: READY_FOR_TEARDOWN → LOOM_NEEDED

## Why this is a strong fit
Revenova is a strong Dealthreads target because it already positions around CRM + TMS. The demo form captures many fields, but it still does not produce a freight-specific buyer profile for sales.

Public evidence:
- RevenovaTMS is built/deployed on Salesforce.
- Targets 3PLs, freight brokers, trucking companies, and shipping departments.
- Form fields include first/last, company, title, phone, email, website, city, state, reason for contacting.

## Current form captures
- First name
- Last name
- Company
- Title
- Phone
- Email
- Website
- City
- State/Province
- Reason for contacting

## What sales still needs before callback
- Buyer type: 3PL, broker, carrier, shipper
- Company size and shipment volume
- Current TMS/CRM stack
- Salesforce usage/maturity
- Pain area: quoting, planning, routing, dispatch, tracking, documentation, settlement
- Implementation complexity
- Timeline / urgency

## Buyer profile mockup
```text
Company: {{company}}
Buyer: {{name / title}}
Segment: 3PL / freight broker / trucking company / shipper
Current CRM/TMS guess: Salesforce user likely? unknown
Fit score: High if Salesforce-backed logistics operator with manual TMS pain
Likely use case: CRM-powered freight workflow visibility
Urgency signal: Demo Request selected
Unknowns: shipment volume, current TMS, Salesforce maturity, timeline
Recommended first question: “Are you evaluating TMS because of quoting/dispatch workflow, customer visibility, or settlement/documentation pain?”
```

## Loom angle
“Revenova’s form captures more fields than most, but it still stops short of the actual sales-ready freight profile. Since Revenova is Salesforce-powered, the angle is a clean Salesforce handoff: form submit → enriched freight buyer profile → CRM-ready callback context.”

## Personalized opener
```text
Hey {{first_name}} — quick specific note on Revenova’s demo flow.

Since RevenovaTMS is Salesforce-powered, the form-to-CRM handoff is already central to the story. The form captures solid basics, but sales still has to figure out buyer type, shipment volume, current TMS/CRM stack, pain area, and urgency after submit.

I’m building Dealthreads to turn demo/contact submits into buyer profiles before callback.

Want me to send a 2-min teardown of what a Revenova rep could see before the first call?
```

## CTA
Send Loom + ask: “Want me to show this as a Salesforce-ready buyer profile mockup?”

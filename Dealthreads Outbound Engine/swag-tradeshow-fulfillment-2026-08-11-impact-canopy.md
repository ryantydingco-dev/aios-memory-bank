# Swag — Trade Show Exhibitors: Impact Canopy fulfillment (2026-08-11)

## Lead

**Rachel Hart** — Marketing Manager, Impact Canopy / Impact Canopies USA (custom pop-up canopies, event structures, flags, table covers; customers incl. Oakley, Kawasaki, Adidas, Honda; Corona CA; impactcanopy.com, "in business since 1999"). rachelh@impactcanopy.com.

- Campaign: Swag — Trade Show Exhibitors Oct 2026 (3777819), lead ID 4313808048, custom fields show_name=SEMA, show_month=November. Reply landed on s.laitmon@calendargroupelite.com inbox.
- Replied Aug 11, 10:31am: "Yes, shoot your shot, Ryan!! Let's see what you've got." + logo attached (extracted from email base64 → exact brand file).
- **SEMA Show verified: Nov 3–6, 2026, Las Vegas Convention Center** (semashow.com). ~12 weeks out.
- Note: they brand events for a living (canopy printer) — deck acknowledges it lightly; mockups had to be clean.

## Deliverables (same day, daily-swag-engine loop)

Five mockups, all catalog-lane items (job folder `Creative-Alternatives-AIOS/mockups/proof-sheets/impact-canopy/`):
1. `mockup-towel.png` — black microfiber detailing towel w/ grommet, white+orange logo (THE SEMA item; Hit Promo/Innovation Line lane; blank recolored blue→black in composite)
2. `mockup-cap.png` — Richardson 256 rope cap, purple+orange embroidery (blank from CA library, proven Bach Club job)
3. `mockup-socks.png` — black crew socks, white+orange logo both legs (SanMar/alphabroder lane; reused AlpVision blank)
4. `mockup-powerbank.png` — slim black power bank, white+orange (Hit/PCNA lane; reused blank; first generation failed, retry clean)
5. `mockup-tumbler.png` — white 20oz stainless tumbler w/ brass base, full-color logo (4imprint "Iconic Tumbler" = Koozie-lane generic, NO brand badge — the Yeti lesson applied)

**Gamma deck: https://gamma.app/docs/ferzvvoolet68mj** — v4 format, Indigo theme (matches Impact purple), towel mockup on title card. ⚠️ sharingOptions API param broken today (MCP serialization bug after server reconnect) — Ryan must set Share → "Anyone with link can view" in Gamma before sending.

Timeline ladder used (backward from Nov 3 + Vegas freight): **mid-Sept art lock = safe even slow-end · late Sept = typical run OK · October = betting on fast end.**

## Reply (send in-thread, CC maclaine@creativealternatives.com, attach 5 PNGs)

Rachel, shot fired. Mockups are done.

Five ideas for the SEMA booth, images attached and the full lineup here: [DECK LINK]

The detailing towel is the one built for that crowd, nobody at a car show has enough of them. The rope cap and socks are the wearables. The power bank is what everyone hunts for by the second hall. And the tumbler is the premium piece for booked meetings. You all brand events for a living, so we kept everything clean and let your logo do the work.

And we can print on just about anything. If something else comes to mind, say the word and I'll mock it up too. That part's always free.

Timing is friendly from here: production runs 4 to 6 weeks and proofs turn in 24 to 48 hours, so art locked by mid-September is safe even on a slow run, with time to ship to Vegas. Late September still works on a typical run.

I've copied Maclaine, who runs our quoting. If anything looks worth pricing, reply with rough quantities and she'll get you real numbers.

Ryan

## Ops notes
- Higgsfield MCP array params broke after server reconnect (batch tools + jobs_wait unusable): workaround = single-file `filename`/`content_type` for media_upload, single `media_id` for confirm, `params` JSON-string for generate_image, `id` for job_display. Gamma `sharingOptions` same bug.
- Logo extraction trick: prospect's email-signature logo arrives as base64 data URI in SmartLead message-history HTML → decode directly (better than tiny site favicon-res files).

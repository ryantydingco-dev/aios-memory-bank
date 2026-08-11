# Recording Setup & Workflow — the "just hit record" system

**Your kit:** Sony ZV-E10 II · RØDE wireless (~$300, likely Wireless GO II / ME) · MacBook Pro · Descript.
**The idea:** set up ONCE per batch day, then rip through 8 videos. Two modes — talking-head and screen-demo — both end in Descript.

---

## One-time setup (≈15 min, do it once per session)

**Camera**
- Tripod at **eye level**, lens about 1–2 ft above/behind the MacBook so the teleprompter sits right under the lens.
- Flip the screen toward you so you can see yourself.
- Settings to start simple: **4K, 30fps**, **Face/Eye AF ON** (the ZV line nails this), auto-exposure, auto white balance. (Go manual later — don't let settings be the bottleneck now.)

**Audio — you have the RØDE Wireless PRO (top of the line). Use its superpowers:**
- Wear it: clip a transmitter on your shirt ~8 inches below your chin, or use the **included Lavalier II** for a cleaner, hidden look.
- **Turn ON the on-board 32-bit float recording** (records to the transmitter's internal memory). This is the game-changer: 32-bit float **can't clip or distort**, so even if your levels are wrong, you recover perfect audio in post. With this on, **bad audio is basically impossible.**
- Turn on **GainAssist** so levels auto-adjust — set it and forget it.
- **Talking-head:** receiver → **camera's 3.5mm mic input** (baked into the video, zero syncing) + the on-board 32-bit file as your safety net.
- **Screen-demo:** receiver → **MacBook via USB-C** (it's a USB mic in Descript) — or just record to the transmitter's on-board memory and drop that file in.
- **Two-person videos (your Maclaine + Kenny interviews/audit):** you have **two transmitters + one receiver** — mic both people at once into the camera, no extra gear. Use the built-in **timecode** if you ever record audio separately.

**Teleprompter (the friction-killer for "follow a script")**
- Put the script on your **phone in a clamp mounted right under the camera lens**, or use the **MacBook screen** if the camera sits just above it.
- App: any teleprompter app (BIGVU, Teleprompter, or a free web one) — or just a Google Doc in huge font.
- Set the **scroll a touch slower than your natural pace** so you're never racing it.

**Light:** face a window, or a single cheap key light. Never light from behind.

---

## Mode A — Talking-head batch (the explainers, listicles, story videos)
1. Load the script into the teleprompter.
2. Hit record on the camera. Slate it: say the video name + clap once (easy to find in Descript).
3. Read the value sections off the prompter **in your own rhythm** — it's your script, paraphrase freely.
4. At every **`[💬 YOUR TAKE]`** beat: stop reading, look at the lens, and just talk. That delivery shift is what makes it *not* sound scripted.
5. Flub a line? **Don't restart the whole take** — pause, clap, redo just that sentence. You'll cut it by text in Descript.
6. Record all 8 back-to-back. **Change your shirt halfway** so the batch doesn't look identical when posted.

## Mode B — Screen-demo batch (QuickBooks, the agent builds, prompt demos)
1. RØDE → Mac (USB-C). 
2. Record in **Descript's recorder** (captures screen + mic + optional camera all at once) — or macOS **Cmd-Shift-5** if you want dead-simple.
3. Pro move: plug the **ZV-E10 II into the Mac via USB-C** — it works as a high-quality webcam, so your demo gets a real-camera corner instead of the laptop cam.
4. Talk through the demo following the script beats. Narrate what you're doing and react honestly to the result.
5. Anonymize any real customer/financial data **before** it hits the screen.

---

## Edit in Descript (same flow for both)
1. **Import** the camera file (+ screen recording). It **auto-transcribes** → now you edit video by editing text.
2. One-click cleanups: **Remove Filler Words** (um/uh), **Shorten/Remove Gaps**, **Studio Sound** (makes audio crisp), **Auto-Captions**.
3. **Trim by deleting text** — highlight the flubbed sentence, delete, it's gone from the video. Let **Underlord** (Descript's AI) take a rough first pass if you want.
4. Export **16:9** for YouTube.
5. **Shorts:** grab 3–5 of the best 30–60s moments (the stat, the result, the hot take), export **9:16 with big captions.** One long-form feeds a week of Shorts.

---

## The 3 things that make solo recording hard — solved
1. **Eyeline / "what do I say"** → teleprompter directly under the lens, script pre-loaded.
2. **Bad/out-of-sync audio** → RØDE *into the camera* for talking-head (baked-in), backup recording on.
3. **One mistake ruins the take** → never restart; redo the sentence, fix by text in Descript.

## Maybe-buy (only if you don't have them, ~$30–60 total)
- A **phone clamp** that mounts to the tripod (for the teleprompter under the lens).
- A basic **tripod** if you don't have one.
- A small **key light** if your room is dim.
That's it. Your camera, mic, and laptop already cover everything else.

---

## Batch-day rhythm (the whole point)
**Set up once → record 8 → dump all files into Descript → template the edit → export long-forms → slice Shorts.** Don't edit between takes. Record everything first, edit in one block. That's how you post daily without it eating your life.

---

## ✅ Pre-flight checklist (screenshot this for every record day)
**Before you roll:**
- [ ] RØDE: **32-bit float on-board recording ON** + GainAssist on
- [ ] Receiver → camera 3.5mm
- [ ] **60-sec test take** → check audio + framing in Descript BEFORE the real one
- [ ] Camera at eye level, Face/Eye AF on, you fill the frame
- [ ] Teleprompter loaded, scroll slightly slow
- [ ] Light on your face (window/key light), never behind you
- [ ] Water nearby, phone on silent, energy up

**While rolling:**
- [ ] Brackets aren't spoken. `[💬 YOUR TAKE]` = look at the lens and riff. `[FILL IN]` / `[VERIFY]` = handle in edit.
- [ ] Flub a line? Don't restart — pause, redo that sentence, keep going. Cut it in Descript.
- [ ] Smile before you hit record — it sets the energy.

**Mindset:** the first video just has to exist, not be perfect. Reps compound.

---

## Production skill stack (the polish layer — Claude can run these FOR you)
Close the on-screen-graphics gap. Use these ON your real footage — polish, never replace. You record + rough-cut in Descript, then hand Claude the footage/transcript and it produces the rest.
- **Base cut:** Descript (trim by text, filler removal, Studio Sound, basic captions).
- **Graphic overlays / lower-thirds / stat cards** (at your `[VISUAL CUE]` marks): **talking-head-recut** skill.
- **Cinematic captions** (beyond Descript): **embedded-captions** skill.
- **Motion graphics** (stat count-ups, kinetic type, callouts, logo sting): **motion-graphics** skill.
- **Auto-cut Shorts** from a long-form: **vidiq_generate_clips**.
- **Thumbnails:** **vidiq_generate_thumbnail** → **vidiq_score_thumbnail** (score before posting).
- **AI b-roll accents:** **vidiq_generate_broll**, or **Higgsfield** (needs authorization — connect via claude.ai connector settings / `/mcp` in an interactive session). Use sparingly.
- **Consistency system (the "Claude Bible"):** a reusable **brand/voice skill** — your on-camera voice + CA brand rules + visual style, so every script and asset stays on-brand.

**Rule:** polish real footage first; AI-generate only accents. Your edge is that it's REAL — don't slop it up.

import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve("outputs/deal_threads_beta_readiness");
const outputPath = path.join(outputDir, "Deal Threads Beta Readiness Workbook.xlsx");

const workbook = Workbook.create();

const palette = {
  ink: "#12242E",
  teal: "#0F766E",
  tealDark: "#115E59",
  blue: "#1D4ED8",
  sky: "#EAF3F8",
  mint: "#DFF7F2",
  amber: "#FFF1CC",
  amberText: "#92400E",
  redSoft: "#FDE2E1",
  redText: "#991B1B",
  greenSoft: "#DCFCE7",
  greenText: "#166534",
  gray: "#F4F6F8",
  white: "#FFFFFF",
  border: "#CBD5E1",
  text: "#172026",
  muted: "#5B6770",
};

function setWidths(sheet, widths) {
  widths.forEach((width, idx) => {
    sheet.getRangeByIndexes(0, idx, 1, 1).format.columnWidthPx = width;
  });
}

function title(sheet, range, text, subtitle = "") {
  const r = sheet.getRange(range);
  r.merge();
  r.values = [[subtitle ? `${text}\n${subtitle}` : text]];
  r.format = {
    fill: palette.ink,
    font: { bold: true, color: palette.white, size: 16 },
    wrapText: true,
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };
}

function section(sheet, range, text) {
  const r = sheet.getRange(range);
  r.merge();
  r.values = [[text]];
  r.format = {
    fill: palette.teal,
    font: { bold: true, color: palette.white, size: 11 },
    horizontalAlignment: "left",
  };
}

function header(range) {
  range.format = {
    fill: palette.ink,
    font: { bold: true, color: palette.white },
    horizontalAlignment: "center",
    wrapText: true,
    verticalAlignment: "center",
  };
}

function inputHeader(range) {
  range.format = {
    fill: palette.teal,
    font: { bold: true, color: palette.white },
    horizontalAlignment: "center",
    wrapText: true,
    verticalAlignment: "center",
  };
}

function tableBorders(range) {
  range.format.borders = {
    inside: { style: "continuous", color: palette.border },
    outside: { style: "continuous", color: palette.border },
  };
}

function card(sheet, cell, label, formula, numberFormat = "0") {
  const labelCell = sheet.getRange(cell);
  const valueCell = labelCell.offset(1, 0);
  labelCell.values = [[label]];
  valueCell.formulas = [[formula]];
  labelCell.format = {
    fill: palette.sky,
    font: { bold: true, color: palette.muted, size: 10 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };
  valueCell.format = {
    fill: palette.white,
    font: { bold: true, color: palette.ink, size: 14 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { bottom: { style: "continuous", color: palette.border } },
  };
  valueCell.format.numberFormat = numberFormat;
}

function statusFormats(range) {
  range.conditionalFormats.add("containsText", {
    text: "Green",
    format: { fill: palette.greenSoft, font: { bold: true, color: palette.greenText } },
  });
  range.conditionalFormats.add("containsText", {
    text: "Yellow",
    format: { fill: palette.amber, font: { bold: true, color: palette.amberText } },
  });
  range.conditionalFormats.add("containsText", {
    text: "Red",
    format: { fill: palette.redSoft, font: { bold: true, color: palette.redText } },
  });
}

function fitFormats(range) {
  range.format = {
    fill: palette.amber,
    font: { bold: true, color: palette.amberText },
    horizontalAlignment: "center",
  };
}

const command = workbook.worksheets.add("Command Center");
const targets = workbook.worksheets.add("Target List");
const teardowns = workbook.worksheets.add("Teardown Tracker");
const examples = workbook.worksheets.add("Profile Examples");
const intake = workbook.worksheets.add("Beta Intake");
const hubspot = workbook.worksheets.add("HubSpot Setup");
const install = workbook.worksheets.add("Install Tracker");
const proof = workbook.worksheets.add("Proof Log");
const objections = workbook.worksheets.add("Objections");
const review = workbook.worksheets.add("Weekly Review");

for (const sheet of [command, targets, teardowns, examples, intake, hubspot, install, proof, objections, review]) {
  sheet.showGridLines = false;
}

// Target List
title(targets, "A1:T2", "Deal Threads Beta Target List", "Build the first 50-account universe. Prioritize weak forms attached to high-value B2B sales motions.");
setWidths(targets, [160, 180, 210, 150, 140, 190, 150, 115, 115, 110, 240, 250, 180, 80, 135, 135, 145, 135, 170, 260]);
targets.getRange("A4:T4").values = [[
  "Company",
  "Website",
  "Form URL",
  "Buyer Name",
  "Buyer Role",
  "LinkedIn URL",
  "Segment",
  "Company Size",
  "Deal Value Guess",
  "CRM Guess",
  "Weak Form Observation",
  "Sales Research Hypothesis",
  "Reason Now",
  "Fit Score",
  "Teardown Priority",
  "Outreach Status",
  "Teardown Status",
  "Next Action",
  "Next Action Date",
  "Notes",
]];
inputHeader(targets.getRange("A4:T4"));
const targetRows = Array.from({ length: 50 }, () => [
  "", "", "", "", "", "", "Vertical SaaS", "", "High", "HubSpot", "", "", "", 0, "Later", "Not started", "Not started", "", "", "",
]);
targets.getRange("A5:T54").values = targetRows;
targets.getRange("G5:G54").dataValidation = { rule: { type: "list", values: ["Founder-led B2B", "RevOps-light", "Vertical SaaS", "Agency", "Cybersecurity", "Compliance", "Fintech", "Managed IT/MSP", "Data/Analytics", "Other"] } };
targets.getRange("I5:I54").dataValidation = { rule: { type: "list", values: ["Low", "Medium", "High", "$8K+", "$25K+", "$50K+", "Unknown"] } };
targets.getRange("J5:J54").dataValidation = { rule: { type: "list", values: ["HubSpot", "Salesforce", "Pipedrive", "Marketo", "Unknown"] } };
targets.getRange("N5:N54").dataValidation = { rule: { type: "list", values: ["0", "1", "2", "3", "4", "5"] } };
targets.getRange("O5:O54").dataValidation = { rule: { type: "list", values: ["Teardown first", "Later", "Avoid"] } };
targets.getRange("P5:P54").dataValidation = { rule: { type: "list", values: ["Not started", "Asked", "Replied", "Teardown sent", "Call booked", "Closed", "Passed"] } };
targets.getRange("Q5:Q54").dataValidation = { rule: { type: "list", values: ["Not started", "Drafted", "Sent", "Install CTA sent", "Won", "Lost"] } };
targets.getRange("S5:S54").format.numberFormat = "yyyy-mm-dd";
targets.getRange("K5:M54").format.wrapText = true;
targets.getRange("T5:T54").format.wrapText = true;
tableBorders(targets.getRange("A4:T54"));
fitFormats(targets.getRange("N5:N54"));
targets.tables.add("A4:T54", true, "TargetListTable");

// Teardown Tracker
title(teardowns, "A1:S2", "Deal Threads Dead Form Teardown Tracker", "Turn weak demo/contact forms into install conversations.");
setWidths(teardowns, [160, 210, 120, 170, 170, 90, 220, 230, 230, 230, 210, 125, 170, 135, 130, 130, 160, 160, 260]);
teardowns.getRange("A4:S4").values = [[
  "Company",
  "Form URL",
  "Page Type",
  "Current CTA",
  "Current Fields",
  "Form Score",
  "Biggest Missing Context",
  "Three Better Questions",
  "Enrichment Fields",
  "CRM Note Preview",
  "Loom/Doc Link",
  "Delivery Status",
  "Install CTA Sent?",
  "Install Call Date",
  "Outcome",
  "Follow-Up Owner",
  "Follow-Up Date",
  "Related Target",
  "Notes",
]];
inputHeader(teardowns.getRange("A4:S4"));
const teardownRows = Array.from({ length: 25 }, () => [
  "", "", "Demo", "", "", 0, "", "1. What are you trying to improve right now?\n2. When are you hoping to solve this?\n3. What CRM or sales workflow are you using today?", "Company size; industry; tech stack; recent news; likely decision-makers; ICP segment", "", "", "Not started", "No", "", "Open", "Ryan", "", "", "",
]);
teardowns.getRange("A5:S29").values = teardownRows;
teardowns.getRange("C5:C29").dataValidation = { rule: { type: "list", values: ["Demo", "Contact sales", "Pricing", "Product", "Other"] } };
teardowns.getRange("F5:F29").dataValidation = { rule: { type: "list", values: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"] } };
teardowns.getRange("L5:L29").dataValidation = { rule: { type: "list", values: ["Not started", "Drafted", "Recorded", "Sent", "Replied", "Call booked", "Closed"] } };
teardowns.getRange("M5:M29").dataValidation = { rule: { type: "list", values: ["Yes", "No"] } };
teardowns.getRange("O5:O29").dataValidation = { rule: { type: "list", values: ["Open", "Call booked", "Install started", "Won", "Lost", "Nurture"] } };
teardowns.getRange("N5:N29").format.numberFormat = "yyyy-mm-dd";
teardowns.getRange("Q5:Q29").format.numberFormat = "yyyy-mm-dd";
teardowns.getRange("G5:J29").format.wrapText = true;
teardowns.getRange("S5:S29").format.wrapText = true;
tableBorders(teardowns.getRange("A4:S29"));
teardowns.tables.add("A4:S29", true, "TeardownTrackerTable");

// Profile Examples
title(examples, "A1:N2", "Deal Threads Buyer Profile Example Library", "Use these as proof artifacts, demo records, and QA references.");
setWidths(examples, [150, 150, 190, 220, 220, 130, 110, 130, 110, 220, 260, 260, 180, 240]);
examples.getRange("A4:N4").values = [[
  "Example Name",
  "Segment",
  "Raw Submission",
  "Business Need",
  "Company Context",
  "Timeline",
  "Budget Signal",
  "ICP Score",
  "Priority",
  "Unknowns",
  "Recommended Rep Opener",
  "CRM Note",
  "Use Case",
  "Notes",
]];
header(examples.getRange("A4:N4"));
examples.getRange("A5:N9").values = [
  [
    "Vertical SaaS Demo",
    "Vertical SaaS",
    "Name, email, company, message: interested in demo.",
    "Needs better intake for inbound demos after paid campaigns.",
    "Approx. 75 employees, B2B SaaS, likely HubSpot, active hiring in sales.",
    "This quarter",
    "$25K+ likely ACV",
    5,
    "High",
    "Confirm CRM owner and buying committee.",
    "Saw your team is scaling sales. Are you trying to improve demo follow-up speed or lead quality first?",
    "High-fit vertical SaaS lead. Likely growth-stage. Ask about campaign source, CRM owner, and current handoff after form fill.",
    "Demo walkthrough",
    "",
  ],
  [
    "Cybersecurity Services",
    "Cybersecurity",
    "Contact form with name, email, phone, message.",
    "Wants security assessment but context is thin.",
    "B2B services, long sales cycle, high trust requirement.",
    "Unknown",
    "Medium/high",
    4,
    "High",
    "Authority, compliance driver, current vendor.",
    "What prompted the security review now: compliance deadline, incident, renewal, or board pressure?",
    "Qualified security inquiry. Capture trigger, deadline, current stack, and compliance requirement before callback.",
    "Trust proof",
    "",
  ],
  [
    "RevOps Consultancy",
    "RevOps-light",
    "Demo form asks only work email and company.",
    "Needs triage for CRM optimization leads.",
    "Consulting/service firm. Buyer likely VP Sales, RevOps, or founder.",
    "30-60 days",
    "Project budget unknown",
    5,
    "High",
    "CRM, deal size, implementation urgency.",
    "Are you looking to fix routing, attribution, pipeline visibility, or rep follow-up?",
    "Strong Deal Threads fit because the company sells operational context and can show CRM note value immediately.",
    "Partner pitch",
    "",
  ],
  [
    "Managed IT/MSP",
    "Managed IT/MSP",
    "Contact us form with generic message field.",
    "Needs to separate urgent support, sales, and compliance inquiries.",
    "B2B services. High value when lead is a multi-location client.",
    "Unknown",
    "High if multi-site",
    4,
    "Medium",
    "Company size, locations, current provider, urgency.",
    "Is this about a new provider search, an urgent issue, or planning for a future change?",
    "Profile should help route urgent support-like inquiries separately from new business.",
    "Routing demo",
    "",
  ],
  [
    "Fintech Platform",
    "Fintech",
    "Pricing inquiry form with company and email.",
    "Needs compliance-aware lead qualification.",
    "Regulated buyer. Sales needs company type, region, use case, and compliance need.",
    "This half",
    "$50K+ possible",
    5,
    "High",
    "Region, product interest, compliance trigger.",
    "Which part of the workflow are you evaluating: onboarding, reporting, compliance, or payment ops?",
    "High-value fintech inquiry. Do not over-enrich sensitive fields; keep unknowns explicit.",
    "Compliance-ready proof",
    "",
  ],
];
examples.getRange("H5:H29").dataValidation = { rule: { type: "list", values: ["0", "1", "2", "3", "4", "5"] } };
examples.getRange("I5:I29").dataValidation = { rule: { type: "list", values: ["Low", "Medium", "High"] } };
examples.getRange("C5:F29").format.wrapText = true;
examples.getRange("J5:N29").format.wrapText = true;
tableBorders(examples.getRange("A4:N29"));
fitFormats(examples.getRange("H5:H29"));
examples.tables.add("A4:N29", true, "ProfileExamplesTable");

// Beta Intake
title(intake, "A1:G2", "Deal Threads Beta Intake", "Collect only what is needed to install, route, and prove value.");
setWidths(intake, [180, 360, 105, 140, 150, 220, 260]);
intake.getRange("A4:G4").values = [["Field", "Question", "Required?", "Owner", "Status", "Response", "Notes"]];
inputHeader(intake.getRange("A4:G4"));
intake.getRange("A5:G26").values = [
  ["Company", "What company is this beta install for?", "Yes", "Client", "Not started", "", ""],
  ["Website", "What website and page should Deal Threads run on?", "Yes", "Client", "Not started", "", ""],
  ["Form URL", "Which current form should be replaced or mirrored?", "Yes", "Client", "Not started", "", ""],
  ["Primary Buyer", "Who owns inbound sales follow-up today?", "Yes", "Client", "Not started", "", ""],
  ["CRM", "Which CRM should receive the buyer profile?", "Yes", "Client", "Not started", "", ""],
  ["CRM Owner", "Who can create fields/workflows in the CRM?", "Yes", "Client", "Not started", "", ""],
  ["Routing Rule", "Who should receive high-priority leads?", "Yes", "Client", "Not started", "", ""],
  ["Existing Form Fields", "What fields does the current form capture?", "Yes", "Ryan", "Not started", "", ""],
  ["Lead Volume", "How many form submissions do you receive per month?", "No", "Client", "Not started", "", ""],
  ["Manual Research Time", "How many minutes does sales spend researching a good lead?", "No", "Client", "Not started", "", ""],
  ["ICP Definition", "What makes a lead high fit?", "Yes", "Client", "Not started", "", ""],
  ["Disqualifiers", "What makes a lead low fit or spam?", "Yes", "Client", "Not started", "", ""],
  ["Compliance Constraints", "Any fields we should avoid collecting or storing?", "Yes", "Client", "Not started", "", ""],
  ["Brand Voice", "Should the widget sound direct, consultative, technical, or warm?", "No", "Client", "Not started", "", ""],
  ["Calendar/Hand-Off", "Should the profile trigger booking, Slack/email, or rep assignment?", "No", "Client", "Not started", "", ""],
  ["Beta Success", "What would make this beta worth paying for next month?", "Yes", "Client", "Not started", "", ""],
  ["Install Contact", "Who can add the script tag?", "Yes", "Client", "Not started", "", ""],
  ["Approval Path", "Who signs off on widget copy and CRM fields?", "Yes", "Client", "Not started", "", ""],
  ["Launch Date", "When should the beta go live?", "Yes", "Client", "Not started", "", ""],
  ["Weekly Review Time", "When should the weekly proof review happen?", "No", "Client", "Not started", "", ""],
  ["Quote Permission", "Can we use anonymized metrics or quotes if this works?", "No", "Client", "Not started", "", ""],
  ["Screenshots Permission", "Can we capture anonymized CRM/profile screenshots?", "No", "Client", "Not started", "", ""],
];
intake.getRange("C5:C26").dataValidation = { rule: { type: "list", values: ["Yes", "No"] } };
intake.getRange("D5:D26").dataValidation = { rule: { type: "list", values: ["Ryan", "Client", "CRM owner", "Developer", "Sales owner"] } };
intake.getRange("E5:E26").dataValidation = { rule: { type: "list", values: ["Not started", "Requested", "Received", "Validated", "Blocked"] } };
intake.getRange("B5:B26").format.wrapText = true;
intake.getRange("F5:G26").format.wrapText = true;
tableBorders(intake.getRange("A4:G26"));
intake.tables.add("A4:G26", true, "BetaIntakeTable");

// HubSpot Setup
title(hubspot, "A1:H2", "Deal Threads HubSpot Sandbox Setup", "Use this to create a repeatable profile sync and QA flow.");
setWidths(hubspot, [210, 330, 120, 135, 130, 220, 160, 260]);
hubspot.getRange("A4:H4").values = [["Step", "Definition", "Required?", "Owner", "Status", "Test Record / Link", "Completion Date", "Notes"]];
inputHeader(hubspot.getRange("A4:H4"));
hubspot.getRange("A5:H24").values = [
  ["Create beta sandbox", "Use a sandbox/test portal when possible before touching production.", "Yes", "Ryan", "Not started", "", "", ""],
  ["Create custom object/fields", "Add buyer profile fields or mapped contact/company properties.", "Yes", "Ryan", "Not started", "", "", ""],
  ["Map identity fields", "Email, name, company, website, role, source page.", "Yes", "Ryan", "Not started", "", "", ""],
  ["Map conversation fields", "Business need, timeline, budget/buying stage, authority, unknowns.", "Yes", "Ryan", "Not started", "", "", ""],
  ["Map enrichment fields", "Employee range, industry, tech stack, recent news, ICP segment.", "Yes", "Ryan", "Not started", "", "", ""],
  ["Map scoring fields", "ICP score, priority, route owner, reason codes.", "Yes", "Ryan", "Not started", "", "", ""],
  ["Add CRM note template", "Rep-ready note with opener and unknowns to confirm.", "Yes", "Ryan", "Not started", "", "", ""],
  ["Build routing workflow", "High-priority leads alert sales owner; low-priority leads route to nurture.", "Yes", "CRM owner", "Not started", "", "", ""],
  ["Create test contact", "Use a fake but realistic lead to validate mapping.", "Yes", "Ryan", "Not started", "", "", ""],
  ["Run widget test", "Submit the test conversation from the target page.", "Yes", "Ryan", "Not started", "", "", ""],
  ["Validate CRM sync", "Confirm all expected values land correctly and unknowns remain explicit.", "Yes", "Ryan", "Not started", "", "", ""],
  ["Validate alert", "Confirm email/Slack/CRM task reaches the right owner.", "Yes", "Client", "Not started", "", "", ""],
  ["Privacy review", "Confirm sensitive or unnecessary fields are not stored.", "Yes", "Client", "Not started", "", "", ""],
  ["Sales review", "Ask rep/founder if profile helps them take action.", "Yes", "Client", "Not started", "", "", ""],
  ["Launch approval", "Client approves copy, routing, fields, and go-live timing.", "Yes", "Client", "Not started", "", "", ""],
  ["Go live", "Install live script and run one final smoke test.", "Yes", "Developer", "Not started", "", "", ""],
  ["Day 1 proof check", "Confirm first lead path, logging, and reporting.", "Yes", "Ryan", "Not started", "", "", ""],
  ["Week 1 report", "Send proof report and ask what changed in follow-up.", "Yes", "Ryan", "Not started", "", "", ""],
  ["Expansion decision", "Continue, adjust, pause, expand, or convert to paid.", "Yes", "Client", "Not started", "", "", ""],
  ["Case study capture", "Collect quote, screenshot, and before/after metrics if proof threshold is met.", "No", "Ryan", "Not started", "", "", ""],
];
hubspot.getRange("C5:C24").dataValidation = { rule: { type: "list", values: ["Yes", "No"] } };
hubspot.getRange("D5:D24").dataValidation = { rule: { type: "list", values: ["Ryan", "Client", "CRM owner", "Developer", "Sales owner"] } };
hubspot.getRange("E5:E24").dataValidation = { rule: { type: "list", values: ["Not started", "In progress", "Done", "Blocked"] } };
hubspot.getRange("G5:G24").format.numberFormat = "yyyy-mm-dd";
hubspot.getRange("B5:B24").format.wrapText = true;
hubspot.getRange("H5:H24").format.wrapText = true;
tableBorders(hubspot.getRange("A4:H24"));
hubspot.tables.add("A4:H24", true, "HubSpotSetupTable");

// Install Tracker
title(install, "A1:L2", "Deal Threads Beta Install Tracker", "Keep each beta install moving from intake to first proof.");
setWidths(install, [160, 170, 120, 140, 120, 140, 140, 140, 140, 180, 160, 260]);
install.getRange("A4:L4").values = [[
  "Client",
  "Website/Page",
  "CRM",
  "Install Contact",
  "Stage",
  "Script Tag Sent",
  "Script Installed",
  "CRM Connected",
  "Smoke Test Done",
  "Go-Live Date",
  "Week 1 Review",
  "Notes",
]];
inputHeader(install.getRange("A4:L4"));
install.getRange("A5:L19").values = Array.from({ length: 15 }, () => ["", "", "HubSpot", "", "Prospect", "No", "No", "No", "No", "", "", ""]);
install.getRange("C5:C19").dataValidation = { rule: { type: "list", values: ["HubSpot", "Salesforce", "Pipedrive", "Other", "Unknown"] } };
install.getRange("E5:E19").dataValidation = { rule: { type: "list", values: ["Prospect", "Intake", "Setup", "QA", "Live", "Paid", "Paused"] } };
install.getRange("F5:I19").dataValidation = { rule: { type: "list", values: ["Yes", "No"] } };
install.getRange("J5:K19").format.numberFormat = "yyyy-mm-dd";
install.getRange("L5:L19").format.wrapText = true;
tableBorders(install.getRange("A4:L19"));
install.tables.add("A4:L19", true, "InstallTrackerTable");

// Proof Log
title(proof, "A1:S2", "Deal Threads Proof Log", "Every beta should produce proof, product learning, or a clear stop signal.");
setWidths(proof, [140, 100, 100, 105, 100, 110, 115, 115, 115, 110, 120, 130, 125, 130, 130, 260, 180, 135, 250]);
proof.getRange("A4:S4").values = [[
  "Client",
  "Week Start",
  "Widget Sessions",
  "Completed Conversations",
  "Completion Rate",
  "Profiles Created",
  "CRM Sync Success",
  "Sync Rate",
  "High-Priority Leads",
  "Profiles Reviewed",
  "Useful Profiles",
  "Useful Profile Rate",
  "Median Submit-to-Profile Min",
  "Research Min Saved",
  "Meetings Influenced",
  "Best Profile / Quote",
  "Decision",
  "Proof Strength",
  "Next Change",
]];
inputHeader(proof.getRange("A4:S4"));
const weekStart = new Date("2026-06-01T00:00:00");
const proofRows = Array.from({ length: 30 }, (_, idx) => {
  const d = new Date(weekStart);
  d.setDate(weekStart.getDate() + Math.floor(idx / 5) * 7);
  return ["", d, 0, 0, "", 0, 0, "", 0, 0, 0, "", 0, "", 0, "", "Continue", "", ""];
});
proof.getRange("A5:S34").values = proofRows;
for (let r = 5; r <= 34; r++) {
  proof.getRange(`E${r}`).formulas = [[`=IFERROR(D${r}/C${r},0)`]];
  proof.getRange(`H${r}`).formulas = [[`=IFERROR(G${r}/F${r},0)`]];
  proof.getRange(`L${r}`).formulas = [[`=IFERROR(K${r}/J${r},0)`]];
  proof.getRange(`N${r}`).formulas = [[`=IF(F${r}>0,F${r}*10,0)`]];
  proof.getRange(`R${r}`).formulas = [[`=IF(AND(F${r}>=10,L${r}>=0.7,N${r}>=100,O${r}>=1),"Strong",IF(AND(F${r}>=5,L${r}>=0.5,H${r}>=0.9),"Good",IF(F${r}=0,"No entries yet","Weak")))`]];
}
proof.getRange("B5:B34").format.numberFormat = "yyyy-mm-dd";
proof.getRange("E5:E34").format.numberFormat = "0.0%";
proof.getRange("H5:H34").format.numberFormat = "0.0%";
proof.getRange("L5:L34").format.numberFormat = "0.0%";
proof.getRange("Q5:Q34").dataValidation = { rule: { type: "list", values: ["Continue", "Adjust", "Pause", "Expand", "Convert to paid"] } };
proof.getRange("P5:P34").format.wrapText = true;
proof.getRange("S5:S34").format.wrapText = true;
tableBorders(proof.getRange("A4:S34"));
proof.tables.add("A4:S34", true, "ProofLogTable");

// Objections
title(objections, "A1:F2", "Deal Threads Objection And Trust Pack", "Keep answers tight, proof-led, and calm.");
setWidths(objections, [210, 330, 260, 220, 160, 250]);
objections.getRange("A4:F4").values = [["Objection", "Short Response", "Proof Asset To Use", "Follow-Up Question", "Risk Level", "Notes"]];
header(objections.getRange("A4:F4"));
objections.getRange("A5:F15").values = [
  ["We already have a form", "That is the point. The form captures the lead; Deal Threads builds the buyer profile before callback.", "Dead form teardown", "What does sales still research after submit?", "Low", ""],
  ["We already use chat", "Most chat tools answer questions. Deal Threads is built around profile capture, enrichment, and CRM handoff.", "Profile example", "Does your current chat create a rep-ready CRM note?", "Medium", ""],
  ["Data accuracy worries me", "Unknowns stay unknown. The profile separates captured answers, enrichment signals, and fields to confirm.", "HubSpot field map", "Which fields must be verified by the rep?", "High", ""],
  ["Compliance/privacy concerns", "The beta only collects sales-relevant context and avoids sensitive fields unless approved.", "Intake compliance section", "Which fields should we explicitly avoid?", "High", ""],
  ["This sounds hard to install", "The beta is intentionally lightweight: one script tag, mapped CRM fields, and one smoke test.", "Install packet", "Who can add a script tag and who owns CRM fields?", "Medium", ""],
  ["We do not have enough traffic", "Then the beta is about profile quality, not volume. Five useful profiles can still prove the workflow.", "Proof log", "How many qualified form submissions do you get monthly?", "Medium", ""],
  ["How is this different from Clearbit/Apollo?", "Those enrich records. Deal Threads changes the intake conversation and creates the sales handoff around the enrichment.", "Buyer profile example", "Where does the rep currently see intent, urgency, and unknowns?", "Medium", ""],
  ["Why pay monthly?", "Because the value is the managed intake, enrichment, routing, QA, and reporting loop, not the widget alone.", "Weekly beta report", "Who owns keeping your current form and CRM handoff optimized?", "Medium", ""],
  ["Can we just build it ourselves?", "Eventually maybe. The beta proves which questions, fields, and routing rules matter before you spend internal roadmap time.", "Install plan", "How fast could your team ship and maintain the full loop?", "Medium", ""],
  ["What if profiles do not improve outcomes?", "Then we adjust the conversation flow. The beta is designed to identify that quickly.", "Proof thresholds", "What metric would prove this is worth continuing?", "Low", ""],
  ["I need to see it first", "I can send a teardown and mock buyer profile from your current form before we talk install.", "Teardown template", "Which form should I use for the teardown?", "Low", ""],
];
objections.getRange("E5:E15").dataValidation = { rule: { type: "list", values: ["Low", "Medium", "High"] } };
objections.getRange("B5:D15").format.wrapText = true;
objections.getRange("F5:F15").format.wrapText = true;
tableBorders(objections.getRange("A4:F15"));
objections.tables.add("A4:F15", true, "ObjectionsTable");

// Weekly Review
title(review, "A1:H2", "Deal Threads Weekly Beta Review", "Use every Friday. Decide what to improve, stop, or scale.");
setWidths(review, [180, 340, 160, 160, 130, 160, 160, 250]);
review.getRange("A4:H4").values = [["Review Area", "Question", "Owner", "Metric / Evidence", "Status", "Decision", "Due Date", "Notes"]];
inputHeader(review.getRange("A4:H4"));
review.getRange("A5:H18").values = [
  ["Targets", "Did we add enough high-fit companies to keep teardown flow moving?", "Ryan", "Fit 4-5 targets", "Open", "", "", ""],
  ["Outreach", "Which message or comment generated actual form URL asks?", "Ryan", "Replies / form URLs", "Open", "", "", ""],
  ["Teardowns", "Which teardown most clearly showed the dead-form gap?", "Ryan", "Replies / calls", "Open", "", "", ""],
  ["Install", "Is any client blocked on script, CRM, or approval?", "Ryan", "Install tracker stage", "Open", "", "", ""],
  ["CRM Handoff", "Did the rep see enough context to act?", "Client", "Profile review answers", "Open", "", "", ""],
  ["Conversation Flow", "Which question created useful qualification?", "Ryan", "Useful profile feedback", "Open", "", "", ""],
  ["Enrichment", "Which enrichment fields were useful, noisy, or missing?", "Ryan", "Profile accuracy notes", "Open", "", "", ""],
  ["Proof", "Did this beta create useful buyer profiles before callback?", "Client", "Useful profile rate", "Open", "", "", ""],
  ["Revenue", "Is this client ready for founder install or managed monthly pricing?", "Ryan", "Decision / quote", "Open", "", "", ""],
  ["Case Study", "Do we have permission and enough proof to create a case study?", "Client", "Quote/screenshots/metrics", "Open", "", "", ""],
  ["Next Week", "What is the one change that most improves proof?", "Ryan", "Decision", "Open", "", "", ""],
  ["Stop Signal", "What would make us pause or adjust this beta?", "Ryan", "Proof strength", "Open", "", "", ""],
  ["Partner Signal", "Did any CRM consultant, agency, or RevOps partner show interest?", "Ryan", "Partner replies", "Open", "", "", ""],
  ["Learning", "What language from buyers should update the landing page or posts?", "Ryan", "Buyer phrase", "Open", "", "", ""],
];
review.getRange("E5:E18").dataValidation = { rule: { type: "list", values: ["Open", "Done", "Blocked", "Deferred"] } };
review.getRange("G5:G18").format.numberFormat = "yyyy-mm-dd";
review.getRange("B5:B18").format.wrapText = true;
review.getRange("H5:H18").format.wrapText = true;
tableBorders(review.getRange("A4:H18"));
review.tables.add("A4:H18", true, "WeeklyReviewTable");

// Command Center
title(command, "A1:J2", "Deal Threads Beta Readiness Command Center", "Run this first: fill Target List, send teardowns, install five betas, then capture proof.");
setWidths(command, [190, 130, 115, 115, 260, 130, 140, 340, 130, 160, 35, 130, 145, 145]);
section(command, "A4:J4", "Beta Readiness Snapshot");
card(command, "A5", "Targets Logged", '=COUNTIF(\'Target List\'!$A$5:$A$54,"?*")', "0");
card(command, "B5", "High-Fit Targets", '=COUNTIFS(\'Target List\'!$A$5:$A$54,"?*",\'Target List\'!$N$5:$N$54,">=4")', "0");
card(command, "C5", "Teardowns Sent", '=COUNTIFS(\'Teardown Tracker\'!$L$5:$L$29,"Sent")+COUNTIFS(\'Teardown Tracker\'!$L$5:$L$29,"Replied")+COUNTIFS(\'Teardown Tracker\'!$L$5:$L$29,"Call booked")+COUNTIFS(\'Teardown Tracker\'!$L$5:$L$29,"Closed")', "0");
card(command, "D5", "Install Calls", '=COUNTIFS(\'Teardown Tracker\'!$O$5:$O$29,"Call booked")+COUNTIFS(\'Install Tracker\'!$E$5:$E$19,"Intake")+COUNTIFS(\'Install Tracker\'!$E$5:$E$19,"Setup")', "0");
card(command, "E5", "Live Betas", '=COUNTIFS(\'Install Tracker\'!$E$5:$E$19,"Live")+COUNTIFS(\'Install Tracker\'!$E$5:$E$19,"Paid")', "0");
card(command, "F5", "Profiles Created", '=SUM(\'Proof Log\'!$F$5:$F$34)', "0");
card(command, "G5", "Useful Profile Rate", '=IFERROR(SUM(\'Proof Log\'!$K$5:$K$34)/SUM(\'Proof Log\'!$J$5:$J$34),0)', "0.0%");
card(command, "H5", "Minutes Saved", '=SUM(\'Proof Log\'!$N$5:$N$34)', "0");
card(command, "I5", "Meetings Influenced", '=SUM(\'Proof Log\'!$O$5:$O$34)', "0");
card(command, "J5", "Next Bottleneck", '=IF(B6<20,"Build target list",IF(C6<5,"Send teardowns",IF(E6<1,"Get first install live",IF(G6<0.5,"Improve profile usefulness","Scale proof"))))', "@");

section(command, "A9:E9", "Operating Checklist");
command.getRange("A10:E18").values = [
  ["Step", "Goal", "Current", "Status", "Next Action"],
  ["1. Build target universe", "50 targets, 20 high-fit", null, null, "Add 5 companies today from LinkedIn/search."],
  ["2. Send teardowns", "5 teardowns sent", null, null, "Record or write one 15-minute teardown."],
  ["3. Book install calls", "3 install calls", null, null, "Send install CTA to teardown replies."],
  ["4. Launch beta", "1 live beta", null, null, "Complete intake and HubSpot setup."],
  ["5. Create profiles", "10 profiles created", null, null, "Run traffic through widget and QA first profiles."],
  ["6. Prove usefulness", "70% useful profile rate", null, null, "Ask rep/founder to rate every profile."],
  ["7. Capture proof", "1 quote + screenshot", null, null, "Ask for quote after a useful profile changes follow-up."],
  ["8. Convert or adjust", "$2.5K/mo or clear learning", null, null, "Use proof review to ask for paid continuation."],
];
header(command.getRange("A10:E10"));
command.getRange("C11:C18").formulas = [
  ["=A6"],
  ["=C6"],
  ["=D6"],
  ["=E6"],
  ["=F6"],
  ["=G6"],
  ['=COUNTIFS(\'Proof Log\'!$R$5:$R$34,"Strong")+COUNTIFS(\'Proof Log\'!$R$5:$R$34,"Good")'],
  ['=COUNTIFS(\'Install Tracker\'!$E$5:$E$19,"Paid")'],
];
command.getRange("D11:D18").formulas = [
  ['=IF(C11>=50,"Green",IF(C11>=20,"Yellow","Red"))'],
  ['=IF(C12>=5,"Green",IF(C12>=2,"Yellow","Red"))'],
  ['=IF(C13>=3,"Green",IF(C13>=1,"Yellow","Red"))'],
  ['=IF(C14>=1,"Green","Red")'],
  ['=IF(C15>=10,"Green",IF(C15>=5,"Yellow","Red"))'],
  ['=IF(C16>=0.7,"Green",IF(C16>=0.5,"Yellow","Red"))'],
  ['=IF(C17>=1,"Green","Yellow")'],
  ['=IF(C18>=1,"Green",IF(E6>=1,"Yellow","Red"))'],
];
command.getRange("C16:C16").format.numberFormat = "0.0%";
command.getRange("A10:E18").format.wrapText = true;
command.getRange("A10:E18").format.rowHeightPx = 38;
tableBorders(command.getRange("A10:E18"));
statusFormats(command.getRange("D11:D18"));

section(command, "G9:J9", "This Week");
command.getRange("G10:J16").values = [
  ["Priority", "Action", "Owner", "Done?"],
  ["1", "Add 25 target accounts and score fit.", "Ryan", "No"],
  ["2", "Create and send 5 dead-form teardowns.", "Ryan", "No"],
  ["3", "Book 3 install conversations.", "Ryan", "No"],
  ["4", "Complete HubSpot sandbox mapping.", "Ryan", "No"],
  ["5", "Get one beta script tag live.", "Ryan", "No"],
  ["6", "Capture first proof quote or product-learning note.", "Ryan", "No"],
];
header(command.getRange("G10:J10"));
command.getRange("J11:J16").dataValidation = { rule: { type: "list", values: ["Yes", "No"] } };
command.getRange("G10:J16").format.wrapText = true;
command.getRange("G10:J16").format.rowHeightPx = 32;
tableBorders(command.getRange("G10:J16"));

section(command, "A21:J21", "Decision Rule");
command.getRange("A22:J25").values = [[
  "Do not add more features until one beta creates at least 10 buyer profiles, 70% useful profile rate, and one clear sales quote. If profile usefulness is below 50%, change questions before changing enrichment. If CRM sync is below 90%, fix implementation before selling broader.",
  "", "", "", "", "", "", "", "", "",
], ["", "", "", "", "", "", "", "", "", ""], ["Workbook tabs to update daily: Target List, Teardown Tracker, Install Tracker. Tabs to update weekly: Proof Log, Weekly Review.", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""]];
command.getRange("A22:J23").merge();
command.getRange("A24:J25").merge();
command.getRange("A22:J25").format = { fill: palette.gray, font: { color: palette.text }, wrapText: true, verticalAlignment: "top" };

// Command chart helper
command.getRange("L4:N4").values = [["Stage", "Count", "Goal"]];
command.getRange("L5:N12").formulas = [
  ['="Targets Logged"', "=A6", "=50"],
  ['="High-Fit Targets"', "=B6", "=20"],
  ['="Teardowns Sent"', "=C6", "=5"],
  ['="Install Calls"', "=D6", "=3"],
  ['="Live Betas"', "=E6", "=1"],
  ['="Profiles Created"', "=F6", "=10"],
  ['="Meetings Influenced"', "=I6", "=1"],
  ['="Paid Installs"', '=COUNTIFS(\'Install Tracker\'!$E$5:$E$19,"Paid")', "=1"],
];
const chart = command.charts.add("bar", command.getRange("L4:N12"));
chart.title = "Beta Readiness vs Goal";
chart.hasLegend = true;
chart.xAxis = { axisType: "textAxis" };
chart.yAxis = { numberFormatCode: "0" };
chart.setPosition("L1", "Q17");
command.getRange("L4:N12").format = { fill: palette.white, font: { color: palette.white } };

// General polish
for (const sheet of [command, targets, teardowns, examples, intake, hubspot, install, proof, objections, review]) {
  const used = sheet.getUsedRange();
  used.format.font = { name: "Aptos" };
}

for (const spec of [
  [command, "A1:J2"],
  [targets, "A1:T2"],
  [teardowns, "A1:S2"],
  [examples, "A1:N2"],
  [intake, "A1:G2"],
  [hubspot, "A1:H2"],
  [install, "A1:L2"],
  [proof, "A1:S2"],
  [objections, "A1:F2"],
  [review, "A1:H2"],
]) {
  spec[0].getRange(spec[1]).format.rowHeightPx = 32;
}

command.getRange("L4:N12").format = { fill: palette.white, font: { color: palette.white } };

await fs.mkdir(outputDir, { recursive: true });

const inspectCommand = await workbook.inspect({
  kind: "table",
  range: "Command Center!A1:J25",
  include: "values,formulas",
  tableMaxRows: 25,
  tableMaxCols: 10,
  maxChars: 6000,
});
console.log(inspectCommand.ndjson);

const inspectProof = await workbook.inspect({
  kind: "table",
  range: "Proof Log!A4:S10",
  include: "values,formulas",
  tableMaxRows: 10,
  tableMaxCols: 19,
  maxChars: 5000,
});
console.log(inspectProof.ndjson);

const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
  maxChars: 2000,
});
console.log(errorScan.ndjson);

for (const sheetName of [
  "Command Center",
  "Target List",
  "Teardown Tracker",
  "Profile Examples",
  "Beta Intake",
  "HubSpot Setup",
  "Install Tracker",
  "Proof Log",
  "Objections",
  "Weekly Review",
]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, `${sheetName.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase()}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(outputPath);

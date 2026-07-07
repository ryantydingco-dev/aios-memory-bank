import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve("outputs/deal_threads_outbound_machine");
const outputPath = path.join(outputDir, "Deal Threads Outbound Machine Workbook.xlsx");
const targetCsvPath = path.resolve("Lead Engine/DealThreads_Targets_Template.csv");
const outputsDir = path.resolve("Lead Engine/Outputs");
const outcomeTrackerPath = path.join(outputsDir, "DealThreads_Outcome_Tracker.csv");

function normKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => String(cell || "").trim()));
}

async function readCsvRows(filePath) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    const [headers = [], ...data] = parseCsv(text);
    const keys = headers.map(normKey);
    return data.map((cells) =>
      Object.fromEntries(keys.map((key, idx) => [key, String(cells[idx] || "").trim()]))
    );
  } catch {
    return [];
  }
}

async function latestDailyQueuePath() {
  try {
    const files = await fs.readdir(outputsDir);
    const queues = files
      .filter((file) => /^DealThreads_Daily_Outbound_Queue_\d{4}-\d{2}-\d{2}\.csv$/.test(file))
      .sort();
    return queues.length ? path.join(outputsDir, queues.at(-1)) : "";
  } catch {
    return "";
  }
}

function rowsToValues(rows, fields, rowCount, defaults) {
  const values = rows.slice(0, rowCount).map((row) => fields.map((field, idx) => row[field] || defaults[idx] || ""));
  while (values.length < rowCount) {
    values.push([...defaults]);
  }
  return values;
}

const targetCsvRows = await readCsvRows(targetCsvPath);
const dailyQueueRows = await readCsvRows(await latestDailyQueuePath());
const outcomeCsvRows = await readCsvRows(outcomeTrackerPath);
const dashboardStats = {
  targets: targetCsvRows.filter((row) => row.company).length,
  highFit: targetCsvRows.filter((row) => row.company && Number(row.fit_score || 0) >= 4).length,
  queue: dailyQueueRows.filter((row) => row.company).length,
  sends: outcomeCsvRows.filter((row) => row.sent === "true").length,
  replies: outcomeCsvRows.filter((row) => row.replied === "true").length,
  teardownYeses: outcomeCsvRows.filter((row) => row.teardown_requested === "true").length,
  teardownsSent: outcomeCsvRows.filter((row) => row.teardown_sent === "true").length,
  installCalls: outcomeCsvRows.filter((row) => row.install_call_booked === "true").length,
};
dashboardStats.replyRate = dashboardStats.sends ? dashboardStats.replies / dashboardStats.sends : 0;
dashboardStats.bottleneck =
  dashboardStats.highFit < 20
    ? "Add high-fit targets"
    : dashboardStats.sends < 50
      ? "Send first touches"
      : dashboardStats.replyRate < 0.05
        ? "Improve targeting/copy"
        : dashboardStats.teardownYeses < 5
          ? "Get teardown yeses"
          : dashboardStats.installCalls < 2
            ? "Ask for install mapping"
            : "Scale";

const workbook = Workbook.create();

const palette = {
  ink: "#12242E",
  teal: "#0F766E",
  sky: "#EAF3F8",
  mint: "#DFF7F2",
  amber: "#FFF1CC",
  redSoft: "#FDE2E1",
  greenSoft: "#DCFCE7",
  gray: "#F4F6F8",
  white: "#FFFFFF",
  border: "#CBD5E1",
  text: "#172026",
  muted: "#5B6770",
  redText: "#991B1B",
  greenText: "#166534",
  amberText: "#92400E",
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

function borders(range) {
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

const command = workbook.worksheets.add("Command Center");
const targets = workbook.worksheets.add("Targets");
const queue = workbook.worksheets.add("Daily Queue");
const outcomes = workbook.worksheets.add("Outcome Tracker");
const plan = workbook.worksheets.add("30-Day Plan");
const sequences = workbook.worksheets.add("Sequences");
const router = workbook.worksheets.add("Reply Router");
const review = workbook.worksheets.add("Weekly Review");
const automation = workbook.worksheets.add("Automation");

for (const sheet of [command, targets, queue, outcomes, plan, sequences, router, review, automation]) {
  sheet.showGridLines = false;
}

// Targets
title(targets, "A1:T2", "Deal Threads Outbound Targets", "Add accounts here or maintain the matching CSV. The send-board script uses the same schema.");
setWidths(targets, [160, 180, 215, 150, 140, 190, 145, 115, 120, 110, 250, 260, 180, 80, 135, 135, 135, 165, 130, 250]);
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
const targetFields = [
  "company",
  "website",
  "form_url",
  "buyer_name",
  "buyer_role",
  "linkedin_url",
  "segment",
  "company_size",
  "deal_value_guess",
  "crm_guess",
  "weak_form_observation",
  "sales_research_hypothesis",
  "reason_now",
  "fit_score",
  "teardown_priority",
  "outreach_status",
  "teardown_status",
  "next_action",
  "next_action_date",
  "notes",
];
const targetRows = rowsToValues(targetCsvRows, targetFields, 100, ["", "", "", "", "", "", "Vertical SaaS", "", "High", "HubSpot", "", "", "", 0, "Later", "Not started", "Not started", "", "", ""]);
targets.getRange("A5:T104").values = targetRows;
targets.getRange("G5:G104").dataValidation = { rule: { type: "list", values: ["Founder-led B2B", "RevOps-light", "Vertical SaaS", "Agency", "Cybersecurity", "Compliance", "Fintech", "Managed IT/MSP", "Data/Analytics", "Partner", "Sales enablement", "Interactive demo software", "Customer evidence", "GTM intelligence", "Pipeline generation", "B2B attribution", "ABM analytics", "Marketing automation", "Customer success SaaS", "Customer success and services ops", "Security compliance", "Compliance operations", "FP&A software", "Procurement software", "LMS and enablement", "Presentation automation", "Client onboarding software", "Product adoption software", "Other"] } };
targets.getRange("I5:I104").dataValidation = { rule: { type: "list", values: ["Low", "Medium", "High", "$8K+", "$25K+", "$50K+", "Unknown"] } };
targets.getRange("J5:J104").dataValidation = { rule: { type: "list", values: ["HubSpot", "Salesforce", "Salesforce or HubSpot", "HubSpot or Salesforce", "Pipedrive", "Unknown"] } };
targets.getRange("N5:N104").dataValidation = { rule: { type: "list", values: ["0", "1", "2", "3", "4", "5"] } };
targets.getRange("O5:O104").dataValidation = { rule: { type: "list", values: ["Teardown first", "Later", "Avoid"] } };
targets.getRange("P5:P104").dataValidation = { rule: { type: "list", values: ["Not started", "Sent", "Replied", "Teardown requested", "Teardown sent", "Call booked", "Closed", "Passed"] } };
targets.getRange("Q5:Q104").dataValidation = { rule: { type: "list", values: ["Not started", "Drafted", "Sent", "Install CTA sent", "Won", "Lost"] } };
targets.getRange("S5:S104").format.numberFormat = "yyyy-mm-dd";
targets.getRange("K5:M104").format.wrapText = true;
targets.getRange("T5:T104").format.wrapText = true;
targets.getRange("N5:N104").format = { fill: palette.amber, font: { bold: true, color: palette.amberText }, horizontalAlignment: "center" };
borders(targets.getRange("A4:T104"));
targets.tables.add("A4:T104", true, "OutboundTargetsTable");

// Daily Queue
title(queue, "A1:T2", "Deal Threads Daily Queue", "Paste or import the generated queue CSV here. Use this as the manual send surface.");
setWidths(queue, [55, 210, 160, 140, 140, 170, 210, 140, 70, 70, 90, 260, 300, 200, 330, 330, 330, 250, 300, 260]);
queue.getRange("A4:T4").values = [[
  "Rank",
  "Lead ID",
  "Company",
  "Buyer Name",
  "Buyer Role",
  "Website",
  "Form URL",
  "Segment",
  "Fit",
  "Score",
  "Channel",
  "LinkedIn Connect",
  "LinkedIn DM",
  "Email Subject",
  "Email Body",
  "Follow-Up 1",
  "Follow-Up 2",
  "Follow-Up 3",
  "Call Opener",
  "Reason",
]];
inputHeader(queue.getRange("A4:T4"));
const queueFields = [
  "rank",
  "lead_id",
  "company",
  "buyer_name",
  "buyer_role",
  "website",
  "form_url",
  "segment",
  "fit_score",
  "score",
  "channel",
  "linkedin_connect_note",
  "linkedin_dm",
  "email_subject",
  "email_body",
  "follow_up_1",
  "follow_up_2",
  "follow_up_3",
  "call_opener",
  "reason",
];
queue.getRange("A5:T34").values = rowsToValues(dailyQueueRows, queueFields, 30, ["", "", "", "", "", "", "", "", "", "", "LinkedIn", "", "", "", "", "", "", "", "", ""]);
queue.getRange("K5:K34").dataValidation = { rule: { type: "list", values: ["LinkedIn", "Email", "Call", "Partner"] } };
queue.getRange("L5:T34").format.wrapText = true;
borders(queue.getRange("A4:T34"));
queue.tables.add("A4:T34", true, "DailyQueueTable");

// Outcome Tracker
title(outcomes, "A1:V2", "Deal Threads Outcome Tracker", "Log every send, reply, teardown, and install-call movement.");
setWidths(outcomes, [105, 105, 210, 160, 140, 140, 180, 210, 140, 90, 135, 70, 80, 70, 120, 150, 95, 135, 110, 135, 160, 260]);
outcomes.getRange("A4:V4").values = [[
  "Date Created",
  "Date Sent",
  "Lead ID",
  "Company",
  "Buyer Name",
  "Buyer Role",
  "Website",
  "Form URL",
  "Segment",
  "Channel",
  "Opener Variant",
  "Sent",
  "Sent Count",
  "Replied",
  "Reply Sentiment",
  "Objection Tag",
  "Meeting?",
  "Teardown Requested",
  "Teardown Sent",
  "Install Call Booked",
  "Next Action",
  "Notes",
]];
inputHeader(outcomes.getRange("A4:V4"));
const outcomeFields = [
  "date_created",
  "date_sent",
  "lead_id",
  "company",
  "buyer_name",
  "buyer_role",
  "website",
  "form_url",
  "segment",
  "channel",
  "opener_variant",
  "sent",
  "sent_count",
  "replied",
  "reply_sentiment",
  "objection_tag",
  "meeting_booked",
  "teardown_requested",
  "teardown_sent",
  "install_call_booked",
  "next_action",
  "notes",
];
outcomes.getRange("A5:V104").values = rowsToValues(outcomeCsvRows, outcomeFields, 100, ["", "", "", "", "", "", "", "", "", "LinkedIn", "dead_form_teardown", "", 0, "", "", "", "", "", "", "", "QUEUED", ""]);
outcomes.getRange("A5:B104").format.numberFormat = "yyyy-mm-dd";
outcomes.getRange("J5:J104").dataValidation = { rule: { type: "list", values: ["LinkedIn", "Email", "Call", "Partner"] } };
outcomes.getRange("L5:L104").dataValidation = { rule: { type: "list", values: ["true", ""] } };
outcomes.getRange("N5:N104").dataValidation = { rule: { type: "list", values: ["true", ""] } };
outcomes.getRange("O5:O104").dataValidation = { rule: { type: "list", values: ["positive", "neutral", "negative", ""] } };
outcomes.getRange("Q5:T104").dataValidation = { rule: { type: "list", values: ["true", ""] } };
outcomes.getRange("U5:U104").dataValidation = { rule: { type: "list", values: ["QUEUED", "AWAITING_REPLY", "REPLIED", "BUILD_TEARDOWN", "ASK_INSTALL_MAPPING", "INSTALL_CALL_BOOKED", "CLOSED", "PASSED"] } };
outcomes.getRange("V5:V104").format.wrapText = true;
borders(outcomes.getRange("A4:V104"));
outcomes.tables.add("A4:V104", true, "OutcomeTrackerTable");

// 30-Day Plan
title(plan, "A1:H2", "Deal Threads 30-Day Outbound Sprint", "Daily execution plan. Do the minimum before creating more strategy.");
setWidths(plan, [55, 160, 320, 160, 110, 110, 110, 260]);
plan.getRange("A4:H4").values = [["Day", "Theme", "Main Job", "Required Output", "Targets", "Sends", "Follow-Ups", "Notes"]];
header(plan.getRange("A4:H4"));
const planRows = [
  [1, "Setup", "Set up target CSV, workbook, tracking, and first queue.", "25 targets, first board", 25, 0, 0, ""],
  [2, "Send", "Send first 10 teardown asks.", "10 sends logged", 10, 10, 0, ""],
  [3, "Send", "Add 10 targets and send 10 more.", "20 total sends", 10, 10, 5, ""],
  [4, "Proof", "Build first public-quality teardown.", "1 teardown ready", 10, 5, 10, ""],
  [5, "Follow-up", "Follow up all non-replies.", "30+ touches logged", 10, 5, 10, ""],
  [6, "Partners", "Find HubSpot/RevOps consultant targets.", "10 partner targets", 10, 10, 5, ""],
  [7, "Review", "Weekly review and copy adjustment.", "bottleneck chosen", 0, 0, 0, ""],
  [8, "Segment", "Send founder-led SaaS targets.", "10 sends logged", 10, 10, 10, ""],
  [9, "Segment", "Send RevOps/GTM targets.", "10 sends logged", 10, 10, 10, ""],
  [10, "Proof", "Produce 2 teardowns.", "2 teardowns ready", 10, 5, 10, ""],
  [11, "Install", "Ask teardown viewers for install mapping.", "install CTA sent", 10, 5, 10, ""],
  [12, "Follow-up", "Send all due follow-ups.", "all due follow-ups sent", 10, 5, 15, ""],
  [13, "Partners", "Partner outreach day.", "10 partner messages", 10, 10, 5, ""],
  [14, "Review", "Weekly review and top opener decision.", "best opener selected", 0, 0, 0, ""],
  [15, "Lookalikes", "Double down on best segment.", "20 lookalike targets", 20, 10, 10, ""],
  [16, "Send", "Send 10 best-segment touches.", "10 sends logged", 10, 10, 10, ""],
  [17, "Proof", "Build teardown from best segment.", "1 teardown", 10, 5, 10, ""],
  [18, "Install", "Install-call push.", "5 install asks", 10, 5, 10, ""],
  [19, "Objections", "Document top objections.", "3 objections updated", 10, 5, 10, ""],
  [20, "Packaging", "Create anonymized before/after asset.", "1 proof asset", 10, 5, 10, ""],
  [21, "Review", "Weekly review and beta bottleneck.", "bottleneck chosen", 0, 0, 0, ""],
  [22, "Send", "Send 10 new targets.", "10 sends logged", 10, 10, 10, ""],
  [23, "Reply", "Reply handling within 24h.", "all replies handled", 10, 5, 15, ""],
  [24, "Proof", "Teardown production.", "2 teardowns delivered", 10, 5, 10, ""],
  [25, "Partners", "Partner channel push.", "10 partner targets", 10, 10, 5, ""],
  [26, "Install", "Install mapping push.", "5 install CTAs", 10, 5, 10, ""],
  [27, "Proof", "Proof capture requests.", "quote/screenshot ask", 5, 5, 10, ""],
  [28, "Review", "Weekly review and paid ask prep.", "paid ask ready", 0, 0, 0, ""],
  [29, "Cleanup", "Clean tracker and stale next actions.", "no stale actions", 5, 0, 10, ""],
  [30, "Retro", "Retrospective and next sprint.", "scale/change/refine decision", 0, 0, 0, ""],
];
plan.getRange("A5:H34").values = planRows;
plan.getRange("C5:D34").format.wrapText = true;
plan.getRange("H5:H34").format.wrapText = true;
borders(plan.getRange("A4:H34"));
plan.tables.add("A4:H34", true, "ThirtyDayPlanTable");

// Sequences
title(sequences, "A1:F2", "Deal Threads Industrial Intake Sequence Library", "Use these as controlled variants for automation, robotics, machine vision, and project-based technical services.");
setWidths(sequences, [140, 140, 130, 360, 250, 200]);
sequences.getRange("A4:F4").values = [["Sequence", "Touch", "Channel", "Copy", "When To Use", "CTA"]];
header(sequences.getRange("A4:F4"));
sequences.getRange("A5:F18").values = [
  ["Project Intake", "1", "LinkedIn/Email", "I looked at your quote/contact intake and noticed it captures the lead, but probably still leaves sales figuring out the actual project profile manually. Want me to send a quick intake teardown?", "Default first touch", "Want the teardown?"],
  ["Project Intake", "2", "Follow-up", "One specific thing I noticed: the intake captures the request, but not the process, equipment, constraints, timeline, or urgency sales needs before replying.", "No reply after 2-3 days", "Still worth sending?"],
  ["Project Intake", "3", "Follow-up", "The project profile I would want sales or engineering to see: process/problem, timeline, equipment context, constraints, unknowns, and recommended opener.", "No reply after 5-7 days", "Want me to map it?"],
  ["Project Intake", "4", "Follow-up", "Should I close the loop here, or would it still be useful if I sent the intake teardown later?", "Close loop", "Close or later?"],
  ["Machine Vision", "1", "LinkedIn/Email", "The intake probably gets the lead, but not defect type, line speed, camera/lighting constraints, validation needs, or timeline.", "Machine vision accounts", "Want the intake map?"],
  ["Robotics", "1", "LinkedIn/Email", "The form likely captures interest, but not payload, robot cell type, current equipment, facility constraints, or implementation timeline.", "Robotics integrators", "Want the before/after?"],
  ["Automation Consulting", "1", "LinkedIn/Email", "The quote path could pre-build the project profile before callback: process, ROI target, equipment, timeline, budget, and stakeholders.", "Consultants/integrators", "Want the teardown?"],
  ["Teardown Sent", "1", "Follow-up", "Curious what stood out. The install path looks lightweight: 3-5 better project-intake questions, enrichment behind the scenes, and a project-ready profile before callback.", "After teardown delivered", "Map the install?"],
  ["Teardown Sent", "2", "Follow-up", "The beta can run on one approved contact/quote page with separate CRM fields and a weekly usefulness check from sales or engineering.", "Risk reversal", "Worth a quick map?"],
  ["Install Ask", "1", "DM/Email", "The teardown points to one clear install path. Worth a 20-minute call to map page, project fields, routing, and proof metric?", "Engaged prospect", "20-minute map?"],
  ["Proof Ask", "1", "Email", "For the beta, the key proof is whether sales or engineering marks the project profile useful before callback. Can we review first profiles weekly?", "Beta setup", "Weekly proof review?"],
  ["No Fit", "1", "Reply", "Totally fair. Appreciate you taking a look.", "Clear no", "None"],
  ["Not Now", "1", "Reply", "Makes sense. Should I close the loop, or send the teardown later as a reference when this becomes timely?", "Timing objection", "Close or later?"],
  ["Send Info", "1", "Reply", "The most useful info is usually a teardown of your actual form. Want me to use the one on your site, or another page?", "Send info reply", "Which form?"],
];
sequences.getRange("D5:D18").format.wrapText = true;
sequences.getRange("E5:F18").format.wrapText = true;
borders(sequences.getRange("A4:F18"));
sequences.tables.add("A4:F18", true, "SequencesTable");

// Reply Router
title(router, "A1:F2", "Deal Threads Industrial Intake Reply Router", "Reply fast, keep it useful, and move to the next proof step.");
setWidths(router, [180, 260, 310, 210, 145, 250]);
router.getRange("A4:F4").values = [["Reply Type", "Signal", "Response", "Next Action", "Status To Log", "Notes"]];
header(router.getRange("A4:F4"));
router.getRange("A5:F12").values = [
  ["Teardown yes", "send it, sure, go ahead", "Perfect. I will keep it tight: what the intake captures, what sales or engineering still has to figure out, what the project profile could include, and the install path if useful.", "Build teardown within 24h", "BUILD_TEARDOWN", ""],
  ["Curious", "what is this?", "Deal Threads turns quote/contact form submissions into project-ready buyer profiles before sales follows up. Want me to show that using your current intake?", "Ask for form URL or use site form", "REPLIED", ""],
  ["Send info", "send me info", "The most useful info is a teardown of your actual intake. Want me to use the one on your site, or another page?", "Get form URL", "REPLIED", ""],
  ["Already have chat", "we use chat", "The useful question is whether the chat creates a project-ready profile or mostly answers questions/books meetings.", "Offer comparison teardown", "REPLIED", ""],
  ["Privacy", "security/privacy", "For beta, keep scope narrow: approved page, approved fields, separate CRM properties, no unnecessary sensitive data.", "Send trust/install scope", "REPLIED", ""],
  ["Not now", "bad timing", "Makes sense. Should I close the loop, or send the teardown later as a reference?", "Schedule later or close", "REPLIED", ""],
  ["No", "not interested", "Totally fair. Appreciate you taking a look.", "Mark passed", "PASSED", ""],
  ["Install interest", "how would setup work?", "Usually: page URL, CRM owner, approved fields, routing owner, script tag access, and one smoke test.", "Book install mapping", "INSTALL_CALL_BOOKED", ""],
];
router.getRange("B5:D12").format.wrapText = true;
router.getRange("F5:F12").format.wrapText = true;
borders(router.getRange("A4:F12"));
router.tables.add("A4:F12", true, "ReplyRouterTable");

// Weekly Review
title(review, "A1:H2", "Deal Threads Weekly Outbound Review", "Use Friday. Decide what to stop, fix, or double down on.");
setWidths(review, [170, 330, 120, 150, 130, 180, 150, 260]);
review.getRange("A4:H4").values = [["Area", "Question", "Owner", "Metric", "Status", "Decision", "Due Date", "Notes"]];
inputHeader(review.getRange("A4:H4"));
review.getRange("A5:H18").values = [
  ["Targets", "Which segment produced the most high-fit targets?", "Ryan", "high-fit targets", "Open", "", "", ""],
  ["First Touch", "Which opener got replies?", "Ryan", "reply rate", "Open", "", "", ""],
  ["Follow-Up", "Are follow-ups creating replies or annoyance?", "Ryan", "follow-up reply rate", "Open", "", "", ""],
  ["Teardowns", "Which teardown got an install-map ask?", "Ryan", "teardown-to-call", "Open", "", "", ""],
  ["Objections", "Which objection repeated?", "Ryan", "objection count", "Open", "", "", ""],
  ["Partners", "Did consultants respond differently than direct buyers?", "Ryan", "partner reply rate", "Open", "", "", ""],
  ["Proof", "What proof asset would make next week's sends easier?", "Ryan", "proof gaps", "Open", "", "", ""],
  ["Offer", "Is the free teardown still the best CTA?", "Ryan", "yes rate", "Open", "", "", ""],
  ["Automation", "Which step still creates friction?", "Ryan", "manual time", "Open", "", "", ""],
  ["Next Week", "Which segment gets the next 50 accounts?", "Ryan", "decision", "Open", "", "", ""],
  ["Copy", "What buyer phrase should update the message library?", "Ryan", "buyer language", "Open", "", "", ""],
  ["Product", "What did outreach reveal about the product/spec?", "Ryan", "learning", "Open", "", "", ""],
  ["Stop Rule", "What are we no longer doing?", "Ryan", "decision", "Open", "", "", ""],
  ["Scale Rule", "What are we doubling down on?", "Ryan", "decision", "Open", "", "", ""],
];
review.getRange("E5:E18").dataValidation = { rule: { type: "list", values: ["Open", "Done", "Blocked", "Deferred"] } };
review.getRange("G5:G18").format.numberFormat = "yyyy-mm-dd";
review.getRange("B5:B18").format.wrapText = true;
review.getRange("H5:H18").format.wrapText = true;
borders(review.getRange("A4:H18"));
review.tables.add("A4:H18", true, "WeeklyReviewTable");

// Automation
title(automation, "A1:F2", "Deal Threads Automation Commands", "Use these to generate queues and log outcomes without hand-editing CSV files.");
setWidths(automation, [180, 430, 270, 170, 140, 280]);
automation.getRange("A4:F4").values = [["Task", "Command", "Output", "When", "Owner", "Notes"]];
header(automation.getRange("A4:F4"));
automation.getRange("A5:F11").values = [
  ["Generate send board", "python3 'Operations/scripts/deal_threads_build_send_board.py' --targets 'Lead Engine/DealThreads_Targets_Template.csv' --limit 10", "Send board, queue CSV, tracker rows", "Daily morning", "Ryan", ""],
  ["Log sent", "python3 'Operations/scripts/deal_threads_log_outcome.py' --id 'company::buyer' --sent --channel LinkedIn --date YYYY-MM-DD", "Tracker updated", "After each send", "Ryan", ""],
  ["Log reply", "python3 'Operations/scripts/deal_threads_log_outcome.py' --id 'company::buyer' --replied --sentiment positive --note 'asked for teardown'", "Tracker updated", "When reply arrives", "Ryan", ""],
  ["Log teardown requested", "python3 'Operations/scripts/deal_threads_log_outcome.py' --id 'company::buyer' --teardown-requested", "Next action BUILD_TEARDOWN", "After yes", "Ryan", ""],
  ["Log teardown sent", "python3 'Operations/scripts/deal_threads_log_outcome.py' --id 'company::buyer' --teardown-sent", "Next action ASK_INSTALL_MAPPING", "After delivery", "Ryan", ""],
  ["Log install call", "python3 'Operations/scripts/deal_threads_log_outcome.py' --id 'company::buyer' --install-call", "Next action INSTALL_CALL_BOOKED", "After booked", "Ryan", ""],
  ["Weekly review", "Open workbook + send board + tracker, then fill Weekly Review tab", "Decisions for next week", "Friday", "Ryan", ""],
];
automation.getRange("B5:C11").format.wrapText = true;
automation.getRange("F5:F11").format.wrapText = true;
borders(automation.getRange("A4:F11"));
automation.tables.add("A4:F11", true, "AutomationCommandsTable");

// Command Center
title(command, "A1:J2", "Deal Threads Outbound Command Center", "Daily goal: send useful teardown offers, produce proof, and log outcomes.");
setWidths(command, [180, 120, 120, 120, 120, 120, 130, 140, 145, 220, 35, 145, 135, 135]);
section(command, "A4:J4", "Daily Scoreboard");
card(command, "A5", "Targets Logged", '=COUNTIF(Targets!$A$5:$A$104,"?*")', "0");
card(command, "B5", "High-Fit Targets", '=COUNTIFS(Targets!$A$5:$A$104,"?*",Targets!$N$5:$N$104,">=4")', "0");
card(command, "C5", "Today's Queue", '=COUNTIF(\'Daily Queue\'!$C$5:$C$34,"?*")', "0");
card(command, "D5", "Sends Logged", '=COUNTIF(\'Outcome Tracker\'!$L$5:$L$104,"true")', "0");
card(command, "E5", "Replies", '=COUNTIF(\'Outcome Tracker\'!$N$5:$N$104,"true")', "0");
card(command, "F5", "Reply Rate", '=IFERROR(E6/D6,0)', "0.0%");
card(command, "G5", "Teardown Yeses", '=COUNTIF(\'Outcome Tracker\'!$R$5:$R$104,"true")', "0");
card(command, "H5", "Teardowns Sent", '=COUNTIF(\'Outcome Tracker\'!$S$5:$S$104,"true")', "0");
card(command, "I5", "Install Calls", '=COUNTIF(\'Outcome Tracker\'!$T$5:$T$104,"true")', "0");
card(command, "J5", "Next Bottleneck", '=IF(B6<20,"Add high-fit targets",IF(D6<50,"Send first touches",IF(F6<0.05,"Improve targeting/copy",IF(G6<5,"Get teardown yeses",IF(I6<2,"Ask for install mapping","Scale")))))', "@");
command.getRange("A6:J6").values = [[
  dashboardStats.targets,
  dashboardStats.highFit,
  dashboardStats.queue,
  dashboardStats.sends,
  dashboardStats.replies,
  dashboardStats.replyRate,
  dashboardStats.teardownYeses,
  dashboardStats.teardownsSent,
  dashboardStats.installCalls,
  dashboardStats.bottleneck,
]];

section(command, "A9:E9", "Today");
command.getRange("A10:E17").values = [
  ["Block", "Time", "Task", "Target", "Status"],
  ["Queue", "15 min", "Add/review targets and run send board.", 10, ""],
  ["First touches", "25 min", "Send generated LinkedIn/email copy manually.", 10, ""],
  ["Follow-ups", "20 min", "Send due follow-ups and reply to engaged prospects.", 10, ""],
  ["Proof", "25 min", "Build/deliver one teardown or project-profile preview.", 1, ""],
  ["Logging", "5 min", "Log every send/reply/teardown/install action.", "All", ""],
  ["Content bridge", "10 min", "Post/comment using one lesson from outbound.", 1, ""],
  ["Review", "5 min", "Pick tomorrow's bottleneck.", 1, ""],
];
header(command.getRange("A10:E10"));
command.getRange("E11:E17").formulas = [
  ['=IF(A6>=10,"Green",IF(A6>=5,"Yellow","Red"))'],
  ['=IF(D6>=10,"Green",IF(D6>=5,"Yellow","Red"))'],
  ['=IF(D6>=20,"Green",IF(D6>=10,"Yellow","Red"))'],
  ['=IF(H6>=1,"Green",IF(G6>=1,"Yellow","Red"))'],
  ['=IF(D6>=1,"Green","Red")'],
  ['=IF(A6>=1,"Green","Yellow")'],
  ['=IF(J6="Scale","Green","Yellow")'],
];
command.getRange("C11:C17").format.wrapText = true;
borders(command.getRange("A10:E17"));
statusFormats(command.getRange("E11:E17"));

section(command, "G9:J9", "Current Decision");
command.getRange("G10:J17").values = [
  ["Question", "Answer", "", ""],
  ["What is the one bottleneck?", "", "", ""],
  ["Which segment gets more targets?", "", "", ""],
  ["Which opener is working?", "", "", ""],
  ["Which objection repeats?", "", "", ""],
  ["Which proof asset is missing?", "", "", ""],
  ["Tomorrow's first action", "", "", ""],
  ["Stop doing", "", "", ""],
];
header(command.getRange("G10:J10"));
command.getRange("G11:G17").format = { fill: palette.sky, font: { bold: true, color: palette.text }, wrapText: true };
command.getRange("H11:J17").merge(false);
command.getRange("H11:J17").format = { fill: palette.gray, font: { color: palette.text }, wrapText: true };
borders(command.getRange("G10:J17"));

section(command, "A20:J20", "Decision Rule");
command.getRange("A21:J24").values = [[
  "Do not add more automation until the daily loop is actually being executed. If reply rate is low, fix targeting and the first-line observation. If replies happen but teardowns do not, make the teardown offer easier. If teardowns happen but calls do not, improve proof and install risk reversal.",
  "", "", "", "", "", "", "", "", "",
], ["", "", "", "", "", "", "", "", "", ""], ["Daily command: python3 'Operations/scripts/deal_threads_build_send_board.py' --targets 'Lead Engine/DealThreads_Targets_Template.csv' --limit 10", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""]];
command.getRange("A21:J22").merge();
command.getRange("A23:J24").merge();
command.getRange("A21:J24").format = { fill: palette.gray, font: { color: palette.text }, wrapText: true, verticalAlignment: "top" };

command.getRange("L4:N4").values = [["Stage", "Count", "Goal"]];
command.getRange("L5:N10").formulas = [
  ['="Targets"', "=A6", "=50"],
  ['="High-Fit"', "=B6", "=20"],
  ['="Sends"', "=D6", "=50"],
  ['="Replies"', "=E6", "=5"],
  ['="Teardowns"', "=H6", "=5"],
  ['="Install Calls"', "=I6", "=2"],
];
const chart = command.charts.add("bar", command.getRange("L4:N10"));
chart.title = "Outbound Progress vs Weekly Goal";
chart.hasLegend = true;
chart.yAxis = { numberFormatCode: "0" };
chart.setPosition("L1", "Q16");
command.getRange("L4:N10").format = { fill: palette.white, font: { color: palette.white } };

for (const sheet of [command, targets, queue, outcomes, plan, sequences, router, review, automation]) {
  const used = sheet.getUsedRange();
  used.format.font = { name: "Aptos" };
}

for (const [sheet, range] of [
  [command, "A1:J2"],
  [targets, "A1:T2"],
  [queue, "A1:T2"],
  [outcomes, "A1:V2"],
  [plan, "A1:H2"],
  [sequences, "A1:F2"],
  [router, "A1:F2"],
  [review, "A1:H2"],
  [automation, "A1:F2"],
]) {
  sheet.getRange(range).format.rowHeightPx = 32;
}

await fs.mkdir(outputDir, { recursive: true });

const inspectCommand = await workbook.inspect({
  kind: "table",
  range: "Command Center!A1:J24",
  include: "values,formulas",
  tableMaxRows: 24,
  tableMaxCols: 10,
  maxChars: 6000,
});
console.log(inspectCommand.ndjson);

const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
  maxChars: 2000,
});
console.log(errorScan.ndjson);

for (const sheetName of ["Command Center", "Targets", "Daily Queue", "Outcome Tracker", "30-Day Plan", "Sequences", "Reply Router", "Weekly Review", "Automation"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, `${sheetName.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase()}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(outputPath);

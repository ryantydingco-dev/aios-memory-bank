import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/ryantydingco/Documents/AIOS-Memory-Bank/outputs/linkedin-acquisition-sprint-2026-08-24";
const previewDir = `${outputDir}/previews`;
const workbook = Workbook.create();

const colors = {
  navy: "#14213D",
  orange: "#FCA311",
  cream: "#F8F5EF",
  white: "#FFFFFF",
  ink: "#1F2937",
  gray: "#E5E7EB",
  lightGray: "#F3F4F6",
  green: "#2A9D8F",
  lightGreen: "#DDF4EE",
  red: "#E76F51",
  lightRed: "#FCE8E4",
  yellow: "#FFF4CC",
  blue: "#DCEBFA",
};

function title(sheet, range, text, subtitleRange, subtitle) {
  sheet.getRange(range).merge();
  sheet.getRange(range).values = [[text]];
  sheet.getRange(range).format = {
    fill: colors.navy,
    font: { bold: true, color: colors.white, size: 20 },
    verticalAlignment: "center",
  };
  sheet.getRange(range).format.rowHeight = 34;
  sheet.getRange(subtitleRange).merge();
  sheet.getRange(subtitleRange).values = [[subtitle]];
  sheet.getRange(subtitleRange).format = {
    fill: colors.cream,
    font: { color: colors.ink, italic: true },
    verticalAlignment: "center",
  };
  sheet.getRange(subtitleRange).format.rowHeight = 28;
}

function header(range) {
  range.format = {
    fill: colors.navy,
    font: { bold: true, color: colors.white },
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "inside", style: "thin", color: colors.white },
  };
  range.format.rowHeight = 30;
}

function section(range) {
  range.format = {
    fill: colors.orange,
    font: { bold: true, color: colors.navy },
    verticalAlignment: "center",
  };
}

function body(range) {
  range.format = {
    font: { color: colors.ink },
    verticalAlignment: "top",
    wrapText: true,
  };
}

function input(range) {
  range.format.fill = colors.yellow;
}

function setWidths(sheet, widths) {
  for (const [col, width] of Object.entries(widths)) {
    sheet.getRange(`${col}:${col}`).format.columnWidth = width;
  }
}

function addStatusFormatting(range) {
  range.conditionalFormats.add("containsText", {
    text: "Ready",
    format: { fill: colors.lightGreen, font: { color: "#176B57", bold: true } },
  });
  range.conditionalFormats.add("containsText", {
    text: "Missing",
    format: { fill: colors.lightRed, font: { color: "#9B3E2F", bold: true } },
  });
  range.conditionalFormats.add("containsText", {
    text: "DNC",
    format: { fill: colors.lightRed, font: { color: "#9B3E2F", bold: true } },
  });
}

const dashboard = workbook.worksheets.add("Dashboard");
const candidates = workbook.worksheets.add("Candidate Queue");
const accounts = workbook.worksheets.add("Accounts");
const contacts = workbook.worksheets.add("Contacts");
const daily = workbook.worksheets.add("Daily Queue");
const touches = workbook.worksheets.add("Touch Log");
const weekly = workbook.worksheets.add("Weekly Review");
const rules = workbook.worksheets.add("Rules");

for (const sheet of [dashboard, candidates, accounts, contacts, daily, touches, weekly, rules]) {
  sheet.showGridLines = false;
}

title(
  dashboard,
  "A1:H2",
  "LinkedIn Acquisition Sprint",
  "A3:H3",
  "30 days. Real conversations. No pitch in the first message. Ryan sends everything by hand.",
);

dashboard.getRange("A5:B5").merge();
dashboard.getRange("A5:B5").values = [["Sprint setup"]];
section(dashboard.getRange("A5:B5"));
dashboard.getRange("A6:B14").values = [
  ["Sprint start", new Date(2026, 7, 24)],
  ["Sprint end", null],
  ["Primary warm motion", "Existing LinkedIn connections"],
  ["Cold lane", "Camps, working hypothesis"],
  ["Connections export", "MISSING"],
  ["Customer source", "Manual QuickBooks / CA check required"],
  ["Owner", "Ryan"],
  ["Send mode", "Manual only"],
  ["First-message rule", "Conversation, never a pitch"],
];
dashboard.getRange("B7").formulas = [["=B6+29"]];
dashboard.getRange("B6:B7").format.numberFormat = "yyyy-mm-dd";
input(dashboard.getRange("B6:B14"));
body(dashboard.getRange("A6:B14"));
dashboard.getRange("A6:A14").format.font = { bold: true, color: colors.ink };
dashboard.getRange("A6:B14").format.borders = {
  insideHorizontal: { style: "thin", color: colors.gray },
};

dashboard.getRange("D5:E5").merge();
dashboard.getRange("D5:E5").values = [["Outcome scoreboard"]];
section(dashboard.getRange("D5:E5"));
dashboard.getRange("D6:D14").values = [
  ["First conversations sent"],
  ["Replies"],
  ["CA inquiries"],
  ["Automation inquiries"],
  ["Mockups accepted"],
  ["Quote requests"],
  ["Closed-won gross profit"],
  ["Same-day response rate"],
  ["Overdue next actions"],
];
dashboard.getRange("E6:E14").formulas = [
  ["=COUNTIFS('Touch Log'!$F$5:$F$504,\"First message\",'Touch Log'!$H$5:$H$504,\"Yes\")"],
  ["=COUNTIFS('Touch Log'!$I$5:$I$504,\"Replied\")"],
  ["=COUNTIFS('Accounts'!$E$5:$E$104,\"CA\",'Accounts'!$T$5:$T$104,\"Yes\")+COUNTIFS('Accounts'!$E$5:$E$104,\"Both\",'Accounts'!$T$5:$T$104,\"Yes\")"],
  ["=COUNTIFS('Accounts'!$E$5:$E$104,\"Automation\",'Accounts'!$T$5:$T$104,\"Yes\")+COUNTIFS('Accounts'!$E$5:$E$104,\"Both\",'Accounts'!$T$5:$T$104,\"Yes\")"],
  ["=COUNTIF('Accounts'!$U$5:$U$104,\"Yes\")"],
  ["=COUNT('Accounts'!$W$5:$W$104)"],
  ["=SUM('Accounts'!$AB$5:$AB$104)"],
  ["=IFERROR(COUNTIFS('Touch Log'!$I$5:$I$504,\"Replied\",'Touch Log'!$J$5:$J$504,\"<=8\")/COUNTIF('Touch Log'!$I$5:$I$504,\"Replied\"),0)"],
  ["=COUNTIFS('Contacts'!$O$5:$O$204,\"<\"&TODAY(),'Contacts'!$O$5:$O$204,\"<>\",'Contacts'!$P$5:$P$204,\"<>Done\")"],
];
body(dashboard.getRange("D6:E14"));
dashboard.getRange("D6:D14").format.font = { bold: true, color: colors.ink };
dashboard.getRange("E6:E14").format = {
  fill: colors.blue,
  font: { bold: true, color: colors.navy, size: 14 },
  horizontalAlignment: "right",
};
dashboard.getRange("E12").format.numberFormat = '"$"#,##0';
dashboard.getRange("E13").format.numberFormat = "0%";

dashboard.getRange("G5:H5").merge();
dashboard.getRange("G5:H5").values = [["Grokbot run order"]];
section(dashboard.getRange("G5:H5"));
dashboard.getRange("G6:H14").values = [
  [1, "Open replies"],
  [2, "Qualified inquiries"],
  [3, "Accepted mockups"],
  [4, "Five candidate reviews"],
  [5, "Up to five first conversations"],
  [6, "Up to five follow-ups"],
  [7, "Ten useful comments"],
  [8, "Today's post"],
  [9, "Log confirmed actions"],
];
body(dashboard.getRange("G6:H14"));
dashboard.getRange("G6:G14").format = {
  fill: colors.navy,
  font: { bold: true, color: colors.white },
  horizontalAlignment: "center",
};

dashboard.getRange("A16:H16").merge();
dashboard.getRange("A16:H16").values = [["Evidence gate before Grokbot drafts a first message"]];
section(dashboard.getRange("A16:H16"));
dashboard.getRange("A17:H23").values = [
  ["1", "Current role confirmed", null, null, "2", "Customer status checked", null, null],
  ["3", "Prior touch / DNC checked", null, null, "4", "Service issue checked", null, null],
  ["5", "Ryan's real relationship context", null, null, "6", "Current signal", null, null],
  ["7", "Buyer role", null, null, "8", "No invented familiarity", null, null],
  ["If one of these is missing, the next action is research, not a message.", null, null, null, null, null, null, null],
  ["A reply pauses new outreach. Answer the actual conversation first.", null, null, null, null, null, null, null],
  ["The workbook tracks confirmed actions only. A draft is not a send.", null, null, null, null, null, null, null],
];
for (let row = 17; row <= 20; row += 1) {
  dashboard.getRange(`B${row}:D${row}`).merge();
  dashboard.getRange(`F${row}:H${row}`).merge();
}
dashboard.getRange("A21:H21").merge();
dashboard.getRange("A22:H22").merge();
dashboard.getRange("A23:H23").merge();
body(dashboard.getRange("A17:H23"));
dashboard.getRange("A17:A20").format = { fill: colors.navy, font: { bold: true, color: colors.white }, horizontalAlignment: "center" };
dashboard.getRange("E17:E20").format = { fill: colors.navy, font: { bold: true, color: colors.white }, horizontalAlignment: "center" };
dashboard.getRange("A21:H23").format.fill = colors.lightGray;
dashboard.getRange("A21:H23").format.font = { bold: true, color: colors.ink };
setWidths(dashboard, { A: 18, B: 30, C: 4, D: 27, E: 14, F: 4, G: 6, H: 32 });
dashboard.freezePanes.freezeRows(3);

title(
  candidates,
  "A1:W2",
  "Candidate Queue",
  "A3:W3",
  "Paste ranked.csv into A:N. Every row is a review candidate until the evidence gate says Ready for Ryan.",
);
const candidateHeaders = [
  "Tier", "Score", "Lane", "First Name", "Last Name", "Company", "Position", "LinkedIn URL", "Connected On",
  "Title Match Why", "Customer Check", "Relationship Context", "Recent Signal", "Message Status", "Current Role Confirmed",
  "Prior Touch / DNC", "Service Issue", "Buyer Role", "Evidence Gate", "Review Status", "Next Action", "Review Date", "Notes",
];
candidates.getRange("A4:W4").values = [candidateHeaders];
header(candidates.getRange("A4:W4"));
body(candidates.getRange("A5:W104"));
candidates.getRange("S5:S104").formulas = Array.from({ length: 100 }, (_, index) => {
  const row = index + 5;
  return [`=IF(COUNTA(A${row}:N${row})=0,\"\",IF(COUNTA(K${row}:M${row},O${row}:R${row})<7,\"Missing evidence\",IF(OR(K${row}=\"Unknown\",O${row}<>\"Yes\",P${row}=\"Unknown\",Q${row}=\"Unknown\"),\"Missing evidence\",\"Ready for Ryan\")))`];
});
candidates.getRange("B5:B104").format.numberFormat = "0";
candidates.getRange("I5:I104").format.numberFormat = "yyyy-mm-dd";
candidates.getRange("V5:V104").format.numberFormat = "yyyy-mm-dd";
input(candidates.getRange("K5:R104"));
input(candidates.getRange("T5:W104"));
candidates.getRange("O5:O104").dataValidation = { rule: { type: "list", values: ["Yes", "No", "Unknown"] } };
candidates.getRange("K5:K104").dataValidation = { rule: { type: "list", values: ["Unknown", "Current CA customer", "Former CA customer", "Never customer"] } };
candidates.getRange("P5:P104").dataValidation = { rule: { type: "list", values: ["Unknown", "Clear", "Prior touch", "DNC"] } };
candidates.getRange("Q5:Q104").dataValidation = { rule: { type: "list", values: ["Unknown", "Clear", "Open issue"] } };
candidates.getRange("R5:R104").dataValidation = { rule: { type: "list", values: ["Owner", "Buyer", "Influencer", "Near buyer", "Not relevant"] } };
candidates.getRange("T5:T104").dataValidation = { rule: { type: "list", values: ["Not reviewed", "Researching", "Ready", "Skip", "Messaged"] } };
addStatusFormatting(candidates.getRange("S5:T104"));
candidates.tables.add("A4:W104", true, "CandidateQueueTable");
setWidths(candidates, { A: 8, B: 8, C: 14, D: 14, E: 14, F: 20, G: 22, H: 32, I: 14, J: 24, K: 20, L: 28, M: 28, N: 16, O: 16, P: 18, Q: 16, R: 14, S: 18, T: 16, U: 22, V: 14, W: 28 });
candidates.freezePanes.freezeRows(4);
candidates.freezePanes.freezeColumns(2);

title(
  accounts,
  "A1:AD2",
  "Accounts",
  "A3:AD3",
  "One row per company. Use this to coordinate LinkedIn, email, phone, customer checks, and the next commercial action.",
);
const accountHeaders = [
  "Account ID", "Company", "Segment", "Motion", "Offer Lane", "Status", "Fit Score", "Why Fit", "Why Now", "Proof to Use",
  "Customer Check", "Prior Touch / DNC", "Service Issue", "Primary Buyer", "Secondary Buyer", "Owner", "Next Action", "Next Action Date",
  "Qualified Date", "Qualified Inquiry", "Mockup Accepted", "Mockup Accepted Date", "Quote Requested Date", "Close Date", "Est Revenue",
  "Est Gross Profit", "Closed Revenue", "Closed Gross Profit", "Source URL", "Notes",
];
accounts.getRange("A4:AD4").values = [accountHeaders];
header(accounts.getRange("A4:AD4"));
body(accounts.getRange("A5:AD104"));
input(accounts.getRange("A5:AD104"));
accounts.getRange("D5:D104").dataValidation = { rule: { type: "list", values: ["Existing connection", "Warm reactivation", "Cold account", "Inbound"] } };
accounts.getRange("E5:E104").dataValidation = { rule: { type: "list", values: ["CA", "Automation", "Both"] } };
accounts.getRange("F5:F104").dataValidation = { rule: { type: "list", values: ["Research", "Ready", "Active conversation", "Qualified need", "Mockup requested", "Quote requested", "Closed won", "Closed lost", "Not now", "DNC"] } };
accounts.getRange("K5:K104").dataValidation = { rule: { type: "list", values: ["Unknown", "Current CA customer", "Former CA customer", "Never customer"] } };
accounts.getRange("L5:L104").dataValidation = { rule: { type: "list", values: ["Unknown", "Clear", "Prior touch", "DNC"] } };
accounts.getRange("M5:M104").dataValidation = { rule: { type: "list", values: ["Unknown", "Clear", "Open issue"] } };
accounts.getRange("T5:T104").dataValidation = { rule: { type: "list", values: ["Yes", "No"] } };
accounts.getRange("U5:U104").dataValidation = { rule: { type: "list", values: ["Yes", "No"] } };
accounts.getRange("G5:G104").dataValidation = { rule: { type: "whole", operator: "between", formula1: 0, formula2: 100 } };
accounts.getRange("R5:S104").format.numberFormat = "yyyy-mm-dd";
accounts.getRange("V5:X104").format.numberFormat = "yyyy-mm-dd";
accounts.getRange("Y5:AB104").format.numberFormat = '"$"#,##0';
addStatusFormatting(accounts.getRange("F5:F104"));
accounts.tables.add("A4:AD104", true, "AccountsTable");
setWidths(accounts, { A: 13, B: 22, C: 18, D: 20, E: 14, F: 20, G: 10, H: 24, I: 24, J: 22, K: 20, L: 18, M: 16, N: 20, O: 20, P: 12, Q: 24, R: 14, S: 14, T: 14, U: 16, V: 15, W: 15, X: 14, Y: 14, Z: 16, AA: 14, AB: 16, AC: 30, AD: 28 });
accounts.freezePanes.freezeRows(4);
accounts.freezePanes.freezeColumns(2);

title(
  contacts,
  "A1:R2",
  "Contacts",
  "A3:R3",
  "A LinkedIn connection is not automatically warm. Record the real relationship and current signal before drafting.",
);
const contactHeaders = [
  "Contact ID", "Account ID", "Name", "Title", "Company", "LinkedIn URL", "Connection", "Relationship Context", "Current Signal",
  "Buyer Role", "Fit Confidence", "Evidence Gate", "Last Touch Date", "Reply Status", "Next Action Date", "Next Action", "Ryan Approval", "Notes",
];
contacts.getRange("A4:R4").values = [contactHeaders];
header(contacts.getRange("A4:R4"));
body(contacts.getRange("A5:R204"));
input(contacts.getRange("A5:R204"));
contacts.getRange("G5:G204").dataValidation = { rule: { type: "list", values: ["1st", "2nd", "3rd", "Not connected"] } };
contacts.getRange("J5:J204").dataValidation = { rule: { type: "list", values: ["Owner", "Buyer", "Influencer", "Near buyer", "Not relevant"] } };
contacts.getRange("K5:K204").dataValidation = { rule: { type: "list", values: ["High", "Medium", "Low"] } };
contacts.getRange("L5:L204").dataValidation = { rule: { type: "list", values: ["Missing evidence", "Ready for Ryan", "Do not contact"] } };
contacts.getRange("N5:N204").dataValidation = { rule: { type: "list", values: ["No reply", "Replied", "Open conversation", "Closed"] } };
contacts.getRange("Q5:Q204").dataValidation = { rule: { type: "list", values: ["Not reviewed", "Approved", "Skip"] } };
contacts.getRange("M5:M204").format.numberFormat = "yyyy-mm-dd";
contacts.getRange("O5:O204").format.numberFormat = "yyyy-mm-dd";
addStatusFormatting(contacts.getRange("L5:L204"));
contacts.tables.add("A4:R204", true, "ContactsTable");
setWidths(contacts, { A: 13, B: 13, C: 20, D: 22, E: 22, F: 32, G: 14, H: 30, I: 30, J: 15, K: 14, L: 18, M: 14, N: 18, O: 15, P: 24, Q: 15, R: 28 });
contacts.freezePanes.freezeRows(4);
contacts.freezePanes.freezeColumns(2);

title(
  daily,
  "A1:O2",
  "Daily Queue",
  "A3:O3",
  "Targets are capacity limits. If the evidence is weak, the queue stays short. Replies always come first.",
);
const dailyHeaders = [
  "Date", "Day", "Replies Due", "Review Target", "Reviews Done", "First Conversation Target", "First Conversations Sent",
  "Follow-up Target", "Follow-ups Sent", "Comment Target", "Comments Done", "Post Target", "Post Live", "Mockups Due", "Notes",
];
daily.getRange("A4:O4").values = [dailyHeaders];
header(daily.getRange("A4:O4"));
const dailyRows = [];
for (let i = 0; i < 30; i += 1) {
  const date = new Date(2026, 7, 24 + i);
  dailyRows.push([date, null, null, 5, null, 5, null, 5, null, 10, null, 1, null, null, null]);
}
daily.getRange("A5:O34").values = dailyRows;
daily.getRange("B5:B34").formulas = Array.from({ length: 30 }, (_, index) => [`=TEXT(A${index + 5},\"ddd\")`]);
daily.getRange("C5:C34").formulas = Array.from({ length: 30 }, (_, index) => {
  const row = index + 5;
  return [`=COUNTIFS('Contacts'!$O$5:$O$204,A${row},'Contacts'!$P$5:$P$204,\"<>Done\")`];
});
daily.getRange("E5:E34").formulas = Array.from({ length: 30 }, (_, index) => {
  const row = index + 5;
  return [`=COUNTIFS('Touch Log'!$A$5:$A$504,A${row},'Touch Log'!$F$5:$F$504,\"Candidate review\")`];
});
daily.getRange("G5:G34").formulas = Array.from({ length: 30 }, (_, index) => {
  const row = index + 5;
  return [`=COUNTIFS('Touch Log'!$A$5:$A$504,A${row},'Touch Log'!$F$5:$F$504,\"First message\",'Touch Log'!$H$5:$H$504,\"Yes\")`];
});
daily.getRange("I5:I34").formulas = Array.from({ length: 30 }, (_, index) => {
  const row = index + 5;
  return [`=COUNTIFS('Touch Log'!$A$5:$A$504,A${row},'Touch Log'!$F$5:$F$504,\"Follow-up\",'Touch Log'!$H$5:$H$504,\"Yes\")`];
});
daily.getRange("K5:K34").formulas = Array.from({ length: 30 }, (_, index) => {
  const row = index + 5;
  return [`=COUNTIFS('Touch Log'!$A$5:$A$504,A${row},'Touch Log'!$F$5:$F$504,\"Comment\",'Touch Log'!$H$5:$H$504,\"Yes\")`];
});
daily.getRange("M5:M34").formulas = Array.from({ length: 30 }, (_, index) => {
  const row = index + 5;
  return [`=COUNTIFS('Touch Log'!$A$5:$A$504,A${row},'Touch Log'!$F$5:$F$504,\"Post\",'Touch Log'!$H$5:$H$504,\"Yes\")`];
});
daily.getRange("N5:N34").formulas = Array.from({ length: 30 }, (_, index) => {
  const row = index + 5;
  return [`=COUNTIFS('Accounts'!$Q$5:$Q$104,\"Build mockup\",'Accounts'!$R$5:$R$104,A${row})`];
});
body(daily.getRange("A5:O34"));
daily.getRange("A5:A34").format.numberFormat = "yyyy-mm-dd";
daily.getRange("D5:D34").format.fill = colors.yellow;
daily.getRange("F5:F34").format.fill = colors.yellow;
daily.getRange("H5:H34").format.fill = colors.yellow;
daily.getRange("J5:J34").format.fill = colors.yellow;
daily.getRange("L5:L34").format.fill = colors.yellow;
daily.getRange("O5:O34").format.fill = colors.yellow;
daily.getRange("E5:E34").conditionalFormats.add("dataBar", { color: colors.green, gradient: true });
daily.getRange("G5:G34").conditionalFormats.add("dataBar", { color: colors.green, gradient: true });
daily.getRange("I5:I34").conditionalFormats.add("dataBar", { color: colors.green, gradient: true });
daily.getRange("K5:K34").conditionalFormats.add("dataBar", { color: colors.green, gradient: true });
daily.tables.add("A4:O34", true, "DailyQueueTable");
setWidths(daily, { A: 14, B: 8, C: 12, D: 12, E: 12, F: 16, G: 16, H: 12, I: 12, J: 12, K: 12, L: 10, M: 10, N: 12, O: 28 });
daily.freezePanes.freezeRows(4);
daily.freezePanes.freezeColumns(2);

title(
  touches,
  "A1:N2",
  "Touch Log",
  "A3:N3",
  "Log only confirmed actions. A Grokbot draft is not a send. One row per review, comment, message, reply, or post.",
);
const touchHeaders = [
  "Date", "Account ID", "Contact ID", "Person", "Channel", "Touch Type", "Context / Summary", "Confirmed Sent", "Response Status",
  "Response Hours", "Outcome", "Next Action", "Next Action Date", "Owner",
];
touches.getRange("A4:N4").values = [touchHeaders];
header(touches.getRange("A4:N4"));
body(touches.getRange("A5:N504"));
input(touches.getRange("A5:N504"));
touches.getRange("E5:E504").dataValidation = { rule: { type: "list", values: ["LinkedIn", "Email", "Phone", "Internal"] } };
touches.getRange("F5:F504").dataValidation = { rule: { type: "list", values: ["Candidate review", "Comment", "Connection request", "First message", "Follow-up", "Reply", "Post", "Mockup handoff", "Call", "Email"] } };
touches.getRange("H5:H504").dataValidation = { rule: { type: "list", values: ["Yes", "No"] } };
touches.getRange("I5:I504").dataValidation = { rule: { type: "list", values: ["No reply", "Replied", "Open conversation", "Closed"] } };
touches.getRange("K5:K504").dataValidation = { rule: { type: "list", values: ["No change", "Conversation started", "Qualified CA inquiry", "Qualified automation inquiry", "Mockup accepted", "Quote requested", "Closed won", "Closed lost", "Not now", "DNC"] } };
touches.getRange("A5:A504").format.numberFormat = "yyyy-mm-dd";
touches.getRange("M5:M504").format.numberFormat = "yyyy-mm-dd";
touches.getRange("J5:J504").format.numberFormat = "0.0";
touches.tables.add("A4:N504", true, "TouchLogTable");
setWidths(touches, { A: 14, B: 13, C: 13, D: 20, E: 12, F: 20, G: 38, H: 14, I: 18, J: 14, K: 24, L: 28, M: 15, N: 12 });
touches.freezePanes.freezeRows(4);
touches.freezePanes.freezeColumns(2);

title(
  weekly,
  "A1:M2",
  "Weekly Review",
  "A3:M3",
  "Judge the motion by conversations, qualified needs, mockups, quotes, gross profit, and response speed. Pick one change.",
);
const weeklyHeaders = [
  "Week", "Start", "End", "Candidate Reviews", "First Conversations", "Replies", "CA Inquiries", "Automation Inquiries", "Mockups Accepted",
  "Quote Requests", "Closed Gross Profit", "Same-day Response Rate", "One Change Next Week",
];
weekly.getRange("A4:M4").values = [weeklyHeaders];
header(weekly.getRange("A4:M4"));
const weekRows = [];
for (let i = 0; i < 5; i += 1) {
  const start = new Date(2026, 7, 24 + i * 7);
  const end = new Date(2026, 7, Math.min(24 + i * 7 + 6, 53));
  weekRows.push([`Week ${i + 1}`, start, end, null, null, null, null, null, null, null, null, null, null]);
}
weekly.getRange("A5:M9").values = weekRows;
for (let row = 5; row <= 9; row += 1) {
  weekly.getRange(`D${row}`).formulas = [[`=COUNTIFS('Touch Log'!$A$5:$A$504,\">=\"&B${row},'Touch Log'!$A$5:$A$504,\"<=\"&C${row},'Touch Log'!$F$5:$F$504,\"Candidate review\")`]];
  weekly.getRange(`E${row}`).formulas = [[`=COUNTIFS('Touch Log'!$A$5:$A$504,\">=\"&B${row},'Touch Log'!$A$5:$A$504,\"<=\"&C${row},'Touch Log'!$F$5:$F$504,\"First message\",'Touch Log'!$H$5:$H$504,\"Yes\")`]];
  weekly.getRange(`F${row}`).formulas = [[`=COUNTIFS('Touch Log'!$A$5:$A$504,\">=\"&B${row},'Touch Log'!$A$5:$A$504,\"<=\"&C${row},'Touch Log'!$I$5:$I$504,\"Replied\")`]];
  weekly.getRange(`G${row}`).formulas = [[`=COUNTIFS('Accounts'!$S$5:$S$104,\">=\"&B${row},'Accounts'!$S$5:$S$104,\"<=\"&C${row},'Accounts'!$T$5:$T$104,\"Yes\",'Accounts'!$E$5:$E$104,\"CA\")+COUNTIFS('Accounts'!$S$5:$S$104,\">=\"&B${row},'Accounts'!$S$5:$S$104,\"<=\"&C${row},'Accounts'!$T$5:$T$104,\"Yes\",'Accounts'!$E$5:$E$104,\"Both\")`]];
  weekly.getRange(`H${row}`).formulas = [[`=COUNTIFS('Accounts'!$S$5:$S$104,\">=\"&B${row},'Accounts'!$S$5:$S$104,\"<=\"&C${row},'Accounts'!$T$5:$T$104,\"Yes\",'Accounts'!$E$5:$E$104,\"Automation\")+COUNTIFS('Accounts'!$S$5:$S$104,\">=\"&B${row},'Accounts'!$S$5:$S$104,\"<=\"&C${row},'Accounts'!$T$5:$T$104,\"Yes\",'Accounts'!$E$5:$E$104,\"Both\")`]];
  weekly.getRange(`I${row}`).formulas = [[`=COUNTIFS('Accounts'!$V$5:$V$104,\">=\"&B${row},'Accounts'!$V$5:$V$104,\"<=\"&C${row},'Accounts'!$U$5:$U$104,\"Yes\")`]];
  weekly.getRange(`J${row}`).formulas = [[`=COUNTIFS('Accounts'!$W$5:$W$104,\">=\"&B${row},'Accounts'!$W$5:$W$104,\"<=\"&C${row})`]];
  weekly.getRange(`K${row}`).formulas = [[`=SUMIFS('Accounts'!$AB$5:$AB$104,'Accounts'!$X$5:$X$104,\">=\"&B${row},'Accounts'!$X$5:$X$104,\"<=\"&C${row})`]];
  weekly.getRange(`L${row}`).formulas = [[`=IFERROR(COUNTIFS('Touch Log'!$A$5:$A$504,\">=\"&B${row},'Touch Log'!$A$5:$A$504,\"<=\"&C${row},'Touch Log'!$I$5:$I$504,\"Replied\",'Touch Log'!$J$5:$J$504,\"<=8\")/COUNTIFS('Touch Log'!$A$5:$A$504,\">=\"&B${row},'Touch Log'!$A$5:$A$504,\"<=\"&C${row},'Touch Log'!$I$5:$I$504,\"Replied\"),0)`]];
}
body(weekly.getRange("A5:M9"));
weekly.getRange("B5:C9").format.numberFormat = "yyyy-mm-dd";
weekly.getRange("K5:K9").format.numberFormat = '"$"#,##0';
weekly.getRange("L5:L9").format.numberFormat = "0%";
input(weekly.getRange("M5:M9"));
weekly.tables.add("A4:M9", true, "WeeklyReviewTable");
setWidths(weekly, { A: 12, B: 14, C: 14, D: 16, E: 18, F: 10, G: 14, H: 18, I: 16, J: 14, K: 18, L: 18, M: 34 });
weekly.freezePanes.freezeRows(4);

title(
  rules,
  "A1:H2",
  "Rules and Command Desk",
  "A3:H3",
  "This sheet keeps the system honest. Do not trade context for volume.",
);
rules.getRange("A5:H5").merge();
rules.getRange("A5:H5").values = [["Hard rules"]];
section(rules.getRange("A5:H5"));
rules.getRange("A6:H14").values = [
  ["1", "Ryan sends every LinkedIn action by hand.", null, null, null, null, null, null],
  ["2", "No pitch, service mention, mockup offer, or calendar link in the first message.", null, null, null, null, null, null],
  ["3", "Draft only after the evidence gate is complete.", null, null, null, null, null, null],
  ["4", "A reply pauses the queue. Answer the real conversation first.", null, null, null, null, null, null],
  ["5", "Current customers use a customer-aware motion, not prospect outreach.", null, null, null, null, null, null],
  ["6", "No automated LinkedIn sending, scraping at scale, fabricated context, discounts, or fake urgency.", null, null, null, null, null, null],
  ["7", "No AI slop and no em dashes in Ryan's copy.", null, null, null, null, null, null],
  ["8", "Never name Harbor Haven or Camp Arcadia.", null, null, null, null, null, null],
  ["9", "Maclaine owns price.", null, null, null, null, null, null],
];
for (let row = 6; row <= 14; row += 1) rules.getRange(`B${row}:H${row}`).merge();
body(rules.getRange("A6:H14"));
rules.getRange("A6:A14").format = { fill: colors.navy, font: { bold: true, color: colors.white }, horizontalAlignment: "center" };

rules.getRange("A16:C16").values = [["Grokbot command", "What it does", "Stop condition"]];
header(rules.getRange("A16:C16"));
rules.getRange("A17:C22").values = [
  ["linkedin sprint setup", "Rank export, load up to 25 candidates, set first five reviews", "Stop if Connections.csv is missing"],
  ["linkedin war room", "Build replies-first daily queue", "Stop weak names instead of filling quota"],
  ["research [name]", "Create evidence packet and fit decision", "Missing evidence becomes [NEED CONTEXT]"],
  ["dm [name]", "Light-edit one grounded first message", "No current signal or Ryan context"],
  ["reply desk", "Handle live conversation before new outreach", "Resume only after next step is clear"],
  ["friday linkedin review", "Report outcomes and pick one change", "Do not rebuild the system"],
];
body(rules.getRange("A17:C22"));
rules.getRange("A17:C22").format.borders = { preset: "inside", style: "thin", color: colors.gray };

rules.getRange("A24:H24").merge();
rules.getRange("A24:H24").values = [["Sources and limits"]];
section(rules.getRange("A24:H24"));
rules.getRange("A25:C25").values = [["Source", "As of", "Use"]];
header(rules.getRange("A25:C25"));
rules.getRange("A26:C30").values = [
  ["Creative-Alternatives/plans/1m-6-month-game-plan.md", "2026-08-24 review", "Revenue target, warm base, approved LinkedIn role"],
  ["Creative-Alternatives/pillars/2-customer-acquisition/account-based-outbound-engine.md", "2026-08-24 review", "Account coordination, controls, camps evidence"],
  ["Personal Brand/GROKBOT-LINKEDIN.md", "2026-08-24 review", "Daily order, audience lanes, no-send rules"],
  ["Personal Brand/DM-PLAYBOOK.md", "2026-08-24 review", "Conversation stages and first-message rule"],
  ["LinkedIn Connections.csv and live customer records", "Not loaded", "Required before the first 25 are treated as usable candidates"],
];
body(rules.getRange("A26:C30"));
rules.getRange("A26:C30").format.borders = { preset: "inside", style: "thin", color: colors.gray };
rules.getRange("A30:C30").format.fill = colors.lightRed;
setWidths(rules, { A: 28, B: 42, C: 42, D: 8, E: 8, F: 8, G: 8, H: 8 });
rules.freezePanes.freezeRows(3);

await fs.mkdir(previewDir, { recursive: true });

const dashboardCheck = await workbook.inspect({
  kind: "table",
  range: "Dashboard!A1:H23",
  include: "values,formulas",
  tableMaxRows: 24,
  tableMaxCols: 10,
  maxChars: 9000,
});
console.log("DASHBOARD_CHECK");
console.log(dashboardCheck.ndjson);

const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
  maxChars: 9000,
});
console.log("FORMULA_ERROR_SCAN");
console.log(formulaErrors.ndjson);

const previews = [
  ["Dashboard", "A1:H23", "dashboard.png"],
  ["Candidate Queue", "A1:W18", "candidate-queue.png"],
  ["Accounts", "A1:AD14", "accounts.png"],
  ["Contacts", "A1:R14", "contacts.png"],
  ["Daily Queue", "A1:O20", "daily-queue.png"],
  ["Touch Log", "A1:N14", "touch-log.png"],
  ["Weekly Review", "A1:M10", "weekly-review.png"],
  ["Rules", "A1:H30", "rules.png"],
];

for (const [sheetName, range, filename] of previews) {
  const preview = await workbook.render({ sheetName, range, scale: 0.9, format: "png" });
  await fs.writeFile(`${previewDir}/${filename}`, new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/LinkedIn-Acquisition-Sprint.xlsx`);
console.log(`EXPORTED ${outputDir}/LinkedIn-Acquisition-Sprint.xlsx`);

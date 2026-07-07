import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve("outputs/deal_threads_kpi_dashboard");
const outputPath = path.join(outputDir, "Deal Threads KPI Dashboard.xlsx");

const workbook = Workbook.create();

const palette = {
  navy: "#14313D",
  teal: "#0E766E",
  mint: "#DFF7F2",
  softBlue: "#EAF3F8",
  amber: "#FFF1CC",
  redSoft: "#FDE2E1",
  greenSoft: "#DCFCE7",
  gray: "#F4F6F8",
  border: "#CBD5E1",
  darkText: "#172026",
  mutedText: "#5B6770",
  white: "#FFFFFF",
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
    fill: palette.navy,
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
    fill: palette.navy,
    font: { bold: true, color: palette.white },
    horizontalAlignment: "center",
    wrapText: true,
  };
}

function inputHeader(range) {
  range.format = {
    fill: palette.teal,
    font: { bold: true, color: palette.white },
    horizontalAlignment: "center",
    wrapText: true,
  };
}

function card(sheet, cell, label, formula, numberFormat = "0") {
  const labelCell = sheet.getRange(cell);
  const valueCell = labelCell.offset(1, 0);
  labelCell.values = [[label]];
  valueCell.formulas = [[formula]];
  labelCell.format = {
    fill: palette.softBlue,
    font: { bold: true, color: palette.mutedText, size: 10 },
    horizontalAlignment: "center",
  };
  valueCell.format = {
    fill: palette.white,
    font: { bold: true, color: palette.navy, size: 15 },
    horizontalAlignment: "center",
    borders: { bottom: { style: "continuous", color: palette.border } },
  };
  valueCell.format.numberFormat = numberFormat;
}

const dashboard = workbook.worksheets.add("Dashboard");
const weekly = workbook.worksheets.add("Weekly Inputs");
const funnel = workbook.worksheets.add("Funnel");
const customers = workbook.worksheets.add("Customers");
const thresholds = workbook.worksheets.add("Thresholds");
const dictionary = workbook.worksheets.add("Metric Dictionary");
const cadence = workbook.worksheets.add("Review Cadence");

for (const sheet of [dashboard, weekly, funnel, customers, thresholds, dictionary, cadence]) {
  sheet.showGridLines = false;
}

// Weekly Inputs
title(
  weekly,
  "A1:Q2",
  "Deal Threads Weekly Inputs",
  "Update this every Friday. Dashboard and funnel calculations pull from these rows.",
);
setWidths(weekly, [110, 70, 90, 115, 105, 115, 125, 120, 105, 105, 105, 90, 95, 90, 90, 140, 250]);
weekly.getRange("A4:Q4").values = [[
  "Week Start",
  "Posts",
  "ICP Comments",
  "DM Conversations",
  "Audit Downloads",
  "Form URL Asks",
  "Qualified Form URLs",
  "Teardowns Delivered",
  "Install Calls",
  "Installs Started",
  "Paying Customers Added",
  "New MRR",
  "Setup Cash",
  "S&M Spend",
  "Direct Costs",
  "Best Learning",
  "Notes",
]];
inputHeader(weekly.getRange("A4:Q4"));
const start = new Date("2026-06-01T00:00:00");
const weekRows = [];
for (let i = 0; i < 12; i++) {
  const d = new Date(start);
  d.setDate(start.getDate() + i * 7);
  weekRows.push([d, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "", ""]);
}
weekly.getRange("A5:Q16").values = weekRows;
weekly.getRange("A5:A16").format.numberFormat = "yyyy-mm-dd";
weekly.getRange("L5:O16").format.numberFormat = "$#,##0";
weekly.getRange("A4:Q16").format.borders = { inside: { style: "continuous", color: palette.border }, outside: { style: "continuous", color: palette.border } };
weekly.tables.add("A4:Q16", true, "WeeklyInputsTable");

// Funnel
title(funnel, "A1:N2", "Deal Threads Funnel Calculations", "Formula layer: do not edit unless changing metric definitions.");
setWidths(funnel, [110, 95, 95, 105, 110, 110, 110, 105, 105, 105, 110, 80, 90, 130]);
funnel.getRange("A4:N4").values = [[
  "Week Start",
  "Ask-to-Submit",
  "Audit-to-URL",
  "Comment-to-DM",
  "DM-to-URL",
  "URL-to-Teardown",
  "Teardown-to-Call",
  "Call-to-Install",
  "Install-to-Paid",
  "Cumulative MRR",
  "ARR",
  "Gross Margin",
  "MRR Goal %",
  "Primary Bottleneck",
]];
header(funnel.getRange("A4:N4"));
for (let r = 5; r <= 16; r++) {
  const wr = r;
  funnel.getRange(`A${r}:N${r}`).formulas = [[
    `='Weekly Inputs'!A${wr}`,
    `=IFERROR('Weekly Inputs'!G${wr}/'Weekly Inputs'!F${wr},0)`,
    `=IFERROR('Weekly Inputs'!G${wr}/'Weekly Inputs'!E${wr},0)`,
    `=IFERROR('Weekly Inputs'!D${wr}/'Weekly Inputs'!C${wr},0)`,
    `=IFERROR('Weekly Inputs'!G${wr}/'Weekly Inputs'!D${wr},0)`,
    `=IFERROR('Weekly Inputs'!H${wr}/'Weekly Inputs'!G${wr},0)`,
    `=IFERROR('Weekly Inputs'!I${wr}/'Weekly Inputs'!H${wr},0)`,
    `=IFERROR('Weekly Inputs'!J${wr}/'Weekly Inputs'!I${wr},0)`,
    `=IFERROR('Weekly Inputs'!K${wr}/'Weekly Inputs'!J${wr},0)`,
    `=SUM('Weekly Inputs'!$L$5:L${wr})`,
    `=J${r}*12`,
    `=IFERROR((J${r}-'Weekly Inputs'!O${wr})/J${r},0)`,
    `=J${r}/5000`,
    `=IF('Weekly Inputs'!G${wr}=0,"Need form URLs",IF('Weekly Inputs'!H${wr}=0,"Deliver teardowns",IF('Weekly Inputs'!I${wr}=0,"Ask for install calls",IF('Weekly Inputs'!J${wr}=0,"Close install","Keep scaling"))))`,
  ]];
}
funnel.getRange("A5:A16").format.numberFormat = "yyyy-mm-dd";
funnel.getRange("B5:I16").format.numberFormat = "0.0%";
funnel.getRange("J5:K16").format.numberFormat = "$#,##0";
funnel.getRange("L5:M16").format.numberFormat = "0.0%";
funnel.getRange("A4:N16").format.borders = { inside: { style: "continuous", color: palette.border }, outside: { style: "continuous", color: palette.border } };
funnel.tables.add("A4:N16", true, "FunnelTable");

// Customers
title(customers, "A1:P2", "Deal Threads Customers And Unit Economics", "Track installed customers, activation, profile usefulness, and recurring revenue.");
setWidths(customers, [150, 120, 115, 100, 105, 95, 110, 80, 100, 95, 100, 100, 110, 110, 100, 240]);
customers.getRange("A4:P4").values = [[
  "Customer",
  "Tier",
  "Stage",
  "Start Date",
  "Monthly Price",
  "Setup Fee",
  "Setup Collected?",
  "Active?",
  "Workflow Live?",
  "Profiles This Week",
  "Profiles Reviewed",
  "Useful Profiles",
  "Useful Profile Rate",
  "Direct Monthly Cost",
  "Gross Margin",
  "Notes",
]];
inputHeader(customers.getRange("A4:P4"));
const customerRows = Array.from({ length: 20 }, () => ["", "Founder Install", "Prospect", "", 0, 0, "No", "No", "No", 0, 0, 0, "", 0, "", ""]);
customers.getRange("A5:P24").values = customerRows;
for (let r = 5; r <= 24; r++) {
  customers.getRange(`M${r}`).formulas = [[`=IFERROR(L${r}/K${r},0)`]];
  customers.getRange(`O${r}`).formulas = [[`=IFERROR((E${r}-N${r})/E${r},0)`]];
}
customers.getRange("D5:D24").format.numberFormat = "yyyy-mm-dd";
customers.getRange("E5:F24").format.numberFormat = "$#,##0";
customers.getRange("N5:N24").format.numberFormat = "$#,##0";
customers.getRange("M5:M24").format.numberFormat = "0.0%";
customers.getRange("O5:O24").format.numberFormat = "0.0%";
customers.getRange("B5:B24").dataValidation = { rule: { type: "list", values: ["Founder Install", "Growth Managed", "Pipeline Intelligence", "Paid Audit"] } };
customers.getRange("C5:C24").dataValidation = { rule: { type: "list", values: ["Prospect", "Teardown", "Call", "Install", "Active", "Churned"] } };
customers.getRange("G5:I24").dataValidation = { rule: { type: "list", values: ["Yes", "No"] } };
customers.getRange("A4:P24").format.borders = { inside: { style: "continuous", color: palette.border }, outside: { style: "continuous", color: palette.border } };
customers.tables.add("A4:P24", true, "CustomersTable");

// Thresholds
title(thresholds, "A1:F2", "Deal Threads Metric Thresholds", "Green means keep executing. Yellow means diagnose. Red means fix the bottleneck.");
setWidths(thresholds, [210, 120, 120, 120, 120, 280]);
thresholds.getRange("A4:F4").values = [["Metric", "Green", "Yellow Low", "Yellow High", "Red", "Action If Red"]];
header(thresholds.getRange("A4:F4"));
thresholds.getRange("A5:F18").values = [
  ["LinkedIn posts/week", 5, 3, 4, "<3", "Publish from Week 1 pack before creating new strategy."],
  ["ICP comments/week", 50, 25, 49, "<25", "Comment on more founder, RevOps, demand gen, and sales posts."],
  ["DM conversations/week", 10, 5, 9, "<5", "Reply to engagers and use the audit CTA directly."],
  ["Audit downloads/week", 10, 3, 9, "<3", "Improve landing page CTA and offer the audit in comments/DMs."],
  ["Qualified form URLs/week", 3, 1, 2, "0", "Ask directly for form URLs and show more before/after proof."],
  ["Teardowns delivered/week", 2, 1, 1, "0", "Use 15-minute teardown template and block delivery time."],
  ["Install calls/week", 1, 0, 0, "0", "Add CRM preview and ask for install scoping call."],
  ["Teardown-to-call rate", 0.25, 0.1, 0.24, "<10%", "Make teardown more specific and include install CTA."],
  ["Call-to-install rate", 0.2, 0.1, 0.19, "<10%", "Improve proof, guarantee, and scope clarity."],
  ["Gross margin", 0.7, 0.5, 0.69, "<50%", "Reduce delivery/API cost or raise price."],
  ["CAC payback", 1.5, 1.5, 3, ">3 months", "Avoid paid acquisition and tighten conversion."],
  ["Monthly churn", 0.05, 0.05, 0.1, ">10%", "Fix activation and profile usefulness before growth."],
  ["Useful profile rate", 0.7, 0.5, 0.69, "<50%", "Tune conversation questions and enrichment fields."],
  ["MRR by day 90", 5000, 1000, 4999, "0", "Prioritize install calls and paid proof clients."],
];
thresholds.getRange("B12:D14").format.numberFormat = "0.0%";
thresholds.getRange("B15:D17").format.numberFormat = "0.0%";
thresholds.getRange("A4:F18").format.borders = { inside: { style: "continuous", color: palette.border }, outside: { style: "continuous", color: palette.border } };
thresholds.tables.add("A4:F18", true, "ThresholdsTable");

// Metric Dictionary
title(dictionary, "A1:E2", "Deal Threads Metric Dictionary", "Use one definition per metric so reviews stay consistent.");
setWidths(dictionary, [200, 150, 350, 250, 180]);
dictionary.getRange("A4:E4").values = [["Metric", "Type", "Definition", "Formula", "Review Cadence"]];
header(dictionary.getRange("A4:E4"));
dictionary.getRange("A5:E24").values = [
  ["Qualified form URLs", "North star", "Submitted B2B demo/contact form URLs that pass qualification.", "Manual qualified count", "Daily/weekly"],
  ["MRR", "Revenue", "Recurring monthly subscription revenue from active customers.", "SUM active monthly prices", "Weekly/monthly"],
  ["ARR", "Revenue", "Annualized recurring revenue.", "MRR x 12", "Monthly"],
  ["Ask-to-submit rate", "Acquisition", "Percent of direct form URL asks that become qualified URL submissions.", "Qualified URLs / Form URL Asks", "Weekly"],
  ["Audit-to-URL rate", "Acquisition", "Percent of audit downloads that become form URL submissions.", "Qualified URLs / Audit Downloads", "Weekly"],
  ["Teardown-to-call rate", "Conversion", "Percent of delivered teardowns that book install calls.", "Calls / Teardowns", "Weekly"],
  ["Call-to-install rate", "Conversion", "Percent of install calls that become installs.", "Installs / Calls", "Weekly"],
  ["Install-to-paid rate", "Conversion", "Percent of installs that become paying customers.", "Paying Customers / Installs", "Monthly"],
  ["Useful profile rate", "Activation", "Percent of reviewed buyer profiles that sales/founder rates useful.", "Useful Profiles / Profiles Reviewed", "Weekly"],
  ["Gross margin", "Financial", "Revenue left after direct API/delivery costs.", "(Revenue - Direct Cost) / Revenue", "Monthly"],
  ["CAC", "Financial", "Sales and marketing spend divided by new customers.", "S&M Spend / New Customers", "Monthly"],
  ["CAC payback", "Financial", "Months needed to recover acquisition cost from gross profit.", "CAC / Monthly Gross Profit", "Monthly"],
  ["Churn", "Retention", "Customers or MRR lost in a period.", "Lost / Starting Base", "Monthly"],
  ["NRR", "Retention", "Revenue retained after expansion, contraction, and churn.", "(Start MRR + Expansion - Contraction - Churn) / Start MRR", "Monthly"],
  ["Profile completeness", "Activation", "Target buyer-profile fields populated with useful or explicitly unknown values.", "Completed Fields / Target Fields", "Weekly"],
  ["Submit-to-profile time", "Activation", "Median time from form submission to CRM buyer profile creation.", "Median minutes", "Weekly"],
  ["Setup cash", "Financial", "One-time setup fees collected.", "SUM setup fees", "Weekly/monthly"],
  ["ARPU", "Revenue", "Average recurring revenue per active customer.", "MRR / Active Customers", "Monthly"],
  ["Founder-time CAC", "Financial", "Founder acquisition time valued as cost per customer.", "Hours x hourly rate / customers", "Monthly"],
  ["Best buyer phrase", "Learning", "Strongest language heard from ICP buyers that should inform copy.", "Manual note", "Weekly"],
];
dictionary.getRange("A4:E24").format.borders = { inside: { style: "continuous", color: palette.border }, outside: { style: "continuous", color: palette.border } };
dictionary.tables.add("A4:E24", true, "MetricDictionaryTable");

// Review Cadence
title(cadence, "A1:E2", "Deal Threads Reporting Cadence", "Keep reviews short, decision-driven, and tied to the revenue path.");
setWidths(cadence, [120, 190, 360, 320, 280]);
cadence.getRange("A4:E4").values = [["Cadence", "Owner", "Review", "Questions", "Decision"]];
header(cadence.getRange("A4:E4"));
cadence.getRange("A5:E8").values = [
  ["Daily 5 min", "Ryan", "Activity and follow-up check", "Did we post/comment/DM? Any form URLs or replies?", "What is today's one conversion action?"],
  ["Weekly 30 min", "Ryan", "Inbound and funnel review", "Where did the funnel leak? Which persona/CTA worked?", "What do we double down on next week?"],
  ["Monthly 60 min", "Ryan + advisors", "Business and unit economics review", "MRR, pipeline, activation, margin, delivery load?", "What milestone matters next month?"],
  ["Quarterly", "Ryan + advisors", "Strategy review", "Is the ICP right? Are installs retaining? Is ARPU rising?", "Stay founder-led, expand upmarket, or adjust offer?"],
];
cadence.getRange("A4:E8").format.borders = { inside: { style: "continuous", color: palette.border }, outside: { style: "continuous", color: palette.border } };
cadence.tables.add("A4:E8", true, "ReviewCadenceTable");

// Dashboard
title(
  dashboard,
  "A1:J2",
  "Deal Threads KPI Dashboard",
  "North star: qualified form URLs submitted per week. Update Weekly Inputs and Customers; this page updates automatically.",
);
setWidths(dashboard, [195, 110, 110, 110, 110, 110, 170, 110, 115, 210, 35, 100, 125, 135, 110, 110]);
dashboard.getRange("A3").values = [["Selected Week"]];
dashboard.getRange("B3").values = [[1]];
dashboard.getRange("A3:B3").format = {
  fill: palette.amber,
  font: { bold: true, color: palette.darkText },
  horizontalAlignment: "center",
};
dashboard.getRange("B3").dataValidation = { rule: { type: "list", values: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] } };

section(dashboard, "A5:J5", "Executive Summary");
card(dashboard, "A6", "Current MRR", "=INDEX(Funnel!$J$5:$J$16,$B$3)", "$#,##0");
card(dashboard, "B6", "MRR Goal %", "=INDEX(Funnel!$M$5:$M$16,$B$3)", "0.0%");
card(dashboard, "C6", "Form URLs", "=INDEX('Weekly Inputs'!$G$5:$G$16,$B$3)", "0");
card(dashboard, "D6", "Teardowns", "=INDEX('Weekly Inputs'!$H$5:$H$16,$B$3)", "0");
card(dashboard, "E6", "Install Calls", "=INDEX('Weekly Inputs'!$I$5:$I$16,$B$3)", "0");
card(dashboard, "F6", "Installs", "=INDEX('Weekly Inputs'!$J$5:$J$16,$B$3)", "0");
card(dashboard, "G6", "Active Customers", '=COUNTIFS(Customers!$H$5:$H$24,"Yes")', "0");
card(dashboard, "H6", "ARR", "=INDEX(Funnel!$K$5:$K$16,$B$3)", "$#,##0");
card(dashboard, "I6", "Setup Cash", "=SUM('Weekly Inputs'!$M$5:$M$16)", "$#,##0");
card(dashboard, "J6", "Bottleneck", "=INDEX(Funnel!$N$5:$N$16,$B$3)", "@");

section(dashboard, "A10:E10", "Conversion Funnel");
dashboard.getRange("A11:E17").values = [
  ["Stage", "Count", "Previous Stage", "Conversion", "Health"],
  ["Audit Downloads", null, null, null, null],
  ["Qualified Form URLs", null, null, null, null],
  ["Teardowns Delivered", null, null, null, null],
  ["Install Calls", null, null, null, null],
  ["Installs Started", null, null, null, null],
  ["Paying Customers Added", null, null, null, null],
];
header(dashboard.getRange("A11:E11"));
dashboard.getRange("B12:B17").formulas = [
  ["=INDEX('Weekly Inputs'!$E$5:$E$16,$B$3)"],
  ["=INDEX('Weekly Inputs'!$G$5:$G$16,$B$3)"],
  ["=INDEX('Weekly Inputs'!$H$5:$H$16,$B$3)"],
  ["=INDEX('Weekly Inputs'!$I$5:$I$16,$B$3)"],
  ["=INDEX('Weekly Inputs'!$J$5:$J$16,$B$3)"],
  ["=INDEX('Weekly Inputs'!$K$5:$K$16,$B$3)"],
];
dashboard.getRange("C12:C17").formulas = [
  [""],
  ["=B12"],
  ["=B13"],
  ["=B14"],
  ["=B15"],
  ["=B16"],
];
dashboard.getRange("D12:D17").formulas = [
  [""],
  ["=IFERROR(B13/C13,0)"],
  ["=IFERROR(B14/C14,0)"],
  ["=IFERROR(B15/C15,0)"],
  ["=IFERROR(B16/C16,0)"],
  ["=IFERROR(B17/C17,0)"],
];
dashboard.getRange("E12:E17").formulas = [
  ["=IF(B12>=10,\"Green\",IF(B12>=3,\"Yellow\",\"Red\"))"],
  ["=IF(B13>=3,\"Green\",IF(B13>=1,\"Yellow\",\"Red\"))"],
  ["=IF(B14>=2,\"Green\",IF(B14>=1,\"Yellow\",\"Red\"))"],
  ["=IF(B15>=1,\"Green\",\"Red\")"],
  ["=IF(B16>=1,\"Green\",\"Red\")"],
  ["=IF(B17>=1,\"Green\",\"Yellow\")"],
];
dashboard.getRange("D12:D17").format.numberFormat = "0.0%";
dashboard.getRange("A11:E17").format.borders = { inside: { style: "continuous", color: palette.border }, outside: { style: "continuous", color: palette.border } };

section(dashboard, "G10:J10", "Health Alerts");
dashboard.getRange("G11:J17").values = [
  ["Metric", "Actual", "Target", "Status"],
  ["Posts", null, 5, null],
  ["ICP Comments", null, 50, null],
  ["DM Conversations", null, 10, null],
  ["Qualified Form URLs", null, 3, null],
  ["Teardowns", null, 2, null],
  ["Install Calls", null, 1, null],
];
header(dashboard.getRange("G11:J11"));
dashboard.getRange("H12:H17").formulas = [
  ["=INDEX('Weekly Inputs'!$B$5:$B$16,$B$3)"],
  ["=INDEX('Weekly Inputs'!$C$5:$C$16,$B$3)"],
  ["=INDEX('Weekly Inputs'!$D$5:$D$16,$B$3)"],
  ["=INDEX('Weekly Inputs'!$G$5:$G$16,$B$3)"],
  ["=INDEX('Weekly Inputs'!$H$5:$H$16,$B$3)"],
  ["=INDEX('Weekly Inputs'!$I$5:$I$16,$B$3)"],
];
dashboard.getRange("J12:J17").formulas = [
  ["=IF(H12>=I12,\"Green\",IF(H12>=I12*0.5,\"Yellow\",\"Red\"))"],
  ["=IF(H13>=I13,\"Green\",IF(H13>=I13*0.5,\"Yellow\",\"Red\"))"],
  ["=IF(H14>=I14,\"Green\",IF(H14>=I14*0.5,\"Yellow\",\"Red\"))"],
  ["=IF(H15>=I15,\"Green\",IF(H15>=1,\"Yellow\",\"Red\"))"],
  ["=IF(H16>=I16,\"Green\",IF(H16>=1,\"Yellow\",\"Red\"))"],
  ["=IF(H17>=I17,\"Green\",\"Red\")"],
];
dashboard.getRange("G11:J17").format.borders = { inside: { style: "continuous", color: palette.border }, outside: { style: "continuous", color: palette.border } };

section(dashboard, "A20:J20", "Weekly Learning And Decision");
dashboard.getRange("A21:J24").values = [
  ["Best Learning", "", "", "", "", "Primary Bottleneck", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["Next Decision", "", "", "", "", "Owner", "Ryan", "Review Date", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
];
dashboard.getRange("A21:E22").merge();
dashboard.getRange("F21:J22").merge();
dashboard.getRange("A23:E24").merge();
dashboard.getRange("I23:J24").merge();
dashboard.getRange("A21:E22").formulas = [["=INDEX('Weekly Inputs'!$P$5:$P$16,$B$3)"]];
dashboard.getRange("F21:J22").formulas = [["=INDEX(Funnel!$N$5:$N$16,$B$3)"]];
dashboard.getRange("A23:E24").values = [["Decide whether to improve CTA, targeting, teardown proof, or install conversion based on the bottleneck."]];
dashboard.getRange("I23:J24").formulas = [["=INDEX('Weekly Inputs'!$A$5:$A$16,$B$3)+6"]];
dashboard.getRange("I23:J24").format.numberFormat = "yyyy-mm-dd";
dashboard.getRange("A21:J24").format = {
  fill: palette.gray,
  font: { color: palette.darkText },
  wrapText: true,
  verticalAlignment: "top",
};

// Dashboard chart helpers
dashboard.getRange("L4:N4").values = [["Week", "Qualified URLs", "Cumulative MRR"]];
for (let r = 5; r <= 16; r++) {
  const sourceRow = r;
  dashboard.getRange(`L${r}:N${r}`).formulas = [[
    `=TEXT('Weekly Inputs'!A${sourceRow},"m/d")`,
    `='Weekly Inputs'!G${sourceRow}`,
    `=Funnel!J${sourceRow}`,
  ]];
}
dashboard.getRange("N5:N16").format.numberFormat = "$#,##0";
const urlChart = dashboard.charts.add("line", dashboard.getRange("L4:M16"));
urlChart.title = "Qualified Form URLs Per Week";
urlChart.hasLegend = false;
urlChart.xAxis = { axisType: "textAxis" };
urlChart.yAxis = { numberFormatCode: "0" };
urlChart.setPosition("L1", "P14");
const mrrChart = dashboard.charts.add("line", dashboard.getRange("L4:L16").resize(13, 3));
mrrChart.title = "Cumulative MRR Trend";
mrrChart.hasLegend = true;
mrrChart.xAxis = { axisType: "textAxis" };
mrrChart.yAxis = { numberFormatCode: "$#,##0" };
mrrChart.setPosition("L16", "P29");
dashboard.getRange("L4:N16").format = { fill: "#FFFFFF", font: { color: "#FFFFFF" } };

// Basic conditional formats for status cells
for (const range of [dashboard.getRange("E12:E17"), dashboard.getRange("J12:J17")]) {
  range.conditionalFormats.add("containsText", { text: "Green", format: { fill: palette.greenSoft, font: { bold: true, color: "#166534" } } });
  range.conditionalFormats.add("containsText", { text: "Yellow", format: { fill: palette.amber, font: { bold: true, color: "#92400E" } } });
  range.conditionalFormats.add("containsText", { text: "Red", format: { fill: palette.redSoft, font: { bold: true, color: "#991B1B" } } });
}
for (const sheet of [dashboard, weekly, funnel, customers, thresholds, dictionary, cadence]) {
  const used = sheet.getUsedRange();
  used.format.font = { name: "Aptos" };
}

// Keep title bands readable and keep helper chart data visually tucked away.
dashboard.getRange("A1:J2").format.rowHeightPx = 32;
weekly.getRange("A1:Q2").format.rowHeightPx = 32;
funnel.getRange("A1:N2").format.rowHeightPx = 32;
customers.getRange("A1:P2").format.rowHeightPx = 32;
thresholds.getRange("A1:F2").format.rowHeightPx = 32;
dictionary.getRange("A1:E2").format.rowHeightPx = 32;
cadence.getRange("A1:E2").format.rowHeightPx = 32;
dashboard.getRange("L4:N16").format = { fill: "#FFFFFF", font: { color: "#FFFFFF" } };

await fs.mkdir(outputDir, { recursive: true });

// Compact verification artifacts.
const inspectDashboard = await workbook.inspect({
  kind: "table",
  range: "Dashboard!A1:J24",
  include: "values,formulas",
  tableMaxRows: 24,
  tableMaxCols: 10,
  maxChars: 5000,
});
console.log(inspectDashboard.ndjson);

const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
  maxChars: 2000,
});
console.log(errorScan.ndjson);

for (const sheetName of ["Dashboard", "Weekly Inputs", "Funnel", "Customers", "Thresholds", "Metric Dictionary", "Review Cadence"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, `${sheetName.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase()}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(outputPath);

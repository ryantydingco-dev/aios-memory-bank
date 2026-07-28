import { existsSync } from "node:fs";
import path from "node:path";

const appRoot = path.resolve(import.meta.dirname, "..");
const defaultFiles = [
  "/Users/ryantydingco/Documents/AIOS/dealthread-agents/.env",
  "/Users/ryantydingco/Documents/AIOS/dealthreads-engine/.env",
  "/Users/ryantydingco/Documents/AIOS/aios-starter-kit/.env",
  path.resolve(appRoot, "../First-Customer Sprint/14-Day Self Sprint - 2026-06-08/.env.salesfinity")
];
const configuredFiles = String(process.env.DEAL_THREADS_ENV_FILES || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const envFiles = configuredFiles.length ? configuredFiles : defaultFiles;
const loaded = [];

for (const file of envFiles) {
  if (!existsSync(file)) continue;
  process.loadEnvFile(file);
  loaded.push(file);
}

alias("HUBSPOT_TOKEN", "HUBSPOT_PRIVATE_APP_TOKEN");
alias("SENDR_API_KEY", "SENDER_AI_API_KEY");
alias("CALCOM_API_KEY", "CAL_API_KEY");

setDefault("SDR_AUTOMATION_ENABLED", "true");
setDefault("SDR_ACTION_MODE", "approval");
setDefault("HUBSPOT_AUTO_SYNC", process.env.HUBSPOT_TOKEN ? "true" : "false");
setDefault("HUBSPOT_AUTO_SETUP_PROPERTIES", "false");
setDefault(
  "REVENUE_NOTIFICATIONS_ENABLED",
  process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID ? "true" : "false"
);
setDefault("REVENUE_WATCHDOG_TIMEZONE", "America/New_York");
setDefault("REVENUE_WATCHDOG_MORNING_TIME", "07:25");
setDefault("REVENUE_WATCHDOG_URGENT_ALERTS", "true");

console.log(`Revenue loop environment loaded from ${loaded.length} file(s).`);
console.log(`24/7 worker: ${process.env.SDR_AUTOMATION_ENABLED}; HubSpot auto-sync: ${process.env.HUBSPOT_AUTO_SYNC}; notifications: ${process.env.REVENUE_NOTIFICATIONS_ENABLED}.`);

await import("../server.js");

function alias(target, source) {
  if (!process.env[target] && process.env[source]) process.env[target] = process.env[source];
}

function setDefault(key, value) {
  if (process.env[key] === undefined) process.env[key] = value;
}

import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import vm from "node:vm";
import test from "node:test";

const PORT = 5199;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ADMIN_USERNAME = "widget-admin";
const ADMIN_PASSWORD = "widget-secret";
const ADMIN_AUTH_HEADER = `Basic ${Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64")}`;

test("script-tag widget boots beta-client config and creates a routed lead", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "deal-threads-widget-install-"));
  const dataFile = path.join(tmp, "state.json");
  const app = await startServer(dataFile);

  try {
    const betaClient = await postProtectedJson("/api/v1/beta-clients", {
      name: "WidgetCo Revenue Team",
      websiteUrl: "https://widgetco.test",
      ownerEmail: "owner@widgetco.test",
      crm: "hubspot",
      status: "setup",
      notes: "Widget install smoke client.",
      launcherText: "Ask WidgetCo",
      welcomeMessage: "WidgetCo custom welcome.",
      quickReplies: "Fix routing, Improve lead quality",
      requiredFields: "email, business_need, timeline, company_name_or_domain, crm",
      questions: [
        { key: "business_need", prompt: "What should WidgetCo improve first?", quickReplies: ["Fix routing", "Improve lead quality"], required: true },
        { key: "company_name_or_domain", prompt: "Which company should the rep research?", required: true },
        {
          key: "authority",
          label: "Decision role",
          prompt: "Who owns the WidgetCo buying decision?",
          quickReplies: ["I own the decision", "I influence the decision"],
          required: false
        },
        { key: "timeline", prompt: "When should WidgetCo solve this?", required: true },
        { key: "budget", prompt: "Is WidgetCo budget approved?", required: false },
        { key: "crm", prompt: "Which CRM should WidgetCo route into?", required: true },
        { key: "email", prompt: "What WidgetCo work email should the rep use?", required: true },
        { key: "name", prompt: "What name should the rep use?", required: false }
      ],
      primaryColor: "#065f46",
      highPriorityOwner: "ae@widgetco.test",
      highPriorityAction: "Call WidgetCo high-priority leads within 10 minutes.",
      reportRecipients: "owner@widgetco.test",
      reportCadence: "weekly",
      reportPeriodDays: "14",
      nextReportDueAt: "2020-01-01T00:00:00.000Z"
    });

    const widgetCode = await readFile(path.resolve(import.meta.dirname, "../public/widget.js"), "utf8");
    const document = new FakeDocument({
      scriptSrc: `${BASE_URL}/widget.js`,
      dataset: {
        widgetId: "wid_deal_threads_demo",
        tenantId: "ten_deal_threads_demo",
        betaClientId: betaClient.id
      }
    });
	    let promptCalls = 0;
	    const window = {
	      document,
	      location: {
		        href: "https://widgetco.test/beta-fixture?utm_source=linkedin&utm_medium=paid&utm_campaign=beta-test",
	        search: "?utm_source=linkedin&utm_medium=paid&utm_campaign=beta-test"
	      },
	      referrer: "https://partner.example/referral",
	      prompt: () => {
	        promptCalls += 1;
	        return "";
	      }
	    };
    document.defaultView = window;

    vm.runInNewContext(widgetCode, {
      console,
      document,
      window,
      fetch,
      URL,
      URLSearchParams,
      setTimeout,
      clearTimeout
    });

    const host = await waitFor(() => document.documentElement.children.find((node) => node.tagName === "deal-threads-widget"));
    const shadow = host.shadowRoot;
    const launcher = shadow.querySelector(".launcher");
    const panel = shadow.querySelector(".panel");
    const messages = shadow.querySelector(".messages");
	    const consentBox = shadow.querySelector(".consent input");
	    const form = shadow.querySelector(".composer");
		    const textarea = shadow.querySelector("textarea");
		    const fallback = shadow.querySelector(".fallback");
		    const done = shadow.querySelector(".done");

    await waitFor(() => launcher.textContent === "Ask WidgetCo");
    assert.equal(launcher.style.background, "#065f46");
    assert.equal(shadow.querySelector(".consent span").textContent.length > 20, true);

	    const installedBeforeChat = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
	    assert.equal(installedBeforeChat.status, "installed");
	    assert.equal(installedBeforeChat.install_activity.config_loads, 1);
	    assert.equal(installedBeforeChat.install_activity.hosted_config_loads, 0);
	    assert.equal(installedBeforeChat.install_activity.client_page_config_loads, 1);
	    assert.equal(installedBeforeChat.install_activity.session_starts, 0);
    assert.equal(installedBeforeChat.install_activity.last_page_url, window.location.href);
    assert.equal(installedBeforeChat.widget_config.questions.find((question) => question.key === "authority").prompt, "Who owns the WidgetCo buying decision?");
    assert.ok(installedBeforeChat.install_activity.last_config_loaded_at);
    assert.equal(installedBeforeChat.checklist.find((item) => item.key === "widget_installed").checked, true);
    assert.equal(installedBeforeChat.checklist.find((item) => item.key === "test_lead_created").checked, false);

    await launcher.click();
    await waitFor(() => messages.textContent.includes("WidgetCo custom welcome."));
    assert.equal(panel.classList.contains("open"), true);
    assert.equal(launcher.style.display, "none");

    const quickButtons = shadow.querySelectorAll(".quick button");
    assert.deepEqual(
      quickButtons.map((button) => button.textContent),
      ["Fix routing", "Improve lead quality"]
    );
    assert.equal(quickButtons[0].style.color, "#065f46");

	    textarea.value = "We need better demo routing";
	    await form.dispatchEvent({ type: "submit" });
	    assert.match(messages.textContent, /Please accept the short disclosure/);
	    await fallback.click();
	    assert.equal(promptCalls, 0);
	    assert.match(messages.textContent, /Please accept the short disclosure/);
	    const leadsBeforeConsent = await getProtectedJson("/api/v1/leads");
	    assert.equal(leadsBeforeConsent.count, 0);

	    consentBox.checked = true;
    await consentBox.dispatchEvent({ type: "change" });

    const leadMessages = [
      "I am evaluating this for WidgetCo, a 160-person SaaS company using HubSpot. Demo requests are going cold because reps research manually. We want to fix this this quarter and likely have $30K-$50K annually.",
      "I own the decision",
      "willa@widgetco.test",
      "My name is Willa Vale",
      "Yes, send it"
    ];

    for (const [index, message] of leadMessages.entries()) {
      textarea.value = message;
      await form.dispatchEvent({ type: "submit" });
      if (index === 0) {
        await waitFor(() => messages.textContent.includes("Who owns the WidgetCo buying decision?"));
      }
    }

	    await waitFor(() => done.style.display === "flex");
	    assert.equal(done.textContent.includes("Profile created. The sales team will follow up with context."), true);
	    assert.equal(Boolean(shadow.querySelector(".done a")), false);

	    const leadId = done.dataset.leadProfileId;
	    assert.match(leadId, /^lead_[a-f0-9]+$/);
	    const lead = await getProtectedJson(`/api/v1/leads/${leadId}`);
    assert.equal(lead.contact.email, "willa@widgetco.test");
    assert.equal(lead.company.domain, "widgetco.test");
    assert.equal(lead.source.beta_client_id, betaClient.id);
    assert.equal(lead.source.page_url, window.location.href);
    assert.equal(lead.source.utm_source, "linkedin");
    assert.equal(lead.source.utm_medium, "paid");
    assert.equal(lead.source.utm_campaign, "beta-test");
    assert.equal(lead.routing.assigned_owner_email, "ae@widgetco.test");
    assert.equal(lead.routing.recommended_next_action, "Call WidgetCo high-priority leads within 10 minutes.");
    assert.equal(lead.enrichment.cost.paid_provider_used, false);

    const linkedClient = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
	    assert.equal(linkedClient.status, "live");
	    assert.equal(linkedClient.lead_count, 1);
	    assert.equal(linkedClient.install_activity.config_loads, 1);
	    assert.equal(linkedClient.install_activity.hosted_config_loads, 0);
	    assert.equal(linkedClient.install_activity.client_page_config_loads, 1);
	    assert.equal(linkedClient.install_activity.session_starts, 1);
    assert.ok(linkedClient.install_activity.last_session_started_at);
    assert.equal(linkedClient.checklist.find((item) => item.key === "widget_installed").checked, true);
    assert.equal(linkedClient.checklist.find((item) => item.key === "test_lead_created").checked, true);
  } finally {
    app.kill("SIGTERM");
    await once(app, "exit");
    await rm(tmp, { recursive: true, force: true });
  }
});

class ClassList {
  constructor(element) {
    this.element = element;
  }

  add(value) {
    const classes = new Set(this.element.className.split(/\s+/).filter(Boolean));
    classes.add(value);
    this.element.className = [...classes].join(" ");
  }

  remove(value) {
    const classes = new Set(this.element.className.split(/\s+/).filter(Boolean));
    classes.delete(value);
    this.element.className = [...classes].join(" ");
  }

  contains(value) {
    return this.element.className.split(/\s+/).includes(value);
  }
}

class FakeElement {
  constructor(tagName, ownerDocument = null) {
    this.tagName = String(tagName || "").toLowerCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.parentNode = null;
    this.shadowRoot = null;
    this.className = "";
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.listeners = new Map();
    this.value = "";
    this.checked = false;
    this.disabled = false;
    this.href = "";
    this.type = "";
    this.scrollTop = 0;
    this.scrollHeight = 0;
    this._textContent = "";
    this.classList = new ClassList(this);
  }

  set textContent(value) {
    this._textContent = String(value || "");
    this.children = [];
  }

  get textContent() {
    return `${this._textContent}${this.children.map((child) => child.textContent).join("")}`;
  }

  set innerHTML(value) {
    this._innerHTML = String(value || "");
  }

  get innerHTML() {
    return this._innerHTML || "";
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    this.scrollHeight = this.children.length;
    return child;
  }

  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode = null;
  }

  attachShadow() {
    this.shadowRoot = new FakeShadowRoot(this.ownerDocument);
    return this.shadowRoot;
  }

  addEventListener(type, handler) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(handler);
    this.listeners.set(type, listeners);
  }

  async dispatchEvent(event) {
    const normalized = typeof event === "string" ? { type: event } : { ...event };
    normalized.target = normalized.target || this;
    normalized.currentTarget = this;
    normalized.preventDefault = normalized.preventDefault || (() => {});
    const results = [];
    for (const handler of this.listeners.get(normalized.type) || []) {
      results.push(handler(normalized));
    }
    await Promise.all(results);
    return true;
  }

  click() {
    return this.dispatchEvent({ type: "click" });
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const parts = selector.trim().split(/\s+/);
    let current = [this];
    for (const part of parts) {
      current = current.flatMap((node) => node.descendants().filter((child) => child.matches(part)));
    }
    return current;
  }

  descendants() {
    return this.children.flatMap((child) => [child, ...child.descendants()]);
  }

  matches(selector) {
    if (selector.startsWith(".")) {
      return this.classList.contains(selector.slice(1));
    }
    return this.tagName === selector.toLowerCase();
  }
}

class FakeShadowRoot extends FakeElement {
  constructor(ownerDocument) {
    super("#shadow-root", ownerDocument);
  }

  set innerHTML(value) {
    this._innerHTML = String(value || "");
    this.children = [];
    buildWidgetShadow(this);
  }
}

class FakeDocument {
  constructor({ scriptSrc, dataset }) {
    this.documentElement = new FakeElement("html", this);
    this.currentScript = {
      src: scriptSrc,
      dataset
    };
    this.referrer = "";
    this.defaultView = null;
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }
}

function buildWidgetShadow(shadow) {
  const style = new FakeElement("style", shadow.ownerDocument);
  const launcher = element(shadow, "button", "launcher", "Talk to sales");
  const panel = element(shadow, "section", "panel");
  const head = element(shadow, "header", "head");
  const close = element(shadow, "button", "close", "x");
  const messages = element(shadow, "div", "messages");
  const wrapper = element(shadow, "div");
  const consent = element(shadow, "div", "consent");
  const label = element(shadow, "label");
  const input = element(shadow, "input");
  const consentText = element(shadow, "span");
  const form = element(shadow, "form", "composer");
  const textarea = element(shadow, "textarea");
  const send = element(shadow, "button", "send", ">");
	  const fallback = element(shadow, "button", "fallback", "Use a simple fallback form");
	  const done = element(shadow, "div", "done");
	  const doneText = element(shadow, "span", "", "Profile created. The sales team will follow up with context.");

  input.type = "checkbox";
  send.type = "submit";
  fallback.type = "button";

  shadow.appendChild(style);
  shadow.appendChild(launcher);
  shadow.appendChild(panel);
  panel.appendChild(head);
  head.appendChild(close);
  panel.appendChild(messages);
  panel.appendChild(wrapper);
  wrapper.appendChild(consent);
  consent.appendChild(label);
  label.appendChild(input);
  label.appendChild(consentText);
  wrapper.appendChild(form);
  form.appendChild(textarea);
  form.appendChild(send);
  form.appendChild(fallback);
	  wrapper.appendChild(done);
	  done.appendChild(doneText);
	}

function element(parent, tagName, className = "", text = "") {
  const node = new FakeElement(tagName, parent.ownerDocument);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

async function startServer(dataFile) {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: path.resolve(import.meta.dirname, ".."),
    env: {
      ...process.env,
      PORT: String(PORT),
      DEAL_THREADS_DATA_FILE: dataFile,
	      ENRICHMENT_MODE: "internal",
	      PAID_ENRICHMENT_LOOKUP_ESTIMATE_USD: "0.25",
	      ENRICHMENT_REVIEW_CONFIDENCE_THRESHOLD: "0.65",
	      OPENAI_API_KEY: "",
	      ADMIN_USERNAME,
      ADMIN_PASSWORD
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    logs += chunk.toString();
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Server exited early:\n${logs}`);
    try {
      const health = await getJson("/api/v1/health");
      if (health.status === "ok") return child;
    } catch {
      await sleep(100);
    }
  }

  child.kill("SIGTERM");
  throw new Error(`Server did not become ready:\n${logs}`);
}

async function waitFor(predicate, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  let lastValue;
  while (Date.now() < deadline) {
    lastValue = predicate();
    if (lastValue) return lastValue;
    await sleep(25);
  }
  throw new Error(`Timed out waiting for condition. Last value: ${String(lastValue)}`);
}

async function getJson(pathname) {
  const response = await fetch(`${BASE_URL}${pathname}`);
  return parseJsonResponse(response);
}

async function getProtectedJson(pathname) {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    headers: { authorization: ADMIN_AUTH_HEADER }
  });
  return parseJsonResponse(response);
}

async function postProtectedJson(pathname, body) {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: ADMIN_AUTH_HEADER
    },
    body: JSON.stringify(body)
  });
  return parseJsonResponse(response);
}

async function parseJsonResponse(response) {
  const payload = await response.json();
  assert.ok(response.ok, JSON.stringify(payload));
  return payload;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

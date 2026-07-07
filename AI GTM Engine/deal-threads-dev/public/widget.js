(function () {
  const script = document.currentScript;
  const widgetId = script?.dataset.widgetId || "wid_deal_threads_demo";
  const tenantId = script?.dataset.tenantId || "ten_deal_threads_demo";
  const betaClientId = script?.dataset.betaClientId || null;
  const pageUrl = script?.dataset.pageUrl || window.location.href;
  const apiBase = new URL(script?.src || window.location.href).origin;

  const state = {
    open: false,
    consentAccepted: false,
    config: null,
    sessionId: null,
    conversationId: null,
    completionStatus: "not_started",
    messages: []
  };

  const styles = `
    :host { all: initial; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .launcher {
      position: fixed;
      right: 22px;
      bottom: 22px;
      z-index: 2147483000;
      min-height: 48px;
      border: 0;
      border-radius: 999px;
      padding: 0 18px;
      background: #0f766e;
      color: white;
      font: 700 14px/1 system-ui;
      box-shadow: 0 14px 35px rgba(15, 118, 110, .32);
      cursor: pointer;
    }
    .panel {
      position: fixed;
      right: 22px;
      bottom: 82px;
      z-index: 2147483000;
      width: min(410px, calc(100vw - 32px));
      height: min(640px, calc(100vh - 110px));
      display: none;
      overflow: hidden;
      border: 1px solid #d9e2e8;
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 24px 80px rgba(16, 32, 51, .28);
    }
    .panel.open { display: grid; grid-template-rows: auto 1fr auto; }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      background: #102033;
      color: #ffffff;
    }
    .title { font: 800 14px/1.2 system-ui; }
    .status { color: #a9bbc5; font: 500 12px/1.2 system-ui; margin-top: 3px; }
    .close {
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 6px;
      color: #dbe8ee;
      background: rgba(255,255,255,.09);
      cursor: pointer;
      font-size: 20px;
    }
    .messages {
      overflow: auto;
      padding: 16px;
      background: #f6f9fb;
    }
    .msg {
      max-width: 86%;
      margin: 0 0 10px;
      padding: 10px 12px;
      border-radius: 8px;
      font: 14px/1.45 system-ui;
      color: #102033;
      white-space: pre-wrap;
    }
    .assistant { background: #ffffff; border: 1px solid #d9e2e8; }
    .visitor { margin-left: auto; background: #dcfce7; border: 1px solid #bbf7d0; }
    .quick {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin: 6px 0 12px;
    }
    .quick button {
      min-height: 32px;
      border: 1px solid #b7d8d3;
      border-radius: 6px;
      padding: 0 9px;
      color: #0f766e;
      background: #effaf8;
      font: 700 12px/1 system-ui;
      cursor: pointer;
    }
    .consent {
      border-top: 1px solid #d9e2e8;
      padding: 10px 12px;
      color: #526476;
      background: #ffffff;
      font: 12px/1.4 system-ui;
    }
    .consent label { display: flex; align-items: flex-start; gap: 8px; }
    .composer {
      display: grid;
      grid-template-columns: 1fr 42px;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid #d9e2e8;
      background: #ffffff;
    }
    textarea {
      width: 100%;
      min-height: 42px;
      max-height: 118px;
      resize: none;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px;
      color: #102033;
      font: 14px/1.35 system-ui;
    }
    textarea:focus { outline: 3px solid rgba(15, 118, 110, .16); border-color: #0f766e; }
    .send {
      width: 42px;
      height: 42px;
      border: 0;
      border-radius: 6px;
      background: #0f766e;
      color: white;
      cursor: pointer;
      font: 900 18px/1 system-ui;
    }
    .send:disabled, textarea:disabled { opacity: .58; cursor: not-allowed; }
    .fallback {
      grid-column: 1 / -1;
      border: 0;
      background: transparent;
      color: #64748b;
      text-align: left;
      font: 700 12px/1 system-ui;
      cursor: pointer;
      padding: 2px 0;
    }
	    .done {
	      grid-column: 1 / -1;
	      display: none;
	      align-items: center;
	      justify-content: flex-start;
	      gap: 10px;
	      border-top: 1px solid #d9e2e8;
	      padding: 12px;
	      background: #ecfdf5;
	      color: #166534;
	      font: 700 13px/1.4 system-ui;
	    }
    @media (max-width: 640px) {
      .panel {
        inset: 0;
        width: 100vw;
        height: 100dvh;
        border-radius: 0;
        border: 0;
      }
      .launcher {
        right: 16px;
        bottom: 16px;
      }
    }
  `;

  const rootHost = document.createElement("deal-threads-widget");
  const shadow = rootHost.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>${styles}</style>
    <button class="launcher" type="button">Talk to sales</button>
    <section class="panel" aria-live="polite">
      <header class="head">
        <div><div class="title">Deal Threads intake</div><div class="status">Builds the rep profile as you answer</div></div>
        <button class="close" type="button" aria-label="Close">x</button>
      </header>
      <div class="messages"></div>
      <div>
        <div class="consent">
          <label><input type="checkbox"> <span></span></label>
        </div>
        <form class="composer">
          <textarea placeholder="Type your answer..." rows="1"></textarea>
          <button class="send" type="submit" aria-label="Send">></button>
          <button class="fallback" type="button">Use a simple fallback form</button>
        </form>
	        <div class="done"><span>Profile created. The sales team will follow up with context.</span></div>
      </div>
    </section>
  `;
  document.documentElement.appendChild(rootHost);

  const els = {
    launcher: shadow.querySelector(".launcher"),
    panel: shadow.querySelector(".panel"),
    close: shadow.querySelector(".close"),
    messages: shadow.querySelector(".messages"),
    consentBox: shadow.querySelector(".consent input"),
    consentText: shadow.querySelector(".consent span"),
    form: shadow.querySelector(".composer"),
    textarea: shadow.querySelector("textarea"),
    send: shadow.querySelector(".send"),
	    fallback: shadow.querySelector(".fallback"),
	    done: shadow.querySelector(".done"),
	    doneText: shadow.querySelector(".done span")
  };

  els.launcher.addEventListener("click", openWidget);
  els.close.addEventListener("click", closeWidget);
  els.form.addEventListener("submit", onSubmit);
  els.fallback.addEventListener("click", useFallback);
  els.consentBox.addEventListener("change", () => {
    state.consentAccepted = els.consentBox.checked;
  });
  preloadConfig().catch(() => {});

  async function openWidget() {
    state.open = true;
    els.panel.classList.add("open");
    els.launcher.style.display = "none";
    if (!state.sessionId) await bootstrap();
  }

  function closeWidget() {
    state.open = false;
    els.panel.classList.remove("open");
    els.launcher.style.display = "block";
  }

  async function bootstrap() {
    setBusy(true);
    try {
      if (!state.config) await preloadConfig();
      const session = await request("/api/v1/widget-sessions", {
        method: "POST",
        body: {
          tenantId,
          widgetId,
          betaClientId,
          pageUrl,
          referrer: document.referrer,
          utm: readUtm()
        }
      });
      state.sessionId = session.sessionId;
      state.conversationId = session.conversationId;
      addMessage("assistant", session.welcomeMessage);
      renderQuickReplies(session.quickReplies || []);
    } catch (error) {
      addMessage("assistant", "Something got in the way of the chat. Use the fallback form and the team will still get the details.");
    } finally {
      setBusy(false);
    }
  }

  async function preloadConfig() {
    const params = new URLSearchParams();
    if (betaClientId) params.set("betaClientId", betaClientId);
    params.set("pageUrl", pageUrl);
    const query = params.toString() ? `?${params.toString()}` : "";
    const config = await request(`/api/v1/widgets/${widgetId}/config${query}`);
    state.config = config;
    applyConfig(config);
    els.consentText.textContent = config.consent.disclosure;
  }

  function applyConfig(config) {
    if (config.conversation?.launcherText) {
      els.launcher.textContent = config.conversation.launcherText;
    }

    if (config.theme?.primaryColor) {
      const color = config.theme.primaryColor;
      els.launcher.style.background = color;
      els.send.style.background = color;
      shadow.querySelectorAll(".quick button").forEach((button) => {
        button.style.color = color;
        button.style.borderColor = color;
      });
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    const value = els.textarea.value.trim();
    if (!value || !state.conversationId) return;
    if (!state.consentAccepted) {
      addMessage("assistant", "Please accept the short disclosure first so I can process and route the request.");
      return;
    }
    els.textarea.value = "";
    addMessage("visitor", value);
    await sendMessage(value);
  }

  async function sendMessage(message) {
    setBusy(true);
    clearQuickReplies();
    try {
      const result = await request(`/api/v1/conversations/${state.conversationId}/messages`, {
        method: "POST",
        body: {
          sessionId: state.sessionId,
          message,
          consentAccepted: state.consentAccepted
        }
      });
      addMessage("assistant", result.assistantMessage);
	      state.completionStatus = result.completionStatus;
	      if (result.completionStatus === "completed") {
	        showDone(result.leadProfileId);
	      } else {
        renderQuickReplies(result.quickReplies || []);
      }
    } catch (error) {
      addMessage("assistant", "I could not process that answer. You can try again or use the fallback form.");
    } finally {
      setBusy(false);
    }
  }

	  async function useFallback() {
    if (!state.consentAccepted) {
      addMessage("assistant", "Please accept the short disclosure first so I can process and route the request.");
      return;
    }
	    const message = window.prompt("Share name, work email, company, and what you are trying to solve.");
	    if (!message) return;
	    setBusy(true);
    try {
      const result = await request("/api/v1/fallback-submissions", {
        method: "POST",
        body: {
          message,
	          betaClientId,
	          pageUrl,
	          referrer: document.referrer,
          consentAccepted: state.consentAccepted
	        }
	      });
	      addMessage("assistant", "Fallback submitted. The team will get the profile.");
	      showDone(result.leadProfileId);
    } catch (error) {
      addMessage("assistant", "Fallback submission failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function renderQuickReplies(items) {
    clearQuickReplies();
    if (!items.length) return;
    const wrap = document.createElement("div");
    wrap.className = "quick";
    for (const item of items) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item;
      if (state.config?.theme?.primaryColor) {
        button.style.color = state.config.theme.primaryColor;
        button.style.borderColor = state.config.theme.primaryColor;
      }
      button.addEventListener("click", async () => {
        if (!state.consentAccepted) {
          addMessage("assistant", "Please accept the short disclosure first so I can process and route the request.");
          return;
        }
        addMessage("visitor", item);
        await sendMessage(item);
      });
      wrap.appendChild(button);
    }
    els.messages.appendChild(wrap);
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function clearQuickReplies() {
    shadow.querySelectorAll(".quick").forEach((node) => node.remove());
  }

  function addMessage(sender, body) {
    const node = document.createElement("div");
    node.className = `msg ${sender}`;
    node.textContent = body;
    els.messages.appendChild(node);
    els.messages.scrollTop = els.messages.scrollHeight;
  }

	  function showDone(leadProfileId) {
	    els.form.style.display = "none";
	    els.done.style.display = "flex";
	    els.done.dataset.leadProfileId = leadProfileId || "";
	    els.doneText.textContent = "Profile created. The sales team will follow up with context.";
	  }

  function setBusy(busy) {
    els.send.disabled = busy;
    els.textarea.disabled = busy;
  }

  function readUtm() {
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get("utm_source"),
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign")
    };
  }

  async function request(path, options = {}) {
    const response = await fetch(`${apiBase}${path}`, {
      method: options.method || "GET",
      headers: { "content-type": "application/json" },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "request_failed");
    return payload;
  }
})();

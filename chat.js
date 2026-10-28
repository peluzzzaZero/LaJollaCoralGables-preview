/* Copied from github.com/peluzzzaZero/lajollaAsistente web-widget/widget.js (branch feature/cloudflare-web-chat, a88d7c8).
 * Change it there first, then copy it here with a new cache key. The assistant runs on Cloudflare Workers. */
/* La Jolla assistant: website chat widget (vanilla JS, no dependencies).
 *
 *   <script src="https://<assistant-host>/widget.js" defer></script>
 *   window.LaJollaChat.open()   // the "Schedule a visit" seal opens it (owners' guide, section 3A)
 *   window.LaJollaChat.configure({ openBooking: function (url) {...}, privacyUrl: "/privacy.html" })
 *     // the site's own Bookings dialog for calendar links (otherwise they open in a new tab)
 *
 * Options (data- attributes on the script tag):
 *   data-api       assistant base URL (default: the script's own origin)
 *   data-launcher  "true" to show a small round launcher (default: none, the site opens it)
 *   data-lang      "en" | "es" (default: <html lang> or the site's language switch)
 *
 * Look and behaviour follow the owners' assistant guide (Epic Lux, 20 Oct 2026):
 * brand colours and Garamond, "Talk to a person" always visible, a short privacy
 * note, and the conversation continues if the visitor closes the chat and returns.
 */
(function () {
  "use strict";
  if (window.LaJollaChat) return;
  var script = document.currentScript;
  var api = script && script.hasAttribute("data-api") ? script.getAttribute("data-api") : script ? new URL(script.src).origin : "";
  var launcher = script && script.getAttribute("data-launcher") === "true";
  var lang = function () {
    var l = (script && script.getAttribute("data-lang")) || document.documentElement.lang || "en";
    return l.slice(0, 2) === "es" ? "es" : "en";
  };
  var T = {
    en: {
      subtitle: "The La Jolla team assistant", placeholder: "Write a message", send: "Send", close: "Close chat", open: "Chat with La Jolla",
      error: "Sorry, something went wrong. You can book on our calendar, call 786-290-8813 or write to info@lajollacoralgables.com.",
      calendar: "Open the booking calendar", direct: "Schedule directly", person: "Talk to a person", personMsg: "Talk to a person",
      restart: "Start over", typing: "La Jolla is writing", privacy: "We keep this conversation to help you.", privacyLink: "Privacy policy",
    },
    es: {
      subtitle: "Asistente del equipo de La Jolla", placeholder: "Escriba un mensaje", send: "Enviar", close: "Cerrar chat", open: "Chatear con La Jolla",
      error: "Perdone, algo falló. Puede reservar en nuestro calendario, llamar al 786-290-8813 o escribir a info@lajollacoralgables.com.",
      calendar: "Abrir el calendario de reservas", direct: "Agendar directo", person: "Hablar con una persona", personMsg: "Hablar con una persona",
      restart: "Empezar de nuevo", typing: "La Jolla está escribiendo", privacy: "Guardamos esta conversación para ayudarle.", privacyLink: "Política de privacidad",
    },
  };
  var BOOKING_URL = "https://bookings.cloud.microsoft/book/LajollaCoralGables@NETORGFT21116605.onmicrosoft.com/?ismsaljsauthenabled=true";
  var isBookingUrl = function (url) { return /^https:\/\/bookings\.cloud\.microsoft\//.test(url); };

  // The conversation survives closing the chat or the tab (guide 3A), in this browser only, for 30 days.
  var STORE = "lj-chat", KEEP_MS = 30 * 86400000, MAX_ITEMS = 60;
  function fresh() {
    return { id: (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/[^A-Za-z0-9_-]/g, ""), items: [], at: Date.now() };
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE) || "null");
      if (s && s.id && Date.now() - s.at < KEEP_MS) return s;
    } catch (e) {}
    return fresh();
  }

  var state = load();
  function save() {
    state.at = Date.now();
    state.items = state.items.slice(-MAX_ITEMS);
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }

  // Brand palette and type from the guide: sage #5E7060, cream #EFE8DA, brown #4D2509, sand #B38F71, Garamond.
  var css =
    ".ljc{--sage:#5e7060;--sage-dark:#4c5c4e;--cream:#efe8da;--brown:#4d2509;--sand:#b38f71;--paper:#f8f4ec;--line:#ddd2bf;" +
    "position:fixed;right:20px;bottom:20px;z-index:2147483000;font:17px/1.45 'Cormorant Garamond','EB Garamond',Garamond,Georgia,serif;color:var(--brown)}" +
    ".ljc *{box-sizing:border-box}" +
    ".ljc-panel{width:min(400px,calc(100vw - 40px));height:min(620px,calc(100dvh - 40px));background:var(--cream);border:1px solid var(--line);border-radius:18px;box-shadow:0 18px 50px rgba(77,37,9,.18);display:flex;flex-direction:column;overflow:hidden;animation:ljc-in .22s ease-out}" +
    "@keyframes ljc-in{from{transform:translateY(12px);opacity:.4}to{transform:none;opacity:1}}" +
    "@media (prefers-reduced-motion:reduce){.ljc-panel{animation:none}}" +
    ".ljc-panel[hidden]{display:none}" +
    ".ljc-head{background:var(--sage);color:#fff;padding:14px 12px 12px 18px;display:flex;align-items:center;gap:12px}" +
    ".ljc-name{font:400 30px/1 MonteCarlo,'Cormorant Garamond',Georgia,serif}" +
    ".ljc-head small{display:block;font:500 14px/1.3 'Cormorant Garamond',Georgia,serif;letter-spacing:.06em;opacity:.92;margin-top:5px}" +
    ".ljc-restart{margin-left:auto;background:none;border:1px solid rgba(255,255,255,.55);color:#fff;font:500 14px/1.2 'Cormorant Garamond',Georgia,serif;letter-spacing:.03em;cursor:pointer;padding:6px 12px;border-radius:999px;white-space:nowrap}" +
    ".ljc-restart:hover{background:rgba(255,255,255,.14)}" +
    ".ljc-x{background:none;border:0;color:#fff;font-size:26px;line-height:1;cursor:pointer;padding:6px 10px;border-radius:999px}" +
    ".ljc-x:hover{background:rgba(255,255,255,.14)}" +
    // Always one tap from the calendar and from a person (guide 3A and 4).
    ".ljc-bar{display:flex;border-bottom:1px solid var(--line);background:var(--paper)}" +
    ".ljc-bar>*{flex:1;min-width:0;text-align:center;display:flex;align-items:center;justify-content:center;gap:7px;padding:10px 8px;font:600 15px/1.2 'Cormorant Garamond',Georgia,serif;letter-spacing:.02em;background:none;border:0;cursor:pointer;text-decoration:none}" +
    ".ljc-bar>*+*{border-left:1px solid var(--line)}" +
    ".ljc .ljc-bar>*,.ljc .ljc-bar>*:visited{color:var(--sage-dark)}.ljc .ljc-bar>*:hover{background:#efe9dc;color:var(--brown)}" +
    ".ljc-bar svg{width:17px;height:17px;flex:none}" +
    ".ljc-log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}" +
    ".ljc-msg{max-width:86%;padding:9px 14px;border-radius:16px;white-space:pre-wrap;word-wrap:break-word}" +
    ".ljc-bot{background:#fffdf8;border:1px solid var(--line);align-self:flex-start;border-bottom-left-radius:5px}" +
    ".ljc-me{background:var(--sage);color:#fff;align-self:flex-end;border-bottom-right-radius:5px}" +
    ".ljc-chips{display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start;max-width:100%}" +
    ".ljc-tel{color:inherit;white-space:nowrap;text-decoration:underline;text-underline-offset:2px}" +
    ".ljc-chip,.ljc-link{font:600 15px/1.25 'Cormorant Garamond',Georgia,serif;border:1px solid var(--sage);background:#fffdf8;color:var(--sage-dark);border-radius:999px;padding:6px 14px;cursor:pointer;text-decoration:none;text-align:left}" +
    ".ljc .ljc-chip:hover{background:var(--sage);color:#fff}" +
    // Beat the host page's own link colours (e.g. a:hover).
    ".ljc a.ljc-link,.ljc a.ljc-link:hover,.ljc a.ljc-link:visited{background:var(--sage);color:#fff;text-decoration:none}.ljc a.ljc-link:hover{background:var(--sage-dark)}" +
    ".ljc-typing{align-self:flex-start;display:flex;gap:4px;padding:13px 15px;background:#fffdf8;border:1px solid var(--line);border-radius:16px;border-bottom-left-radius:5px}" +
    ".ljc-typing i{width:6px;height:6px;border-radius:50%;background:var(--sand);opacity:.4;animation:ljc-dot 1s infinite}" +
    ".ljc-typing i:nth-child(2){animation-delay:.15s}.ljc-typing i:nth-child(3){animation-delay:.3s}" +
    "@keyframes ljc-dot{50%{opacity:1}}" +
    ".ljc-foot{border-top:1px solid var(--line);background:var(--paper);padding:10px 12px 8px}" +
    ".ljc-form{display:flex;gap:8px}" +
    ".ljc-in{flex:1;font:16px/1.3 Manrope,'Helvetica Neue',Arial,sans-serif;border:1px solid var(--line);border-radius:999px;padding:10px 15px;min-width:0;background:#fffdf8;color:var(--brown)}" +
    ".ljc .ljc-in:focus,.ljc .ljc-in:focus-visible{outline:none;border-color:var(--sage);box-shadow:0 0 0 3px rgba(94,112,96,.22)}" +
    ".ljc-send{font:600 16px 'Cormorant Garamond',Georgia,serif;letter-spacing:.03em;background:var(--sage);color:#fff;border:0;border-radius:999px;padding:9px 18px;cursor:pointer}" +
    ".ljc-send:hover{background:var(--sage-dark)}" +
    ".ljc-privacy{margin:7px 4px 0;font:12.5px/1.35 Manrope,Arial,sans-serif;color:#7a6550}" +
    ".ljc .ljc-privacy a{color:#7a6550;text-decoration:underline;text-underline-offset:2px}" +
    ".ljc-launch[hidden]{display:none}.ljc-launch{width:56px;height:56px;border-radius:50%;background:var(--sage);color:#fff;border:0;cursor:pointer;box-shadow:0 6px 20px rgba(77,37,9,.22);font-size:24px}" +
    ".ljc :focus-visible{outline:2px solid var(--brown);outline-offset:2px}" +
    // Phones: a full-screen sheet, so the keyboard never hides the conversation.
    "@media (max-width:600px){.ljc{right:0;bottom:0;left:0}.ljc-panel{width:100%;height:100dvh;border-radius:0;border:0}.ljc-bar>*{font-size:14px}}";

  var ICON_CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
  var ICON_PERSON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.3-3.6 4.1-5.4 7.5-5.4s6.2 1.8 7.5 5.4"/></svg>';

  var root, panel, log, input, launchBtn, typing, returnFocus, labels = {}, busy = false;
  var options = { openBooking: null, privacyUrl: "/privacy.html" };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function withIcon(node, icon, key, text) {
    node.innerHTML = icon;
    node.appendChild((labels[key] = el("span", null, text)));
    return node;
  }

  function build() {
    var t = T[lang()];
    var style = el("style");
    style.textContent = css;
    document.head.appendChild(style);
    root = el("div", "ljc");
    panel = el("div", "ljc-panel");
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", t.open);

    var head = el("div", "ljc-head");
    var h = el("div");
    h.appendChild(el("span", "ljc-name", "La Jolla"));
    h.appendChild((labels.subtitle = el("small", null, t.subtitle)));
    var x = (labels.close = el("button", "ljc-x", "×"));
    x.type = "button";
    x.setAttribute("aria-label", t.close);
    x.onclick = close;
    // Dan: a visible way to start the conversation again from the welcome.
    var again = (labels.restart = el("button", "ljc-restart", t.restart));
    again.type = "button";
    again.onclick = restart;
    head.appendChild(h);
    head.appendChild(again);
    head.appendChild(x);

    var bar = el("div", "ljc-bar");
    bar.appendChild(withIcon(linkChip("", BOOKING_URL), ICON_CAL, "direct", t.direct));
    var person = withIcon(el("button"), ICON_PERSON, "person", t.person);
    person.type = "button";
    person.onclick = function () { say(T[lang()].personMsg); };
    bar.appendChild(person);
    bar.firstChild.className = "";

    log = el("div", "ljc-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");

    var foot = el("div", "ljc-foot");
    var form = el("form", "ljc-form");
    input = el("input", "ljc-in");
    input.placeholder = t.placeholder;
    input.maxLength = 1000;
    input.setAttribute("aria-label", t.placeholder);
    input.setAttribute("autocomplete", "off");
    var send = (labels.send = el("button", "ljc-send", t.send));
    send.type = "submit";
    form.appendChild(input);
    form.appendChild(send);
    form.onsubmit = function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (v && !busy) { input.value = ""; say(v); }
    };
    var privacy = el("p", "ljc-privacy");
    privacy.appendChild((labels.privacy = el("span", null, t.privacy + " ")));
    var pl = (labels.privacyLink = el("a", null, t.privacyLink));
    pl.href = options.privacyUrl;
    pl.target = "_blank";
    pl.rel = "noopener";
    privacy.appendChild(pl);
    foot.appendChild(form);
    foot.appendChild(privacy);

    panel.appendChild(head);
    panel.appendChild(bar);
    panel.appendChild(log);
    panel.appendChild(foot);
    root.appendChild(panel);
    if (launcher) {
      // A drawn icon, not the envelope character: iOS renders that as an emoji tile.
      var b = (launchBtn = el("button", "ljc-launch"));
      b.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 5.5h16v10H9l-5 4z"/></svg>';
      b.type = "button";
      b.setAttribute("aria-label", t.open);
      b.onclick = function () { panel.hidden ? open() : close(); };
      root.appendChild(b);
    }
    document.body.appendChild(root);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });

    // A returning visitor sees the conversation where they left it; only the latest buttons stay tappable.
    var lastBot = -1;
    state.items.forEach(function (it, i) { if (it.who === "bot") lastBot = i; });
    state.items.forEach(function (it, i) {
      if (it.who === "me") addMsg(it.text, "me");
      else render(it.reply, i === lastBot);
    });
  }

  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function addMsg(text, who) {
    var msg = el("div", "ljc-msg " + (who === "me" ? "ljc-me" : "ljc-bot"));
    // The venue's phone number is a tap-to-call link that never breaks across lines.
    String(text).split(/(\b\d{3}-\d{3}-\d{4}\b)/).forEach(function (part, i) {
      if (i % 2 && who !== "me") {
        var a = el("a", "ljc-tel", part);
        a.href = "tel:+1" + part.replace(/-/g, "");
        msg.appendChild(a);
      } else msg.appendChild(document.createTextNode(part));
    });
    log.appendChild(msg);
    scrollDown();
  }

  function linkChip(label, url) {
    var a = el("a", "ljc-link", label);
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    // Calendar links open the site's own Bookings window when it offers one.
    if (isBookingUrl(url)) a.onclick = function (e) {
      if (!options.openBooking || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
      e.preventDefault();
      close(true);
      options.openBooking(url);
    };
    return a;
  }

  function render(reply, withButtons) {
    addMsg(reply.text, "bot");
    var quick = withButtons === false ? [] : reply.quickReplies || [];
    if (quick.length || reply.link) {
      var chips = el("div", "ljc-chips");
      quick.forEach(function (q) {
        var c = el("button", "ljc-chip", q.label);
        c.type = "button";
        c.onclick = function () { say(q.value, q.label); };
        chips.appendChild(c);
      });
      if (reply.link) chips.appendChild(linkChip(reply.link.label, reply.link.url));
      log.appendChild(chips);
      scrollDown();
    }
  }

  function setTyping(on) {
    if (on) {
      typing = el("div", "ljc-typing");
      typing.setAttribute("aria-label", T[lang()].typing);
      typing.appendChild(el("i")); typing.appendChild(el("i")); typing.appendChild(el("i"));
      log.appendChild(typing);
      scrollDown();
    } else if (typing) { typing.remove(); typing = null; }
  }

  function say(value, label, silent) {
    if (busy) return;
    busy = true;
    // Old quick replies belong to earlier questions: only the latest ones stay tappable.
    Array.prototype.forEach.call(log.querySelectorAll(".ljc-chip"), function (c) { c.remove(); });
    Array.prototype.forEach.call(log.querySelectorAll(".ljc-chips:empty"), function (c) { c.remove(); });
    if (!silent) {
      addMsg(label || value, "me");
      state.items.push({ who: "me", text: label || value });
      save();
    }
    setTyping(true);
    fetch(api + "/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId: state.id, message: value, lang: lang() }),
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        setTyping(false);
        (data.replies || []).forEach(function (reply) {
          render(reply);
          state.items.push({ who: "bot", reply: reply });
        });
        save();
      })
      .catch(function () {
        setTyping(false);
        var t = T[lang()];
        render({ text: t.error, link: { label: t.calendar, url: BOOKING_URL } });
      })
      .then(function () { busy = false; });
  }

  /** The site can switch language after load: refresh the fixed labels on every open. */
  function relabel() {
    var t = T[lang()];
    ["subtitle", "send", "direct", "person", "privacyLink", "restart"].forEach(function (k) { labels[k].textContent = t[k]; });
    labels.privacy.textContent = t.privacy + " ";
    labels.close.setAttribute("aria-label", t.close);
    input.placeholder = t.placeholder;
    input.setAttribute("aria-label", t.placeholder);
    panel.setAttribute("aria-label", t.open);
  }

  function open() {
    if (!root) build();
    returnFocus = document.activeElement;
    relabel();
    panel.hidden = false;
    if (launchBtn) launchBtn.hidden = true;
    // The visitor's first view is the assistant's welcome, not a message they did not write.
    if (!state.items.length && !busy) say(lang() === "es" ? "Hola" : "Hello", null, true);
    scrollDown();
    input.focus({ preventScroll: true });
  }

  function close(keepFocus) {
    if (panel) panel.hidden = true;
    if (launchBtn) launchBtn.hidden = false;
    if (keepFocus !== true && returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
  }

  /** A new conversation: new id (the old one is deleted after 30 idle days), empty log, the welcome again. */
  function restart() {
    if (busy) return;
    state = fresh();
    save();
    log.textContent = "";
    say(lang() === "es" ? "Hola" : "Hello", null, true);
    input.focus({ preventScroll: true });
  }

  function configure(o) {
    for (var k in o) if (Object.prototype.hasOwnProperty.call(options, k)) options[k] = o[k];
    if (labels.privacyLink) labels.privacyLink.href = options.privacyUrl;
  }

  window.LaJollaChat = { open: open, close: close, configure: configure, isOpen: function () { return !!panel && !panel.hidden; } };
  if (launcher) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
    else build();
  }
})();

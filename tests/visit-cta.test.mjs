import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

test("the landing has exactly one Schedule a visit button", () => {
  const openers = html.match(/<a [^>]*data-booking-opener[^>]*>.*?<\/a>/g) || [];
  const visits = openers.filter((a) => /data-i18n="form\.planning"/.test(a));
  assert.equal(visits.length, 1, visits.join("\n"));
  assert.match(visits[0], /id="visit-cta"/);
  assert.match(visits[0], /href="https:\/\/bookings\.cloud\.microsoft\/book\/[^"]+" data-booking-opener/);
  for (const gone of ["occasion-visit", "section-action", "tour-cta", "venue-inquiry", 'class="inquire-link"']) {
    assert.equal(html.includes(gone), false, gone);
  }
});

test("it rests as a button in the arrival and Let's begin and as a small monogram seal while reading", () => {
  const slots = [...html.matchAll(/<span class="btn visit-cta-shape visit-cta-slot" data-cta-slot="(\w+)" aria-hidden="true"><span data-i18n="form\.planning">Schedule a visit<\/span><\/span>/g)].map((m) => m[1]);
  assert.deepEqual(slots, ["start", "end"]);
  assert.match(html, /<span class="visit-cta-seal-shape visit-cta-slot" data-cta-slot="float" aria-hidden="true"><\/span>/);
  // The seal is the site's own LJ monogram ringed by the bilingual booking line; the label stays the accessible name.
  assert.match(html, /<a [^>]*id="visit-cta"[^>]*><span class="visit-cta-label" data-i18n="form\.planning">Schedule a visit<\/span><span class="visit-cta-seal" aria-hidden="true">.*?data-i18n="cta\.seal".*?<img src="assets\/brand\/logo-lj-oval-sage\.png" alt=""/);
  assert.equal(js.split('"cta.seal":').length - 1, 2);
  // The ring is the only visible text while floating, so it must contain the accessible name (WCAG 2.5.3).
  const seals = [...js.matchAll(/"cta\.seal": "([^"]+)"/g)].map((m) => m[1]);
  const names = [...js.matchAll(/"form\.planning": "([^"]+)"/g)].map((m) => m[1]);
  assert.equal(seals.length, 2);
  seals.forEach((seal, i) => assert.ok(seal.startsWith(names[i]), seal));
  assert.match(css, /\.visit-cta-seal-shape \{[^}]*width: 64px; height: 64px;/);
  const hero = html.slice(html.indexOf('id="hero"'), html.indexOf('id="history"'));
  const planning = html.slice(html.indexOf('id="planning"'), html.indexOf('id="footer"'));
  assert.match(hero, /data-cta-slot="start"/);
  assert.match(planning, /data-cta-slot="end"/);
});

test("the button is touch-sized, respects reduced motion and never sits over the booking dialog", () => {
  assert.match(css, /\.landing-page \.btn\.visit-cta-shape \{[^}]*min-height: 48px/);
  assert.match(css, /visit-cta-label \{ position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect\(0 0 0 0\)/);
  assert.match(css, /\.visit-cta-slot \{ visibility: hidden; pointer-events: none; \}/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{ \.landing-page \.btn\.visit-cta, \.visit-cta-seal svg \{ transition: none; \}/);
  assert.match(css, /body\.booking-open \.visit-cta \{ visibility: hidden; \}/);
  assert.match(js, /function initVisitCta\(\)/);
  assert.match(js, /if \(reduced\.matches\) \{ out = Math\.round\(out\); home = home < 1 \? 0 : 1; \}/);
});

test("the floating seal beats softly 3s in every 12s while floating and never under reduced motion", () => {
  const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
  assert.match(css, /\.visit-cta\.is-float \.visit-cta-seal \{ animation: visit-cta-beat 12s [^;]* infinite; \}/);
  assert.match(css, /@keyframes visit-cta-beat \{[^\n]*scale\(1\.07\)/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{[^\n]*\.visit-cta\.is-float \.visit-cta-seal, \.landing-page \.btn\.visit-cta\.is-float \{ animation: none !important; \}/);
});

test("the visit invitation is a centred closing line, not an empty band with a light", () => {
  assert.match(html, /<div class="visit-invitation"><p data-i18n="landing\.visitReason">Experience La Jolla in person and discover the possibilities for your next extraordinary occasion\.<\/p><\/div>/);
  assert.match(css, /\.visit-invitation \{[^}]*text-align: center;/);
  assert.doesNotMatch(css, /\.visit-invitation \{[^}]*background/);
  assert.doesNotMatch(css, /\.landing-effects \.visit-invitation/);
  assert.doesNotMatch(js, /querySelectorAll\('[^']*\.visit-invitation/);
  // The pull-up into the pinned walk's empty room must not apply when the walk is collapsed over its caption.
  assert.match(css, /@media \(max-width: 650px\) \{ \.venue-walk\.is-walking \+ \.visit-invitation \{ margin-top: -88px; \} \}/);
});

test("the seal opens the chat assistant, whose calendar button reuses the same-page booking window", () => {
  // Owners' assistant guide, section 3A: the seal opens the chat; "Schedule directly" stays one tap away.
  assert.match(html, /<script src="chat\.js\?v=[\d.]+" data-api="https:\/\/lajolla-assistant\.lajolla-assistant\.workers\.dev" defer><\/script>/);
  assert.match(js, /if \(link\.id === "visit-cta" && window\.LaJollaChat\) \{\s*window\.LaJollaChat\.configure\(\{ privacyUrl: "privacy\.html", openBooking: function \(url\) \{ openCalendar\(link, url\); \} \}\);\s*(?:\/\/[^\n]*\s*)?const from = section\(\);\s*window\.LaJollaChat\.open\(from \? \{ section: from \} : undefined\);\s*return;\s*\}\s*openCalendar\(link, link\.href\);/);
  // v1.35 (guide 3A): the part of the page in view chooses the chat's first question.
  assert.match(js, /r\.top <= innerHeight \/ 2 && r\.bottom > innerHeight \/ 2;\s*\};\s*return holds\("alcazar"\) \? "lexington" : holds\("events"\) \? "events" : "";/);
  // On phones the floating seal shrinks while scrolling down, never hidden: 48px stays a full tap target.
  assert.match(css, /\.landing-page \.btn\.visit-cta\.is-float\.is-compact \{ scale: \.75; \}/);
  // The shrink eases only without reduced motion; only the fully formed seal shrinks, and a wobble does not flip it.
  assert.match(css, /@media \(max-width: 900px\) and \(prefers-reduced-motion: no-preference\) \{\s*\.landing-page \.btn\.visit-cta\.is-float \{ transition:[^}]*scale \.3s/);
  assert.doesNotMatch(css.replace(/@media \(max-width: 900px\) and \(prefers-reduced-motion: no-preference\) \{[^]*?\n\}/, ""), /scale \.3s/);
  assert.match(js, /formed = m > \.98;\s*if \(!formed\) cta\.classList\.remove\("is-compact"\);/);
  assert.match(js, /down = y > lastY \+ 24, up = y < lastY - 24;/);
  // Without the assistant, the seal is still the calendar link (fallback and no-JS).
  assert.match(js, /function openCalendar\(link, url\) \{[^]*?if \(!frame\.hasAttribute\("src"\)\) frame\.src = url;/);
  const chat = readFileSync(new URL("../chat.js", import.meta.url), "utf8");
  assert.match(chat, /Copied from github\.com\/peluzzzaZero\/lajollaAsistente web-widget\/widget\.js \(commit c375de2\)/);
  // Byte-for-byte the upstream file at that commit (after the two-line header): edits belong upstream.
  const body = chat.split("\n").slice(2).join("\n");
  assert.equal(createHash("sha256").update(body).digest("hex"), "4935a557082b6ba478fddc086cde7ac6b3db8476b0cc1a80b91a4a8a6aacb8e1");
  assert.match(chat, /direct: "Schedule directly"/);
  assert.match(chat, /direct: "Agendar directo"/);
  assert.doesNotMatch(chat, /ballroom|facebook/i);
  // Visitors are told, inside the chat, that an AI writes the replies (EN and ES).
  assert.match(chat, /subtitle: "AI assistant of the La Jolla team"/);
  assert.match(chat, /subtitle: "Asistente con IA del equipo de La Jolla"/);
  assert.match(chat, /privacy: "Replies are written by AI\./);
  assert.match(chat, /privacy: "Las respuestas las escribe una IA\./);
  // Turnstile is loaded only when the assistant answers "verification_required", from Cloudflare's own address.
  assert.match(chat, /d\.error !== "verification_required"/);
  assert.match(chat, /"https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?render=explicit"/);
  // A check that cannot run sends the message again as "unavailable" (answered without AI); one that stalls ends with the calendar help.
  assert.match(chat, /ok\("unavailable"\)/);
  // Invisible unless a tap is needed.
  assert.match(chat, /appearance: "interaction-only"/);
  for (const callback of ["before-interactive-callback", "timeout-callback", "unsupported-callback", "error-callback", "expired-callback"]) assert.ok(chat.includes(`"${callback}"`), callback);
  // The public copy carries no internal notes.
  assert.doesNotMatch(chat, /Epic Lux|\/\/ Dan:/);
});

test("the privacy page explains the chat assistant in both languages", () => {
  const privacy = readFileSync(new URL("../privacy.html", import.meta.url), "utf8");
  assert.match(privacy, /<h2>Chat assistant<\/h2>\s*<p>On the home page, Schedule a visit opens[^<]*replies are written by AI/);
  assert.match(privacy, /<h2>Asistente de chat<\/h2>\s*<p>En la página de inicio, Agende una visita abre[^<]*respuestas las escribe una IA/);
  assert.match(privacy, /<h2>Chat assistant<\/h2>\s*<p>[^<]*third-party technology and cloud service providers[^<]*30 days without activity[^<]*does not sell chat information or use it for advertising[^<]*answers and estimates are informational/);
  assert.match(privacy, /<h2>Asistente de chat<\/h2>\s*<p>[^<]*proveedores externos de tecnología y servicios en la nube[^<]*30 días sin actividad[^<]*no vende la información del chat ni la usa para publicidad[^<]*respuestas y estimados son informativos/);
  // The person check that chat.js loads when the assistant asks for it, described without naming the service.
  assert.match(privacy, /<h2>Chat assistant<\/h2>\s*<p>[^<]*automated security check may run once per conversation to confirm that the chat is used by a person/);
  assert.match(privacy, /<h2>Asistente de chat<\/h2>\s*<p>[^<]*comprobación de seguridad automática una vez por conversación para confirmar que el chat lo usa una persona/);
});

test("the legal pages do not name the chat's technology providers", () => {
  for (const name of ["privacy.html", "terms.html"]) {
    const page = readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
    assert.doesNotMatch(page, /nvidia|cloudflare|workers ai|turnstile|microsoft 365|gemma|minimax|openai|anthropic|groq/i, name);
  }
  const terms = readFileSync(new URL("../terms.html", import.meta.url), "utf8");
  assert.match(terms, /<h2>Chat assistant<\/h2>\s*<p>[^<]*may be incomplete or wrong[^<]*not reserve a date for an event/);
  assert.match(terms, /<h2>Asistente de chat<\/h2>\s*<p>[^<]*pueden ser incompletas o incorrectas[^<]*no reserva una fecha para un evento/);
});

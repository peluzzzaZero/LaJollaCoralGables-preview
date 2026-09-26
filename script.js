/* La Jolla Coral Gables — P0 UI script
   Local form only — no network, Stripe, or email. */

(function () {
  "use strict";

  const I18N = {
    en: {
      "nav.inquire": "Inquire",
      "hero.est": "Coral Gables · Est. 1928",
      "hero.title": "A jewel in Coral Gables",
      "hero.cta": "Request a private quote",
      "hero.whisper": "Venue film forthcoming",
      "history.eyebrow": "Our History",
      "history.title": "La Jolla, a jewel in Coral Gables",
      "history.lede":
        "Since 1928, La Jolla has welcomed celebrations beneath Mediterranean arches and garden light. A setting shaped by Coral Gables heritage — intimate, timeless, and quietly grand.",
      "history.managed": "Managed by Epic Lux Management",
      "quote.text": "“Where every gathering becomes a memory worth keeping.”",
      "events.eyebrow": "Events we host",
      "events.title": "Celebrations of every kind",
      "events.weddings.title": "Weddings",
      "events.weddings.body":
        "Ceremonies and receptions framed by historic architecture and garden calm — from intimate vows to full celebrations.",
      "events.celebrations.title": "Celebrations",
      "events.celebrations.body":
        "Anniversaries, milestones, and gatherings that deserve a room with character and care.",
      "events.corporate.title": "Corporate",
      "events.corporate.body":
        "Board dinners, brand dinners, and professional occasions in a setting that feels considered, not corporate.",
      "events.social.title": "Social",
      "events.social.body":
        "Private dinners, showers, and evenings among friends — hosted with the ease of a well-kept home.",
      "events.alcazar.title": "The Alcazar Room",
      "events.alcazar.body":
        "A curated private space with 1928 vintage character — for occasions that ask for something more intimate.",
      "events.alcazar.link": "Discover The Alcazar Room",
      "alcazar.eyebrow": "Curated · Vintage 1928",
      "alcazar.title": "The Alcazar Room",
      "alcazar.body":
        "A private chamber within La Jolla — soft light, period detail, and the quiet grandeur of Coral Gables’ historic decade. Reserved for gatherings that prefer intimacy over spectacle.",
      "alcazar.cta": "Inquire about The Alcazar Room",
      "rentals.eyebrow": "Rentals & Services",
      "rentals.title": "For La Jolla — or anywhere you gather",
      "rentals.intro":
        "Furniture, décor, glassware, and production services available for events at La Jolla or at a location of your choosing. Inquire to reserve — no public prices.",
      "rentals.furniture": "Furniture",
      "rentals.decor": "Decor",
      "rentals.glassware": "Glassware",
      "rentals.photography": "Photography",
      "rentals.video": "Video",
      "rentals.dj": "DJ",
      "rentals.lighting": "Lighting",
      "rentals.other": "More services",
      "rentals.inquire": "Inquire",
      "testimonial.eyebrow": "Guest voice",
      "testimonial.title": "Testimonial",
      "testimonial.quote": "A guest reflection will appear here.",
      "testimonial.cite": "— Name & celebration forthcoming",
      "gallery.eyebrow": "Gallery",
      "gallery.title": "Spaces & moments",
      "gallery.spacesNote": "Space names to follow — a flexible gallery for rooms yet to be named.",
      "gallery.cap1": "301 Alcazar Avenue",
      "gallery.cap2": "Balcony mark",
      "gallery.cap3": "Brand mood",
      "gallery.cap4": "Wax seal",
      "gallery.cap5": "Plaque",
      "gallery.space1": "Awaiting photography · name TBD",
      "gallery.space2": "Awaiting photography · name TBD",
      "team.eyebrow": "Our Team",
      "team.title": "Here for your celebration",
      "team.julie.role": "Events",
      "team.julie.bio": "Biography forthcoming",
      "team.pat.role": "Events",
      "team.pat.bio": "Biography forthcoming",
      "quote.eyebrow": "Private quote",
      "quote.title": "Request a private quote",
      "quote.intro":
        "Share a few details. We respond personally — no prices are shown on this site.",
      "quote.notice": "Local preview only — nothing is sent yet.",
      "form.name": "Name",
      "form.email": "Email",
      "form.phone": "Phone",
      "form.date": "Event date",
      "form.guests": "Guest count",
      "form.type": "Event type",
      "form.typePlaceholder": "Select…",
      "form.typeWedding": "Wedding",
      "form.typeCelebration": "Celebration",
      "form.typeCorporate": "Corporate",
      "form.typeSocial": "Social",
      "form.typeAlcazar": "The Alcazar Room",
      "form.typeRental": "Rentals / services only",
      "form.typeOther": "Other",
      "form.interest": "Rental / service interest",
      "form.optional": "(optional)",
      "form.interestPh": "e.g. Furniture, Lighting",
      "form.comments": "Comments",
      "form.submit": "Submit inquiry",
      "form.success":
        "Thank you — your inquiry was recorded locally for this preview. Nothing was sent. When live, you will receive a confirmation email.",
      "form.error": "Please complete the required fields.",
      "pending.mood": "Brand mood · venue photography forthcoming",
      "pending.alcazar": "Awaiting interior photography",
      "pending.catalog": "Awaiting photography",
      "pending.catalogNote": "Catalog photography forthcoming · inquire for the full collection",
      "pending.photo": "Portrait forthcoming",
      "footer.tag": "Coral Gables · Est. 1928",
      "footer.managed": "Managed by Epic Lux Management",
      "footer.contact": "Contact",
      "footer.address": "301 Alcazar Avenue, Coral Gables",
      "footer.maps": "Find us",
      "footer.mapsSoon": "Map & reviews coming soon",
      "footer.connect": "Connect",
      "footer.igSoon": "Instagram — coming soon",
      "footer.ttSoon": "TikTok — coming soon",
      "footer.fbSoon": "Facebook — coming soon",
      "footer.vendor": "Become a Vendor",
      "footer.terms": "Terms",
      "footer.privacy": "Privacy",
      "footer.rights": "All rights reserved.",
    },
    es: {
      "nav.inquire": "Consultar",
      "hero.est": "Coral Gables · Est. 1928",
      "hero.title": "Una joya en Coral Gables",
      "hero.cta": "Solicitar cotización privada",
      "hero.whisper": "Film del lugar próximamente",
      "history.eyebrow": "Nuestra historia",
      "history.title": "La Jolla, una joya en Coral Gables",
      "history.lede":
        "Desde 1928, La Jolla ha acogido celebraciones bajo arcos mediterráneos y luz de jardín. Un entorno forjado por la herencia de Coral Gables — íntimo, atemporal y discretamente grandioso.",
      "history.managed": "Gestionado por Epic Lux Management",
      "quote.text": "“Donde cada encuentro se convierte en un recuerdo para guardar.”",
      "events.eyebrow": "Eventos que recibimos",
      "events.title": "Celebraciones de todo tipo",
      "events.weddings.title": "Bodas",
      "events.weddings.body":
        "Ceremonias y recepciones enmarcadas por arquitectura histórica y la calma del jardín — desde votos íntimos hasta grandes celebraciones.",
      "events.celebrations.title": "Celebraciones",
      "events.celebrations.body":
        "Aniversarios, hitos y encuentros que merecen un salón con carácter y cuidado.",
      "events.corporate.title": "Corporativo",
      "events.corporate.body":
        "Cenas de junta, cenas de marca y ocasiones profesionales en un entorno pensado, no corporativo.",
      "events.social.title": "Social",
      "events.social.body":
        "Cenas privadas, baby showers y noches entre amigos — con la naturalidad de un hogar bien cuidado.",
      "events.alcazar.title": "The Alcazar Room",
      "events.alcazar.body":
        "Un espacio privado curado con carácter vintage de 1928 — para ocasiones que piden algo más íntimo.",
      "events.alcazar.link": "Descubrir The Alcazar Room",
      "alcazar.eyebrow": "Curado · Vintage 1928",
      "alcazar.title": "The Alcazar Room",
      "alcazar.body":
        "Una cámara privada dentro de La Jolla — luz suave, detalle de época y la quieta grandeza de la década histórica de Coral Gables. Reservada para encuentros que prefieren intimidad a espectáculo.",
      "alcazar.cta": "Consultar por The Alcazar Room",
      "rentals.eyebrow": "Renta y servicios",
      "rentals.title": "Para La Jolla — o donde usted celebre",
      "rentals.intro":
        "Mobiliario, decoración, cristalería y servicios de producción disponibles para eventos en La Jolla o en el lugar que usted elija. Consulte para reservar — sin precios públicos.",
      "rentals.furniture": "Mobiliario",
      "rentals.decor": "Decoración",
      "rentals.glassware": "Cristalería",
      "rentals.photography": "Fotografía",
      "rentals.video": "Video",
      "rentals.dj": "DJ",
      "rentals.lighting": "Iluminación",
      "rentals.other": "Más servicios",
      "rentals.inquire": "Consultar",
      "testimonial.eyebrow": "Voz de un invitado",
      "testimonial.title": "Testimonio",
      "testimonial.quote": "Aquí aparecerá la reflexión de un invitado.",
      "testimonial.cite": "— Nombre y celebración próximamente",
      "gallery.eyebrow": "Galería",
      "gallery.title": "Espacios y momentos",
      "gallery.spacesNote": "Nombres de espacios por confirmar — galería flexible para salas aún por nombrar.",
      "gallery.cap1": "301 Alcazar Avenue",
      "gallery.cap2": "Marca del balcón",
      "gallery.cap3": "Ambiente de marca",
      "gallery.cap4": "Sello de cera",
      "gallery.cap5": "Placa",
      "gallery.space1": "Fotografía pendiente · nombre por confirmar",
      "gallery.space2": "Fotografía pendiente · nombre por confirmar",
      "team.eyebrow": "Nuestro equipo",
      "team.title": "Aquí para su celebración",
      "team.julie.role": "Eventos",
      "team.julie.bio": "Biografía próximamente",
      "team.pat.role": "Eventos",
      "team.pat.bio": "Biografía próximamente",
      "quote.eyebrow": "Cotización privada",
      "quote.title": "Solicitar cotización privada",
      "quote.intro":
        "Comparta algunos datos. Respondemos de forma personal — no se muestran precios en este sitio.",
      "quote.notice": "Vista previa local — aún no se envía nada.",
      "form.name": "Nombre",
      "form.email": "Correo",
      "form.phone": "Teléfono",
      "form.date": "Fecha del evento",
      "form.guests": "Cantidad de invitados",
      "form.type": "Tipo de evento",
      "form.typePlaceholder": "Seleccionar…",
      "form.typeWedding": "Boda",
      "form.typeCelebration": "Celebración",
      "form.typeCorporate": "Corporativo",
      "form.typeSocial": "Social",
      "form.typeAlcazar": "The Alcazar Room",
      "form.typeRental": "Solo renta / servicios",
      "form.typeOther": "Otro",
      "form.interest": "Interés en renta / servicio",
      "form.optional": "(opcional)",
      "form.interestPh": "p. ej. Mobiliario, Iluminación",
      "form.comments": "Comentarios",
      "form.submit": "Enviar solicitud",
      "form.success":
        "Gracias — su solicitud se registró localmente para esta vista previa. No se envió nada. Cuando esté en vivo, recibirá un correo de confirmación.",
      "form.error": "Complete los campos obligatorios.",
      "pending.mood": "Ambiente de marca · fotografía del lugar próximamente",
      "pending.alcazar": "Fotografía del interior pendiente",
      "pending.catalog": "Fotografía pendiente",
      "pending.catalogNote": "Fotografía del catálogo próximamente · consulte por la colección completa",
      "pending.photo": "Retrato próximamente",
      "footer.tag": "Coral Gables · Est. 1928",
      "footer.managed": "Gestionado por Epic Lux Management",
      "footer.contact": "Contacto",
      "footer.address": "301 Alcazar Avenue, Coral Gables",
      "footer.maps": "Cómo llegar",
      "footer.mapsSoon": "Mapa y reseñas próximamente",
      "footer.connect": "Conectar",
      "footer.igSoon": "Instagram — próximamente",
      "footer.ttSoon": "TikTok — próximamente",
      "footer.fbSoon": "Facebook — próximamente",
      "footer.vendor": "Convertirse en proveedor",
      "footer.terms": "Términos",
      "footer.privacy": "Privacidad",
      "footer.rights": "Todos los derechos reservados.",
    },
  };

  let lang = "en";

  function applyI18n(next) {
    lang = next;
    const dict = I18N[lang] || I18N.en;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      if (!key || dict[key] == null) return;
      const attr = el.getAttribute("data-i18n-attr");
      if (attr) {
        el.setAttribute(attr, dict[key]);
      } else {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      const on = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function initLang() {
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyI18n(btn.getAttribute("data-lang") || "en");
      });
    });
  }

  function initHeader() {
    const header = document.getElementById("header");
    if (!header) return;
    let ticking = false;
    const onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) {
        n.classList.add("is-visible");
      });
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  function scrollToQuote() {
    const quote = document.getElementById("quote");
    if (!quote) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    quote.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  function initHeroVideo() {
    const media = document.querySelector(".hero-media");
    const video = document.querySelector(".hero-video");
    if (!media || !video) return;
    const source = video.getAttribute("src") || video.querySelector("source[src]");
    if (!source) return;

    media.classList.add("has-video");
    video.addEventListener("canplay", function () {
      media.classList.add("is-video-ready");
      video.play().catch(function () {
        /* Autoplay may be unavailable; the poster/fallback remains visible. */
      });
    }, { once: true });
    video.addEventListener("error", function () {
      media.classList.remove("has-video", "is-video-ready");
    }, { once: true });
    video.load();
  }

  function initCatalogPrefill() {
    const interest = document.getElementById("q-interest");
    const typeSelect = document.getElementById("q-type");
    document.querySelectorAll("[data-scroll-quote]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const value = btn.getAttribute("data-interest") || "";
        if (interest) {
          interest.value = value;
          interest.focus({ preventScroll: true });
        }
        if (typeSelect && !typeSelect.value) {
          typeSelect.value = "rental";
        }
        scrollToQuote();
      });
    });
  }

  function initForm() {
    const form = document.getElementById("quote-form");
    if (!form) return;
    const success = document.getElementById("form-success");
    const error = document.getElementById("form-error");
    const required = form.querySelectorAll("[required]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (success) success.hidden = true;
      if (error) error.hidden = true;

      let ok = true;
      required.forEach(function (field) {
        const valid = field.checkValidity();
        field.classList.toggle("is-invalid", !valid);
        if (!valid) ok = false;
      });

      if (!ok) {
        if (error) error.hidden = false;
        const first = form.querySelector(".is-invalid");
        if (first) first.focus();
        return;
      }

      // Local confirmation only — no fetch, Stripe, or email.
      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        eventDate: form.eventDate.value,
        guestCount: form.guestCount.value,
        eventType: form.eventType.value,
        rentalInterest: form.rentalInterest.value.trim(),
        comments: form.comments.value.trim(),
        recordedAt: new Date().toISOString(),
        previewOnly: true,
      };
      try {
        const prev = JSON.parse(localStorage.getItem("lj_quote_preview") || "[]");
        prev.push(payload);
        localStorage.setItem("lj_quote_preview", JSON.stringify(prev));
      } catch (_) {
        /* ignore storage errors in preview */
      }

      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      form.reset();
      required.forEach(function (field) {
        field.classList.remove("is-invalid");
      });
    });

    required.forEach(function (field) {
      const validate = function () {
        field.classList.toggle("is-invalid", !field.checkValidity());
      };
      field.addEventListener("input", validate);
      field.addEventListener("blur", validate);
    });
  }

  function initYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function initStubLinks() {
    ["vendor-stub", "terms-stub", "privacy-stub"].forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("click", function (e) {
        e.preventDefault();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    applyI18n("en");
    initHeader();
    initHeroVideo();
    initReveal();
    initCatalogPrefill();
    initForm();
    initYear();
    initStubLinks();
  });
})();

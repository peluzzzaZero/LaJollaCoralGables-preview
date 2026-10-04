/* La Jolla Coral Gables — page script.
   Scroll: GSAP ScrollTrigger + Lenis, with a CSS fallback.
   Forms post through Web3Forms. No Stripe. */

(function () {
  "use strict";

  const I18N = {
    en: {
      "nav.inquire": "Inquire",
      "hero.est": "Coral Gables · Est. 1928",
      "hero.title": "A jewel in Coral Gables",
      "hero.cta": "Request a private quote",
      "history.eyebrow": "Our History",
      "history.title": "La Jolla, a jewel in Coral Gables",
      "history.lede":
        "Since 1928, La Jolla has welcomed celebrations beneath Mediterranean arches and garden light. A setting shaped by Coral Gables heritage — intimate, timeless, and quietly grand.",
      "history.managed": "Managed by Epic Lux Management",
      "quote.text": "“Where every gathering becomes a memory worth keeping.”",
      "events.eyebrow": "Events at La Jolla",
      "events.title": "A space for every vision",
      "events.lede":
        "From life's biggest milestones to business, entertainment and creative productions, La Jolla offers a versatile setting for experiences of every scale and style. If you can envision it, let's explore how we can bring it to life.",
      "events.weddings.title": "Weddings",
      "events.weddings.body":
        "From the ceremony to cocktails, dinner and dancing, La Jolla offers an elegant setting for every part of your wedding day—from intimate celebrations to full receptions.",
      "events.quince.title": "Quinceañeras & Sweet Sixteens",
      "events.quince.body":
        "Celebrate this once-in-a-lifetime milestone with a space that can transform around your theme, traditions and vision—from the grand entrance to the final dance.",
      "events.social.title": "Social celebrations",
      "events.social.body":
        "Birthdays, anniversaries, engagements, baby showers, bridal showers, graduations, reunions and milestone occasions. Whatever you're celebrating, make the space your own.",
      "events.corporate.title": "Corporate events",
      "events.corporate.body":
        "Meetings, conferences, holiday parties, awards dinners, networking events, company celebrations and client experiences—with flexible spaces that can transition from business to entertainment.",
      "events.brand.title": "Brand activations & product launches",
      "events.brand.body":
        "A versatile backdrop for launches, pop-ups, showcases, influencer events, experiential marketing and immersive brand experiences.",
      "events.productions.title": "Productions & entertainment",
      "events.productions.body":
        "Live performances, dinner shows, fashion shows, theatrical productions, comedy, music, dance and ticketed experiences—with the flexibility to create something completely original.",
      "events.film.title": "Film, photo & content",
      "events.film.body":
        "Photoshoots, commercials, interviews, music videos, film productions and branded content, with multiple spaces and distinctive looks available within one property.",
      "events.galas.title": "Galas & fundraisers",
      "events.galas.body":
        "Charity events, nonprofit gatherings, awards ceremonies, auctions and benefit dinners designed around your organization and your guests.",
      "events.dining.title": "Private dining & intimate events",
      "events.dining.body":
        "Rehearsal dinners, private dinners, cocktail receptions, tastings and smaller gatherings for occasions that call for a more intimate experience.",
      "events.other.title": "Something completely different?",
      "events.other.body":
        "Not every event fits neatly into a category—and that's the point. Tell us what you're envisioning and we'll help you make it happen.",
      "events.alcazar.link": "Discover The Alcazar Room",
      "alcazar.eyebrow": "Curated · Vintage 1928",
      "alcazar.title": "The Alcazar Room",
      "alcazar.body":
        "Step upstairs and into another era. Layered in deep greens, wine reds, and warm golds, this intimate lounge draws inspiration from private clubs, classic whiskey rooms, and the timeless elegance of Kentucky racing culture. Designed for cocktails, private dinners, intimate celebrations, and distinctive gatherings, the space feels secluded, sophisticated, and entirely its own.",
      "alcazar.cta": "Inquire about The Alcazar Room",
      "rentals.eyebrow": "Rentals & event services",
      "rentals.title": "At La Jolla & beyond",
      "rentals.intro":
        "From individual rentals to complete event production, our services extend beyond the walls of La Jolla. Furniture, décor, tabletop, glassware, staging, production elements and more are available for events both at La Jolla and at locations throughout South Florida. Whether you're hosting with us or bringing your event to another venue, our team can provide the elements and services needed to bring your vision together. Inquire for rentals, custom packages and full-service event production.",
      "rentals.servicesTitle": "Everything your event needs",
      "rentals.servicesLede":
        "From a single service to complete event production, our team brings together the elements needed to transform your vision into an unforgettable experience.",
      "rentals.elseTitle": "Looking for something else?",
      "rentals.elseBody":
        "Every event is different. Tell us what you're envisioning, and our team can source, coordinate and produce additional services to bring your event at La Jolla to life.",
      "rentals.svc.planning": "Planning, coordination & production",
      "rentals.svc.catering": "Catering & bar services",
      "rentals.svc.florals": "Florals, design & décor",
      "rentals.svc.furniture": "Furniture, linens & tabletop rentals",
      "rentals.svc.photo": "Photography & videography",
      "rentals.svc.entertainment": "Entertainment & specialty performers",
      "rentals.svc.av": "Audio, lighting, AV & staging",
      "rentals.svc.builds": "Custom builds, branding & signage",
      "rentals.svc.interactive": "Interactive experiences & photo activations",
      "rentals.svc.staff": "Valet, security & event staffing",
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
      "gallery.eyebrow": "Gallery",
      "gallery.title": "Gallery",
      "gallery.stationery": "Stationery",
      "gallery.stripe": "Monogram",
      "gallery.oval": "Oval monogram",
      "gallery.cap1": "301 Alcazar Avenue",
      "gallery.cap2": "Balcony mark",
      "gallery.cap3": "Brand mood",
      "gallery.cap4": "Wax seal",
      "gallery.cap5": "Plaque",
      "gallery.lockupEvents": "Events & experiences",
      "gallery.lockupBallroom": "Ballroom & catering",
      "gallery.welcome": "Welcome",
      "team.eyebrow": "Our Team",
      "team.title": "Our Team",
      "team.julie.role": "Executive Director",
      "team.pat.role": "Managing Director",
      "quote.eyebrow": "Private quote",
      "quote.title": "Request a private quote",
      "quote.intro": "Share a few details. We will be in touch.",
      "form.name": "Name",
      "form.email": "Email",
      "form.phone": "Phone",
      "form.date": "Event date",
      "form.guests": "Guest count",
      "form.type": "Event type",
      "form.typePlaceholder": "Select…",
      "form.typeWedding": "Wedding",
      "form.typeQuince": "Quinceañera / Sweet Sixteen",
      "form.typeSocial": "Social celebration",
      "form.typeCorporate": "Corporate event",
      "form.typeBrand": "Brand activation / launch",
      "form.typeProduction": "Production & entertainment",
      "form.typeFilm": "Film, photo & content",
      "form.typeGala": "Gala / fundraiser",
      "form.typeDining": "Private dining",
      "form.typeAlcazar": "The Alcazar Room",
      "form.typeRental": "Rentals / services only",
      "form.typeOther": "Something else",
      "form.interest": "Rental / service interest",
      "form.optional": "(optional)",
      "form.interestPh": "e.g. Furniture, Lighting",
      "form.comments": "Comments",
      "form.submit": "Submit inquiry",
      "form.successEyebrow": "La Jolla",
      "form.successTitle": "Thank you",
      "form.successBody": "Your request has been sent. We will be in touch.",
      "form.error": "Please complete the required fields.",
      "form.sendError": "We could not send that. Please email info@lajollacoralgables.com or call 786-290-8813.",
      "vendors.eyebrow": "Vendors",
      "vendors.title": "Become a vendor",
      "vendors.intro": "Tell us your name, company, service, and email.",
      "vendors.name": "Name",
      "vendors.company": "Company",
      "vendors.service": "Service",
      "vendors.email": "Email",
      "vendors.submit": "Send vendor note",
      "vendors.successTitle": "Thank you",
      "vendors.successBody": "Your note has been sent. We will be in touch.",
      "footer.tag": "Coral Gables · Est. 1928",
      "footer.managed": "Managed by Epic Lux Management",
      "footer.contact": "Contact",
      "footer.address": "301 Alcazar Avenue, Coral Gables",
      "footer.maps": "Find us",
      "footer.mapsLink": "Open in Google Maps",
      "footer.connect": "Connect",
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
      "history.eyebrow": "Nuestra historia",
      "history.title": "La Jolla, una joya en Coral Gables",
      "history.lede":
        "Desde 1928, La Jolla ha acogido celebraciones bajo arcos mediterráneos y luz de jardín. Un entorno forjado por la herencia de Coral Gables — íntimo, atemporal y discretamente grandioso.",
      "history.managed": "Gestionado por Epic Lux Management",
      "quote.text": "“Donde cada encuentro se convierte en un recuerdo para guardar.”",
      "events.eyebrow": "Eventos en La Jolla",
      "events.title": "Un espacio para cada visión",
      "events.lede":
        "Desde los grandes momentos de la vida hasta empresa, entretenimiento y producciones creativas, La Jolla ofrece un escenario versátil para experiencias de toda escala y estilo. Si puede imaginarlo, exploremos cómo hacerlo realidad.",
      "events.weddings.title": "Bodas",
      "events.weddings.body":
        "De la ceremonia a los cócteles, la cena y el baile, La Jolla ofrece un entorno elegante para cada parte de su boda: desde celebraciones íntimas hasta recepciones completas.",
      "events.quince.title": "Quinceañeras y Sweet Sixteens",
      "events.quince.body":
        "Celebre este hito irrepetible en un espacio que se transforma según su tema, sus tradiciones y su visión: desde la gran entrada hasta el último baile.",
      "events.social.title": "Celebraciones sociales",
      "events.social.body":
        "Cumpleaños, aniversarios, compromisos, baby showers, bridal showers, graduaciones, reuniones y ocasiones que marcan un momento. Sea lo que celebre, haga suyo el espacio.",
      "events.corporate.title": "Eventos corporativos",
      "events.corporate.body":
        "Reuniones, conferencias, fiestas de fin de año, cenas de premiación, encuentros de networking, celebraciones de empresa y experiencias con clientes, en espacios flexibles que pasan del trabajo al entretenimiento.",
      "events.brand.title": "Activaciones de marca y lanzamientos",
      "events.brand.body":
        "Un escenario versátil para lanzamientos, pop-ups, presentaciones, eventos con creadores, marketing experiencial y experiencias de marca.",
      "events.productions.title": "Producciones y entretenimiento",
      "events.productions.body":
        "Presentaciones en vivo, cenas-espectáculo, desfiles, teatro, comedia, música, danza y experiencias con entrada, con la libertad de crear algo completamente original.",
      "events.film.title": "Cine, foto y contenido",
      "events.film.body":
        "Sesiones de fotos, comerciales, entrevistas, videos musicales, producciones de cine y contenido de marca, con varios espacios y looks distintos en una misma propiedad.",
      "events.galas.title": "Galas y recaudaciones",
      "events.galas.body":
        "Eventos benéficos, encuentros de organizaciones, ceremonias de premiación, subastas y cenas de beneficio pensadas para su organización y sus invitados.",
      "events.dining.title": "Cenas privadas y eventos íntimos",
      "events.dining.body":
        "Cenas de ensayo, cenas privadas, recepciones de cóctel, catas y reuniones más pequeñas, para ocasiones que piden una experiencia íntima.",
      "events.other.title": "¿Algo completamente distinto?",
      "events.other.body":
        "No todo evento cabe en una categoría, y esa es la idea. Cuéntenos lo que imagina y le ayudamos a hacerlo realidad.",
      "events.alcazar.link": "Descubrir The Alcazar Room",
      "alcazar.eyebrow": "Curado · Vintage 1928",
      "alcazar.title": "The Alcazar Room",
      "alcazar.body":
        "Suba y entre en otra época. En verdes profundos, granates y oros cálidos, este salón íntimo se inspira en clubes privados, salas de whiskey clásicas y la elegancia atemporal de la cultura hípica de Kentucky. Pensado para cócteles, cenas privadas, celebraciones íntimas y reuniones singulares, el espacio se siente recogido, sofisticado y enteramente propio.",
      "alcazar.cta": "Consultar por The Alcazar Room",
      "rentals.eyebrow": "Renta y servicios para eventos",
      "rentals.title": "En La Jolla y más allá",
      "rentals.intro":
        "Desde una renta puntual hasta la producción completa del evento, nuestros servicios salen de La Jolla. Mobiliario, decoración, menaje, cristalería, escenografía, elementos de producción y más están disponibles para eventos en La Jolla y en otros lugares del sur de Florida. Sea que celebre con nosotros o lleve su evento a otro venue, el equipo puede reunir lo necesario para dar forma a su visión. Consulte por rentas, paquetes a medida y producción integral.",
      "rentals.servicesTitle": "Todo lo que su evento necesita",
      "rentals.servicesLede":
        "Desde un solo servicio hasta la producción completa, el equipo reúne lo necesario para convertir su visión en una experiencia memorable.",
      "rentals.elseTitle": "¿Busca algo más?",
      "rentals.elseBody":
        "Cada evento es distinto. Cuéntenos lo que imagina y el equipo puede buscar, coordinar y producir servicios adicionales para su evento en La Jolla.",
      "rentals.svc.planning": "Planeación, coordinación y producción",
      "rentals.svc.catering": "Catering y barra",
      "rentals.svc.florals": "Flores, diseño y decoración",
      "rentals.svc.furniture": "Mobiliario, lencería y menaje",
      "rentals.svc.photo": "Fotografía y video",
      "rentals.svc.entertainment": "Entretenimiento y artistas especiales",
      "rentals.svc.av": "Audio, iluminación, AV y escenografía",
      "rentals.svc.builds": "Construcciones a medida, marca y señalética",
      "rentals.svc.interactive": "Experiencias interactivas y activaciones de foto",
      "rentals.svc.staff": "Valet, seguridad y personal de evento",
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
      "gallery.eyebrow": "Galería",
      "gallery.title": "Galería",
      "gallery.stationery": "Papelería",
      "gallery.stripe": "Monograma",
      "gallery.oval": "Monograma oval",
      "gallery.cap1": "301 Alcazar Avenue",
      "gallery.cap2": "Marca del balcón",
      "gallery.cap3": "Ambiente de marca",
      "gallery.cap4": "Sello de cera",
      "gallery.cap5": "Placa",
      "gallery.lockupEvents": "Events & experiences",
      "gallery.lockupBallroom": "Ballroom & catering",
      "gallery.welcome": "Welcome",
      "team.eyebrow": "Nuestro equipo",
      "team.title": "Nuestro equipo",
      "team.julie.role": "Executive Director",
      "team.pat.role": "Managing Director",
      "quote.eyebrow": "Cotización privada",
      "quote.title": "Solicitar cotización privada",
      "quote.intro": "Comparta algunos datos. Le responderemos.",
      "form.name": "Nombre",
      "form.email": "Correo",
      "form.phone": "Teléfono",
      "form.date": "Fecha del evento",
      "form.guests": "Cantidad de invitados",
      "form.type": "Tipo de evento",
      "form.typePlaceholder": "Seleccionar…",
      "form.typeWedding": "Boda",
      "form.typeQuince": "Quinceañera / Sweet Sixteen",
      "form.typeSocial": "Celebración social",
      "form.typeCorporate": "Evento corporativo",
      "form.typeBrand": "Activación de marca / lanzamiento",
      "form.typeProduction": "Producción y entretenimiento",
      "form.typeFilm": "Cine, foto y contenido",
      "form.typeGala": "Gala / recaudación",
      "form.typeDining": "Cena privada",
      "form.typeAlcazar": "The Alcazar Room",
      "form.typeRental": "Solo renta / servicios",
      "form.typeOther": "Otra cosa",
      "form.interest": "Interés en renta / servicio",
      "form.optional": "(opcional)",
      "form.interestPh": "p. ej. Mobiliario, Iluminación",
      "form.comments": "Comentarios",
      "form.submit": "Enviar solicitud",
      "form.successEyebrow": "La Jolla",
      "form.successTitle": "Gracias",
      "form.successBody": "Su solicitud ha sido enviada. Le responderemos.",
      "form.sendError": "No pudimos enviarla. Escriba a info@lajollacoralgables.com o llame al 786-290-8813.",
      "form.error": "Complete los campos obligatorios.",
      "vendors.eyebrow": "Proveedores",
      "vendors.title": "Ser proveedor",
      "vendors.intro": "Indique su nombre, empresa, servicio y correo.",
      "vendors.name": "Nombre",
      "vendors.company": "Empresa",
      "vendors.service": "Servicio",
      "vendors.email": "Correo",
      "vendors.submit": "Enviar nota de proveedor",
      "vendors.successTitle": "Gracias",
      "vendors.successBody": "Su nota ha sido enviada. Le responderemos.",
      "footer.tag": "Coral Gables · Est. 1928",
      "footer.managed": "Gestionado por Epic Lux Management",
      "footer.contact": "Contacto",
      "footer.address": "301 Alcazar Avenue, Coral Gables",
      "footer.maps": "Cómo llegar",
      "footer.mapsLink": "Abrir en Google Maps",
      "footer.connect": "Conectar",
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

  function initStory() {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
      initReveal();
      return;
    }

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("has-gsap");

    var lenis = null;
    if (typeof window.Lenis !== "undefined") {
      lenis = new window.Lenis({
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: false
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
      window.__ljLenis = lenis;
    }

    document.addEventListener("click", function (event) {
      var link = event.target && event.target.closest ? event.target.closest("a[href^='#']") : null;
      if (!link) return;
      var id = link.getAttribute("href");
      if (!id || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -8 });
      else target.scrollIntoView({ block: "start" });
    });

    var reel = document.querySelector(".reel");
    if (reel) {
      var shots = gsap.utils.toArray(reel.querySelectorAll(".reel-shot"));
      var beats = gsap.utils.toArray(reel.querySelectorAll(".reel-beat"));
      var cta = reel.querySelector(".reel-cta");
      if (shots.length && beats.length) {
        var reelTl = gsap.timeline({
          scrollTrigger: {
            trigger: reel,
            start: "top top",
            end: "+=460%",
            pin: true,
            scrub: true,
            anticipatePin: 1
          }
        });
        var step = 1.4;
        var cross = 0.18;
        var lineDelay = 0.2;
        var zoomDur = 0.28;
        var openingCrops = {
          "hero-facade": { from: "8% 96%", to: "8% 96%", fromScale: 1.9, scale: 1.9 },
          "welcome-table": { from: "100% 50%", to: "100% 50%", fromScale: 6.2, scale: 6.2 },
          "mood-card-flowers": { from: "2% 90%", to: "2% 90%", fromScale: 1.85, scale: 1.85 },
          "flower-plaque": { from: "0% 55%", to: "0% 55%", fromScale: 2.6, scale: 2.6 }
        };
        if (window.matchMedia("(max-width: 800px)").matches) {
          openingCrops["hero-facade"] = { from: "50% 100%", to: "50% 100%", fromScale: 4.2, scale: 4.2 };
        }
        shots.forEach(function (shot, i) {
          var at = i * step;
          var img = shot.querySelector("img");
          var src = img.getAttribute("src") || "";
          var crop = null;
          Object.keys(openingCrops).forEach(function (name) {
            if (src.indexOf(name) !== -1) crop = openingCrops[name];
          });
          var fromPos = (crop && crop.from) || img.getAttribute("data-from") || "50% 50%";
          var toPos = (crop && crop.to) || img.getAttribute("data-to") || "50% 40%";
          var scaleFrom = (crop && crop.fromScale) || 1.45;
          var scaleTo = (crop && crop.scale) || parseFloat(img.getAttribute("data-scale")) || 1.8;
          gsap.set(img, { objectPosition: fromPos, scale: scaleFrom, transformOrigin: toPos });
          gsap.set(shot, { zIndex: i + 1 });
          if (i === 0) {
            gsap.set(shot, { autoAlpha: 1 });
          } else {
            gsap.set(shot, { autoAlpha: 0 });
            /* Incoming rises 0→1 over the same span the outgoing falls 1→0.
               power3 keeps one of them near opaque so the ink field does not show through. */
            reelTl.fromTo(shot, { autoAlpha: 0 }, {
              autoAlpha: 1,
              ease: "power3.out",
              duration: cross,
              immediateRender: false
            }, at);
          }
          reelTl.fromTo(img, {
            scale: scaleFrom,
            objectPosition: fromPos,
            transformOrigin: toPos
          }, {
            scale: scaleTo,
            objectPosition: toPos,
            transformOrigin: toPos,
            ease: "none",
            duration: zoomDur,
            immediateRender: false
          }, at);
          if (i < shots.length - 1) {
            /* Outgoing reaches 0 as the next shot reaches 1. Overlap is only this cross. */
            reelTl.to(shot, {
              autoAlpha: 0,
              ease: "power3.in",
              duration: cross,
              immediateRender: false
            }, at + step);
          }
        });
        beats.forEach(function (beat, i) {
          var at = i * step;
          gsap.set(beat, { autoAlpha: 0, y: 16 });
          /* Since 1928 is the table line. It fades out before the flower shot. */
          reelTl.fromTo(beat, { autoAlpha: 0, y: 16 }, {
            autoAlpha: 1,
            y: 0,
            ease: "none",
            duration: 0.12,
            immediateRender: false
          }, at + lineDelay);
          if (i < beats.length - 1) {
            /* Hold the line through most of the photo, then let it leave. */
            reelTl.to(beat, { autoAlpha: 0, y: -8, ease: "none", duration: 0.1 }, at + 1.26);
          }
        });
        /* Last photo must occupy a full step, or its line sits in the last sliver of the pin. */
        reelTl.set({}, {}, shots.length * step);
        if (cta) {
          gsap.set(cta, { autoAlpha: 0 });
          reelTl.fromTo(cta, { autoAlpha: 0 }, {
            autoAlpha: 1,
            ease: "none",
            duration: 0.2,
            immediateRender: false
          }, (shots.length - 1) * step + lineDelay);
        }
      }
    }

    var history = document.querySelector(".history");
    if (history) {
      var historyPhoto = history.querySelector(".history-photo img");
      var historyLines = gsap.utils.toArray(history.querySelectorAll(".history-line"));
      var historyRule = history.querySelector(".history-rule");
      var historyTl = gsap.timeline({
        scrollTrigger: {
          trigger: history,
          start: "top top",
          end: "+=90%",
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      if (historyPhoto) {
        /* Walk the facade from the blue pots (bottom left) onto the sun tile.
           Scale stays tight and the window stays low so the painted wordmark never enters. */
        gsap.set(historyPhoto, {
          scale: 3.55,
          objectPosition: "2% 100%",
          transformOrigin: "2% 100%"
        });
        historyTl.fromTo(historyPhoto, {
          scale: 3.55,
          objectPosition: "2% 100%",
          transformOrigin: "2% 100%"
        }, {
          scale: 3.35,
          objectPosition: "52% 100%",
          transformOrigin: "52% 100%",
          ease: "none",
          duration: 1
        }, 0);
      }
      if (historyRule) {
        gsap.set(historyRule, { scaleX: 0, transformOrigin: "left center" });
        historyTl.to(historyRule, { scaleX: 1, ease: "none", duration: 0.28 }, 0.06);
      }
      historyLines.forEach(function (line, i) {
        /* Eyebrow, title, and the Since 1928 lede stay readable. Only the managed line may fade in. */
        if (i < 3) {
          gsap.set(line, { autoAlpha: 1, y: 0 });
          return;
        }
        gsap.set(line, { autoAlpha: 0, y: 12 });
        historyTl.to(line, { autoAlpha: 1, y: 0, ease: "none", duration: 0.22 }, 0.4);
      });
    }

    var alcazarVisual = document.querySelector("#alcazar");
    if (alcazarVisual) {
      /* Name, body, and the full line drawing stay readable together.
         No photo wipe and no tilt. */
      gsap.set(alcazarVisual.querySelectorAll(".reveal"), { autoAlpha: 1, y: 0 });
      var alcazarMark = alcazarVisual.querySelector(".alcazar-visual img");
      if (alcazarMark) {
        /* The awning mark settles as the room name is read. No wipe, no tilt. */
        gsap.fromTo(alcazarMark, { scale: 0.92, transformOrigin: "50% 50%" }, {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: alcazarVisual,
            start: "top 78%",
            end: "top 42%",
            scrub: true
          }
        });
      }
    }

    gsap.utils.toArray(".brand-card img").forEach(function (img) {
      gsap.fromTo(img, { scale: 0.9 }, {
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: img, start: "top 92%", end: "top 58%", scrub: true }
      });
    });

    var moment = document.querySelector("#moment");
    if (moment) {
      var momentImg = moment.querySelector(".quote-bleed-media img");
      var momentText = moment.querySelector(".quote-bleed-text");
      var momentTl = gsap.timeline({
        scrollTrigger: {
          trigger: moment,
          start: "top top",
          end: "+=140%",
          pin: true,
          scrub: true,
          anticipatePin: 1
        }
      });
      if (momentImg) {
        /* The highlight walks across the leaves. Stay in the lower crop so the
           painted oval remains above the sentence for the whole pin. */
        gsap.set(momentImg, {
          scale: 1.32,
          objectPosition: "100% 90%",
          transformOrigin: "70% 65%"
        });
        momentTl.to(momentImg, {
          scale: 1.58,
          objectPosition: "15% 78%",
          transformOrigin: "70% 65%",
          ease: "none",
          duration: 1
        }, 0);
      }
      if (momentText) {
        gsap.set(momentText, { autoAlpha: 1, y: 0 });
      }
    }

    var events = document.querySelector("#events");
    if (events) {
      /* Headings and bodies stay fully readable. The rule under the eyebrow
         is the only motion: it draws across as the section arrives. */
      gsap.set(events.querySelectorAll(".reveal"), { autoAlpha: 1, y: 0 });
      var eventsRule = events.querySelector(".events-rule");
      if (eventsRule) {
        gsap.set(eventsRule, { scaleX: 0, transformOrigin: "center center" });
        gsap.to(eventsRule, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: events,
            start: "top 82%",
            end: "top 38%",
            scrub: true
          }
        });
      }
    }

    var rentals = document.querySelector("#rentals");
    if (rentals) {
      /* Title, intro, the ten names, Inquire, and the closing line stay readable.
         Not a fade from invisible. */
      gsap.set(rentals.querySelectorAll(".reveal"), { autoAlpha: 1, y: 0 });
      var rentalsRule = rentals.querySelector(".rentals-rule");
      if (rentalsRule) {
        gsap.set(rentalsRule, { scaleX: 0, transformOrigin: "left center" });
        gsap.to(rentalsRule, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: rentals,
            start: "top 80%",
            end: "top 48%",
            scrub: true
          }
        });
      }
    }

    var team = document.querySelector("#team");
    if (team) {
      gsap.set(team.querySelectorAll(".reveal"), { autoAlpha: 1, y: 0 });
      var monograms = team.querySelectorAll(".team-photo.monogram");
      if (monograms.length) {
        /* Names stay fully readable. The monograms settle while the two cards hold. */
        gsap.set(monograms, { scale: 0.94, transformOrigin: "50% 60%" });
        gsap.to(monograms, {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: team,
            start: "top 72%",
            end: "top 36%",
            scrub: true
          }
        });
      }
    }

    var quote = document.querySelector("#quote");
    if (quote) {
      gsap.set(quote.querySelectorAll(".reveal"), { autoAlpha: 1, y: 0 });
      var quoteRule = quote.querySelector(".quote-rule");
      if (quoteRule) {
        gsap.set(quoteRule, { scaleX: 0, transformOrigin: "center center" });
        gsap.to(quoteRule, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: quote,
            start: "top 78%",
            end: "top 52%",
            scrub: true
          }
        });
      }
    }

    var vendors = document.querySelector("#vendors");
    if (vendors) {
      gsap.set(vendors.querySelectorAll(".reveal"), { autoAlpha: 1, y: 0 });
      var vendorsRule = vendors.querySelector(".vendors-rule");
      if (vendorsRule) {
        gsap.set(vendorsRule, { scaleX: 0, transformOrigin: "center center" });
        gsap.to(vendorsRule, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: vendors,
            start: "top 78%",
            end: "top 52%",
            scrub: true
          }
        });
      }
    }

    if (lenis) {
      ScrollTrigger.addEventListener("refresh", function () { lenis.resize(); });
      lenis.resize();
    }
    window.addEventListener("load", function () {
      ScrollTrigger.refresh();
      if (lenis) lenis.resize();
    });
  }

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    const heroTrack = document.querySelector(".hero-track");
    const moment = document.querySelector(".moment-track");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      nodes.forEach(function (n) {
        n.style.setProperty("--p", "1");
        n.classList.add("is-visible");
      });
      if (moment) moment.style.setProperty("--p", "1");
      return;
    }
    let ticking = false;
    const update = function () {
      const vh = window.innerHeight || 1;
      nodes.forEach(function (el) {
        const top = el.getBoundingClientRect().top;
        const start = vh * 0.98;
        const end = vh * 0.52;
        const p = Math.max(0, Math.min(1, (start - top) / (start - end)));
        el.style.setProperty("--p", p.toFixed(3));
        el.classList.toggle("is-visible", p > 0.85);
      });
      if (heroTrack) {
        const rect = heroTrack.getBoundingClientRect();
        const total = Math.max(heroTrack.offsetHeight - vh, 1);
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        heroTrack.style.setProperty("--hero-p", (scrolled / total).toFixed(3));
      }
      if (moment) {
        const rect = moment.getBoundingClientRect();
        const total = Math.max(moment.offsetHeight - vh, 1);
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        moment.style.setProperty("--p", (scrolled / total).toFixed(3));
      }
      ticking = false;
    };
    const onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  function scrollToQuote() {
    const quote = document.getElementById("quote");
    if (!quote) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.__ljLenis && !reduced) {
      window.__ljLenis.scrollTo(quote, { offset: -8 });
      return;
    }
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

  var MAIL_KEY = "c13b3e4c-b71b-4df0-84b0-ce0b91be3b84";

  function sendMail(payload) {
    if (!MAIL_KEY) return Promise.reject(new Error("mail"));
    return fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.assign({
        access_key: MAIL_KEY,
        from_name: "La Jolla",
        ccemail: "info@lajollacoralgables.com",
        botcheck: ""
      }, payload))
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok || data.success === false || data.success === "false") {
          throw new Error("mail");
        }
        return data;
      });
    });
  }

  function initLocalForm(formId, successId, errorId, sendErrorId, subject) {
    const form = document.getElementById(formId);
    if (!form) return;
    const success = document.getElementById(successId);
    const error = document.getElementById(errorId);
    const sendError = document.getElementById(sendErrorId);
    const required = form.querySelectorAll("[required]");
    const submit = form.querySelector("[type='submit']");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (success) success.hidden = true;
      if (error) error.hidden = true;
      if (sendError) sendError.hidden = true;

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

      const payload = { subject: subject };
      Array.prototype.forEach.call(form.elements, function (field) {
        if (!field.name || field.type === "submit" || field.type === "button") return;
        payload[field.name] = String(field.value || "").trim();
      });
      if (payload.email) payload.replyto = payload.email;
      if (submit) submit.disabled = true;

      sendMail(payload).then(function () {
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        form.reset();
        required.forEach(function (field) {
          field.classList.remove("is-invalid");
        });
      }).catch(function () {
        if (sendError) sendError.hidden = false;
      }).then(function () {
        if (submit) submit.disabled = false;
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

  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    applyI18n("en");
    initHeader();
    initHeroVideo();
    initStory();
    initCatalogPrefill();
    initLocalForm("quote-form", "form-success", "form-error", "form-send-error", "La Jolla inquiry");
    initLocalForm("vendor-form", "vendor-success", "vendor-error", "vendor-send-error", "La Jolla vendor");
    initYear();
  });
})();

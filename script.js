/* La Jolla Coral Gables — page script.
   Scroll: GSAP ScrollTrigger with native scrolling and a readable static fallback.
   Forms post through Web3Forms. No Stripe. */

(function () {
  "use strict";

  const I18N = {
    en: {
      "paths.eyebrow": "Consider the possibilities",
      "paths.title": "Your occasion. Your setting.",
      "paths.houseKicker": "At the house",
      "paths.houseTitle": "Celebrate at La Jolla",
      "paths.houseBody": "Weddings, celebrations and gatherings in our historic Coral Gables setting.",
      "paths.houseLink": "Explore occasions",
      "paths.beyondKicker": "Beyond the house",
      "paths.beyondTitle": "Bring the occasion to you",
      "paths.beyondBody": "Rentals, design and production for your chosen location in South Florida.",
      "paths.beyondLink": "Explore services",
      "form.contactGroup": "A way to reach you",
      "form.occasionGroup": "The occasion",
      "form.detailsGroup": "Your vision",
      "form.location": "Event location",
      "form.locationPlaceholder": "Select a setting…",
      "form.locationHouse": "At La Jolla, Coral Gables",
      "form.locationBeyond": "At another location in South Florida",
      "form.locationExploring": "Still exploring",
      "selection.setting": "Setting",
      "nav.menu": "Explore La Jolla",
      "rentals.select": "Select",
      "rentals.selected": "Selected",
      "selection.title": "Your selection",
      "selection.help": "Choose the services that interest you. You can adjust your selection before sending an inquiry.",
      "selection.continue": "Discuss your selection",
      "selection.inquiry": "Services to discuss",
      "selection.edit": "Explore more services",
      "selection.remove": "Remove",
      "selection.count": "services selected",
      "form.planning": "Let's Start Planning",

      "visit.altFacade": "La Jolla facade, ivy, striped awnings and brick entrance at 301 Alcazar Avenue.",
      "visit.altWide": "La Jolla facade and balcony at 301 Alcazar Avenue, Coral Gables.",
      "visit.altBallroom": "La Jolla's white ballroom with chandeliers and an open floor.",
      "visit.altStair": "Curved staircase with a decorative iron railing inside La Jolla.",
      "visit.altMusic": "An open music score against patterned red wallpaper inside the house.",
      "visit.altGarden": "Palm trees, ivy and a brick garden path alongside La Jolla.",
      "visit.altPiano": "A second view of La Jolla's ballroom, with a grand piano and chandeliers.",
      "nav.visit": "The spaces",
      "visit.eyebrow": "An invitation inside",
      "visit.title": "Picture your occasion here.",
      "visit.intro": "From the light-filled ballroom to the smallest architectural detail, take a closer look at La Jolla.",
      "visit.ballroom": "The ballroom · a space to make your own",
      "visit.stair": "A different perspective",
      "visit.music": "Details with character",
      "visit.garden": "Garden light",
      "visit.more": "Another view of the ballroom",
      "visit.piano": "The ballroom, from another angle",
      "visit.filmEyebrow": "A moment at the house",
      "visit.filmTitle": "The approach. The details.",
      "visit.filmIntro": "Two short glimpses of the facade, its striped awnings and the greenery that frames your arrival.",
      "visit.cta": "Let's imagine your occasion here",
      "visit.arrival": "The arrival · 12 seconds",
      "visit.details": "A closer look · 13 seconds",
      "visit.download": "Open the film",
      "visit.filmError": "The film could not load. You can open the file below.",
      "visit.arrivalLabel": "Arrival at La Jolla",
      "visit.detailsLabel": "Architectural details of La Jolla",
      "nav.skip": "Skip to content",
      "nav.house": "The house",
      "nav.occasions": "Occasions",
      "nav.services": "Services",
      "hero.offer": "A historic setting for your celebration. Event services at La Jolla and throughout South Florida.",
      "hero.explore": "Explore the possibilities",
      "hero.enter": "Step inside",
      "hero.chapter1": "The arrival",
      "hero.chapter2": "Around the table",
      "hero.chapter3": "Considered details",
      "hero.chapter4": "A celebration takes shape",
      "events.detail": "The details set the tone.",
      "rentals.short": "From a single rental to complete event production. At La Jolla or at your chosen location in South Florida.",
      "rentals.more": "More about our services",

      "nav.inquire": "Inquire",
      "hero.est": "Coral Gables · Est. 1928",
      "hero.title": "A jewel in Coral Gables",
      "hero.cta": "Request a private quote",
      "history.eyebrow": "Our History",
      "history.title": "A place with a story",
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
      "events.alcazar.link": "Discover The Lexington",
      "alcazar.eyebrow": "Curated · Vintage 1928",
      "alcazar.title": "The Lexington",
      "alcazar.body":
        "Step upstairs and into another era. Layered in deep greens, wine reds, and warm golds, this intimate lounge draws inspiration from private clubs, classic whiskey rooms, and the timeless elegance of Kentucky racing culture. Designed for cocktails, private dinners, intimate celebrations, and distinctive gatherings, the space feels secluded, sophisticated, and entirely its own.",
      "alcazar.cta": "Inquire about The Lexington",
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
      "gallery.eyebrow": "The La Jolla identity",
      "gallery.title": "A world of details",
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
      "form.typeAlcazar": "The Lexington",
      "form.typeRental": "Rentals / services only",
      "form.typeOther": "Something else",
      "form.interest": "Additional service details",
      "form.optional": "(optional)",
      "form.interestPh": "Anything else you would like us to know",
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
      "paths.eyebrow": "Explore las posibilidades",
      "paths.title": "Su ocasión. Su escenario.",
      "paths.houseKicker": "En nuestra casa",
      "paths.houseTitle": "Celebre en La Jolla",
      "paths.houseBody": "Bodas, celebraciones y encuentros en nuestro entorno histórico de Coral Gables.",
      "paths.houseLink": "Explore las ocasiones",
      "paths.beyondKicker": "Más allá de la casa",
      "paths.beyondTitle": "Lleve la ocasión a su espacio",
      "paths.beyondBody": "Alquileres, diseño y producción en el lugar que elija en South Florida.",
      "paths.beyondLink": "Explore los servicios",
      "form.contactGroup": "Cómo contactarle",
      "form.occasionGroup": "La ocasión",
      "form.detailsGroup": "Su visión",
      "form.location": "Lugar del evento",
      "form.locationPlaceholder": "Elija un escenario…",
      "form.locationHouse": "En La Jolla, Coral Gables",
      "form.locationBeyond": "En otro lugar de South Florida",
      "form.locationExploring": "Aún por decidir",
      "selection.setting": "Lugar",
      "nav.menu": "Explore La Jolla",
      "rentals.select": "Elegir",
      "rentals.selected": "Elegido",
      "selection.title": "Su selección",
      "selection.help": "Elija los servicios que le interesan. Puede ajustar su selección antes de enviar una consulta.",
      "selection.continue": "Consultar su selección",
      "selection.inquiry": "Servicios para consultar",
      "selection.edit": "Explorar más servicios",
      "selection.remove": "Quitar",
      "selection.count": "servicios seleccionados",
      "form.planning": "Comencemos a planificar",

      "visit.altFacade": "Fachada de La Jolla, hiedra, toldos de rayas y entrada de ladrillo en 301 Alcazar Avenue.",
      "visit.altWide": "Fachada y balcón de La Jolla en 301 Alcazar Avenue, Coral Gables.",
      "visit.altBallroom": "Salón blanco de La Jolla con lámparas de araña y espacio abierto.",
      "visit.altStair": "Escalera curva con barandilla decorativa de hierro en La Jolla.",
      "visit.altMusic": "Partitura abierta frente al papel tapiz rojo estampado de la casa.",
      "visit.altGarden": "Palmeras, hiedra y camino de ladrillo junto a La Jolla.",
      "visit.altPiano": "Otra vista del salón de La Jolla con piano de cola y lámparas de araña.",
      "nav.visit": "Los espacios",
      "visit.eyebrow": "Una invitación a entrar",
      "visit.title": "Imagine su ocasión aquí.",
      "visit.intro": "Desde el salón lleno de luz hasta el más pequeño detalle arquitectónico, conozca La Jolla más de cerca.",
      "visit.ballroom": "El salón · un espacio para hacerlo suyo",
      "visit.stair": "Otra perspectiva",
      "visit.music": "Detalles con carácter",
      "visit.garden": "La luz del jardín",
      "visit.more": "Otra vista del salón",
      "visit.piano": "El salón, desde otro ángulo",
      "visit.filmEyebrow": "Un momento en la casa",
      "visit.filmTitle": "La llegada. Los detalles.",
      "visit.filmIntro": "Dos breves recorridos por la fachada, sus toldos de rayas y la vegetación que enmarca su llegada.",
      "visit.cta": "Imaginemos su ocasión aquí",
      "visit.arrival": "La llegada · 12 segundos",
      "visit.details": "Una mirada cercana · 13 segundos",
      "visit.download": "Abrir el video",
      "visit.filmError": "No se pudo cargar el video. Puede abrir el archivo a continuación.",
      "visit.arrivalLabel": "La llegada a La Jolla",
      "visit.detailsLabel": "Detalles arquitectónicos de La Jolla",
      "nav.skip": "Ir al contenido",
      "nav.house": "La casa",
      "nav.occasions": "Ocasiones",
      "nav.services": "Servicios",
      "hero.offer": "Un entorno histórico para su celebración. Servicios para eventos en La Jolla y en todo el sur de Florida.",
      "hero.explore": "Explore las posibilidades",
      "hero.enter": "Entre a descubrirlo",
      "hero.chapter1": "La llegada",
      "hero.chapter2": "Alrededor de la mesa",
      "hero.chapter3": "Detalles cuidados",
      "hero.chapter4": "Una celebración toma forma",
      "events.detail": "Los detalles marcan el tono.",
      "rentals.short": "Desde una renta puntual hasta la producción integral. En La Jolla o en el lugar que usted elija en el sur de Florida.",
      "rentals.more": "Más sobre nuestros servicios",

      "nav.inquire": "Consultar",
      "hero.est": "Coral Gables · Est. 1928",
      "hero.title": "Una joya en Coral Gables",
      "hero.cta": "Solicitar cotización privada",
      "history.eyebrow": "Nuestra historia",
      "history.title": "Un lugar con historia",
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
      "events.alcazar.link": "Descubrir The Lexington",
      "alcazar.eyebrow": "Curado · Vintage 1928",
      "alcazar.title": "The Lexington",
      "alcazar.body":
        "Suba y entre en otra época. En verdes profundos, granates y oros cálidos, este salón íntimo se inspira en clubes privados, salas de whiskey clásicas y la elegancia atemporal de la cultura hípica de Kentucky. Pensado para cócteles, cenas privadas, celebraciones íntimas y reuniones singulares, el espacio se siente recogido, sofisticado y enteramente propio.",
      "alcazar.cta": "Consultar por The Lexington",
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
      "gallery.eyebrow": "La identidad de La Jolla",
      "gallery.title": "Un mundo de detalles",
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
      "form.typeAlcazar": "The Lexington",
      "form.typeRental": "Solo renta / servicios",
      "form.typeOther": "Otra cosa",
      "form.interest": "Detalles adicionales de servicios",
      "form.optional": "(opcional)",
      "form.interestPh": "Algo más que usted desee compartir",
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
  const selectedServices = new Set();

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
    renderInquirySelection();
    try { localStorage.setItem("lajolla-language", lang); } catch (_) { /* Storage is optional. */ }
    // Translated paragraphs change section heights and scroll positions.
    window.requestAnimationFrame(function () {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      if (window.__ljLenis) window.__ljLenis.resize();
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
    if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add({ desktop: "(min-width: 901px)", mobile: "(max-width: 900px)", reduced: "(prefers-reduced-motion: reduce)" }, function (context) {
      if (context.conditions.reduced) return;
      document.documentElement.classList.add("has-gsap");
      const reel = document.querySelector(".reel");
      const shots = gsap.utils.toArray(".reel-shot");
      const beats = gsap.utils.toArray(".reel-beat");
      const index = document.querySelector(".reel-index");
      const progress = document.querySelector(".reel-progress i");
      const desktop = context.conditions.desktop;
      const openingCrops = {
        "facade": { position: "50% 55%", scale: 1.03 },
        "hero-facade": { position: "50% 70%", scale: 1.06 },
        "welcome-table": { position: "50% 50%", scale: 1.06 },
        "mood-card-flowers": { position: "50% 65%", scale: 1.06 },
        "flower-plaque": { position: "50% 50%", scale: 1.06 }
      };
      // Copy and inquiry never animate away. Only the framed photographs change.
      const reelTl = gsap.timeline({ scrollTrigger: {
        trigger: reel, start: "top top", end: desktop ? "+=160%" : "bottom top",
        pin: desktop, scrub: true, anticipatePin: 1,
        onUpdate: function (self) {
          const current = Math.min(3, Math.floor(self.progress * 4));
          if (index) index.textContent = "0" + (current + 1) + " / 04";
        }
      }});
      shots.forEach(function (shot, i) {
        const img = shot.querySelector("img");
        const key = Object.keys(openingCrops).find(function (name) { return img.src.includes(name); });
        const crop = openingCrops[key] || { position: "50% 50%", scale: 1.03 };
        gsap.set(shot, { autoAlpha: i === 0 ? 1 : 0, zIndex: i + 1 });
        gsap.set(beats[i], { autoAlpha: i === 0 ? 1 : 0 });
        reelTl.fromTo(img, { scale: crop.scale, objectPosition: crop.position }, { scale: 1.12, ease: "none", duration: 1, immediateRender: false }, i);
        if (i > 0) {
          reelTl.to(shot, { autoAlpha: 1, ease: "power3.out", duration: .22 }, i);
          reelTl.to(shots[i - 1], { autoAlpha: 0, ease: "power3.in", duration: .22 }, i);
          reelTl.to(beats[i - 1], { autoAlpha: 0, duration: .08 }, i);
          reelTl.to(beats[i], { autoAlpha: 1, duration: .08 }, i + .08);
        }
      });
      if (progress) reelTl.fromTo(progress, { scaleX: .05 }, { scaleX: 1, duration: 4, ease: "none" }, 0);
      reelTl.fromTo(reel, { "--light-x": "-12%" }, { "--light-x": "18%", duration: 4, ease: "none" }, 0);

      var history = document.querySelector(".history");
      const historyPhoto = history.querySelector(".history-photo img");
      // Tight lower facade crop protects the printed wordmark. The history now scrolls naturally.
      gsap.fromTo(historyPhoto, { scale: 3.55, objectPosition: "2% 100%", transformOrigin: "2% 100%" }, {
        scale: 3.35, objectPosition: "52% 100%", transformOrigin: "52% 100%", ease: "none",
        scrollTrigger: { trigger: history, start: "top 85%", end: "bottom 20%", scrub: true }
      });
      var alcazarVisual = document.querySelector("#alcazar");
      const alcazarMark = alcazarVisual.querySelector(".alcazar-visual img");
      gsap.fromTo(alcazarMark, { scale: .94 }, { scale: 1, ease: "none",
        scrollTrigger: { trigger: alcazarVisual, start: "top 80%", end: "bottom 55%", scrub: true }
      });
      gsap.fromTo(alcazarVisual, { "--light-x": "-10%" }, { "--light-x": "16%", ease: "none",
        scrollTrigger: { trigger: alcazarVisual, start: "top bottom", end: "bottom top", scrub: true }
      });
      gsap.utils.toArray(".brand-card img").forEach(function (img) {
        gsap.fromTo(img, { scale: 0.96 }, { scale: 1, ease: "none",
          scrollTrigger: { trigger: img, start: "top 92%", end: "top 58%", scrub: true }
        });
      });
      var moment = document.querySelector("#moment");
      gsap.fromTo(moment.querySelector(".quote-bleed-media img"), { scale: 1.4, objectPosition: "100% 90%", transformOrigin: "50% 100%" }, {
        scale: 1.5, objectPosition: "25% 90%", ease: "none",
        scrollTrigger: { trigger: moment, start: "top bottom", end: "bottom top", scrub: true }
      });
      // All commercial sections remain opaque, including when animations cannot run.
      var events = document.querySelector("#events");
      var rentals = document.querySelector("#rentals");
      var team = document.querySelector("#team");
      var quote = document.querySelector("#quote");
      var vendors = document.querySelector("#vendors");
      [events, rentals, team, quote, vendors].forEach(function (section) {
        gsap.set(section.querySelectorAll(".reveal"), { autoAlpha: 1, y: 0 });
      });
      ScrollTrigger.refresh();
      return function () { document.documentElement.classList.remove("has-gsap"); };
    });
    // Native scroll keeps touch, focus and keyboard positions in the same coordinate system.
    document.addEventListener("click", function (event) {
      const link = event.target.closest && event.target.closest("a[href^='#']");
      if (!link) return;
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) return;
      event.preventDefault();
      scrollToSection(target);
    });
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

  function scrollToSection(target) {
    if (!target) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.getElementById("header");
    const offset = header ? header.getBoundingClientRect().height + 8 : 76;
    window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset), behavior: reduced ? "instant" : "smooth" });
  }

  function serviceLabel(id) {
    return I18N[lang]["rentals.svc." + id] || I18N.en["rentals.svc." + id] || id;
  }

  function renderInquirySelection() {
    const dict = I18N[lang];
    const ids = Array.from(selectedServices);
    document.querySelectorAll("[data-service-id]").forEach(function (button) {
      const selected = selectedServices.has(button.dataset.serviceId);
      button.setAttribute("aria-pressed", String(selected));
      const action = button.querySelector("em");
      const key = selected ? "rentals.selected" : "rentals.select";
      action.setAttribute("data-i18n", key);
      action.textContent = dict[key];
    });
    ["catalog-selection", "inquiry-selection"].forEach(function (id) {
      const list = document.getElementById(id);
      if (!list) return;
      list.setAttribute("aria-label", dict["selection.inquiry"]);
      list.replaceChildren();
      ids.forEach(function (service) {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.removeService = service;
        button.setAttribute("aria-label", dict["selection.remove"] + " " + serviceLabel(service));
        button.append(document.createTextNode(serviceLabel(service)));
        const cross = document.createElement("span");
        cross.setAttribute("aria-hidden", "true");
        cross.textContent = "×";
        button.append(cross);
        item.append(button);
        list.append(item);
      });
    });
    document.querySelectorAll(".selection-continue, .inquiry-selection").forEach(function (node) { node.hidden = !ids.length; });
    const services = document.getElementById("selected-services");
    const stableIds = document.getElementById("selected-service-ids");
    if (services) services.value = ids.map(serviceLabel).join("; ");
    if (stableIds) stableIds.value = ids.join(", ");
    const status = document.getElementById("selection-status");
    if (status) status.textContent = ids.length + " " + dict["selection.count"];
    const location = document.getElementById("q-location");
    const setting = document.querySelector(".inquiry-location");
    if (location && setting) {
      setting.hidden = !location.value;
      setting.textContent = location.value ? dict["selection.setting"] + ": " + location.selectedOptions[0].textContent : "";
    }
  }

  function initInquiryComposer() {
    const type = document.getElementById("q-type");
    const location = document.getElementById("q-location");
    document.querySelectorAll("[data-service-id]").forEach(function (button) {
      button.disabled = false;
      button.addEventListener("click", function () {
        const position = button.getBoundingClientRect().top;
        const id = button.dataset.serviceId;
        if (selectedServices.has(id)) selectedServices.delete(id);
        else selectedServices.add(id);
        if (type && !type.value && selectedServices.size) type.value = "rental";
        renderInquirySelection();
        const shift = button.getBoundingClientRect().top - position;
        if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: "instant" });
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      });
    });
    document.addEventListener("click", function (event) {
      const remove = event.target.closest && event.target.closest("[data-remove-service]");
      if (remove) {
        const list = remove.closest("ul");
        const service = remove.dataset.removeService;
        const before = Array.from(list.querySelectorAll("button"));
        const index = before.indexOf(remove);
        selectedServices.delete(service);
        renderInquirySelection();
        const remaining = list.querySelectorAll("button");
        const focus = remaining[Math.min(index, remaining.length - 1)] || (list.id === "catalog-selection"
          ? document.querySelector('[data-service-id="' + service + '"]') : document.getElementById("q-name"));
        if (focus) focus.focus({ preventScroll: true });
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      }
      const occasion = event.target.closest && event.target.closest("[data-event-type]");
      if (occasion && type) {
        type.value = occasion.dataset.eventType;
        if (location) location.value = "la-jolla";
        renderInquirySelection();
      }
      const path = event.target.closest && event.target.closest("[data-inquiry-location]");
      if (path && location) {
        location.value = path.dataset.inquiryLocation;
        renderInquirySelection();
      }
      const vendorLink = event.target.closest && event.target.closest("a[href='#vendors']");
      if (vendorLink) document.getElementById("vendor-details").open = true;
    });
    if (type) type.addEventListener("change", renderInquirySelection);
    if (location) location.addEventListener("change", renderInquirySelection);
    const form = document.getElementById("quote-form");
    if (form) form.addEventListener("reset", function () {
      selectedServices.clear();
      window.requestAnimationFrame(renderInquirySelection);
    });
    renderInquirySelection();
  }

  function initChapterMenu() {
    const menu = document.querySelector(".mobile-menu");
    if (!menu) return;
    document.addEventListener("click", function (event) {
      if (!menu.contains(event.target) || event.target.closest("a")) menu.open = false;
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.open) {
        menu.open = false;
        menu.querySelector("summary").focus();
      }
    });
  }

  var MAIL_KEY = "c13b3e4c-b71b-4df0-84b0-ce0b91be3b84";

  function sendMail(payload) {
    if (!MAIL_KEY) return Promise.reject(new Error("mail"));
    const controller = new AbortController();
    const timeout = window.setTimeout(function () { controller.abort(); }, 15000);
    return fetch("https://api.web3forms.com/submit", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.assign({
        access_key: MAIL_KEY,
        from_name: "La Jolla",
        ccemail: "info@lajollacoralgables.com",
        botcheck: ""
      }, payload))
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok || (data.success !== true && data.success !== "true")) {
          throw new Error("mail");
        }
        return data;
      });
    }).finally(function () { window.clearTimeout(timeout); });
  }

  function initLocalForm(formId, successId, errorId, sendErrorId, subject) {
    const form = document.getElementById(formId);
    if (!form) return;
    const success = document.getElementById(successId);
    const error = document.getElementById(errorId);
    const sendError = document.getElementById(sendErrorId);
    const required = form.querySelectorAll("[required]");
    const submit = form.querySelector("[type='submit']");
    let sending = false;
    // The default submit button stays disabled if the page script fails to load.
    if (submit) submit.disabled = false;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return;
      if (success) success.hidden = true;
      if (error) error.hidden = true;
      if (sendError) sendError.hidden = true;

      let ok = true;
      required.forEach(function (field) {
        if (field.type === "text" || field.type === "email" || field.type === "tel") {
          field.value = field.value.trim();
        }
        const valid = field.checkValidity();
        field.classList.toggle("is-invalid", !valid);
        field.setAttribute("aria-invalid", valid ? "false" : "true");
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
      sending = true;
      form.setAttribute("aria-busy", "true");
      if (submit) submit.disabled = true;

      sendMail(payload).then(function () {
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
        }
        form.reset();
        required.forEach(function (field) {
          field.classList.remove("is-invalid");
          field.removeAttribute("aria-invalid");
        });
      }).catch(function () {
        if (sendError) sendError.hidden = false;
      }).then(function () {
        sending = false;
        form.removeAttribute("aria-busy");
        if (submit) submit.disabled = false;
      });
    });

    required.forEach(function (field) {
      const validate = function () {
        const valid = field.checkValidity();
        field.classList.toggle("is-invalid", !valid);
        field.setAttribute("aria-invalid", valid ? "false" : "true");
      };
      field.addEventListener("input", validate);
      field.addEventListener("blur", validate);
    });
  }

  function initVenueFilms() {
    document.querySelectorAll(".venue-more").forEach(function (details) {
      details.addEventListener("toggle", function () {
        window.requestAnimationFrame(function () {
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();
          if (window.__ljLenis) window.__ljLenis.resize();
        });
      });
    });
    const films = Array.from(document.querySelectorAll(".venue-film video"));
    films.forEach(function (film) {
      const status = film.closest("figure").querySelector(".venue-film-status");
      const showError = function () { if (status) status.hidden = false; };
      film.addEventListener("error", showError);
      film.querySelectorAll("source").forEach(function (source) { source.addEventListener("error", showError); });
      film.addEventListener("loadeddata", function () { if (status) status.hidden = true; });
      film.addEventListener("play", function () {
        films.forEach(function (other) { if (other !== film) other.pause(); });
      });
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) films.forEach(function (film) { film.pause(); });
    });
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { if (!entry.isIntersecting) entry.target.pause(); });
      }, { threshold: 0 });
      films.forEach(function (film) { observer.observe(film); });
    }
  }

  function initYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    let preferred = "en";
    try { if (localStorage.getItem("lajolla-language") === "es") preferred = "es"; } catch (_) { /* Storage is optional. */ }
    applyI18n(preferred);
    initHeader();
    initStory();
    initInquiryComposer();
    initChapterMenu();
    initVenueFilms();
    initLocalForm("quote-form", "form-success", "form-error", "form-send-error", "La Jolla inquiry");
    initLocalForm("vendor-form", "vendor-success", "vendor-error", "vendor-send-error", "La Jolla vendor");
    initYear();
  });
})();

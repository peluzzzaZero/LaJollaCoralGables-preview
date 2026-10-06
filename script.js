/* La Jolla Coral Gables — page script.
   Scroll: GSAP ScrollTrigger with native scrolling and a readable static fallback.
   Forms post through Web3Forms. No Stripe. */

(function () {
  "use strict";

  const I18N = {
    en: {
      "cinema.eyebrow": "A sense of place",
      "cinema.title": "A closer look at the house.",
      "cinema.arrivalTitle": "A first impression.",
      "cinema.arrivalBody": "Ivy, striped awnings, and a welcome that begins at the door.",
      "cinema.balconyTitle": "Look a little closer.",
      "cinema.balconyBody": "An iron balcony. Garden light. The details that give the house its character.",
      "cinema.roomTitle": "Now, imagine your occasion.",
      "cinema.roomBody": "Inside, a light-filled ballroom becomes the starting point for your celebration.",
      "cinema.label": "Views of the house",
      "cinema.arrival": "The arrival",
      "cinema.balcony": "The balcony",
      "cinema.room": "The ballroom",
      "cinema.continue": "Explore the spaces ↓",

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
      "visit.cta": "Let's imagine your occasion here",
      "visit.filmsLabel": "Short films of the house",
      "visit.watchArrival": "The arrival · 12s",
      "visit.watchDetails": "A closer look · 13s",
      "visit.close": "Close",
      "visit.download": "Open the film",
      "visit.filmError": "The film could not load. You can open the file below.",
      "visit.arrivalLabel": "Arrival at La Jolla",
      "visit.detailsLabel": "Architectural details of La Jolla",
      "nav.skip": "Skip to content",
      "nav.house": "The house",
      "nav.occasions": "Occasions",
      "nav.services": "Services",
      "hero.photos": "Opening photographs",
      "history.alt": "La Jolla’s ivy-covered corner, arched windows and striped awnings.",
      "gallery.label": "La Jolla brand gallery",
      "gallery.previous": "Previous piece",
      "gallery.next": "Next piece",
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
      "cinema.eyebrow": "El carácter de un lugar",
      "cinema.title": "Una mirada más cercana a la casa.",
      "cinema.arrivalTitle": "Una primera impresión.",
      "cinema.arrivalBody": "Hiedra, toldos a rayas y una bienvenida que empieza en la puerta.",
      "cinema.balconyTitle": "Mira un poco más de cerca.",
      "cinema.balconyBody": "Un balcón de hierro. La luz del jardín. Los detalles que dan carácter a la casa.",
      "cinema.roomTitle": "Ahora, imagina tu celebración.",
      "cinema.roomBody": "Dentro, un salón lleno de luz es el punto de partida para tu celebración.",
      "cinema.label": "Vistas de la casa",
      "cinema.arrival": "La llegada",
      "cinema.balcony": "El balcón",
      "cinema.room": "El salón",
      "cinema.continue": "Explora los espacios ↓",

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
      "visit.cta": "Imaginemos su ocasión aquí",
      "visit.filmsLabel": "Breves recorridos por la casa",
      "visit.watchArrival": "La llegada · 12s",
      "visit.watchDetails": "Una mirada más cerca · 13s",
      "visit.close": "Cerrar",
      "visit.download": "Abrir el video",
      "visit.filmError": "No se pudo cargar el video. Puede abrir el archivo a continuación.",
      "visit.arrivalLabel": "La llegada a La Jolla",
      "visit.detailsLabel": "Detalles arquitectónicos de La Jolla",
      "nav.skip": "Ir al contenido",
      "nav.house": "La casa",
      "nav.occasions": "Ocasiones",
      "nav.services": "Servicios",
      "hero.photos": "Fotografías de bienvenida",
      "history.alt": "La esquina de La Jolla cubierta de hiedra, sus ventanas en arco y toldos de rayas.",
      "gallery.label": "Galería de identidad de La Jolla",
      "gallery.previous": "Pieza anterior",
      "gallery.next": "Siguiente pieza",
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
    prepareScrollWords();
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

  function initCinematicWindow() {
    const section = document.getElementById("cinema");
    if (!section) return null;
    const stage = section.querySelector(".cinema-stage");
    const frame = section.querySelector(".cinema-aperture");
    const slot = section.querySelector(".cinema-media");
    const layers = Array.from(section.querySelectorAll("[data-scene-layer]"));
    const stories = Array.from(section.querySelectorAll("[data-scene-copy]"));
    const buttons = Array.from(section.querySelectorAll("[data-scene]"));
    const videos = Array.from(section.querySelectorAll("[data-cinema-film]"));
    const positions = [.12, .57, .96];
    let trigger = null, observer = null, active = 0, loaded = false, loadController = null;
    const connection = navigator.connection;
    const saveData = !!(connection && connection.saveData);
    section.classList.add("cinema-ready");

    function select(index) {
      if (section.dataset.scene === String(index)) return;
      active = index;
      stories.forEach(function (story, i) { story.hidden = i !== index; });
      buttons.forEach(function (button, i) { button.setAttribute("aria-pressed", String(i === index)); });
      section.dataset.scene = String(index);
    }
    function staticScene(index) {
      select(index);
      layers.forEach(function (layer, i) { layer.style.opacity = i === index ? "1" : "0"; });
      stories.forEach(function (story) { story.style.opacity = "1"; story.style.transform = ""; story.style.removeProperty("--reading-progress"); });
      buttons.forEach(function (button) { button.style.removeProperty("--scene-progress"); });
      frame.style.width = index === 2 ? "100%" : "76%";
      frame.style.height = index === 2 ? slot.clientWidth * 9 / 16 + "px" : "100%";
      frame.style.borderRadius = index === 2 ? "6px" : "50% 50% 0 0";
    }
    videos.forEach(function (video) {
      let desired = 0;
      function seek() {
        if (video.readyState < 2 || video.seeking || !Number.isFinite(video.duration)) return;
        const target = Math.min(video.duration - .05, Math.max(0, desired));
        if (Math.abs(video.currentTime - target) > .035) {
          try { video.currentTime = target; } catch (_) { /* The poster remains available. */ }
        }
      }
      video.requestFrame = function (fraction) { desired = fraction * (video.duration || 5.3); seek(); };
      video.addEventListener("seeked", seek);
      video.addEventListener("loadeddata", function () {
        video.classList.add("is-decoded");
        seek();
      });
      video.addEventListener("error", function () { video.classList.remove("is-decoded"); });
    });
    function loadFilms() {
      if (loaded || !trigger || saveData) return;
      loaded = true;
      const controller = new AbortController();
      loadController = controller;
      videos.forEach(function (video) {
        let attempt = 0;
        const formats = ["mp4", "webm"].filter(function (format) { return video.canPlayType("video/" + format); });
        function tryFormat() {
          if (controller.signal.aborted || attempt >= formats.length) return;
          const format = formats[attempt++];
          // Blob URLs permit reliable backward seeking even on hosts without byte-range support.
          fetch("assets/venue/cinematic/" + video.dataset.cinemaFilm + "." + format, { signal: controller.signal })
            .then(function (response) { if (!response.ok) throw new Error("film"); return response.blob(); })
            .then(function (blob) {
              if (controller.signal.aborted) return;
              if (video.filmURL) URL.revokeObjectURL(video.filmURL);
              video.filmURL = URL.createObjectURL(blob);
              video.dataset.format = format;
              video.src = video.filmURL;
              video.preload = "auto";
              video.load();
            }).catch(function () { if (!controller.signal.aborted) tryFormat(); });
        }
        video.onerror = tryFormat;
        tryFormat();
      });
    }
    function releaseFilms() {
      if (loadController) loadController.abort();
      loadController = null;
      videos.forEach(function (video) {
        video.onerror = null; video.pause(); video.replaceChildren(); video.removeAttribute("src");
        video.classList.remove("is-decoded"); video.preload = "none"; video.load();
        if (video.filmURL) URL.revokeObjectURL(video.filmURL);
        video.filmURL = null; delete video.dataset.format;
      });
      loaded = false;
    }
    buttons.forEach(function (button, index) {
      button.addEventListener("click", function () {
        if (trigger) {
          window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * positions[index], behavior: "smooth" });
        } else { staticScene(index); }
      });
    });
    window.addEventListener("resize", function () { if (!trigger) staticScene(active); });
    staticScene(0);
    return { animate: function (gsap, ScrollTrigger) {
      // Short screens, reduced motion and data saving retain deliberate, still-image choices.
      if (saveData || window.innerHeight < 740) return null;
      section.classList.add("cinema-scroll");
      const playhead = { progress: 0 };
      function render() {
        const p = playhead.progress;
        // Covered dissolves keep the arch filled, even while a video seek is pending.
        const balcony = gsap.utils.clamp(0, 1, (p - .34) / .12);
        const room = gsap.utils.clamp(0, 1, (p - .76) / .12);
        layers[0].style.opacity = "1";
        layers[1].style.opacity = String(balcony);
        layers[2].style.opacity = String(room);
        layers[0].style.transform = "scale(" + (1.24 - Math.min(p / .38, 1) * .24) + ")";
        layers[1].style.transform = "scale(" + (1.12 - gsap.utils.clamp(0, 1, (p - .4) / .36) * .12) + ")";
        frame.style.width = (76 + room * 24) + "%";
        frame.style.height = slot.clientHeight + (slot.clientWidth * 9 / 16 - slot.clientHeight) * room + "px";
        frame.style.borderTopLeftRadius = (50 * (1 - room)) + "%";
        frame.style.borderTopRightRadius = (50 * (1 - room)) + "%";
        videos[0].requestFrame(gsap.utils.clamp(0, 1, p / .4));
        videos[1].requestFrame(gsap.utils.clamp(0, 1, (p - .4) / .38));
        select(p < .4 ? 0 : p < .82 ? 1 : 2);
        // Type and chapter traces accompany the original film timing, without changing its frames.
        const bounds = [0, .4, .82, 1];
        buttons.forEach(function (button, i) {
          button.style.setProperty("--scene-progress", String(gsap.utils.clamp(0, 1, (p - bounds[i]) / (bounds[i + 1] - bounds[i]))));
        });
        stories[active].style.setProperty("--reading-progress", String(gsap.utils.clamp(0, 1, (p - bounds[active]) / .09)));
        const entrance = active === 0 ? 1 : gsap.utils.clamp(.35, 1, (p - (active === 1 ? .4 : .82)) / .07);
        stories[active].style.opacity = "1";
        stories[active].style.transform = "translateY(" + ((1 - entrance) * 12) + "px)";
      }
      const timeline = gsap.to(playhead, { progress: 1, ease: "none", onUpdate: render,
        scrollTrigger: { id: "cinematic-arch", trigger: section, pin: stage,
          start: function () { return "top " + document.getElementById("header").offsetHeight; },
          end: function () { return "+=" + Math.round(window.innerHeight * (window.innerWidth < 650 ? 1.05 : 1.5)); },
          scrub: .25, invalidateOnRefresh: true, onRefresh: render,
          onEnter: loadFilms, onEnterBack: loadFilms
        }
      });
      trigger = timeline.scrollTrigger;
      observer = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) loadFilms();
      }, { rootMargin: "180px 0px" });
      observer.observe(section);
      render();
      return function () {
        observer.disconnect(); observer = null; trigger = null;
        section.classList.remove("cinema-scroll");
        releaseFilms();
        layers.forEach(function (layer) { layer.style.transform = ""; });
        staticScene(active);
      };
    }};
  }

  function prepareScrollWords() {
    document.querySelectorAll("[data-scroll-text]").forEach(function (element) {
      if (element.querySelector(".scroll-word")) return;
      const parts = element.textContent.split(/(\s+)/);
      const count = parts.filter(function (part) { return part.trim(); }).length;
      let index = 0;
      element.replaceChildren();
      parts.forEach(function (part) {
        if (!part.trim()) { element.append(document.createTextNode(part)); return; }
        const word = document.createElement("span");
        word.className = "scroll-word"; word.textContent = part;
        word.style.setProperty("--word-step", String(index++ / Math.max(1, count - 1)));
        element.append(word);
      });
    });
  }

  function initStory(cinema) {
    if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;
    prepareScrollWords();
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add({ desktop: "(min-width: 901px)", mobile: "(max-width: 900px)", tall: "(min-height: 740px)", reduced: "(prefers-reduced-motion: reduce)" }, function (context) {
      if (context.conditions.reduced) return;
      document.documentElement.classList.add("has-gsap");
      // The entrance has restrained depth, without pinning or changing photos on scroll.
      gsap.fromTo(document.querySelector(".reel-shots"), { "--arrival-depth": "0px" }, {
        "--arrival-depth": "-12px", ease: "none",
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
      });
      // Letterforms breathe independently while the offer and inquiry stay readable.
      gsap.fromTo(".title-letter", { y: 14, opacity: .65 }, { y: 0, opacity: 1,
        duration: .8, stagger: .045, ease: "power2.out" });
      gsap.to(".arrival-title .title-line", { x: function (i) { return i ? 10 : -10; },
        y: -8, ease: "none", scrollTrigger: { id: "arrival-type", trigger: "#hero",
          start: "top top", end: "bottom 35%", scrub: .35 } });
      // Register the upstream pin before downstream text/photo triggers so their positions include its space.
      const disposeCinema = cinema && cinema.animate(gsap, ScrollTrigger);
      gsap.fromTo(".paths-decoration", { y: 14, rotation: -4 }, { y: 0, rotation: 0, ease: "none",
        scrollTrigger: { trigger: "#possibilities", start: "top 90%", end: "top 45%", scrub: .35 } });
      // Aligned photographic layers reveal detail without displaced copies of the facade.
      document.querySelectorAll(".path-art").forEach(function (art) {
        gsap.set(art.querySelector(".path-photo"), { opacity: .75 });
        gsap.fromTo(art.querySelectorAll(".photo-shard"), { opacity: 0 }, {
          opacity: 1, stagger: .12, ease: "none",
          scrollTrigger: { trigger: art, start: "top 95%", end: "top 48%", scrub: .35 } });
        // Every layer shares one camera move, preserving alignment throughout the reveal.
        gsap.fromTo(art.querySelector(".path-composition"), { scale: 1.045 }, {
          scale: 1, ease: "none", scrollTrigger: { trigger: art,
            start: "top 95%", end: "top 48%", scrub: .35 } });
      });
      document.querySelectorAll("[data-scroll-text]:not(.cinema-story *)").forEach(function (text) {
        gsap.fromTo(text, { "--reading-progress": 0 }, { "--reading-progress": 1,
          ease: "none", scrollTrigger: { trigger: text, start: "top 90%", end: "top 52%", scrub: .3 } });
      });
      gsap.fromTo(".history-year", { y: 24, opacity: .65 }, { y: 0, opacity: 1, ease: "none",
        scrollTrigger: { trigger: ".history-stage", start: "top 90%", end: "top 45%", scrub: .35 } });
      gsap.fromTo(".history-photo", { y: 24, scale: .97 }, { y: 0, scale: 1, ease: "none",
        scrollTrigger: { trigger: ".history-stage", start: "top 90%", end: "top 40%", scrub: .35 } });
      document.querySelectorAll(".venue-essay .venue-detail").forEach(function (photo, i) {
        gsap.fromTo(photo, { y: [24, 38, 52][i], scale: .97 }, {
          y: 0, scale: 1, ease: "none", scrollTrigger: { trigger: photo,
            start: "top 92%", end: "top 45%", scrub: .4 } });
      });
      // Original architecture and brand artwork retain their complete views.
      var alcazarVisual = document.querySelector("#alcazar");
      const alcazarMark = alcazarVisual.querySelector(".alcazar-visual img");
      gsap.fromTo(alcazarMark, { scale: .94 }, { scale: 1, ease: "none",
        scrollTrigger: { trigger: alcazarVisual, start: "top 80%", end: "bottom 55%", scrub: true }
      });
      gsap.fromTo(alcazarVisual, { "--light-x": "-10%" }, { "--light-x": "16%", ease: "none",
        scrollTrigger: { trigger: alcazarVisual, start: "top bottom", end: "bottom top", scrub: true }
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
      return function () { if (disposeCinema) disposeCinema(); document.documentElement.classList.remove("has-gsap"); };
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
    const inquiry = target.id === "quote";
    // Native positioning honors scroll-padding and avoids stale coordinates during an interrupted scroll.
    target.scrollIntoView({ block: "start", behavior: reduced || inquiry ? "instant" : "smooth" });
    if (inquiry) {
      const title = document.getElementById("quote-title");
      title.setAttribute("tabindex", "-1");
      title.focus({ preventScroll: true });
    }
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
    const viewer = document.getElementById("film-viewer");
    if (!viewer || typeof viewer.showModal !== "function") return;
    const film = viewer.querySelector("video");
    const status = viewer.querySelector(".venue-film-status");
    const fileLink = viewer.querySelector(".venue-film-link");
    const choices = Array.from(viewer.querySelectorAll("[data-film]"));
    const media = {
      arrival: { stem: "arrival", poster: "arrival-poster", label: "visit.arrivalLabel" },
      details: { stem: "facade-details", poster: "details-poster", label: "visit.detailsLabel" }
    };
    let opener = null;
    let previousOverflow = "";
    let generation = 0;
    film.addEventListener("error", function () { status.hidden = false; });
    film.addEventListener("loadeddata", function () { status.hidden = true; });
    document.querySelectorAll("[data-film]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
        const selected = media[link.dataset.film];
        if (!selected) return;
        event.preventDefault();
        if (!viewer.open) {
          opener = link;
          previousOverflow = document.body.style.overflow;
          viewer.showModal();
          document.body.style.overflow = "hidden";
          if (window.__ljLenis) window.__ljLenis.stop();
        }
        film.pause();
        film.replaceChildren();
        status.hidden = true;
        film.poster = "assets/venue/" + selected.poster + ".jpg";
        film.dataset.i18n = selected.label;
        film.dataset.i18nAttr = "aria-label";
        film.setAttribute("aria-label", I18N[document.documentElement.lang === "es" ? "es" : "en"][selected.label]);
        fileLink.href = link.href;
        choices.forEach(function (choice) { choice.setAttribute("aria-current", String(choice.dataset.film === link.dataset.film)); });
        const request = ++generation;
        let failed = 0;
        ["mp4", "webm"].forEach(function (format) {
          const source = document.createElement("source");
          source.src = "assets/venue/" + selected.stem + "." + format;
          source.type = "video/" + format;
          source.addEventListener("error", function () {
            if (request === generation && ++failed === 2) status.hidden = false;
          });
          film.appendChild(source);
        });
        film.load();
        // Playback follows this explicit click, including when reduced motion is enabled.
        film.play().catch(function () { /* Native controls allow a retry if playback is restricted. */ });
      });
    });
    viewer.addEventListener("keydown", function (event) {
      if (event.key !== "Tab") return;
      const focusable = Array.from(viewer.querySelectorAll("button, video, a[href]"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
    viewer.querySelector(".film-close").addEventListener("click", function () { viewer.close(); });
    viewer.addEventListener("click", function (event) {
      const box = viewer.getBoundingClientRect();
      if (event.target === viewer && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) viewer.close();
    });
    viewer.addEventListener("close", function () {
      film.pause();
      ++generation;
      film.replaceChildren();
      film.removeAttribute("src");
      film.load();
      status.hidden = true;
      document.body.style.overflow = previousOverflow;
      if (window.__ljLenis) window.__ljLenis.start();
      if (opener) opener.focus({ preventScroll: true });
    });
    document.addEventListener("visibilitychange", function () { if (document.hidden) film.pause(); });
  }

  function initPhotoCollections() {
    const reel = document.querySelector(".arrival-visual");
    const shots = Array.from(reel.querySelectorAll(".reel-shot"));
    const beats = Array.from(reel.querySelectorAll(".reel-beat"));
    const controls = Array.from(reel.querySelectorAll("[data-shot]"));
    let previousShot = 0;
    function selectShot(index) {
      shots.forEach(function (shot, i) {
        shot.classList.toggle("is-current", i === index);
        shot.classList.toggle("is-under", i === previousShot && i !== index);
        shot.setAttribute("aria-hidden", String(i !== index));
        beats[i].hidden = i !== index;
        controls[i].setAttribute("aria-pressed", String(i === index));
      });
      reel.querySelector(".reel-index").textContent = "0" + (index + 1) + " / 04";
      previousShot = index;
    }
    selectShot(0);
    reel.classList.add("photos-ready");
    controls.forEach(function (button) {
      button.addEventListener("click", function () { selectShot(Number(button.dataset.shot)); });
    });
    // A small change of light follows the pointer, never the scroll position.
    reel.addEventListener("pointermove", function (event) {
      if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const box = reel.getBoundingClientRect();
      reel.style.setProperty("--frame-x", ((event.clientX - box.left) / box.width - .5) * 8 + "px");
      reel.style.setProperty("--frame-y", ((event.clientY - box.top) / box.height - .5) * 8 + "px");
    });
    function resetFrame() { reel.style.setProperty("--frame-x", "0px"); reel.style.setProperty("--frame-y", "0px"); }
    reel.addEventListener("pointerleave", resetFrame);
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", resetFrame);

    const gallery = document.querySelector("#gallery");
    const track = gallery.querySelector(".brand-track");
    const cards = Array.from(track.querySelectorAll(".brand-card"));
    const previous = gallery.querySelector(".gallery-prev");
    const next = gallery.querySelector(".gallery-next");
    let current = 0;
    function updateGallery() {
      const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
      current = Math.min(cards.length - 1, Math.max(0, Math.round(track.scrollLeft / step)));
      previous.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
      gallery.querySelector(".gallery-position").textContent = "0" + (current + 1) + " / 07";
    }
    function moveGallery(direction) {
      const target = Math.min(cards.length - 1, Math.max(0, current + direction));
      track.scrollTo({ left: cards[target].offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
    previous.addEventListener("click", function () { moveGallery(-1); });
    next.addEventListener("click", function () { moveGallery(1); });
    track.addEventListener("scroll", updateGallery, { passive: true });
    window.addEventListener("resize", updateGallery);
    gallery.classList.add("gallery-ready");
    updateGallery();
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
    initPhotoCollections();
    initInquiryComposer();
    initChapterMenu();
    // Resolve selection and menu layout before positioning or focusing an anchor.
    initStory(initCinematicWindow());
    initVenueFilms();
    initLocalForm("quote-form", "form-success", "form-error", "form-send-error", "La Jolla inquiry");
    initLocalForm("vendor-form", "vendor-success", "vendor-error", "vendor-send-error", "La Jolla vendor");
    initYear();
  });
})();

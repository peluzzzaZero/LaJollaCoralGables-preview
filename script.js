/* La Jolla Coral Gables — page script.
   Scroll: GSAP ScrollTrigger with native scrolling and a readable static fallback.
   Forms post through Web3Forms. No Stripe. */

(function () {
  "use strict";

  const I18N = {
    en: {
      "motion.team.body": "Julie Arias, Executive Director, and Patricia Mir, Managing Director. A personal team to help you shape your occasion.",
      "motion.details.body": "From the welcome at the table to the smallest finishing touch. Discover the details that give La Jolla its character.",
      "motion.close": "Close details",
      "motion.more": "Discover more",
      "journey.title": "The house. Your occasion. A world of possibilities.",
      "journey.label": "Explore the story",
      "journey.place.kicker": "The house",
      "journey.place.title": "A historic house. A personal welcome.",
      "journey.place.body": "Mediterranean arches, ivy and garden light, since 1928. Find La Jolla at 301 Alcazar Avenue, in the heart of Coral Gables.",
      "journey.place.link": "Discover the house",
      "journey.occasion.kicker": "Your occasion",
      "journey.occasion.title": "Make room for your occasion.",
      "journey.occasion.body": "Weddings, celebrations, private dinners and corporate gatherings in our light-filled ballroom. Shape the setting around your guests.",
      "journey.occasion.link": "Explore occasions",
      "journey.lexington.kicker": "The Lexington",
      "journey.lexington.title": "A more intimate setting.",
      "journey.lexington.body": "Our upstairs lounge, in deep greens, wine tones and warm golds. The Lexington welcomes cocktails, private dinners and smaller gatherings.",
      "journey.lexington.link": "Meet The Lexington",
      "journey.beyond.kicker": "Beyond the house",
      "journey.beyond.title": "Your vision. Your location.",
      "journey.beyond.body": "Rentals, design and production throughout South Florida. Furniture, lighting, florals and tableware, brought together for the location you choose.",
      "journey.beyond.link": "Explore services",
      "journey.finale.kicker": "Imagine the possibilities",
      "journey.finale.title": "Let's plan something memorable.",
      "journey.finale.body": "At La Jolla or beyond. Tell us your occasion, your date and your ideas; we will help you explore the possibilities.",
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
      "form.sending": "Sending inquiry…",
      "form.emailDraft": "Email this inquiry",
      "form.emailHelp": "Your email app will open with your details. Please send the email to complete your inquiry.",
      "form.bookingNotice": "Your preferred event date is a request. Availability and visits are confirmed by our team.",
      "form.rateLimit": "Please wait before trying again, or email your inquiry below.",
      "form.networkError": "The connection was interrupted. Your details are still here. You can retry or email your inquiry below.",
      "form.providerError": "Online sending is unavailable. Your details are still here. Please email your inquiry below or call 786-290-8813.",

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
      "motion.team.body": "Julie Arias, directora ejecutiva, y Patricia Mir, directora general. Un equipo cercano que le ayudará a dar forma a su celebración.",
      "motion.details.body": "Desde la bienvenida en la mesa hasta el último toque. Descubra los detalles que dan carácter a La Jolla.",
      "motion.close": "Cerrar detalles",
      "motion.more": "Descubra más",
      "journey.title": "La casa. Su celebración. Un mundo de posibilidades.",
      "journey.label": "Explore la historia",
      "journey.place.kicker": "La casa",
      "journey.place.title": "Una casa histórica. Una bienvenida personal.",
      "journey.place.body": "Arcos mediterráneos, hiedra y luz de jardín desde 1928. Encuentre La Jolla en el 301 de Alcazar Avenue, en el corazón de Coral Gables.",
      "journey.place.link": "Descubra la casa",
      "journey.occasion.kicker": "Su celebración",
      "journey.occasion.title": "Un espacio para su celebración.",
      "journey.occasion.body": "Bodas, celebraciones, cenas privadas y encuentros corporativos en nuestro salón lleno de luz. Un espacio pensado alrededor de sus invitados.",
      "journey.occasion.link": "Explore las celebraciones",
      "journey.lexington.kicker": "The Lexington",
      "journey.lexington.title": "Un ambiente más íntimo.",
      "journey.lexington.body": "Nuestro salón en la planta superior, entre verdes profundos, tonos vino y dorados cálidos. The Lexington acoge cócteles, cenas privadas y encuentros íntimos.",
      "journey.lexington.link": "Conozca The Lexington",
      "journey.beyond.kicker": "Más allá de la casa",
      "journey.beyond.title": "Su idea. Su espacio.",
      "journey.beyond.body": "Alquileres, diseño y producción en el sur de Florida. Mobiliario, iluminación, flores y vajilla para dar forma al lugar que elija.",
      "journey.beyond.link": "Explore los servicios",
      "journey.finale.kicker": "Imagine las posibilidades",
      "journey.finale.title": "Planeemos algo memorable.",
      "journey.finale.body": "En La Jolla o en el lugar que elija. Cuéntenos la ocasión, la fecha y sus ideas; le ayudaremos a explorar las posibilidades.",
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
      "form.sending": "Enviando solicitud…",
      "form.emailDraft": "Enviar esta solicitud por correo",
      "form.emailHelp": "Se abrirá su aplicación de correo con sus datos. Envíe el mensaje para completar la solicitud.",
      "form.bookingNotice": "La fecha de evento indicada es una solicitud. Nuestro equipo confirma disponibilidad y visitas.",
      "form.rateLimit": "Espere antes de volver a intentarlo o envíe su solicitud por correo a continuación.",
      "form.networkError": "La conexión se interrumpió. Sus datos siguen aquí. Puede reintentar o enviar su solicitud por correo a continuación.",
      "form.providerError": "El envío en línea no está disponible. Sus datos siguen aquí. Envíe su solicitud por correo a continuación o llame al 786-290-8813.",

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
  const allowedServices = ["planning", "catering", "florals", "furniture", "photo", "entertainment", "av", "builds", "interactive", "staff"];
  let inquiryContext = { type: "", location: "" };
  try {
    const saved = JSON.parse(sessionStorage.getItem("lajolla-inquiry") || "{}");
    (saved.services || []).filter(id => allowedServices.includes(id)).forEach(id => selectedServices.add(id));
    inquiryContext = { type: typeof saved.type === "string" ? saved.type : "", location: typeof saved.location === "string" ? saved.location : "" };
  } catch (_) { /* Direct contact and forms work without browser storage. */ }
  function saveInquiryContext() {
    try { sessionStorage.setItem("lajolla-inquiry", JSON.stringify({ services: Array.from(selectedServices), type: inquiryContext.type, location: inquiryContext.location })); } catch (_) {}
  }

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
      if (window.ScrollTrigger && !document.body.classList.contains("reading-details")) window.ScrollTrigger.refresh();
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
    const stories = Array.from(section.querySelectorAll("[data-scene-copy]"));
    const details = Array.from(section.querySelectorAll("[data-scene-detail]"));
    const buttons = Array.from(section.querySelectorAll("[data-scene]"));
    const videos = Array.from(section.querySelectorAll("[data-cinema-film]"));
    const layers = Array.from(section.querySelectorAll("[data-film-layer]"));
    const positions = [.035, .155, .265, .375, .485, .595, .705, .815, .965];
    // Every chapter has a reading interval; the gaps deliberately leave only the film.
    const chapters = [[0, .10], [.12, .21], [.23, .32], [.34, .43], [.45, .54], [.56, .65], [.67, .76], [.78, .87], [.92, 1.01]];
    const films = [[0, .34], [.34, .67], [.67, .90]];
    const filmStates = videos.map(function () { return { loaded: false, controller: null }; });
    let trigger = null, observer = null, nearby = false;
    const saveData = !!(navigator.connection && navigator.connection.saveData);

    function setAvailable(element, available) {
      element.hidden = !available;
      element.inert = !available;
    }
    function resetPresentation() {
      section.dataset.scene = "all";
      delete section.dataset.film;
      section.style.removeProperty("--chapter-ink");
      layers.forEach(function (layer) { layer.style.opacity = ""; });
      stories.concat(details).forEach(function (element) {
        setAvailable(element, true); element.style.opacity = ""; element.style.transform = "";
      });
      buttons.forEach(function (button) { button.setAttribute("aria-pressed", "false"); button.style.removeProperty("--scene-progress"); });
    }
    videos.forEach(function (video) {
      let desired = 0;
      function seek() {
        if (video.readyState < 2 || video.seeking || !Number.isFinite(video.duration)) return;
        const target = Math.min(video.duration - .001, Math.max(0, desired * video.duration));
        if (Math.abs(video.currentTime - target) > .012) {
          try { video.currentTime = target; } catch (_) { /* The poster remains available. */ }
        }
      }
      video.requestFrame = function (fraction) { desired = fraction; seek(); };
      video.addEventListener("seeked", seek);
      video.addEventListener("loadeddata", function () {
        video.classList.add("is-decoded");
        seek();
      });
      video.addEventListener("error", function () { video.classList.remove("is-decoded"); });
    });
    function loadFilm(index) {
      if (!trigger || saveData || !videos[index] || filmStates[index].loaded) return;
      const state = filmStates[index], video = videos[index];
      state.loaded = true;
      const controller = new AbortController();
      state.controller = controller;
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
    }
    function releaseFilms() {
      videos.forEach(function (video, index) {
        const state = filmStates[index];
        if (state.controller) state.controller.abort();
        state.controller = null; state.loaded = false;
        video.onerror = null; video.pause(); video.replaceChildren(); video.removeAttribute("src");
        video.classList.remove("is-decoded"); video.preload = "none"; video.load();
        if (video.filmURL) URL.revokeObjectURL(video.filmURL);
        video.filmURL = null; delete video.dataset.format;
      });
    }
    function goTo(index, focus) {
      if (index < 0 || !stories[index]) return;
      closeChapterDetails();
      if (trigger) {
        const top = trigger.start + (trigger.end - trigger.start) * positions[index];
        window.scrollTo({ top: top, behavior: focus ? "instant" : "smooth" });
        if (focus) { trigger.update(); trigger.animation.progress(positions[index]); }
      } else stories[index].scrollIntoView({ behavior: "auto", block: "start" });
      if (focus) {
        stories[index].setAttribute("tabindex", "-1");
        // The browser processes a native fragment after load. Focus after the rendered chapter settles.
        requestAnimationFrame(function () { requestAnimationFrame(function () {
          if (!stories[index].hidden && !stories[index].inert) stories[index].focus({ preventScroll: true });
        }); });
      }
    }
    window.__ljStory = { goTo: goTo, chapterIds: stories.map(story => story.id) };
    buttons.forEach(function (button, index) { button.addEventListener("click", function () { goTo(index, false); }); });
    function restoreHash() {
      const id = location.hash.slice(1);
      const index = stories.findIndex(story => story.id === id || (id === "possibilities" && story.id === "hero") || (id === "quote" && story.id === "planning"));
      if (index >= 0) goTo(index, true);
    }
    window.addEventListener("hashchange", restoreHash);
    window.addEventListener("load", function () { window.setTimeout(restoreHash, 100); });
    resetPresentation();
    return { animate: function (gsap, ScrollTrigger) {
      if (saveData || window.innerHeight < 600) return null;
      section.classList.add("cinema-scroll");
      const playhead = { progress: 0 };
      const clamp = gsap.utils.clamp(0, 1);
      function render() {
        const p = playhead.progress;
        const current = chapters.findIndex(function (range) { return p >= range[0] && p < range[1]; });
        section.dataset.scene = String(current);
        const range = chapters[current];
        const fade = range ? Math.min(current === 0 ? 1 : clamp((p - range[0]) / .015), current === 8 ? 1 : clamp((range[1] - p) / .025)) : 0;
        section.style.setProperty("--chapter-ink", String(fade));
        stories.forEach(function (story, i) {
          if (i !== current) { const more = story.querySelector(".chapter-more"); if (more && more.open) { more.open = false; closeChapterDetails(); } }
          setAvailable(story, i === current);
          story.style.opacity = String(fade);
          story.style.transform = "translateY(" + ((1 - fade) * 16) + "px)";
        });
        details.forEach(function (detail, i) {
          // One relevant photograph supports each reading; the finale gathers the four memories.
          const visible = current === i || (current === 8 && [0,3,4,5].includes(i));
          setAvailable(detail, visible);
          detail.style.opacity = String(fade);
          detail.style.transform = "translateY(" + ((1 - fade) * 14) + "px)";
        });
        buttons.forEach(function (button, i) {
          button.setAttribute("aria-pressed", String(i === current));
          button.style.setProperty("--scene-progress", String(clamp((p - chapters[i][0]) / (chapters[i][1] - chapters[i][0]))));
        });
        const film = p < .34 ? 0 : p < .67 ? 1 : p < .90 ? 2 : 0;
        const reprise = clamp((p - .90) / .025);
        section.dataset.film = String(film);
        videos.forEach(function (video, i) {
          const span = films[i];
          video.requestFrame(i === 0 && p >= .90 ? .8 + .2 * clamp((p - .90) / .10) : clamp((p - span[0]) / (span[1] - span[0])));
          // Fetch only the active shot and the next shot shortly before its transition.
          if (p > .002 && (nearby || (trigger && trigger.isActive)) && (i === film || (i === film + 1 && p >= span[0] - .06))) loadFilm(i);
          const opacity = i === 0 ? 1 : clamp((p - span[0] + .015) / .03);
          layers[i].style.opacity = String(i === 0 ? 1 : opacity * (1 - reprise));
        });
      }
      const timeline = gsap.to(playhead, { progress: 1, ease: "none", onUpdate: render,
        scrollTrigger: { id: "cinematic-journey", trigger: section, pin: stage,
          start: "top top",
          end: function () { return "+=" + Math.round(window.innerHeight * 10); },
          scrub: .3, invalidateOnRefresh: true, onRefresh: render,
          onEnter: render, onEnterBack: render
        }
      });
      trigger = timeline.scrollTrigger;
      observer = new IntersectionObserver(function (entries) {
        nearby = entries.some(function (entry) { return entry.isIntersecting; });
        if (nearby) render();
      }, { rootMargin: "180px 0px" });
      observer.observe(section);
      render();
      return function () {
        observer.disconnect(); observer = null; trigger = null; nearby = false;
        section.classList.remove("cinema-scroll");
        releaseFilms(); resetPresentation();
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

  function closeChapterDetails() {
    document.querySelectorAll(".chapter-more[open]").forEach(more => { more.open = false; });
    document.body.classList.remove("reading-details");
  }
  function initChapterDetails() {
    document.querySelectorAll(".chapter-more").forEach(function (more) {
      const close = document.createElement("button");
      close.type = "button"; close.className = "chapter-close"; close.dataset.i18n = "motion.close";
      close.textContent = I18N[lang]["motion.close"];
      more.querySelector(".chapter-body").prepend(close);
      close.addEventListener("click", function () { closeChapterDetails(); more.querySelector("summary").focus({ preventScroll: true }); });
      more.addEventListener("toggle", function () {
        if (more.open) {
          document.querySelectorAll(".chapter-more").forEach(other => { if (other !== more) other.open = false; });
        }
        document.body.classList.toggle("reading-details", !!document.querySelector(".cinema-scroll .chapter-more[open]"));
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !document.querySelector("dialog[open]")) { const more = document.querySelector(".chapter-more[open]"); if (more) { closeChapterDetails(); more.querySelector("summary").focus({ preventScroll: true }); } }
    });
  }
  function initStory(cinema) {
    if (window.gsap && window.ScrollTrigger && cinema) {
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference) and (min-height: 600px)", function () {
        const dispose = cinema.animate(gsap, ScrollTrigger);
        ScrollTrigger.refresh();
        return function () { closeChapterDetails(); if (dispose) dispose(); };
      });
      window.addEventListener("load", function () { ScrollTrigger.refresh(); });
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    document.addEventListener("click", function (event) {
      const link = event.target.closest && event.target.closest("a[href^='#']");
      if (!link) return;
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) return;
      event.preventDefault();
      scrollToSection(target);
    });
  }

  function scrollToSection(target) {
    if (!target) return;
    if (window.__ljStory) {
      const index = window.__ljStory.chapterIds.indexOf(target.id);
      if (index >= 0) { history.replaceState(null, "", "#" + target.id); window.__ljStory.goTo(index, true); return; }
    }
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
    saveInquiryContext();
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
    if (type && Array.from(type.options).some(o => o.value === inquiryContext.type)) type.value = inquiryContext.type;
    if (location && Array.from(location.options).some(o => o.value === inquiryContext.location)) location.value = inquiryContext.location;
    document.querySelectorAll("[data-service-id]").forEach(function (button) {
      button.disabled = false;
      button.addEventListener("click", function () {
        const position = button.getBoundingClientRect().top;
        const id = button.dataset.serviceId;
        if (selectedServices.has(id)) selectedServices.delete(id);
        else selectedServices.add(id);
        if (selectedServices.size && !inquiryContext.type) inquiryContext.type = "rental";
        if (type && !type.value && selectedServices.size) type.value = "rental";
        renderInquirySelection();
        const shift = button.getBoundingClientRect().top - position;
        const chapter = button.closest(".cinema-scroll .cinema-story");
        if (Math.abs(shift) > 1) {
          if (chapter) chapter.scrollTop += shift;
          else window.scrollBy({ top: shift, behavior: "instant" });
        }
        // Choices expand inside the reader; they do not change the film timeline's document height.
        if (!chapter && window.ScrollTrigger) window.ScrollTrigger.refresh();
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
        if (window.ScrollTrigger && !document.body.classList.contains("reading-details")) window.ScrollTrigger.refresh();
      }
      const occasion = event.target.closest && event.target.closest("[data-event-type]");
      if (occasion) {
        inquiryContext.type = occasion.dataset.eventType; inquiryContext.location = "la-jolla";
        if (type) type.value = occasion.dataset.eventType;
        if (location) location.value = "la-jolla";
        renderInquirySelection();
      }
      const path = event.target.closest && event.target.closest("[data-inquiry-location]");
      if (path) {
        inquiryContext.location = path.dataset.inquiryLocation;
        if (location) location.value = path.dataset.inquiryLocation;
        renderInquirySelection();
      }
      const vendorLink = event.target.closest && event.target.closest("a[href='#vendors']");
      if (vendorLink) document.getElementById("vendor-details").open = true;
    });
    if (type) type.addEventListener("change", function () { inquiryContext.type = type.value; renderInquirySelection(); });
    if (location) location.addEventListener("change", function () { inquiryContext.location = location.value; renderInquirySelection(); });
    const form = document.getElementById("quote-form");
    if (form) form.addEventListener("reset", function () {
      selectedServices.clear(); inquiryContext = { type: "", location: "" }; saveInquiryContext();
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
      return res.json().catch(function () {
        const error = new Error("mail");
        error.status = res.status;
        throw error;
      }).then(function (data) {
        if (!res.ok || (data.success !== true && data.success !== "true")) {
          // Keep diagnostics free of submitted contact data and provider echoes.
          const error = new Error("mail");
          error.status = res.status;
          throw error;
        }
        return data;
      });
    }).finally(function () { window.clearTimeout(timeout); });
  }

  function formText(key) { return (I18N[lang] || I18N.en)[key] || I18N.en[key]; }

  function inquiryDraft(form, subject) {
    const lines = [subject, ""];
    Array.prototype.forEach.call(form.elements, function (field) {
      if (!field.name || field.type === "submit" || field.type === "button" || field.type === "hidden") return;
      const value = String(field.value || "").trim();
      if (!value) return;
      const label = form.querySelector('label[for="' + field.id + '"]');
      const title = label ? label.textContent.trim().replace(/\s+/g, " ") : field.name;
      const text = field.tagName === "SELECT" ? field.options[field.selectedIndex].textContent.trim() : value;
      lines.push(title + ": " + text);
    });
    const services = form.querySelector('[name="selectedServices"]');
    if (services && services.value) lines.push(formText("selection.title") + ": " + services.value);
    return "mailto:info@lajollacoralgables.com?subject=" + encodeURIComponent(subject)
      + "&body=" + encodeURIComponent(lines.join("\n"));
  }

  function initLocalForm(formId, successId, errorId, sendErrorId, subject) {
    const form = document.getElementById(formId);
    if (!form) return;
    const success = document.getElementById(successId);
    const error = document.getElementById(errorId);
    const sendError = document.getElementById(sendErrorId);
    const recovery = form.querySelector(".inquiry-recovery");
    const draft = form.querySelector(".inquiry-email-draft");
    if (draft) draft.addEventListener("click", function () {
      // Build only on an explicit click; no personal details in page links/storage.
      draft.href = inquiryDraft(form, subject);
      window.setTimeout(function () { draft.href = "mailto:info@lajollacoralgables.com"; }, 0);
    });
    const required = form.querySelectorAll("[required]");
    const submit = form.querySelector("[type='submit']");
    const submitLabel = submit && submit.dataset.i18n;
    let sending = false;
    // The default submit button stays disabled if the page script fails to load.
    if (submit) submit.disabled = false;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return;
      if (success) success.hidden = true;
      if (error) error.hidden = true;
      if (sendError) sendError.hidden = true;
      if (recovery) recovery.hidden = true;

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
      if (submit) { submit.disabled = true; submit.dataset.i18n = "form.sending"; submit.textContent = formText("form.sending"); }

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
      }).catch(function (failure) {
        const status = Number(failure.status) || 0;
        const key = status === 429 ? "form.rateLimit" : status ? "form.providerError" : "form.networkError";
        if (sendError) {
          sendError.dataset.i18n = key;
          sendError.textContent = formText(key);
          sendError.dataset.deliveryStatus = String(status);
          sendError.hidden = false;
          sendError.scrollIntoView({ behavior: "auto", block: "nearest" });
        }
        // HTTP status only: never log the provider's response/data, which echoes PII.
        form.dispatchEvent(new CustomEvent("inquiry-delivery-error", { bubbles: true, detail: { status: status } }));
        if (recovery) recovery.hidden = false;
      }).then(function () {
        sending = false;
        form.removeAttribute("aria-busy");
        if (submit) { submit.disabled = false; submit.dataset.i18n = submitLabel; submit.textContent = formText(submitLabel); }
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
          if (window.ScrollTrigger && !document.body.classList.contains("reading-details")) window.ScrollTrigger.refresh();
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
    const gallery = document.querySelector("#gallery");
    if (!gallery) return;
    const track = gallery.querySelector(".brand-track");
    if (!track) return;
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
    const disclosure = track.closest(".chapter-more");
    if (disclosure) disclosure.addEventListener("toggle", function () { if (disclosure.open) requestAnimationFrame(updateGallery); });
    window.addEventListener("resize", updateGallery);
    gallery.classList.add("gallery-ready");
    updateGallery();
  }

  function initPhotoViewer() {
    const viewer = document.getElementById("photo-viewer");
    if (!viewer || !viewer.showModal) return;
    const image = viewer.querySelector("img"), caption = viewer.querySelector(".photo-caption");
    let opener = null;
    document.querySelectorAll("[data-photo-view]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
        event.preventDefault(); opener = link;
        const source = link.querySelector("img");
        image.src = source.src; image.alt = source.alt;
        caption.textContent = source.alt;
        viewer.showModal(); document.body.classList.add("photo-open");
      });
    });
    viewer.addEventListener("keydown", function (event) {
      if (event.key === "Tab") { event.preventDefault(); viewer.querySelector(".photo-close").focus(); }
    });
    viewer.querySelector(".photo-close").addEventListener("click", function () { viewer.close(); });
    viewer.addEventListener("close", function () {
      document.body.classList.remove("photo-open"); image.removeAttribute("src");
      if (opener && !opener.hidden) opener.focus({ preventScroll: true });
    });
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
    initPhotoViewer();
    initInquiryComposer();
    initChapterMenu();
    initChapterDetails();
    // Resolve selection and menu layout before positioning or focusing an anchor.
    initStory(initCinematicWindow());
    initVenueFilms();
    initLocalForm("quote-form", "form-success", "form-error", "form-send-error", "La Jolla inquiry");
    initLocalForm("vendor-form", "vendor-success", "vendor-error", "vendor-send-error", "La Jolla vendor");
    initYear();
    if (document.body.classList.contains("planning-page")) {
      const title = document.getElementById("quote-title");
      title.setAttribute("tabindex", "-1"); title.focus({ preventScroll: true });
      function openPlanningAnchor() {
        if (location.hash === "#vendors") {
          document.getElementById("vendor-details").open = true;
          document.getElementById("vendors").scrollIntoView({ block: "start" });
        }
      }
      window.addEventListener("hashchange", openPlanningAnchor);
      openPlanningAnchor();
    }
  });
})();

/* La Jolla Coral Gables — page script.
   Scroll: GSAP ScrollTrigger with native scrolling and a readable static fallback.
   Visits are scheduled through Microsoft Bookings. */

(function () {
  "use strict";

  const I18N = {
    en: {

      "motion.head.history": "Coral Gables.",
      "motion.head.visit": "The ballroom.",
      "motion.head.events": "Your occasion.",
      "motion.head.alcazar": "The Lexington.",
      "motion.head.rentals": "Beyond the house.",
      "motion.head.gallery": "Design & details.",
      "motion.head.team": "Our team.",
      "motion.head.planning": "Let’s begin.",
      "motion.hero": "Weddings, private gatherings and event services in Coral Gables and throughout South Florida.",
      "motion.alcazar": "An upstairs lounge for cocktails, private dinners and smaller gatherings.",
      "motion.final": "Schedule a visit to explore the house and discuss your occasion with our team.",
      "motion.index": "Chapters",
      "motion.link.history": "About the house",
      "motion.link.visit": "See the spaces",
      "motion.link.events": "Explore occasions",
      "motion.link.alcazar": "Explore The Lexington",
      "motion.link.rentals": "View services",
      "motion.link.gallery": "Explore the details",
      "motion.link.team": "Meet the team",

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
      "journey.finale.kicker": "Your occasion",
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
      "nav.menu": "Explore La Jolla",
      "form.planning": "Schedule a visit",

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
      "hero.offer": "Weddings, private gatherings and event services in Coral Gables and throughout South Florida.",
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
      "quote.eyebrow": "An invitation",
      "quote.title": "Come see the house",
      "quote.intro": "Choose an available time for a venue tour.",
      "booking.title": "Come see the house",
      "booking.intro": "Choose an available time for a venue tour.",
      "booking.open": "Schedule a visit",
      "booking.separate": "A tour appointment does not reserve a space for an event.",
      "booking.dialogTitle": "Schedule your visit",
      "booking.help": "Select a date and time in the calendar. Your visit is confirmed when Bookings completes the reservation. Check the time zone shown before booking.",
      "booking.close": "Close booking calendar",
      "booking.frameTitle": "La Jolla venue tour booking calendar",
      "booking.fallback": "If the calendar does not load,",
      "booking.external": "open the booking page in a new tab",
      "footer.tag": "Coral Gables · Est. 1928",
      "footer.managed": "Managed by Epic Lux Management",
      "footer.contact": "Contact",
      "footer.address": "301 Alcazar Avenue, Coral Gables",
      "footer.maps": "Find us",
      "footer.mapsLink": "Open in Google Maps",
      "footer.connect": "Connect",
      "footer.terms": "Terms",
      "footer.privacy": "Privacy",
      "motion.history": "Mediterranean arches, ivy and striped awnings. Find the house at 301 Alcazar Avenue.",
      "motion.visit": "A light-filled ballroom, chandeliers and an open setting for your celebration.",
      "motion.events": "Weddings. Private dinners. Corporate gatherings. Explore the occasions we welcome.",
      "motion.lexington": "The Lexington. An intimate setting for private gatherings, dining and shared moments.",
      "motion.rentals": "Furniture, florals, tableware, lighting and production. At La Jolla or at the location you choose.",
      "motion.gallery": "Invitations, table settings and finishing touches. Explore the La Jolla identity.",
      "motion.team": "Julie Arias and Patricia Mir. A personal approach to every occasion.",
      "motion.finale": "Your occasion. Your date. Your ideas. Let's begin.",
      "motion.nav.house": "The house",
      "motion.nav.history": "History",
      "motion.nav.inside": "Inside",
      "motion.nav.events": "Occasions",
      "motion.nav.lexington": "Lexington",
      "motion.nav.services": "Services",
      "motion.nav.details": "Details",
      "motion.nav.team": "Our team",
      "motion.nav.plan": "Your occasion",
      "footer.rights": "All rights reserved.",
    },
    es: {
      "motion.head.history": "Coral Gables.",
      "motion.head.visit": "El salón.",
      "motion.head.events": "Su ocasión.",
      "motion.head.alcazar": "The Lexington.",
      "motion.head.rentals": "Más allá de la casa.",
      "motion.head.gallery": "Diseño y detalles.",
      "motion.head.team": "Nuestro equipo.",
      "motion.head.planning": "Empecemos.",
      "motion.hero": "Bodas, encuentros privados y servicios para eventos en Coral Gables y en todo el sur de Florida.",
      "motion.alcazar": "Un lounge en la planta superior para cócteles, cenas privadas y encuentros más pequeños.",
      "motion.final": "Agende una visita para conocer la casa y hablar de su ocasión con nuestro equipo.",
      "motion.index": "Capítulos",
      "motion.link.history": "Conozca la casa",
      "motion.link.visit": "Vea los espacios",
      "motion.link.events": "Explore las ocasiones",
      "motion.link.alcazar": "Conozca The Lexington",
      "motion.link.rentals": "Vea los servicios",
      "motion.link.gallery": "Explore los detalles",
      "motion.link.team": "Conozca al equipo",


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
      "journey.finale.kicker": "Su ocasión",
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
      "nav.menu": "Explore La Jolla",
      "form.planning": "Agende una visita",

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
      "hero.offer": "Bodas, encuentros privados y servicios para eventos en Coral Gables y en todo el sur de Florida.",
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
      "quote.eyebrow": "Una invitación",
      "quote.title": "Venga a conocer la casa",
      "quote.intro": "Elija un horario disponible para visitar el espacio.",
      "booking.title": "Venga a conocer la casa",
      "booking.intro": "Elija un horario disponible para visitar el lugar.",
      "booking.open": "Agendar una visita",
      "booking.separate": "La cita para visitar el lugar no reserva un espacio para un evento.",
      "booking.dialogTitle": "Agende su visita",
      "booking.help": "Seleccione una fecha y hora en el calendario. Su visita queda confirmada cuando Bookings completa la reserva. Compruebe la zona horaria indicada antes de reservar.",
      "booking.close": "Cerrar calendario de visitas",
      "booking.frameTitle": "Calendario de visitas a La Jolla",
      "booking.fallback": "Si el calendario no carga,",
      "booking.external": "abra la página de reservas en una pestaña nueva",
      "footer.tag": "Coral Gables · Est. 1928",
      "footer.managed": "Gestionado por Epic Lux Management",
      "footer.contact": "Contacto",
      "footer.address": "301 Alcazar Avenue, Coral Gables",
      "footer.maps": "Cómo llegar",
      "footer.mapsLink": "Abrir en Google Maps",
      "footer.connect": "Conectar",
      "footer.terms": "Términos",
      "footer.privacy": "Privacidad",
      "motion.history": "Arcos mediterráneos, hiedra y toldos a rayas. Encuentre la casa en 301 Alcazar Avenue.",
      "motion.visit": "Un salón lleno de luz, lámparas de araña y un espacio abierto para su celebración.",
      "motion.events": "Bodas. Cenas privadas. Encuentros de empresa. Explore las ocasiones que recibimos.",
      "motion.lexington": "The Lexington. Un ambiente íntimo para reuniones privadas, cenas y momentos compartidos.",
      "motion.rentals": "Mobiliario, flores, menaje, iluminación y producción. En La Jolla o en el lugar que usted elija.",
      "motion.gallery": "Invitaciones, mesas y los detalles finales. Explore la identidad de La Jolla.",
      "motion.team": "Julie Arias y Patricia Mir. Una atención personal para cada celebración.",
      "motion.finale": "Tu celebración. Tu fecha. Tus ideas. Empecemos.",
      "motion.nav.house": "La casa",
      "motion.nav.history": "Historia",
      "motion.nav.inside": "Espacios",
      "motion.nav.events": "Celebraciones",
      "motion.nav.lexington": "Lexington",
      "motion.nav.services": "Servicios",
      "motion.nav.details": "Detalles",
      "motion.nav.team": "Equipo",
      "motion.nav.plan": "Su ocasión",
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
    prepareScrollWords();
    window.dispatchEvent(new Event("lajolla-language"));
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
    const chapters = [[0, .10], [.12, .21], [.23, .32], [.34, .43], [.45, .54], [.56, .65], [.67, .76], [.78, .87], [.92, 1.01]];
    // One camera journey; each source has its own pace and a quiet reading centre.
    const portrait = window.matchMedia("(max-width: 650px) and (orientation: portrait)");
    const portraitSegments = [
      { name: "journey", start: 0, end: .12, linger: .2 },
      { name: "architecture", start: .12, end: .22, linger: .22 },
      { name: "arrival", start: .22, end: .28, linger: .15 },
      { name: "balcony", start: .28, end: .45, linger: .15 },
      { name: "details", start: .45, end: .56, linger: .12 },
      { name: "exterior", start: .56, end: .67, linger: .12 },
      { name: "craft", start: .67, end: .78, linger: .12 },
      { name: "house", start: .78, end: 1, linger: .1 }
    ];
    // Horizontal photographs carry each desktop beat without stretching a
    // portrait recording or spreading one five-second take over seven chapters.
    // Animated originals are not represented as a captured interior walkthrough.
    const landscapeSegments = [
      { name: "journey", start: 0, end: .12, linger: .2 },
      { name: "history-wide", start: .12, end: .22, linger: .12 },
      { name: "room-wide", start: .22, end: .45, linger: .12 },
      { name: "stair-wide", start: .45, end: .56, linger: .12 },
      { name: "identity-wide", start: .56, end: .78, linger: .12 },
      { name: "house", start: .78, end: 1, linger: .1 }
    ];
    let filmSegments = portrait.matches ? portraitSegments : landscapeSegments;
    // The film carries the motion. Copy/photo treatment follows each chapter,
    // rather than replaying one entrance on every slide.
    const copyMotion = ['settle', 'fade', 'rise', 'fade', 'fade', 'rise', 'fade', 'fade', 'settle'];
    const photoMotion = ['still', 'still', 'assemble', 'still', 'still', 'drift', 'assemble', 'still'];
    stories.forEach((story, i) => { story.dataset.copyMotion = copyMotion[i]; });
    details.forEach((detail, i) => { detail.dataset.photoMotion = photoMotion[i]; });
    const filmStates = videos.map(() => ({ loaded: false, controller: null }));
    const saveData = !!(navigator.connection && navigator.connection.saveData);
    let trigger = null, observer = null, nearby = false, renderCurrent = null;
    let viewportSpan = window.innerHeight, viewportWidth = window.innerWidth, viewportHeight = window.innerHeight;
    let wideSource = window.innerWidth >= 1500;
    let userReady = false;
    const clamp = x => Math.min(1, Math.max(0, x));
    const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
    // Adapted from oso95/scroll-world (MIT): endpoint-preserving linger mapping.
    // f(0)=0 and f(1)=1, so a reading hold never drops either seam frame.
    const linger = (x, amount) => { const c = x - .5; return (1 - amount) * x + amount * (4 * c * c * c + .5); };
    const filmIndex = name => videos.findIndex(v => v.dataset.cinemaFilm === name);
    function setAvailable(element, available) { element.hidden = !available; element.inert = !available; }
    details.forEach(function (detail) {
      if (detail.querySelector('.photo-window')) return;
      const image = detail.querySelector('img');
      const frame = document.createElement('span'); frame.className = 'photo-window';
      image.before(frame); frame.append(image);
      const fragments = document.createElement('span'); fragments.className = 'photo-fragments'; fragments.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 3; i++) {
        const part = document.createElement('span'); part.className = 'photo-slice'; part.dataset.slice = String(i);
        const copy = image.cloneNode(false); copy.alt = ''; copy.removeAttribute('data-i18n'); copy.removeAttribute('data-i18n-attr'); copy.dataset.photoSource = copy.getAttribute('src'); copy.removeAttribute('src'); copy.loading = 'eager';
        part.append(copy); fragments.append(part);
      }
      frame.append(fragments);
    });
    function resetPresentation() {
      const brandMark = document.querySelector('header .logo-mark-img'); if (brandMark) brandMark.src = 'assets/brand/logo-lj-oval-sage.png';
      section.dataset.scene = 'all'; delete section.dataset.film;
      section.style.removeProperty('--chapter-ink'); section.style.removeProperty('--world-progress');
      layers.forEach(layer => { layer.style.opacity = ''; layer.style.zIndex = ''; });
      stories.concat(details).forEach(element => {
        setAvailable(element, true); element.style.opacity = ''; element.style.transform = '';
        element.style.removeProperty('--reading-progress'); element.style.removeProperty('--photo-spread');
      });
      buttons.forEach(button => { button.setAttribute('aria-pressed', 'false'); button.style.removeProperty('--scene-progress'); });
      renderCurrent = null;
    }
    function primeVideo(video) {
      if (!userReady || !portrait.matches || !video?.filmURL || video.primedURL === video.filmURL) return;
      const source = video.filmURL;
      video.primeCleanup?.(); video.primedURL = source; video.priming = true;
      let timer;
      function cleanup() { clearTimeout(timer); video.removeEventListener('playing', finish); video.priming = false; }
      function finish() {
        if (video.filmURL !== source) return;
        cleanup(); video.pause(); video.resumeSeek?.();
      }
      video.primeCleanup = cleanup;
      // WebKit may delay play() settlement during a seek. Pause on the first
      // playing event, with a bounded fallback, then restore the requested frame.
      video.addEventListener('playing', finish, { once: true });
      timer = setTimeout(finish, 120);
      try { const play = video.play(); if (play?.then) play.then(finish, finish); } catch (_) { finish(); }
    }
    function firstGesture() { userReady = true; videos.forEach(primeVideo); }
    window.addEventListener('pointerdown', firstGesture, { once: true, passive: true });
    videos.forEach(function (video) {
      let desired = 0;
      function seek() {
        if (video.priming || video.readyState < 1 || video.seeking || !Number.isFinite(video.duration)) return;
        if (!video.paused) video.pause();
        const target = Math.min(video.duration - .001, Math.max(0, desired * video.duration));
        if (Math.abs(video.currentTime - target) > .012) { try { video.currentTime = target; } catch (_) {} }
      }
      video.requestFrame = fraction => { desired = fraction; seek(); };
      video.resumeSeek = seek;
      video.addEventListener('pause', seek);
      video.addEventListener('loadedmetadata', function () { primeVideo(video); seek(); });
      video.addEventListener('seeked', function () { video.classList.add('is-decoded'); seek(); });
      video.addEventListener('loadeddata', function () { primeVideo(video); seek(); });
      video.addEventListener('error', () => video.classList.remove('is-decoded'));
    });
    function loadFilm(index) {
      if (!trigger || saveData || !videos[index] || filmStates[index].loaded) return;
      const state = filmStates[index], video = videos[index]; state.loaded = true;
      const controller = new AbortController(); state.controller = controller;
      const mobile = portrait.matches && video.dataset.cinemaMobile;
      const source = mobile || video.dataset.cinemaFilm;
      const wide = window.innerWidth >= 1500 && video.dataset.cinemaWide;
      const formats = ['mp4', 'webm'].filter(format => video.canPlayType('video/' + format));
      let attempt = 0;
      function tryFormat() {
        if (controller.signal.aborted || attempt >= formats.length) return;
        const format = formats[attempt++];
        const actualSource = wide && format === 'mp4' ? wide : source;
        fetch('assets/venue/cinematic/' + actualSource + '.' + format, { signal: controller.signal })
          .then(response => { if (!response.ok) throw new Error('film'); return response.blob(); })
          .then(blob => {
            if (controller.signal.aborted) return;
            video.primeCleanup?.();
            if (video.filmURL) URL.revokeObjectURL(video.filmURL);
            video.filmURL = URL.createObjectURL(blob); video.dataset.format = format; video.dataset.source = actualSource;
            video.src = video.filmURL; video.preload = 'auto'; video.load();
          }).catch(() => { if (!controller.signal.aborted) tryFormat(); });
      }
      video.onerror = tryFormat; tryFormat();
    }
    function releaseFilms() {
      videos.forEach(function (video, index) {
        const state = filmStates[index]; state.controller?.abort(); state.controller = null; state.loaded = false;
        video.primeCleanup?.(); video.primedURL = null;
        video.onerror = null; video.pause(); video.replaceChildren(); video.removeAttribute('src'); video.classList.remove('is-decoded'); video.preload = 'none'; video.load();
        if (video.filmURL) URL.revokeObjectURL(video.filmURL);
        video.filmURL = null; delete video.dataset.format; delete video.dataset.source;
      });
    }
    function goTo(index, focus) {
      if (index < 0 || !stories[index]) return;
      closeChapterDetails();
      const directory = section.querySelector('.cinema-directory'); if (directory) directory.open = false;
      if (trigger) {
        window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * positions[index], behavior: focus ? 'instant' : 'smooth' });
        if (focus) { trigger.update(); trigger.animation.progress(positions[index]); }
      } else stories[index].scrollIntoView({ behavior: 'auto', block: 'start' });
      if (focus) { stories[index].setAttribute('tabindex', '-1'); requestAnimationFrame(() => requestAnimationFrame(() => { if (!stories[index].hidden) stories[index].focus({ preventScroll: true }); })); }
    }
    const directory = section.querySelector('.cinema-directory');
    directory?.addEventListener('keydown', event => { if (event.key === 'Escape' && directory.open) { directory.open = false; directory.querySelector('summary').focus(); } });
    window.__ljStory = { goTo, chapterIds: stories.map(s => s.id), cameraSegments: filmSegments };
    buttons.forEach((button, index) => button.addEventListener('click', event => goTo(index, event.detail === 0)));
    function restoreHash() {
      const id = location.hash.slice(1);
      const index = stories.findIndex(story => story.id === id || (id === 'possibilities' && story.id === 'hero') || (id === 'quote' && story.id === 'planning'));
      if (index >= 0) goTo(index, true);
    }
    window.addEventListener('hashchange', restoreHash);
    window.addEventListener('load', () => window.setTimeout(restoreHash, 100));
    window.addEventListener('lajolla-language', () => { if (renderCurrent) renderCurrent(); });
    portrait.addEventListener('change', () => { filmSegments = portrait.matches ? portraitSegments : landscapeSegments; window.__ljStory.cameraSegments = filmSegments; releaseFilms(); if (renderCurrent) renderCurrent(); });
    window.addEventListener('resize', () => {
      const changedWidth = window.innerWidth !== viewportWidth;
      const changedDesktopHeight = !portrait.matches && window.innerHeight !== viewportHeight;
      viewportHeight = window.innerHeight;
      if (!changedWidth && !changedDesktopHeight) return; // Keep phone toolbar resizing stable.
      const nextWideSource = window.innerWidth >= 1500;
      if (nextWideSource !== wideSource) { wideSource = nextWideSource; releaseFilms(); }
      viewportWidth = window.innerWidth; viewportSpan = window.innerHeight;
      trigger?.refresh(); if (renderCurrent) renderCurrent();
    });
    resetPresentation();
    return { animate: function (gsap, ScrollTrigger) {
      if (saveData) return null; // Viewport/reduced-motion eligibility belongs to initStory media queries.
      section.classList.add('cinema-scroll');
      const brandMark = document.querySelector('header .logo-mark-img'); if (brandMark) brandMark.src = 'assets/brand/logo-lj-oval-cream.png';
      const playhead = { progress: 0 };
      function render() {
        const p = playhead.progress;
        const current = chapters.findIndex(range => p >= range[0] && p < range[1]);
        const range = chapters[current];
        const local = range ? clamp((p - range[0]) / (range[1] - range[0])) : 0;
        const fade = range ? Math.min(current === 0 ? 1 : smooth((p - range[0]) / .012), current === 8 ? 1 : smooth((range[1] - p) / .016)) : 0;
        if (current >= 0) {
          const number = String(current + 1).padStart(2, '0') + ' / 09'; const numberNode = section.querySelector('[data-current-number]'); if (numberNode.textContent !== number) numberNode.textContent = number;
          const label = buttons[current].querySelector('span:last-child').textContent; const labelNode = section.querySelector('[data-current-chapter]'); if (labelNode.textContent !== label) labelNode.textContent = label;
        }
        section.dataset.scene = String(current); section.style.setProperty('--chapter-ink', String(fade)); section.style.setProperty('--world-progress', String(p));
        stories.forEach(function (story, i) {
          if (i !== current) { const more = story.querySelector('.chapter-more'); if (more?.open) { more.open = false; closeChapterDetails(); } }
          setAvailable(story, i === current); story.style.opacity = String(fade);
          const lift = copyMotion[i] === 'rise' ? 14 : copyMotion[i] === 'settle' ? 6 : 0;
          story.style.transform = 'translate3d(0,' + ((1 - fade) * lift) + 'px,0)';
          story.style.setProperty('--reading-progress', String(current === 0 ? .72 + .28 * smooth(local / .5) : smooth(local / .58)));
        });
        details.forEach(function (detail, i) {
          const visible = current === i && [2,4,5,6].includes(i); setAvailable(detail, visible);
          if (visible && detail.dataset.photoMotion === 'assemble') detail.querySelectorAll('.photo-slice img').forEach(image => { if (!image.getAttribute('src')) image.src = image.dataset.photoSource; });
          const photoFade = current === 0 ? 1 : Math.min(1, fade * 1.2);
          detail.style.opacity = String(photoFade);
          detail.style.setProperty('--photo-spread', String(1 - smooth(local / .34)));
          const drift = photoMotion[i] === 'drift' ? (local - .5) * 12 : 0;
          detail.style.transform = 'translate3d(0,' + drift + 'px,0)';
        });
        buttons.forEach((button, i) => { button.setAttribute('aria-pressed', String(i === current)); button.style.setProperty('--scene-progress', String(clamp((p - chapters[i][0]) / (chapters[i][1] - chapters[i][0])))); });
        let segmentIndex = filmSegments.findIndex(segment => p >= segment.start && p < segment.end);
        if (segmentIndex < 0) segmentIndex = filmSegments.length - 1;
        const segment = filmSegments[segmentIndex], active = filmIndex(segment.name);
        section.dataset.film = String(active);
        layers.forEach(layer => { layer.style.opacity = '0'; layer.style.zIndex = '0'; });
        if (layers[active]) { layers[active].style.opacity = '1'; layers[active].style.zIndex = '1'; }
        // Adjacent clips dissolve across a small band. We never claim these
        // independently photographed views form a geometrically exact 3D take.
        for (let n = 1; n < filmSegments.length; n++) {
          const boundary = filmSegments[n].start;
          if (Math.abs(p - boundary) <= .008) {
            const from = filmIndex(filmSegments[n - 1].name), to = filmIndex(filmSegments[n].name);
            if (layers[from]) { layers[from].style.opacity = '1'; layers[from].style.zIndex = '2'; }
            if (layers[to]) { layers[to].style.opacity = String(smooth((p - boundary + .008) / .016)); layers[to].style.zIndex = '3'; }
          }
        }
        videos.forEach(function (video, i) {
          // A reused take must seek the nearest interval before its dissolve,
          // keeping the outgoing end and incoming first frame intact.
          const spans = filmSegments.filter(s => s.name === video.dataset.cinemaFilm);
          if (!spans.length) return;
          const distance = s => p < s.start ? s.start - p : p > s.end ? p - s.end : 0;
          const span = spans.reduce((a, b) => distance(a) <= distance(b) ? a : b);
          let fraction = clamp((p - span.start) / (span.end - span.start));
          fraction = linger(fraction, span.linger);
          if (span.reverse) fraction = 1 - fraction;
          video.requestFrame(fraction);
          const next = filmSegments[segmentIndex + 1];
          if (p > .002 && (nearby || trigger?.isActive) && (i === active || (next && i === filmIndex(next.name) && p > next.start - .035))) loadFilm(i);
        });
      }
      renderCurrent = render;
      const timeline = gsap.to(playhead, { progress: 1, ease: 'none', onUpdate: render,
        scrollTrigger: { id: 'cinematic-journey', trigger: section, pin: stage, start: 'top top',
          end: () => '+=' + Math.round(viewportSpan * 11), scrub: .3, invalidateOnRefresh: true,
          onRefresh: render, onEnter: render, onEnterBack: render }
      });
      trigger = timeline.scrollTrigger;
      observer = new IntersectionObserver(entries => { nearby = entries.some(entry => entry.isIntersecting); if (nearby) render(); }, { rootMargin: '180px 0px' });
      observer.observe(section); render();
      return function () { observer.disconnect(); observer = null; trigger = null; nearby = false; section.classList.remove('cinema-scroll'); releaseFilms(); resetPresentation(); };
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
      ScrollTrigger.config({ ignoreMobileResize: true });
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference) and (min-height: 600px), (prefers-reduced-motion: no-preference) and (min-width: 651px) and (min-height: 480px)", function () {
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

  function initBookingCalendar() {
    const viewer = document.getElementById("booking-viewer");
    if (!viewer || typeof viewer.showModal !== "function") return;
    const frame = viewer.querySelector("iframe");
    let opener;
    document.querySelectorAll("[data-booking-opener]").forEach(function (link) {
      link.setAttribute("aria-haspopup", "dialog");
      link.setAttribute("aria-controls", "booking-viewer");
      link.addEventListener("click", function (event) {
        // Retain native new-tab gestures and the ordinary link without JS.
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
        event.preventDefault();
        opener = link;
        viewer.showModal();
        document.body.classList.add("booking-open");
        // Load Microsoft only after an explicit request. Keep the same frame
        // across closes so an unfinished reservation is not reset.
        if (!frame.hasAttribute("src")) frame.src = link.href;
        viewer.querySelector("button").focus();
      });
    });
    viewer.querySelector(".booking-close").addEventListener("click", function () { viewer.close(); });
    viewer.addEventListener("close", function () {
      document.body.classList.remove("booking-open");
      if (opener) opener.focus({ preventScroll: true });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    let preferred = "en";
    try { if (localStorage.getItem("lajolla-language") === "es") preferred = "es"; } catch (_) { /* Storage is optional. */ }
    applyI18n(preferred);
    initHeader();
    initPhotoCollections();
    initPhotoViewer();
    initChapterMenu();
    initChapterDetails();
    // Resolve the menu layout before positioning or focusing an anchor.
    initStory(initCinematicWindow());
    initVenueFilms();
    initBookingCalendar();
    initYear();
    if (document.body.classList.contains("planning-page")) {
      const title = document.getElementById("quote-title");
      title.setAttribute("tabindex", "-1"); title.focus({ preventScroll: true });
    }
  });
})();

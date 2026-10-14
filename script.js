/* La Jolla Coral Gables — page script.
   Scroll: GSAP ScrollTrigger with native scrolling and a readable static fallback.
   Visits are scheduled through Microsoft Bookings. */

(function () {
  "use strict";

  const I18N = {
    en: {
      "social.reviewsTitle": "Guest experiences",
      "social.reviewsIntro": "Discover the house through the people who have celebrated here.",
      "social.reviewsLoad": "See selected guest reviews",
      "social.reviewsSource": "Read guest reviews on Google Maps",
      "social.profiles": "La Jolla social profiles",
      "social.houseTitle": "From the house",
      "social.houseIntro": "Follow our celebrations and the life of the house.",
      "social.instagramFollow": "See more on Instagram",
      "social.instagramOpen": "Open La Jolla on Instagram",
      "social.instagramGrid": "Photos from the house",
      "social.instagramNote": "Celebrations, details and the house",
      "social.tiktokNote": "Moments from our events",
      "social.pinterestNote": "Inspiration boards for your occasion",
      "social.facebookNote": "News and gatherings at La Jolla",
      "social.alt.facade": "The ivy-covered facade of La Jolla under a blue sky.",
      "social.alt.plaque": "A La Jolla oval sign among white flowers and a striped lamp.",
      "social.alt.evening": "The La Jolla Coral Gables mark over the ivy-covered facade.",
      "social.alt.seal": "A sage wax seal and stamp on a white envelope.",
      "social.alt.monogram": "The La Jolla monogram over deep green leaves.",
      "social.alt.suite": "A La Jolla stationery suite on sage stripes.",
      "social.facebookLoad": "See the latest Facebook posts",
      "meta.locale": "en_US",
      "meta.title.home": "Historic Wedding & Event Venue in Coral Gables | La Jolla",
      "meta.description.home": "Explore La Jolla, a historic venue in Coral Gables for weddings, private gatherings and events. Discover the spaces and schedule a venue tour.",
      "meta.title.visit": "Schedule a Venue Tour | La Jolla Coral Gables",
      "meta.description.visit": "Choose an available time to visit La Jolla in Coral Gables. Meet the team and explore the spaces. A tour appointment does not reserve an event.",
      "meta.title.privacy": "Privacy | La Jolla Coral Gables",
      "meta.description.privacy": "How La Jolla Coral Gables uses Microsoft Bookings for venue tours, and how to contact the team about information you share.",
      "meta.title.terms": "Visit Terms | La Jolla Coral Gables",
      "meta.description.terms": "Information about arranging a venue tour at La Jolla Coral Gables. Event dates and arrangements must be confirmed directly with the venue team.",
      "hero.context": " — Historic event venue in Coral Gables",

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
      "landing.explore": "Discover the house",
      "landing.arrival": "An arrival worth remembering.",
      "landing.house": "A house with a story.",
      "landing.occasion": "Make it your occasion.",
      "landing.arrive": "Arrive",
      "landing.visitReason": "A visit is the first step to finding the right setting for your occasion.",
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

      "nav.inquire": "Schedule a visit",
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
        "From individual rentals to complete event production, our services extend beyond the walls of La Jolla. Furniture, décor, tabletop, glassware, staging, production elements and more are available for events both at La Jolla and at locations throughout South Florida. Whether you're hosting with us or bringing your event to another venue, our team can provide the elements and services needed to bring your vision together. Talk with our team about rentals, custom packages and full-service event production.",
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
      "social.reviewsTitle": "Experiencias de nuestros invitados",
      "social.reviewsIntro": "Conozca la casa a través de quienes han celebrado aquí.",
      "social.reviewsLoad": "Ver una selección de reseñas",
      "social.reviewsSource": "Leer reseñas en Google Maps",
      "social.profiles": "Perfiles sociales de La Jolla",
      "social.houseTitle": "Desde la casa",
      "social.houseIntro": "Siga nuestras celebraciones y la vida de la casa.",
      "social.instagramFollow": "Vea más en Instagram",
      "social.instagramOpen": "Abrir La Jolla en Instagram",
      "social.instagramGrid": "Fotos de la casa",
      "social.instagramNote": "Celebraciones, detalles y la casa",
      "social.tiktokNote": "Momentos de nuestros eventos",
      "social.pinterestNote": "Tableros de inspiración para su ocasión",
      "social.facebookNote": "Novedades y encuentros en La Jolla",
      "social.alt.facade": "La fachada de La Jolla cubierta de hiedra bajo un cielo azul.",
      "social.alt.plaque": "Un letrero ovalado de La Jolla entre flores blancas y una lámpara de rayas.",
      "social.alt.evening": "La marca La Jolla Coral Gables sobre la fachada cubierta de hiedra.",
      "social.alt.seal": "Un sello de lacre verde salvia y su estampador sobre un sobre blanco.",
      "social.alt.monogram": "El monograma de La Jolla sobre hojas verde oscuro.",
      "social.alt.suite": "Papelería de La Jolla sobre rayas verde salvia.",
      "social.facebookLoad": "Ver las últimas publicaciones de Facebook",
      "meta.locale": "es_US",
      "meta.title.home": "Espacio histórico para bodas y eventos en Coral Gables | La Jolla",
      "meta.description.home": "Conozca La Jolla, un espacio histórico de Coral Gables para bodas, celebraciones privadas y eventos. Descubra los espacios y agende una visita.",
      "meta.title.visit": "Agende una visita | La Jolla Coral Gables",
      "meta.description.visit": "Elija un horario disponible para visitar La Jolla en Coral Gables. Conozca al equipo y los espacios. Una visita no reserva un evento.",
      "meta.title.privacy": "Privacidad | La Jolla Coral Gables",
      "meta.description.privacy": "Cómo La Jolla Coral Gables usa Microsoft Bookings para las visitas y cómo contactar al equipo sobre la información que usted comparte.",
      "meta.title.terms": "Términos de las visitas | La Jolla Coral Gables",
      "meta.description.terms": "Información sobre las visitas a La Jolla Coral Gables. Las fechas y los acuerdos de eventos deben confirmarse directamente con el equipo.",
      "hero.context": " — Espacio histórico para eventos en Coral Gables",
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
      "landing.explore": "Descubra la casa",
      "landing.arrival": "Una llegada para recordar.",
      "landing.house": "Una casa con historia.",
      "landing.occasion": "Imagine su celebración.",
      "landing.arrive": "Llegue",
      "landing.visitReason": "Una visita es el primer paso para encontrar el espacio adecuado para su celebración.",
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

      "nav.inquire": "Agende una visita",
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
      "booking.open": "Agende una visita",
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
        const entrance = document.getElementById('hero');
        header.classList.toggle('over-entrance', !!entrance && entrance.getBoundingClientRect().bottom > header.offsetHeight);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  function initEntranceZoom() {
    const entrance = document.getElementById('hero');
    const video = entrance?.querySelector('.entrance-video');
    if (!video) return;
    const stage = entrance.querySelector('.entrance-stage');
    const saveData = !!navigator.connection?.saveData;
    let desired = 0, active = false, trigger = null, sourceIndex = 0;
    let priming = false, primeTimer, primeAttempts = 0, primeGeneration = 0, started = false;
    let controller, objectURL, loadFailed = false;
    let networkURL, nativeSource = false;
    const formats = ['mp4', 'webm'].filter(format => video.canPlayType('video/' + format));
    function seek() {
      if (!active || priming || video.seeking || video.readyState < 1 || !Number.isFinite(video.duration)) return;
      video.pause();
      const time = Math.max(0, Math.min(video.duration - .04, desired * video.duration));
      if (Math.abs(video.currentTime - time) > .015) {
        try { video.currentTime = time; } catch (_) { /* Keep the approved poster. */ }
      } else if (video.readyState >= 2) video.classList.add('is-decoded');
    }
    function finishPrime(generation) {
      if (generation !== undefined && generation !== primeGeneration) return;
      if (!priming) return;
      priming = false; clearTimeout(primeTimer); video.pause(); seek();
      if (video.readyState === 0) useNativeSource();
    }
    function useNativeSource() {
      if (!active || !objectURL || nativeSource) return false;
      // WebKit can reject a blob at bootstrap or after a reverse seek. Try
      // its native loader once for this same format before choosing another.
      clearTimeout(primeTimer); priming = false; primeGeneration++; primeAttempts = 0;
      video.pause(); video.classList.remove('is-decoded');
      const previous = objectURL; objectURL = null; nativeSource = true;
      video.src = networkURL; video.load(); URL.revokeObjectURL(previous); prime();
      return true;
    }
    function prime() {
      if (!active || !video.hasAttribute('src') || priming || primeAttempts >= 3 || video.readyState >= 2) return;
      priming = true; primeAttempts++;
      const generation = ++primeGeneration;
      primeTimer = setTimeout(() => finishPrime(generation), 1500);
      try { video.play()?.then(() => finishPrime(generation), () => finishPrime(generation)); } catch (_) { finishPrime(generation); }
    }
    function nextSource() {
      clearTimeout(primeTimer); priming = false; video.pause(); video.classList.remove('is-decoded');
      if (!active || sourceIndex >= formats.length) return;
      primeAttempts = 0;
      const format = formats[sourceIndex++];
      const url = 'assets/venue/cinematic/' + (window.innerWidth >= 1500 && format === 'mp4' ? 'journey-hd' : 'journey') + '.' + format;
      networkURL = url; nativeSource = false;
      controller?.abort(); controller = new AbortController();
      const signal = controller.signal; loadFailed = false;
      // Complete the small approved clip before seeking. This also works on
      // static hosts whose native loader does not support byte-range requests.
      fetch(url, { signal }).then(response => {
        if (!response.ok) throw new Error('Entrance unavailable');
        return response.blob();
      }).then(blob => {
        if (signal.aborted) return;
        if (objectURL) URL.revokeObjectURL(objectURL);
        objectURL = URL.createObjectURL(blob); video.src = objectURL;
        video.preload = 'auto'; video.load(); prime();
      }).catch(() => {
        if (!signal.aborted) { loadFailed = true; nextSource(); }
      });
    }
    video.addEventListener('loadedmetadata', () => { prime(); seek(); });
    video.addEventListener('loadeddata', () => { finishPrime(); seek(); });
    video.addEventListener('seeked', seek);
    video.addEventListener('playing', () => finishPrime());
    video.addEventListener('error', () => {
      // An error queued by an abandoned source must not replace a fresh one.
      if (video.error && !useNativeSource()) nextSource();
    });
    // One paused entrance film. The rest of the page never seeks or pins media.
    function render(self) {
      desired = self.progress;
      entrance.dataset.progress = desired.toFixed(3);
      stage.style.setProperty('--entrance-progress', desired.toFixed(4));
      stage.dataset.phase = desired < .34 ? 'arrival' : desired < .72 ? 'house' : 'occasion';
      const start = desired < .34 ? 0 : desired < .72 ? .34 : .72;
      const end = desired < .34 ? .34 : desired < .72 ? .72 : 1;
      const phraseProgress = (desired - start) / (end - start);
      stage.style.setProperty('--phrase-travel', ((.5 - phraseProgress) * 72).toFixed(2) + 'px');
      stage.style.setProperty('--phrase-scale', (1.08 - phraseProgress * .16).toFixed(4));
      stage.style.setProperty('--title-travel', (Math.sin(desired * Math.PI) * 24).toFixed(2) + 'px');
      // The approach ends as a doorway: the film settles into an arch.
      const arch = Math.max(0, Math.min(1, (desired - .7) / .3));
      stage.style.setProperty('--entrance-arch', (arch * arch * (3 - 2 * arch)).toFixed(4));
      // Clip the film only while it is an arch; the open frame stays unmasked.
      if (arch > 0) stage.dataset.arch = ''; else delete stage.dataset.arch;
      active = self.isActive && !document.hidden && !document.querySelector('dialog[open]');
      if (!active) { finishPrime(); video.pause(); return; }
      if (desired > .001 && !started) { started = true; nextSource(); }
      else if (video.error) { if (!useNativeSource()) nextSource(); }
      else if (loadFailed && sourceIndex < formats.length) nextSource();
      prime(); seek();
    }
    function release() {
      active = false; finishPrime(); video.pause();
      controller?.abort(); controller = null;
      video.removeAttribute('src'); video.load(); video.preload = 'none'; video.classList.remove('is-decoded');
      if (objectURL) URL.revokeObjectURL(objectURL); objectURL = null; loadFailed = false; networkURL = null; nativeSource = false;
      sourceIndex = 0; primeAttempts = 0; started = false;
      stage.style.removeProperty('--entrance-progress'); ['--phrase-travel', '--phrase-scale', '--title-travel', '--entrance-arch'].forEach(name => stage.style.removeProperty(name)); delete stage.dataset.phase; delete stage.dataset.arch;
    }
    if (window.gsap && window.ScrollTrigger && !saveData) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference) and (min-height: 600px), (prefers-reduced-motion: no-preference) and (min-width: 651px) and (min-height: 480px)', function () {
        entrance.classList.add('entrance-scroll');
        trigger = ScrollTrigger.create({ id: 'entrance-zoom', trigger: entrance, pin: stage,
          start: 'top top', end: () => '+=' + Math.round(window.innerHeight * 1.25),
          onUpdate: render, onRefresh: render, onEnter: render, onEnterBack: render,
          onLeave: render, onLeaveBack: render, invalidateOnRefresh: true });
        return () => { release(); trigger = null; entrance.classList.remove('entrance-scroll'); };
      });
      window.addEventListener('load', () => ScrollTrigger.refresh());
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    document.addEventListener('visibilitychange', () => { if (trigger) render(trigger); });
    document.addEventListener('close', () => { if (trigger) render(trigger); }, true);
    document.addEventListener('lajolla-dialog-open', () => { if (trigger) render(trigger); });
    window.addEventListener('pointerdown', prime, { passive: true });
    window.addEventListener('touchstart', prime, { passive: true });
    window.addEventListener('pagehide', release);
    window.__ljEntrance = { get trigger() { return trigger; }, video };
  }

  function initLandingMotion() {
    if (!document.body.classList.contains('landing-page')) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const saveData = !!navigator.connection?.saveData;
    const photos = [...document.querySelectorAll('[data-landing-parallax]')];
    const visible = new Set();
    const sections = [...document.querySelectorAll('.landing-section')];
    const interactive = [...document.querySelectorAll('.occasion, .brand-card, .social-links a, .visit-invitation')];
    // Decorative light follows the pointer; links and complete copy stay native.
    interactive.forEach(element => {
      element.addEventListener('pointermove', event => {
        if (reduced.matches || saveData || event.pointerType !== 'mouse') return;
        const box = element.getBoundingClientRect();
        element.style.setProperty('--light-x', ((event.clientX - box.left) / box.width * 100).toFixed(1) + '%');
        element.style.setProperty('--light-y', ((event.clientY - box.top) / box.height * 100).toFixed(1) + '%');
      }, { passive: true });
      element.addEventListener('pointerleave', () => {
        element.style.removeProperty('--light-x'); element.style.removeProperty('--light-y');
      });
    });
    let frame = 0, observer, reveal;
    const clamp = value => Math.max(0, Math.min(1, value));
    const ease = value => value * value * (3 - 2 * value);
    // Scroll-scrubbed scenes. Every one settles on the complete, readable
    // layout and is removed for reduced motion, SaveData or missing observers.
    const inked = [...document.querySelectorAll('[data-ink]')];
    function inkWords(paragraph) {
      const text = paragraph.textContent;
      let index = 0;
      paragraph.textContent = '';
      text.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { paragraph.append(part); return; }
        const word = document.createElement('span');
        word.className = 'ink-word'; word.style.setProperty('--i', String(index++)); word.textContent = part;
        paragraph.append(word);
      });
      paragraph.style.setProperty('--ink-count', String(index));
    }
    function plainWords(paragraph) {
      if (paragraph.querySelector('.ink-word')) paragraph.textContent = paragraph.textContent;
      paragraph.style.removeProperty('--ink'); paragraph.style.removeProperty('--ink-count');
    }
    const album = document.querySelector('[data-scene="album"]');
    const prints = album ? [...album.querySelectorAll('.album-print')] : [];
    const albumIndex = album?.querySelector('.album-index');
    const albumStage = album?.querySelector('.album-stage');
    // The sticky album needs room for a print and its caption, plus small-viewport units.
    const roomy = matchMedia('(min-height: 600px), (min-width: 651px) and (min-height: 480px)');
    const staging = () => !!album && roomy.matches && !!window.CSS?.supports?.('height', '1svh') && CSS.supports('overflow', 'clip');
    const occasions = [...document.querySelectorAll('.occasion')];
    const occasionCounter = document.querySelector('.occasion-counter');
    const services = [...document.querySelectorAll('.rentals-quiet li')];
    const cards = [...document.querySelectorAll('.brand-card')];
    const seal = document.querySelector('.planning-seal');
    const scenes = [
      ...inked.map(element => ({ element, update() {
        const box = element.getBoundingClientRect();
        // Complete while the paragraph centre is still in the lower 60% of the view.
        const progress = clamp((innerHeight * .95 - box.top - box.height * .5) / (innerHeight * .35));
        element.style.setProperty('--ink', (progress * (Number(element.style.getPropertyValue('--ink-count')) + 1)).toFixed(3));
      } })),
      album && { element: album, staged: true, update() {
        // Use the stage's own height so a collapsing mobile URL bar cannot end the album early.
        const box = album.getBoundingClientRect();
        const travel = clamp(-box.top / Math.max(1, box.height - albumStage.offsetHeight)) * (prints.length - 1);
        prints.forEach((print, index) => {
          // Each print travels for 70% of its interval, then rests to be seen.
          print.style.setProperty('--arrive', index ? ease(clamp((travel - index + 1) / .7)).toFixed(4) : '1');
          print.style.setProperty('--covered', ease(clamp((travel - index) / .7)).toFixed(4));
        });
        if (albumIndex) albumIndex.textContent = String(prints.filter((print, index) => !index || travel - index + 1 > .35).length).padStart(2, '0');
      } },
      occasions.length && { element: document.querySelector('.events-list'), update() {
        // Mark the whole row nearest the middle: two-column rows share one top.
        // Measure the list items, which never move: the hover lift and focus cues
        // transform the card inside, so a hovered or focused card stays in its row.
        const boxes = occasions.map(occasion => occasion.parentElement.getBoundingClientRect());
        const rows = boxes.map(box => box.top);
        let row = 0, distance = Infinity;
        boxes.forEach((box, index) => {
          const gap = Math.abs(box.top + box.height / 2 - innerHeight * .5);
          if (gap < distance) { distance = gap; row = rows[index]; }
        });
        const current = [];
        occasions.forEach((occasion, index) => {
          const on = Math.abs(rows[index] - row) < 2;
          occasion.classList.toggle('is-current', on);
          if (on) current.push(String(index + 1).padStart(2, '0'));
        });
        if (occasionCounter) occasionCounter.textContent = current.join(' · ');
      } },
      services.length && { element: document.querySelector('.rentals-quiet'), update() {
        // Read every position before writing, so one frame needs one layout.
        const tops = services.map(item => item.getBoundingClientRect().top);
        services.forEach((item, index) => item.style.setProperty('--enter', (1 - ease(clamp((innerHeight * 1.02 - tops[index]) / (innerHeight * .32)))).toFixed(4)));
      } },
      cards.length && { element: document.querySelector('.brand-grid'), update() {
        // Measure the untransformed grid, never the moving plate itself.
        const grid = document.querySelector('.brand-grid').getBoundingClientRect().top;
        cardTops.forEach((top, index) => cards[index].style.setProperty('--scatter', (1 - ease(clamp((innerHeight * 1.05 - grid - top) / (innerHeight * .6)))).toFixed(4)));
      } },
      seal && { element: seal, update() {
        const box = { top: seal.offsetParent.getBoundingClientRect().top + seal.offsetTop };
        seal.style.setProperty('--stamp', ease(clamp((innerHeight * .98 - box.top) / (innerHeight * .38))).toFixed(4));
      } },
    ].filter(scene => scene && scene.element);
    const activeScenes = new Set();
    let liveScenes = [];
    let cardTops = [], configuredWidth = 0, preload;
    function measureScatter() {
      const grid = document.querySelector('.brand-grid');
      if (!grid) return;
      cardTops = cards.map(card => card.offsetTop);
      cards.forEach((card, index) => {
        // Gather the plates towards the middle of the table before they settle.
        // The grid is positioned, so offsets ignore the scatter transforms.
        card.style.setProperty('--scatter-x', ((grid.offsetWidth / 2 - card.offsetLeft - card.offsetWidth / 2) * .45).toFixed(1) + 'px');
        card.style.setProperty('--scatter-r', (index % 2 ? 7 : -6) + (index % 3) * 1.5 + 'deg');
      });
    }
    const progress = document.createElement('span');
    progress.className = 'landing-reading-progress'; progress.setAttribute('aria-hidden', 'true');
    document.querySelector('#header')?.append(progress);
    function draw() {
      frame = 0;
      if (document.hidden || reduced.matches || saveData) return;
      const span = document.documentElement.scrollHeight - innerHeight;
      progress.style.setProperty('--reading-progress', String(span > 0 ? Math.min(1, Math.max(0, scrollY / span)) : 0));
      for (const photo of visible) {
        const image = photo.querySelector('img'), box = image.getBoundingClientRect();
        const position = Math.max(-1, Math.min(1, (box.top + box.height / 2 - innerHeight / 2) / innerHeight));
        photo.style.setProperty('--photo-drift', (position * Math.min(38, image.offsetHeight * .04)).toFixed(2) + 'px');
        photo.style.setProperty('--photo-scale', (1.09 + Math.abs(position) * .04).toFixed(4));
      }
      // Scenes near the viewport are decided from geometry in this same frame, so a
      // jump or a late observer callback never leaves a pose behind the scroll.
      const near = liveScenes.map(scene => {
        const box = scene.element.getBoundingClientRect();
        return box.bottom > -innerHeight * .25 && box.top < innerHeight * 1.25;
      });
      liveScenes.forEach((scene, index) => {
        // A scene that has just left gets one last update and settles at its end.
        if (near[index] || activeScenes.has(scene)) scene.update();
        if (near[index]) activeScenes.add(scene); else activeScenes.delete(scene);
      });
      for (const section of sections) {
        const box = section.getBoundingClientRect();
        if (box.bottom < 0 || box.top > innerHeight) continue;
        const travel = Math.max(0, Math.min(1, (innerHeight - box.top) / (innerHeight * .75)));
        section.style.setProperty('--section-arrival', travel.toFixed(4));
      }
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
    function configure() {
      observer?.disconnect(); reveal?.disconnect(); visible.clear(); activeScenes.clear(); liveScenes = [];
      inked.forEach(plainWords);
      prints.forEach(print => { print.style.removeProperty('--arrive'); print.style.removeProperty('--covered'); });
      occasions.forEach(occasion => occasion.classList.remove('is-current'));
      services.forEach(item => item.style.removeProperty('--enter'));
      cards.forEach(card => ['--scatter', '--scatter-x', '--scatter-r'].forEach(name => card.style.removeProperty(name)));
      seal?.style.removeProperty('--stamp');
      if (albumIndex) albumIndex.textContent = '01';
      album?.classList.remove('is-staged');
      preload?.disconnect();
      prints.forEach(print => { print.querySelector('img').loading = 'lazy'; });
      if (frame) cancelAnimationFrame(frame); frame = 0;
      document.body.classList.remove('landing-effects');
      photos.forEach(photo => { photo.style.removeProperty('--photo-drift'); photo.style.removeProperty('--photo-scale'); });
      sections.forEach(section => section.style.removeProperty('--section-arrival'));
      interactive.forEach(element => { element.style.removeProperty('--light-x'); element.style.removeProperty('--light-y'); });
      progress.style.removeProperty('--reading-progress');
      if (reduced.matches || saveData || !('IntersectionObserver' in window)) return;
      document.body.classList.add('landing-effects');
      // Only three photographs drift. Complete text never fades or follows scroll.
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
        schedule();
      }, { rootMargin: '80px' });
      photos.forEach(photo => observer.observe(photo));
      // Three one-time image reveals complement the continuous photo motion.
      reveal = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('has-arrived'); reveal.unobserve(entry.target); }
      }), { threshold: .08, rootMargin: '30px' });
      document.querySelectorAll('[data-landing-effect], .landing-section').forEach(element => reveal.observe(element));
      inked.forEach(inkWords); measureScatter();
      const albumStaged = staging();
      configuredWidth = innerWidth;
      if (albumStaged) {
        album.classList.add('is-staged');
        // Off-stage prints are clipped, so lazy loading would wait until each one
        // slides in. Load them together once the album is two screens away.
        preload = new IntersectionObserver(entries => {
          if (!entries.some(entry => entry.isIntersecting)) return;
          prints.forEach(print => { print.querySelector('img').loading = 'eager'; });
          preload.disconnect();
        }, { rootMargin: '200% 0px' });
        preload.observe(album);
      }
      liveScenes = scenes.filter(scene => !scene.staged || albumStaged);
      // Write the first poses now, so a restored scroll never shows the stacked defaults.
      liveScenes.forEach(scene => scene.update());
      schedule();
    }
    // Translation replaces the inked paragraphs with plain text.
    window.addEventListener('lajolla-language', () => {
      if (!document.body.classList.contains('landing-effects')) return;
      inked.forEach(inkWords); measureScatter();
      // The word count changes with the language; recompute every scene's pose at once.
      scenes.forEach(scene => { if (!scene.staged || album.classList.contains('is-staged')) scene.update(); });
      schedule();
    });
    window.addEventListener('resize', () => {
      if (!document.body.classList.contains('landing-effects') || innerWidth === configuredWidth) return;
      if (staging() !== album?.classList.contains('is-staged')) configure(); else { configuredWidth = innerWidth; measureScatter(); }
    }, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', configure);
    // A collapsing toolbar can cross the height threshold mid-scroll; only a
    // width change (rotation or window resize) re-decides the staged album.
    roomy.addEventListener('change', () => { if (innerWidth !== configuredWidth) configure(); });
    configure();
  }

  function initAnchorNavigation() {
    let navigated = false;
    const initialHash = location.hash;
    function targetFor(hash) {
      const id = hash.slice(1);
      return document.getElementById(id === 'quote' ? 'planning' : id === 'possibilities' ? 'events' : id);
    }
    function go(target, smooth) {
      if (!target) return;
      target.scrollIntoView({ block: 'start', behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant' });
      const heading = target.querySelector('h1,h2') || target;
      heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true });
    }
    document.addEventListener('click', event => {
      const link = event.target.closest?.('a[href^="#"]');
      if (!link || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = targetFor(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault(); navigated = true;
      history.pushState(null, '', '#' + target.id); go(target, true);
    });
    window.addEventListener('hashchange', () => go(targetFor(location.hash), false));
    document.fonts.ready.then(() => requestAnimationFrame(() => {
      if (initialHash && !navigated) go(targetFor(initialHash), false);
    }));
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
        opener = link.closest(".chapter-more")?.querySelector("summary") || link;
        document.querySelectorAll(".cinema-directory[open], .contact-directory[open], .mobile-menu[open]")
          .forEach(function (menu) { menu.open = false; });
        viewer.showModal();
        document.dispatchEvent(new Event("lajolla-dialog-open"));
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
    initChapterMenu();
    // Resolve the menu layout before positioning or focusing an anchor.
    initEntranceZoom();
    initLandingMotion();
    initAnchorNavigation();
    initBookingCalendar();
    initYear();
    if (document.body.classList.contains("planning-page")) {
      const title = document.getElementById("quote-title");
      title.setAttribute("tabindex", "-1"); title.focus({ preventScroll: true });
    }
  });
})();

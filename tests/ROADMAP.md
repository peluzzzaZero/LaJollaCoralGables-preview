# La Jolla — continuing design review

## v1.0.0 — editorial visit (published)

Purpose: explain the offer from first paint, introduce a stronger rhythm and make the brand feel specific to this place.

- Stable opening copy and CTA; four framed photographs with modest zooms and overlapping crossfades. Desktop uses one short pin; mobile scrolls naturally.
- Facade history moves between the pots, door and sun tile without showing its printed wordmark.
- Native keyboard-accessible occasion disclosures preserve all approved descriptions.
- Alcazar has its own dark-green chapter, full existing illustration and direct inquiry.
- Rentals outside the venue are clear; seven brand plates receive a composed gallery; director names replace large empty portrait frames.
- Version metadata, cache keys, CI, release notes and immutable tags establish the release cycle.

Review question: can a visitor assemble their actual service interests without being sent straight to the form after each choice?

## v1.1.0 — an inquiry with context (published)

- Select multiple services with clear selected states and a useful summary.
- Carry event/room choices into the inquiry; allow correction before submitting.
- Translate selected service labels when switching languages without overwriting freeform details.
- Clear the selection only after successful submission, preserving it on errors and timeouts.
- Add concise mobile chapter access and give suppliers a secondary disclosure.
- Review keyboard operation, focus, empty-state layout, payload, translation and success/error behavior.

## v1.2.0 — your occasion, your setting

Purpose: make the two offers easier to understand while refining the invitation to inquire.

- A restrained editorial gateway distinguishes an occasion at La Jolla from services at another location in South Florida.
- Native links remain useful without JavaScript. With it, the choice supplies an optional, editable inquiry setting.
- The setting translates without overwriting written notes, is sent in the payload, survives errors and clears after success.
- Three accessible field groups, a fine double border and ruled controls make the form feel like personal correspondence.
- Review native keyboard routes, optional/edited context, first paint, translations, narrow screens and form delivery simulations.

Review question: can visitors see enough real evidence of the space and services to make a confident inquiry? Better approved photographs and verified venue details remain the next priority.

## v1.2.1 — approved copy corrections

- The lounge is The Lexington throughout navigation, its chapter, inquiry links and bilingual event options.
- The form introduction is “Let's Start Planning” (Spanish: “Comencemos a planificar”), always visible regardless of the selected event.
- Existing #alcazar anchors and internal option values remain compatible; Alcazar Avenue is still the street address.
- New photographs and exterior videos were subsequently received on 5 October and reviewed locally. The decorated event photograph still needs confirmation of provenance before use as venue evidence.

## v1.3.0 — actual venue photography and films

- Integrate newly supplied original exterior/interior photography and both facade videos.
- Make the spaces directly discoverable and connect the visual visit to a venue inquiry.
- Native manual playback, real posters, no initial MP4 transfer and sensible pause behavior.
- Review media decoding, orientation, fallback, keyboard disclosure, no-script access and responsive layouts.

## Reference and private workflow

The user supplied an earlier DOCX brief and HTML mockup during this cycle. See BRIEF-ALIGNMENT.md for decisions, asset provenance and the private automation backlog. The brief describes quoting, tours, native contracts, Stripe deposits and an administration panel; these require approved operational inputs and server integrations. None is represented as working on the current static inquiry site. The user supplied 17 smaller RAR volumes after the ZIP transfer limit; all were reconstructed and reviewed. The brand originals are now available locally, including higher-resolution marks and floral/wax-seal artwork. No new room/service photography or venue video was delivered.

## Later cycles, ranked by usefulness

1. Actual approved space/event and rental/service photography. The supplied original facade improves evidence; the brand-delivery originals can support a measured clarity/loading cycle, but do not replace real room and product photographs.
2. Verified venue facts (capacity, configuration, amenities and access) when supplied. These would let visitors decide whether the venue suits their event without claiming unsupported facilities.
3. Pat's final tagline and an approved guest quote, when provided.
4. Safari/iOS and Android device review; optimize image/font delivery using measured load behavior.
5. Real inbox delivery, with a separately authorized test submission.

Historical section-by-section instructions are retained in PLAN.md. The current design direction and release policy take precedence over its old presentation choices; brand requirements continue to apply.

## Publication and review checkpoints

v1.0.0 was integrated through PR #3 (feature → dev) and PR #4 (dev → main), at 55433aac. Its annotated tag and GitHub release were created by successful CI run 37203746047; Pages run 37203745470 published it. Live assets match the reviewed tree; navigation passes at 390/768/1280 px in both languages.

The v1.1.0 review exposed narrow intrinsic form controls at 320 px. They now shrink to their grid column, with explicit 320/375 px checks. The selection CTA precedes the list so it stays easy to find. Screenshots wait for native scrolling to settle before recording fixed navigation. Missing-page-script behavior leaves sending disabled and direct contact accessible.

## v1.4.0 — lighter film integration

Replaces the two large on-page players with discreet links at the facade and one requested modal viewer. Retains both actual films, zero initial video transfer, direct no-script access, translated controls and venue photographs. Next improvements should prioritize useful venue facts and imagery over additional page length or motion.

## v1.5.0 — user-led visual corrections

Replace the rejected history crop, simplify the quote interlude, present brand pieces as a larger native gallery and decouple opening photo selection from scroll. Preserve the explicitly approved offering section and quiet film integration. Earlier crop/pin/tween requirements in historical notes and tests are superseded by these user comments.

## v1.6.0 — an architectural scroll scene

Translate the user's Apple references into one short, reversible GSAP journey using real arrival/balcony footage and the ballroom photograph. Preserve the approved offering cards and v1.5 corrections. A responsive arch changes framing, captions advance with the scene, and three accessible choices or the continuation link give visitors control. Reduced motion, data saving and short screens use still-image choices; film loads are deferred until near the scene. Review decoded forward/reverse frames and covered transitions, rather than equating a scroll effect with a decorative CSS shift.

## v1.7.0 — a continuous house story

The client liked the actual film animation but found its arch-themed chapter forced and the adjacent blocks too static. Letterforms, photographic panel assembly and readable staged word fades now extend the motion language. History contains the film scene and leads to a shorter assembled photographic essay; the repeated giant ballroom is removed. Earlier strict one-hero-trigger expectations are superseded by two unpinned opening treatments. The approved offers and authentic brand/venue evidence remain intact. Next: assess live pacing, gather verified venue facts and approved service/event imagery.

## v1.7.1 — preserve approved effects

The client corrected v1.7: restore the independent sage-green video scene before history and keep the actual forward/reverse video/zoom/opening effect. Replace displaced photographic strips with aligned progressive reveals; preserve typography and authentic venue assets. Treat the approved cinematic behavior as a baseline for future refinements.

## v1.8.0 — cinematic continuity

The client's Runway reference informs shot-to-detail pacing and restrained presentation. Keep the approved real-film engine and green stage; add readable chapter words and reversible position traces. All offering photograph layers share a single camera move. Replace the tilted interior collage with upright depth and numbered captions, preserving complete real views. No new media, pin or scene length. Next review: live pacing and useful verified venue/service information.

## v1.9.0 — a full-screen house journey

Replace the rejected small cinema with the newly supplied continuous approach filling the viewport. Five chapters explain the house, occasions, The Lexington, off-site services and planning; four film-only pauses separate them. Small complete photographs accumulate and reverse with the scroll. The old arch, three-shot sequence and short-pin expectations are superseded by this explicit request. Preserve the original full films, offering photograph assembly and native inquiry routes. Next review: live reading pace, mobile crop and verified venue/service information.

## v1.10.0 — distinct cinematic compositions

Keep the approved full-screen scrub effect and extend it to three real shots. Alternate shorter, readable panels between positions; show a relevant complete photograph per chapter and gather the four details in the finale. Review all three complete films and reverse seeks, deferred shot loads, readable mobile placement and native alternatives. The fixed text column and repeated intermediate photo grid are superseded by the latest user feedback. GoDaddy is installed but its personal account is not connected; DNS stays pending.

## v1.11.0 — one continuous motion

The client explicitly requested that all information belong to the film motion and the form move to an internal page. The homepage has one pinned timeline covering welcome, heritage, real spaces, ten occasion categories, The Lexington, ten services, seven brand pieces, both directors and planning. Native disclosures carry the complete approved copy inside the current chapter; no repeated long section stack follows the film. The quote interlude becomes part of the finale. Forms move intact to planning.html, with same-tab safe selection context and no contact-data persistence. Historical independent hero triggers and home-page form contracts are superseded; asset integrity, complete commercial content, simulated mail failure handling and accessibility remain release gates. Next: review actual visitor pacing and replace low-resolution portrait footage only when authentic improved source is supplied.

## v1.11.1 — inquiry recovery and booking dependency

A client screenshot establishes a real submission failure. Keep fields and selected services after rejection and provide an explicit complete email draft to the business address. Expose safe HTTP status categories for diagnosis, never echoed contact data. Keep the approved one-motion homepage. The root provider/account failure is still pending verification; calendar automation now requires verified business access, real availability and conflict-safe booking rather than merely accepting a preferred event date. See INQUIRY-AND-CALENDAR.md.

## Next — first-party business mail (activation pending)

The client objects to Web3Forms' 250 free monthly submissions and requests authenticating the business mailbox inside the project. Pause the business-key v1.11.2 PR; do not merge or tag it as the desired final solution. An authorized technical Web3Forms request was provider-accepted, but receipt was not confirmed. Build the server-owned Microsoft Graph path with private persistent inquiry records, fixed sender/recipient, idempotency, safe error states and burst protection. The client confirms GoDaddy's owner Email & Office dashboard can administer the mailbox. Verify the actual Microsoft permissions and available compatible hosting; configuring domains alone does not provide a backend. Activate only after a real received Graph test and a reviewed frontend/deployment cycle. Email acceptance never confirms a visit or space booking.

## v1.15.0 — editorial rhythm after owner feedback

Restore complete readable headings and the original cream navigation. Reserve word reading for the occasions statement and split-photo assembly for two chapters. Alternate mobile positions and photographic proportions, leaving the opening, occasions and team film uninterrupted by inset photos. Keep the existing recorded footage and v1.14.1 mobile priming. Subjective art direction is assessed from all nine mobile/desktop stops; automatic checks protect readability, safe geometry and native interactions.

## v1.16.0 — venue-tour calendar in the inquiry page

Integrate the owner-owned Microsoft Bookings schedule as an on-demand accessible dialog beside the existing event-quote form, and offer it again after a successful inquiry. Preserve homepage motion, selected services, entered draft and provider booking session. EN/ES controls, keyboard dismissal/focus restoration, narrow phones and desktop, HTTPS embedding and external/no-JS fallback are reviewed without actual email or appointment creation. Tour booking is independent of the preferred event date. Remaining: verify each owner's Outlook notification flow, finish native inquiry activation and implement reviewed event-space occupancy rules before exposing confirmed event reservations.

## v1.16.1 — booking-only planning at the owner's request

Remove the full selected quote form and redundant notice/submit action; retain tours through the existing calendar and direct contact for event discussions. Reword EN/ES page introduction, use a compact single-column layout, and keep service selections across navigation for discussion in booking notes. Vendor form and prepared native API are retained. Revise browser assertions to cover the actual remaining routes and keep vendor error/retry/idempotency/privacy tests. Do not describe tours as confirmed event-space reservations.

## v1.16.2 — one visit action

At the owner's request, remove the remaining vendor form and service selection controls. Planning contains only its visit introduction, Schedule a visit action and existing calendar, with ordinary footer contact. Keep all ten homepage service descriptions, the films, navigation, languages and legal links. Remove public mail delivery JavaScript and update privacy copy. Native mail preparation stays disabled and is optional. Update the existing browser reviews for the actual booking/navigation route and wait for the native dialog close event before asserting body unlock.

## v1.18.0 — a short entrance and a continuous landing

Client feedback rejected the extended camera journey and expanding chapter readers. Keep only the approved approach to the door, then expose the original room, occasion, services, brand and team information in ordinary vertical flow. Use warm ivory/beige, classic headings, readable controls and subtle image/card shadows. The calendar opens over the current page; visible invitations beside the spaces explain why a visit is useful. Clean owner-confirmed social links and styled, attributed five-star review selection belong within the content, with no secondary video or fabricated testimonials.

Next improvements, in order of useful evidence:

- Connect the existing restricted Google review source when the owner supplies an authorized provider connection; retain selection disclosure, original authors/date/source and the native source link on failure.
- Collect approved high-resolution photographs of actual weddings and celebrations, with permission for identifiable guests. Use them beside the matching occasion descriptions instead of adding more motion.
- Confirm each room's capacity, accessibility, parking, catering and scheduling policies. Present a concise visible FAQ near the visit invitation once those facts are reliable.
- Validate the entrance-to-calendar journey with representative mobile visitors before adding more effects. A visit appointment remains separate from reserving event space.

## v1.19.0 — visible motion without a second scroll world

The owner found the first beige landing too static. Add layered arrival phrases, an advancing frame and a moving title alongside the only entrance zoom. Below, three photographed scenes receive native scroll depth and three one-time reveals; keep every paragraph visible and all later sections unpinned. Emphasize Weddings with one full-width editorial tile, with captions safely outside each moving image window. Reduced motion disables decoration. The next evidence priorities remain actual celebration photography, verified venue facts and an owner-configured Google review connection.

## v1.20.0 — continuous entrance typography and editorial interaction

Respond to the owner’s feedback that captions and normal sections feel static: bind each caption's travel/scale directly to scroll, add restrained depth, pointer light and keyboard occasion focus. Keep one initial film, complete native-flow content, original assets and warm event styling. Verify reduced-motion reset, fast reverse scroll, readable copy and reservation navigation before publication.

## v1.21.0 — a visit told in scenes

The owner asked for storytelling closer to Apple's product pages and narrative studio sites: a mix of film and photography where each section advances like a scene, not a full scroll world. Keep the single approved film; give each chapter its own reversible scroll scene (doorway arch, inked history, stacked printed photographs of the spaces, current-occasion index, deep green Lexington, written services, spread identity plates, sealed invitation). Correct the mobile detail grid and caption strips. Verify reduced motion, SaveData and no-JS fallbacks, EN/ES at every reviewed width and readable settled states before publication. At the owner’s request the release also brings the social profiles into the content: a local, embed-free six-image mosaic opening Instagram in the team chapter. Next: owner-chosen posts with permalinks, then an optional automatic feed through the official Instagram API.

## v1.22.0 — reviews, location and a quiet credit

The owner liked the mobile scenes and asked for desktop polish of the entrance film and its frame, guest reviews and opinions together with the location, and a discreet gray "powered by peluzzza" at the very bottom. Per the client stakeholder, replace the brand plates with an Instagram chapter of venue photographs followed by guest reviews (Google, links to read and write; no invented testimonials or ratings) and the profiles, never say "ballroom", and lead the spaces with the piano photograph instead of the bar. Add a location chapter with address, phone, email, directions and a Google map that loads only on request, and start the desktop film below the opaque header so the frame is complete. Next: the owner's restricted Google browser key so selected five-star reviews appear on the page, and owner-chosen Instagram posts.

## v1.22.1 — the location map opens Google Maps at La Jolla

The owner reported from his phone that the location map showed the whole world, needed a tap and misbehaved once open. The keyless embed is removed; the facade card opens Google Maps in a new tab through the official Maps URL with La Jolla's Place ID, and nothing from Google loads inside the page. Next: confirm on a phone that the venue is marked, and a keyed Maps JavaScript map pinned by Place ID once the owner's browser key is active.

## v1.23.0 — your tour

The owner shared the client's brochure; the goal of the site is the tour. Bring the brochure's look (sage lockups, flourish, paper card) into a tour invitation after the services. Never its prices, packages, inclusions, capacity or partners; those are handled separately. Next: photographs for the chapter once the owner confirms the brochure's or supplies the house's.

## v1.24.0 — the team, in person

The owner sent portraits of Patricia Mir and Julie Arias. Replace the team monograms with matching cut-out portraits (no ID-style circles) with translated alt text; keep names, roles and order. Next: photographs of the house for the tour chapter.

## v1.25.0 — the house's lettering, and photographs that arrive

The owner asked that the name be written as in the brochure, then the titles, and for photographs to appear subtly. Draw "La Jolla" with the brochure's own script outlines (CSS mask, current color, real text kept), set chapter titles in Great Vibes (closest free match, self-hosted), and fade section photographs up once from a soft veil. Next: photographs of the house for the tour chapter.

## v1.26.0 — the walk through the front doors

The owner shared his own film of the entrance; stakeholders asked to keep the page's essence and only enrich the venue section. In "An invitation inside" the scroll draws a 6.9 s cut of the real film (front doors, then the walk into the hall) inside a sticky frame that opens from the hero's arch, with three short story notes. The approved hall photograph stays as the fallback. Next: photographs of the house for the tour chapter.

## v1.27.0 — the map you can see, and reviews that appear

The owner asked to see Google Maps in the Location chapter, pinned at the house, and the best Google reviews on the page. The chapter shows an embedded Google map of 301 Alcazar Ave, Coral Gables, FL 33134 (lazy, softened toward the palette) with "Open in Google Maps" by Place ID; five short excerpts of real Google reviews are always shown, and selected five-star reviews now appear on their own as the visitor reaches them once the browser key is configured. Next: activate the owner's Google browser key, then confirm the map and reviews on a real phone.

## v1.27.1 — a clean title on the visit page

- The visit page title no longer shows a focus ring on load; it still takes focus for screen readers, and controls keep their keyboard focus ring.

## v1.27.2 — the owners' copy for the walk, the album and The Lexington

- The owners' copy for the venue walk, the album captions and The Lexington is applied word for word in English and translated faithfully to Spanish; by Dan's decision the owners' "The Grand Ballroom" stays in those three walk strings, and the banned-word checks cover everything else.

## v1.28.0 — the house dressed for events

- New event photographs from the site owner replace older images in the events, services, album and mosaic chapters (first dance, set table, bougainvillea, the house at night, reception, desserts, dressed tables, balcony couple); a new "One hall, many moods" strip; the mosaic grows to 12 tiles. Next: full-resolution originals.

## v1.28.1 — a quieter footer

- At the owner's request, "powered by peluzzza" (10px → 9px) and the bottom legal line (© · Terms · Privacy, .8rem → .75rem) are a touch smaller; no copy changes.

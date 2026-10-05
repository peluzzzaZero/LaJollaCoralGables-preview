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

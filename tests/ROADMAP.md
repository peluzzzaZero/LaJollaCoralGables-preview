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

## v1.1.0 — an inquiry with context (reviewed; publication follows the release pipeline)

- Select multiple services with clear selected states and a useful summary.
- Carry event/room choices into the inquiry; allow correction before submitting.
- Translate selected service labels when switching languages without overwriting freeform details.
- Clear the selection only after successful submission, preserving it on errors and timeouts.
- Add concise mobile chapter access and give suppliers a secondary disclosure.
- Review keyboard operation, focus, empty-state layout, payload, translation and success/error behavior.

## Later cycles, ranked by usefulness

1. Approved photographic originals and actual space/event photographs. The existing artwork limits detail clarity and evidence of the venue; no invented replacements.
2. Verified venue facts (capacity, configuration, amenities and access) when supplied. These would let visitors decide whether the venue suits their event without claiming unsupported facilities.
3. Pat's final tagline and an approved guest quote, when provided.
4. Safari/iOS and Android device review; optimize image/font delivery using measured load behavior.
5. Real inbox delivery, with a separately authorized test submission.

Historical section-by-section instructions are retained in PLAN.md. The current design direction and release policy take precedence over its old presentation choices; brand requirements continue to apply.

## Publication and review checkpoints

v1.0.0 was integrated through PR #3 (feature → dev) and PR #4 (dev → main), at 55433aac. Its annotated tag and GitHub release were created by successful CI run 37203746047; Pages run 37203745470 published it. Live assets match the reviewed tree; navigation passes at 390/768/1280 px in both languages.

The v1.1.0 review exposed narrow intrinsic form controls at 320 px. They now shrink to their grid column, with explicit 320/375 px checks. The selection CTA precedes the list so it stays easy to find. Screenshots wait for native scrolling to settle before recording fixed navigation. Missing-page-script behavior leaves sending disabled and direct contact accessible.

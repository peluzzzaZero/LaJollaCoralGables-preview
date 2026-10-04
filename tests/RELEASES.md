# Reviewed release cycles

The user's instruction of 4 October 2026 authorizes iterative improvements, feature branches, development reviews, publication and version tags. Each cycle must still produce a concrete reviewed result.

1. Read the current roadmap and inspect the live release. Ask: what prevents a visitor from understanding the place, finding the right offer or making an inquiry?
2. Choose a bounded improvement and document its purpose. Work on `feature/<purpose>` from current `dev`.
3. Run brand/content/syntax tests and the browser review. Look at the actual section screenshots and scroll frames in both languages and multiple widths. Correct issues before integration.
4. Open a PR to `dev`; inspect its final diff and successful CI. Integrate the feature.
5. Increase the semantic version (a PR to main verifies it against its exact main base), metadata and cache keys; include release notes recording changes, verification, limitations and the next useful improvement.
6. Open `dev` → `main`, with the expected reviewed head. Inspect the final diff and successful CI before merging.
7. On main, CI creates an annotated `vVERSION` tag and a GitHub release after its checks pass. Existing tags may never be moved. Each main integration must have a new version.
8. Wait for Pages publication, verify bytes/version and exercise the live navigation. Log the release commit, tag, PRs, checks and deployment.
9. Reassess the result and update the backlog. Begin another bounded cycle when it materially improves the site.

No invented content, real mail submissions, private user information in review artifacts, arbitrary version bumps or merges merely to increase the release count. The automated browser uses fake contact data and intercepts every email request.

Screenshots and videos live in CI artifacts for 14 days; release notes and review findings remain in Git. Local review evidence is outside the repository. CI success validates behavior, not subjective art direction; visual inspection is still required before merging.

# Reviewed release cycles

The user's instruction of 4 October 2026 authorizes iterative improvements, feature branches, development reviews, publication and version tags. Each cycle must still produce a concrete reviewed result.

1. Read the current roadmap and inspect the live release. Ask: what prevents a visitor from understanding the place, finding the right offer or making an inquiry?
2. Choose a bounded improvement and document its purpose. Work on `feature/<purpose>` from current `develop`.
3. Run brand/content/syntax tests and the browser review. Look at the actual section screenshots and scroll frames in both languages and multiple widths. Correct issues before integration.
4. Open a PR to `develop`. Run external Claude CLI with Sonnet and high effort on its exact head. If the invocation fails, record the error and invoke gpt-6.1-sol at medium effort, as authorized by the owner. Record actual model, effort, head SHA, findings and resolutions in the PR. A new code commit requires a new review. Inspect the final diff and successful CI before integration.
5. Increase the semantic version (a PR to main verifies it against its exact main base), metadata and cache keys; include release notes recording changes, verification, limitations and the next useful improvement.
6. Open `develop` → `main`, with the expected reviewed head. Inspect the final diff and successful CI before merging.
7. On main, CI creates an annotated `vVERSION` tag and a GitHub release after its checks pass. Existing tags may never be moved. Each main integration must have a new version.
8. Wait for Pages publication, verify bytes/version and exercise the live navigation. Log the release commit, tag, PRs, checks and deployment.
9. Reassess the result and update the backlog. Begin another bounded cycle when it materially improves the site.

No invented content, real mail submissions, private user information in review artifacts, arbitrary version bumps or merges merely to increase the release count. The automated browser uses fake contact data and intercepts every email request.

Screenshots and videos live in CI artifacts for 14 days; release notes and review findings remain in Git. Local review evidence is outside the repository. CI success validates behavior, not subjective art direction; visual inspection is still required before merging.

### One-time restoration of v1.4.0

v1.4.0 passed feature/main-PR and public review, but its post-main release gate exposed a browser timing race: the test asserted paused playback immediately after the dialog became closed, before the native asynchronous close event released the player. Its tag was correctly withheld. The v1.5.0 workflow rechecks the immutable v1.4.0 product commit in a temporary worktree, changing exactly that test assertion to wait for paused playback and released sources. It repeats all original static/browser checks. Only after both reviews pass may the release job restore the missing annotated v1.4.0 tag at ae36e702289cb12b6d2222a2ea1703bc1422c4e5 and publish v1.5.0. Product files and existing tags are never altered. Later runs verify the restored tag and skip the old browser review.

From v1.6.0, superseded pull-request reviews are cancelled within their own PR concurrency group. Push reviews and main release jobs are not cancelled by newer pushes. This allows feature iteration while preserving the complete review/tag gate on main.

## Release checklist: develop → main

- Freeze the candidate head and record its feature PRs, external-review provenance and resolved findings. Review the complete release diff, including configuration and dependencies.
- Verify semantic version, HTML/cache keys, release notes, approved content and asset hashes. Keep Pages on `main`; preserve the final domain and Microsoft 365 DNS.
- Require successful complete CI on the final release PR. This includes isolated MySQL, Chromium, mobile WebKit, motion, responsive navigation, calendar interception and static/reduced-motion fallbacks.
- Inspect screenshots and actual scroll frames in both languages at 320, 390, 768, **884**, 901 and desktop widths. Check layout, contrast, keyboard focus, header/footer, chapter text, quick forward/reverse scrubbing, cold media load and viewport changes. Passing tests alone does not approve art direction.
- No real mail/calendar submissions. Document any limitations instead of silently passing them.
- Merge only the exact reviewed head. Wait for main quality/release and Pages; verify immutable tag target, public HTTPS on apex/www, fresh version, video byte ranges, legal pages and Schedule a visit. Record deployment evidence in the release PR.

### External reviewer

Run `python scripts/review-feature.py --base origin/develop --output /path/outside/repo/sonnet-review.json` on a clean committed tree. `CLAUDE_BIN` may point to the installed official Claude CLI. Authentication remains private and must already exist. The runner requests Sonnet/high, limits tools to source reads, verifies actual model and result structure, and fails closed on CLI/auth/timeout/schema errors.

An actual invocation failure permits Sol/medium. Its separate report must reference the failed Sonnet report and the same head. A blocking finding is not a CLI failure: fix it and re-review. Put evidence in a PR comment and publish the `external-review` status on that head only after completion. Never manufacture a Sonnet pass or approve based solely on auth status.

Verify branch protection requires `external-review` and successful quality checks on `develop` and `main`, and PRs for integration. If repository permissions cannot configure it, state that limitation; do not describe these documented rules as server-enforced protection. The old `dev` branch is historical and no longer a delivery target.

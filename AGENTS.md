# La Jolla delivery rules

Use `feature/<purpose>` from `develop`; open a feature PR to `develop`, then a release PR from `develop` to `main`. Do not integrate through the retired `dev` branch or push product changes directly to integration branches.

Before integrating a feature:
- Audit the real behavior and inspect screenshots in EN/ES, including mobile, 884px tablet and desktop. Keep genuine approved venue assets and content. Do not generate new video for this cycle.
- Run the existing quality suite and the checks appropriate to the change. No real emails or bookings in automated tests.
- Freeze the PR head and invoke external Claude CLI with **Sonnet, high effort** using `scripts/review-feature.py`. It must perform a read-only review of the final diff and relevant source.
- Only after an actual Sonnet invocation fails, record its failure and use **gpt-6.1-sol, medium effort**, as explicitly authorized by the owner. Never label this fallback as a Sonnet review.
- Record reviewer/model/effort, exact head SHA, findings, resolutions and visual evidence in the PR. Resolve blocking findings. Any code change invalidates the previous review.
- Check the PR's exact head and successful CI immediately before merge. Publish an `external-review` commit status with the review evidence URL; success requires a completed review with no unresolved blocking findings. Do not bypass failing checks.

Before integrating `develop` into `main`, follow `tests/RELEASES.md`: new semantic version, release notes, final diff, successful complete CI and methodical visual/browser checks. After merge, wait for release and Pages, verify HTTPS on root/www, version, critical assets and visit navigation. Tags are immutable. Report any validation limits honestly.

Review reports and screenshots live outside the source tree or in CI artifacts/PR evidence. Do not commit a report claiming to review its own resulting commit: committing the report changes the SHA.

Branch protection must be verified through GitHub, not inferred from this file. Documentation alone does not enforce merge protection.

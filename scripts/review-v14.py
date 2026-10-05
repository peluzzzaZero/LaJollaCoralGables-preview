"""Validate the immutable v1.4.0 tree with an eventual native-dialog close assertion."""
import argparse
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
COMMIT = 'ae36e702289cb12b6d2222a2ea1703bc1422c4e5'
TAG = 'v1.4.0'


def run(*args, cwd=ROOT):
    subprocess.run(args, cwd=cwd, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--browser')
    args = parser.parse_args()
    args.output = args.output.resolve()
    existing = subprocess.run(['git', 'rev-parse', '--verify', 'refs/tags/' + TAG], cwd=ROOT, capture_output=True, text=True)
    if existing.returncode == 0:
        target = subprocess.check_output(['git', 'rev-list', '-n', '1', TAG], cwd=ROOT, text=True).strip()
        kind = subprocess.check_output(['git', 'cat-file', '-t', TAG], cwd=ROOT, text=True).strip()
        assert target == COMMIT and kind == 'tag', 'Never move an existing release tag'
        print('v1.4.0 already has its verified immutable annotated tag', flush=True)
        return
    run('git', 'merge-base', '--is-ancestor', COMMIT, 'HEAD')
    with tempfile.TemporaryDirectory(prefix='lajolla-v14-review-') as temporary:
        checkout = Path(temporary) / 'repo'
        run('git', 'worktree', 'add', '--detach', str(checkout), COMMIT)
        try:
            assert (checkout / 'VERSION').read_text().strip() == '1.4.0'
            test = checkout / 'tests/browser/review.py'
            source = test.read_text()
            old = '            assert await video.evaluate("v => v.paused")\n            assert await video.locator("source").count() == 0'
            new = '            await page.wait_for_function("() => { const v = document.querySelector(\'#film-viewer video\'); return v.paused && v.querySelectorAll(\'source\').length === 0; }")\n            assert await video.locator("source").count() == 0'
            assert source.count(old) == 1, 'The retrospective adjustment must remain exactly scoped'
            test.write_text(source.replace(old, new))
            # Product files remain exactly those of the immutable release commit.
            changed = subprocess.check_output(['git', 'diff', '--name-only'], cwd=checkout, text=True).strip()
            assert changed == 'tests/browser/review.py'
            run('node', '--check', 'script.js', cwd=checkout)
            run('node', '--test', *[str(path.relative_to(checkout)) for path in sorted((checkout / 'tests').glob('*.test.mjs'))], cwd=checkout)
            command = [sys.executable, 'tests/browser/review.py', '--output', str(args.output)]
            if args.browser:
                command.extend(['--browser', args.browser])
            run(*command, cwd=checkout)
            print('Immutable v1.4.0 product passed its full review with correctly awaited native close', flush=True)
        finally:
            run('git', 'worktree', 'remove', '--force', str(checkout))


if __name__ == '__main__':
    main()

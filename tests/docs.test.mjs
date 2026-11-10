import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const here = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, here), 'utf8');
const readme = read('README.md');
const manifest = JSON.parse(read('manifest.json'));
const pkg = JSON.parse(read('package.json'));

test('project metadata matches and extension permissions remain minimal', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.version, pkg.version);
  assert.deepEqual(manifest.permissions, ['activeTab', 'scripting']);
  assert.equal(manifest.action.default_popup, 'popup.html');
});

test('public README has a demo, install instructions and accurate privacy details', () => {
  assert.match(readme, /https:\/\/kaitlyn-xie-jj\.github\.io\/everything-has-eyes\//);
  assert.match(readme, /## Install/);
  assert.match(readme, /## Privacy & permissions/);
  assert.match(readme, /not published on the Chrome Web Store yet/i);
  assert.doesNotMatch(readme, /\\n\\n/, 'no accidentally escaped newlines');
});

test('GitHub preview is self-contained and has alternative text', () => {
  assert.ok(existsSync(new URL('assets/preview.svg', here)));
  const svg = read('assets/preview.svg');
  assert.match(svg, /<svg\b/);
  assert.match(svg, /<title\b/);
  assert.match(readme, /!\[[^\]]+\]\(assets\/preview\.svg\)/);
  assert.doesNotMatch(svg, /https?:\/\//g, 'inline-only illustration has no remote assets');
});

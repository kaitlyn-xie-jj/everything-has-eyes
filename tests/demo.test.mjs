import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('demo is standalone, accessible, and loads the existing overlay', () => {
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<title>Everything Has Eyes/);
  assert.match(html, /id="eyes-toggle"[^>]*aria-pressed="false"/);
  assert.match(html, /id="eyes-status"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /script\.src = 'eyes\.js';/);
  assert.match(html, /tiny-eyes-overlay-v1/);
  assert.match(html, /<img class="face-img"/);
  assert.match(html, /type="text" aria-label="Test googly-eyes input"/);
  assert.doesNotMatch(html, /<script[^>]*src="https?:/);
});

test('demo includes working toggle and a clear installation link', () => {
  assert.match(html, /toggle\.addEventListener\('click'/);
  assert.match(html, /script\.addEventListener\('load'/);
  assert.match(html, /script\.addEventListener\('error'/);
  assert.match(html, /script\.remove\(\)/);
  assert.match(html, /setAttribute\('aria-pressed', String\(active\)\)/);
  assert.match(html, /github\.com\/kaitlyn-xie-jj\/everything-has-eyes#install/);
});

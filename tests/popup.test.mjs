import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../popup.js', import.meta.url), 'utf8');

function popup(query, inject = async () => {}) {
  let click;
  let closed = false;
  const message = { textContent: 'Make this webpage look back at you.' };
  const document = {
    querySelector(selector) {
      if (selector === '#toggle') return {
        addEventListener(type, fn) {
          assert.equal(type, 'click');
          click = fn;
        },
      };
      if (selector === 'p') return message;
      throw new Error('Unexpected selector: ' + selector);
    },
  };
  const chrome = {
    tabs: { query },
    scripting: { executeScript: inject },
  };
  runInNewContext(script, { document, chrome, window: { close() { closed = true; } } });
  return { click: () => click(), message, isClosed: () => closed };
}

test('click injects the script into the active tab and closes popup', async () => {
  let queried = false;
  let injected;
  const p = popup(async options => {
    queried = options.active && options.currentWindow;
    return [{ id: 31 }];
  }, async options => { injected = options; });
  await p.click();
  assert.equal(queried, true);
  assert.equal(injected.target.tabId, 31);
  assert.deepEqual(Array.from(injected.files), ['eyes.js']);
  assert.equal(p.isClosed(), true);
});

test('rejected tab lookup shows a useful message without throwing', async () => {
  const p = popup(async () => { throw new Error('No window'); });
  await assert.doesNotReject(p.click());
  assert.match(p.message.textContent, /Could not add eyes/);
  assert.equal(p.isClosed(), false);
});

test('missing active tab skips injection and does not close popup', async () => {
  let injected = false;
  const p = popup(async () => [], async () => { injected = true; });
  await p.click();
  assert.equal(injected, false);
  assert.match(p.message.textContent, /ordinary webpage/);
  assert.equal(p.isClosed(), false);
});

test('rejected script injection leaves popup open and shows message', async () => {
  const p = popup(async () => [{ id: 31 }], async () => {
    throw new Error('Restricted page');
  });
  await p.click();
  assert.match(p.message.textContent, /Could not add eyes/);
  assert.equal(p.isClosed(), false);
});

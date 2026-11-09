# Everything Has Eyes 👀

A tiny, playful Chrome extension that turns webpage elements into expressive googly-eyed characters. The eyes follow your pointer.\n\n**New:** oversized cartoon eyes, gentle independent blinking, and **shy mode**: move your pointer close to a face and its pupils softly glance away; move back and it looks at you again. The same overlay scales down for ordinary websites.

## Try it first

The [live demo](https://kaitlyn-xie-jj.github.io/everything-has-eyes/) runs the **same `eyes.js` overlay** in a playful sample page, so you can try it before installing the extension. Click **Give everything eyes**, then move your mouse. The demo runs locally in the page with no tracking or backend.

**Deployment status:** The demo source is committed, and [the Pages deployment workflow](.github/workflows/deploy-demo.yml) now publishes `index.html` and `eyes.js` on pushes to `main`. If the link returns 404, the site is **not deployed yet**. Repository owner: open [Settings → Pages](https://github.com/kaitlyn-xie-jj/everything-has-eyes/settings/pages), set **Build and deployment → Source → GitHub Actions**, then check [Actions](https://github.com/kaitlyn-xie-jj/everything-has-eyes/actions/workflows/deploy-demo.yml) for a successful deploy. A source file existing on `main` does *not* automatically mean the Pages site is live.

## Install
1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select this repository's folder.
3. Open any ordinary webpage and click the extension icon. Click again to turn it off.

Works locally with no backend, analytics, or network calls. Chrome internal pages cannot be modified.

## Testing

Requires Node.js 22+; no npm install is needed.

```sh
npm run check
npm test
```

GitHub Actions runs the four overlay regression tests plus two static demo checks (visibility filtering, pointer tracking, toggling/cleanup, 70-element cap, disconnected elements) and JavaScript/manifest syntax checks on every pull request.

A local headless Chromium smoke test also verified injection on a test webpage with four different element types, pupil movement, toggling off, and no page errors. The extension popup itself has not yet been verified by clicking the icon in a user's installed browser.

MIT License.
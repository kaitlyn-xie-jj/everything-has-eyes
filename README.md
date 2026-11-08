# Everything Has Eyes 👀

A tiny, playful Chrome extension that gives buttons, links, images, and inputs googly eyes that follow your mouse.

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

GitHub Actions runs four regression tests (visibility filtering, pointer tracking, toggling/cleanup, 70-element cap, disconnected elements) and JavaScript/manifest syntax checks on every pull request.

A local headless Chromium smoke test also verified injection on a test webpage with four different element types, pupil movement, toggling off, and no page errors. The extension popup itself has not yet been verified by clicking the icon in a user's installed browser.

MIT License.
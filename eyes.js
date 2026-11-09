(() => {
  const ID = 'tiny-eyes-overlay-v1';
  const existing = document.getElementById(ID);
  if (existing) {
    existing.remove();
    window.__tinyEyesCleanup?.();
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = ID;
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '2147483647'
  });
  document.documentElement.appendChild(overlay);

  // On the demo page, turn whole cards into characters. Else use common controls.
  const demoTargets = [...document.querySelectorAll('[data-eyes-target]')];
  const pool = demoTargets.length ? demoTargets :
    [...document.querySelectorAll('button, a, input, textarea, select, img, [role="button"]')];
  const candidates = pool.filter((el) => {
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return r.width >= 35 && r.height >= 18 &&
      r.top < innerHeight && r.left < innerWidth &&
      r.bottom > 0 && r.right > 0 &&
      style.visibility !== 'hidden' && style.display !== 'none';
  }).slice(0, 70);

  const items = [];
  function makeEye(size) {
    const outer = document.createElement('span');
    const pupil = document.createElement('span');
    const diameter = Math.round(size * 0.37);
    Object.assign(outer.style, {
      width: size + 'px', height: size + 'px', display: 'inline-block',
      boxSizing: 'border-box', position: 'relative', background: '#fff',
      border: Math.max(2, Math.round(size * .09)) + 'px solid #29243c',
      borderRadius: '50%', boxShadow: '1px 4px 0 #29243c22'
    });
    Object.assign(pupil.style, {
      position: 'absolute', left: '50%', top: '50%',
      width: diameter + 'px', height: diameter + 'px', borderRadius: '50%',
      background: '#29243c', transform: 'translate(-50%, -50%)',
      willChange: 'transform'
    });
    outer.appendChild(pupil);
    return { outer, pupil };
  }

  for (const el of candidates) {
    const box = el.getBoundingClientRect();
    const big = typeof el.hasAttribute === 'function' && el.hasAttribute('data-eyes-target');
    const size = big ? Math.min(52, Math.max(32, box.width * .14)) :
      Math.min(32, Math.max(19, box.width * .13));
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position: 'absolute', display: 'flex', alignItems: 'center',
      gap: Math.round(size * .16) + 'px',
      transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 3px 2px #00000014)',
      transition: 'filter 180ms'
    });
    const a = makeEye(size), b = makeEye(size);
    wrap.append(a.outer, b.outer);
    overlay.appendChild(wrap);
    items.push({
      el, wrap, pupils: [a.pupil, b.pupil], whites: [a.outer, b.outer],
      size, big, nextBlink: Date.now() + 1200 + Math.random() * 4200,
      blinkUntil: 0, blinking: false, doubleBlink: false
    });
  }

  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let frame = 0;
  const onMove = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  };

  function animate() {
    const now = Date.now();
    for (const item of items) {
      // Each character blinks independently, occasionally twice in a row.
      if (now >= item.nextBlink && !item.blinking) {
        item.blinking = true;
        item.blinkUntil = now + 165;
        item.doubleBlink = Math.random() < 0.14;
      }
      if (item.blinking && now >= item.blinkUntil) {
        item.blinking = false;
        item.nextBlink = now + (item.doubleBlink ? 230 : 2200 + Math.random() * 4800);
        item.doubleBlink = false;
      }
      for (const white of item.whites) {
        white.style.transform = item.blinking ? 'scaleY(0.09)' : 'scaleY(1)';
      }
      if (!item.el.isConnected) { item.wrap.style.display = 'none'; continue; }
      const r = item.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) {
        item.wrap.style.display = 'none';
        continue;
      }
      item.wrap.style.display = 'flex';
      const cx = Math.max(item.size, Math.min(innerWidth - item.size, r.left + r.width / 2));
      const cy = Math.max(item.size, Math.min(innerHeight - item.size,
        r.top + (item.big ? Math.min(r.height * .28, 84) : Math.min(r.height * .30, 22))));
      item.wrap.style.left = cx + 'px';
      item.wrap.style.top = cy + 'px';
      const dx = mouseX - cx, dy = mouseY - cy;
      const distance = Math.hypot(dx, dy) || 1;
      const reach = item.size * .18;
      const offset = Math.min(reach, distance / 22);
      for (const pupil of item.pupils) {
        pupil.style.transform = 'translate(calc(-50% + ' + (dx / distance * offset) +
          'px), calc(-50% + ' + (dy / distance * offset) + 'px))';
      }
      item.wrap.style.filter = distance < 190 ?
        'drop-shadow(0 4px 2px #00000022)' : 'drop-shadow(0 3px 2px #00000014)';
    }
    frame = requestAnimationFrame(animate);
  }

  document.addEventListener('pointermove', onMove, { passive: true });
  animate();
  window.__tinyEyesCleanup = () => {
    cancelAnimationFrame(frame);
    document.removeEventListener('pointermove', onMove);
    delete window.__tinyEyesCleanup;
  };
})();

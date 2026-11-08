(() => {
  const ID = 'tiny-eyes-overlay-v1';
  const existing = document.getElementById(ID);

  // Clicking the extension icon again turns the eyes off.
  if (existing) {
    window.__tinyEyesCleanup?.();
    existing.remove();
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = ID;
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '2147483647',
  });
  document.documentElement.appendChild(overlay);

  const candidates = [
    ...document.querySelectorAll('button,a,input,textarea,select,img,[role="button"]'),
  ].filter((el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return (
      rect.width >= 35 &&
      rect.height >= 18 &&
      rect.top < innerHeight &&
      rect.left < innerWidth &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      style.visibility !== 'hidden' &&
      style.display !== 'none'
    );
  }).slice(0, 70);

  function makeEye() {
    const outer = document.createElement('span');
    Object.assign(outer.style, {
      width: '16px',
      height: '16px',
      background: 'white',
      border: '2px solid #222',
      borderRadius: '50%',
      display: 'inline-block',
      position: 'relative',
      boxSizing: 'border-box',
    });
    const pupil = document.createElement('span');
    Object.assign(pupil.style, {
      width: '6px',
      height: '6px',
      background: '#222',
      borderRadius: '50%',
      position: 'absolute',
      left: '3px',
      top: '3px',
    });
    outer.append(pupil);
    return { outer, pupil };
  }

  const eyes = [];
  for (const el of candidates) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position: 'absolute',
      display: 'flex',
      gap: '2px',
      transform: 'translate(-50%,-50%)',
    });
    const left = makeEye();
    const right = makeEye();
    wrap.append(left.outer, right.outer);
    overlay.append(wrap);
    eyes.push({ el, wrap, pupils: [left.pupil, right.pupil] });
  }

  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let frame = 0;

  function update() {
    frame = 0;
    if (document.hidden) return;

    for (const item of eyes) {
      if (!item.el.isConnected) {
        item.wrap.style.display = 'none';
        continue;
      }
      const rect = item.el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight ||
          rect.right < 0 || rect.left > innerWidth) {
        item.wrap.style.display = 'none';
        continue;
      }
      item.wrap.style.display = 'flex';

      const cx = Math.max(15, Math.min(innerWidth - 15, rect.left + rect.width / 2));
      const cy = Math.max(15, Math.min(innerHeight - 15,
        rect.top + Math.min(rect.height * 0.35, 18)));
      item.wrap.style.left = cx + 'px';
      item.wrap.style.top = cy + 'px';

      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const length = Math.hypot(dx, dy) || 1;
      const distance = Math.min(3, length / 40);
      for (const pupil of item.pupils) {
        pupil.style.transform = 'translate(' +
          dx / length * distance + 'px,' + dy / length * distance + 'px)';
      }
    }
  }

  // One frame per burst of interaction, instead of reading every target's
  // layout on every animation frame indefinitely.
  function schedule() {
    if (!frame && !document.hidden) {
      frame = requestAnimationFrame(update);
    }
  }

  const onPointerMove = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    schedule();
  };
  const onVisibilityChange = () => {
    if (document.hidden) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    } else {
      schedule();
    }
  };

  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
  // Capture scroll events from nested containers as well as the document.
  window.addEventListener('scroll', schedule, true);
  window.addEventListener('resize', schedule);
  schedule();

  window.__tinyEyesCleanup = () => {
    if (frame) cancelAnimationFrame(frame);
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('scroll', schedule, true);
    window.removeEventListener('resize', schedule);
    delete window.__tinyEyesCleanup;
  };
})();

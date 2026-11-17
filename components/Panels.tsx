'use client';
import { useEffect } from 'react';

// Scrolls long panels' text automatically as the page scrolls, so every line can be read.
export default function Panels() {
  useEffect(() => {
    let raf = 0;
    const ss = (t: number) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
    const loop = () => {
      const p = parseFloat(document.documentElement.style.getPropertyValue('--p') || '0');
      document.querySelectorAll<HTMLElement>('.pn').forEach((el) => {
        const a = parseFloat(el.style.getPropertyValue('--a')), b = parseFloat(el.style.getPropertyValue('--b')), len = b - a;
        el.scrollTop = Math.max(0, el.scrollHeight - el.clientHeight) * ss((p - a - len * 0.2) / (len * 0.6));
      });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return null;
}

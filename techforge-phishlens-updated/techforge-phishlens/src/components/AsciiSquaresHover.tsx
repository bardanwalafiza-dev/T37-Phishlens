import React, { useEffect, useRef } from 'react';

/**
 * Interactive ASCII square field drawn on the page background (outside the
 * main card). Small squares sit idle; when the cursor nears them they ease
 * up into bigger squares, then into full ASCII-drawn boxes, and settle back
 * when the cursor leaves. Purely decorative: non-interactive, aria-hidden,
 * desktop only, and static when the user prefers reduced motion.
 */

const CELL = 30; // grid pitch in CSS px
const RADIUS = 130; // hover influence radius in CSS px
const EASE_IN = 0.22;
const EASE_OUT = 0.07;

const SMALL = ['▪', '▫'];
const MID = ['□', '■'];

export const AsciiSquaresHover: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let levels = new Float32Array(0);
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };
    let excludes: DOMRect[] = [];

    const refreshExcludes = () => {
      excludes = Array.from(document.querySelectorAll('[data-ascii-exclude]')).map((el) =>
        el.getBoundingClientRect(),
      );
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      levels = new Float32Array(cols * rows);
      refreshExcludes();
      start();
    };

    const insideExcluded = (x: number, y: number, pad: number) =>
      excludes.some(
        (r) => x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad,
      );

    const drawBox = (cx: number, cy: number, v: number) => {
      // Big ASCII square: three text rows centred on the cell.
      const size = 9 + v * 3;
      ctx.font = `700 ${size}px "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace`;
      ctx.fillText('+--+', cx, cy - size * 0.9);
      ctx.fillText('|##|', cx, cy);
      ctx.fillText('+--+', cx, cy + size * 0.9);
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let active = false;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const cx = c * CELL + CELL / 2;
          const cy = r * CELL + CELL / 2;

          if (insideExcluded(cx, cy, 10)) continue;

          const d = Math.hypot(cx - mouse.x, cy - mouse.y);
          const target = reduceMotion ? 0 : d < RADIUS ? 1 - d / RADIUS : 0;
          const cur = levels[i];
          const next = cur + (target - cur) * (target > cur ? EASE_IN : EASE_OUT);
          levels[i] = Math.abs(next - target) < 0.004 ? target : next;
          const v = levels[i];
          if (v !== target) active = true;

          // Stage by level: small -> medium -> big ASCII box
          const alpha = 0.14 + v * 0.55;
          ctx.fillStyle = `rgba(225, 29, 72, ${alpha.toFixed(3)})`;

          if (v < 0.25) {
            ctx.font = `${8 + v * 14}px ui-monospace, Menlo, Consolas, monospace`;
            ctx.fillText(SMALL[(r + c) % 2], cx, cy);
          } else if (v < 0.6) {
            ctx.font = `${12 + v * 18}px ui-monospace, Menlo, Consolas, monospace`;
            ctx.fillText(MID[(r + c) % 2], cx, cy);
          } else {
            drawBox(cx, cy, v);
          }
        }
      }

      raf = active ? requestAnimationFrame(frame) : 0;
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      refreshExcludes(); // card height changes between tabs
      start();
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      start();
    };
    const onScroll = () => {
      refreshExcludes();
      start();
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none select-none fixed inset-0 z-0 hidden md:block"
    />
  );
};

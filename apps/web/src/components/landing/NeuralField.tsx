"use client";

import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

/**
 * Lightweight 2D canvas neural mesh — intentionally not WebGL/Three.js.
 * Includes subtle pointer parallax (scene offset + soft node attraction).
 */
export function NeuralField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let nodes: Node[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;

    // Pointer: target (raw) + smoothed for parallax
    const pointerTarget = { x: 0.5, y: 0.5 };
    const pointerSmooth = { x: 0.5, y: 0.5 };
    // Scene parallax offset in px (lerped)
    const sceneOffset = { x: 0, y: 0 };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(28, Math.min(64, Math.floor((w * h) / 18000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1.2 + Math.random() * 1.6,
      }));
    };

    const onPointerMove = (e: PointerEvent) => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointerTarget.x = (e.clientX - rect.left) / rect.width;
      pointerTarget.y = (e.clientY - rect.top) / rect.height;
    };

    const onPointerLeave = () => {
      pointerTarget.x = 0.5;
      pointerTarget.y = 0.5;
    };

    resize();
    window.addEventListener("resize", resize);

    // Listen on window so canvas can stay pointer-events-none
    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      // Reset when leaving the document window edge is awkward; soft center is enough
      document.addEventListener("mouseleave", onPointerLeave);
    }

    const linkDist = 130;
    const linkDist2 = linkDist * linkDist;
    const PARALLAX_STRENGTH = 22; // max scene shift in px
    const ATTRACT = 0.012; // soft pull toward pointer

    const draw = () => {
      // Smooth pointer + scene offset
      if (!reduceMotion) {
        pointerSmooth.x += (pointerTarget.x - pointerSmooth.x) * 0.06;
        pointerSmooth.y += (pointerTarget.y - pointerSmooth.y) * 0.06;
        const targetOx = (pointerSmooth.x - 0.5) * PARALLAX_STRENGTH;
        const targetOy = (pointerSmooth.y - 0.5) * PARALLAX_STRENGTH;
        sceneOffset.x += (targetOx - sceneOffset.x) * 0.08;
        sceneOffset.y += (targetOy - sceneOffset.y) * 0.08;
      }

      ctx.clearRect(0, 0, w, h);

      // Soft radial wash follows pointer slightly
      const gx = w * (0.5 + (pointerSmooth.x - 0.5) * 0.12);
      const gy = h * (0.35 + (pointerSmooth.y - 0.5) * 0.08);
      const gradient = ctx.createRadialGradient(
        gx,
        gy,
        40,
        gx,
        gy + h * 0.05,
        Math.max(w, h) * 0.55,
      );
      gradient.addColorStop(0, "rgba(99, 102, 241, 0.05)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      const px = pointerSmooth.x * w;
      const py = pointerSmooth.y * h;

      if (!reduceMotion) {
        for (const n of nodes) {
          // Soft attraction toward pointer (very subtle)
          const adx = px - n.x;
          const ady = py - n.y;
          const ad2 = adx * adx + ady * ady;
          if (ad2 > 40 && ad2 < 280 * 280) {
            n.vx += adx * ATTRACT * 0.002;
            n.vy += ady * ATTRACT * 0.002;
          }

          // Cap velocity so attraction never runs away
          const speed = Math.hypot(n.vx, n.vy);
          if (speed > 0.55) {
            n.vx = (n.vx / speed) * 0.55;
            n.vy = (n.vy / speed) * 0.55;
          }

          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
          n.x = Math.max(0, Math.min(w, n.x));
          n.y = Math.max(0, Math.min(h, n.y));
        }
      }

      const ox = sceneOffset.x;
      const oy = sceneOffset.y;

      // Links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > linkDist2) continue;
          const alpha = (1 - Math.sqrt(d2) / linkDist) * 0.28;
          ctx.beginPath();
          ctx.moveTo(a.x + ox, a.y + oy);
          ctx.lineTo(b.x + ox, b.y + oy);
          ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Nodes — highlight those near pointer
      for (const n of nodes) {
        const dx = n.x - px;
        const dy = n.y - py;
        const near = dx * dx + dy * dy < 120 * 120;
        ctx.beginPath();
        ctx.arc(n.x + ox, n.y + oy, near ? n.r * 1.35 : n.r, 0, Math.PI * 2);
        ctx.fillStyle = near
          ? "rgba(199, 210, 254, 0.95)"
          : "rgba(165, 180, 252, 0.75)";
        ctx.fill();
      }

      // Soft cursor halo
      if (!reduceMotion) {
        const halo = ctx.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, 90);
        halo.addColorStop(0, "rgba(129, 140, 248, 0.07)");
        halo.addColorStop(1, "rgba(129, 140, 248, 0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(px + ox, py + oy, 90, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduceMotion) {
        raf = requestAnimationFrame(draw);
      }
    };

    draw();
    // One static frame if reduced motion
    if (reduceMotion) {
      // already drew once
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={
        className ?? "pointer-events-none absolute inset-0 h-full w-full"
      }
    />
  );
}

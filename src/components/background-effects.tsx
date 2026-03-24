"use client";

import { useEffect, useRef, useCallback } from "react";

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  r: number;
  g: number;
  b: number;
  phase: number;
  speed: number;
}

export function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const orbsRef = useRef<Orb[]>([]);
  const frameRef = useRef(0);

  const createOrbs = useCallback((w: number, h: number): Orb[] => {
    const palette = [
      { r: 139, g: 108, b: 246 }, // violet
      { r: 217, g: 70, b: 239 },  // magenta
      { r: 155, g: 111, b: 247 }, // purple
      { r: 99, g: 102, b: 241 },  // indigo
      { r: 6, g: 182, b: 212 },   // cyan accent
      { r: 139, g: 92, b: 246 },  // deep violet
      { r: 192, g: 70, b: 239 },  // pink-purple
    ];

    return Array.from({ length: 7 }, (_, i) => {
      const color = palette[i % palette.length];
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 250 + Math.random() * 200,
        r: color.r,
        g: color.g,
        b: color.b,
        phase: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.004,
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      orbsRef.current = createOrbs(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      time++;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      for (const orb of orbsRef.current) {
        const drift = Math.sin(time * orb.speed + orb.phase);
        const driftY = Math.cos(time * orb.speed * 0.7 + orb.phase);

        orb.x += orb.vx + drift * 0.3;
        orb.y += orb.vy + driftY * 0.3;

        if (orb.x < -orb.radius) orb.x = w + orb.radius;
        if (orb.x > w + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = h + orb.radius;
        if (orb.y > h + orb.radius) orb.y = -orb.radius;

        const pulseScale = 1 + 0.15 * Math.sin(time * orb.speed * 1.5 + orb.phase);
        const currentRadius = orb.radius * pulseScale;

        const alpha = 0.08 + 0.04 * Math.sin(time * orb.speed * 2 + orb.phase);

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          currentRadius
        );
        gradient.addColorStop(0, `rgba(${orb.r}, ${orb.g}, ${orb.b}, ${alpha})`);
        gradient.addColorStop(0.4, `rgba(${orb.r}, ${orb.g}, ${orb.b}, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${orb.r}, ${orb.g}, ${orb.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouse-reactive glow on canvas too
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0 && my > 0) {
        const mouseGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 300);
        mouseGrad.addColorStop(0, "rgba(139, 108, 246, 0.06)");
        mouseGrad.addColorStop(0.5, "rgba(217, 70, 239, 0.02)");
        mouseGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = mouseGrad;
        ctx.beginPath();
        ctx.arc(mx, my, 300, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [createOrbs]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {/* Animated gradient canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ opacity: 0.55 }}
      />

      {/* Noise texture */}
      <div className="bg-noise" />

      {/* Cursor-following glow (DOM layer for the bright spot) */}
      <div ref={glowRef} className="cursor-glow" />
    </>
  );
}

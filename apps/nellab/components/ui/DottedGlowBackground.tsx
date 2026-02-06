'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type DottedGlowBackgroundProps = {
  className?: string;
  /** Distance between dot centers in pixels */
  gap?: number;
  /** Base radius of each dot in CSS px */
  radius?: number;
  /** Dot color (will pulse by alpha) */
  color?: string;
  /** Shadow/glow color for bright dots */
  glowColor?: string;
  /** Global opacity for the whole layer */
  opacity?: number;
  /** Background radial fade opacity (0 = transparent) */
  backgroundOpacity?: number;
  /** Minimum per-dot speed in rad/s */
  speedMin?: number;
  /** Maximum per-dot speed in rad/s */
  speedMax?: number;
  /** Global speed multiplier */
  speedScale?: number;
};

/**
 * Canvas-based dotted background that randomly glows and dims.
 * Based on Aceternity UI Dotted Glow Background.
 */
export function DottedGlowBackground({
  className,
  gap = 12,
  radius = 2,
  color = 'rgba(255,255,255,0.4)',
  glowColor = 'rgba(6, 182, 212, 0.6)',
  opacity = 0.5,
  backgroundOpacity = 0,
  speedMin = 0.4,
  speedMax = 1.2,
  speedScale = 1,
}: DottedGlowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    const ctx = el.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let stopped = false;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    type Dot = { x: number; y: number; phase: number; speed: number };
    let dots: Dot[] = [];

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      el.width = Math.max(1, Math.floor(width * dpr));
      el.height = Math.max(1, Math.floor(height * dpr));
      el.style.width = `${Math.floor(width)}px`;
      el.style.height = `${Math.floor(height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const regenDots = () => {
      dots = [];
      const { width, height } = container.getBoundingClientRect();
      const cols = Math.ceil(width / gap) + 2;
      const rows = Math.ceil(height / gap) + 2;
      const min = Math.min(speedMin, speedMax);
      const max = Math.max(speedMin, speedMax);
      const span = Math.max(max - min, 0);
      for (let i = -1; i < cols; i++) {
        for (let j = -1; j < rows; j++) {
          const x = i * gap + (j % 2 === 0 ? 0 : gap * 0.5);
          const y = j * gap;
          const phase = Math.random() * Math.PI * 2;
          const speed = min + Math.random() * span;
          dots.push({ x, y, phase, speed });
        }
      }
    };

    const ro = new ResizeObserver(() => {
      resize();
      regenDots();
    });
    ro.observe(container);
    resize();
    regenDots();

    let last = performance.now();

    const draw = (now: number) => {
      if (stopped) return;
      const dt = (now - last) / 1000;
      last = now;
      const { width, height } = container.getBoundingClientRect();

      ctx.clearRect(0, 0, el.width, el.height);
      ctx.globalAlpha = opacity;

      if (backgroundOpacity > 0) {
        const grad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.4,
          Math.min(width, height) * 0.1,
          width * 0.5,
          height * 0.5,
          Math.max(width, height) * 0.7
        );
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, `rgba(0,0,0,${Math.min(Math.max(backgroundOpacity, 0), 1)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.save();
      ctx.fillStyle = color;
      const time = (now / 1000) * Math.max(speedScale, 0);

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const mod = (time * d.speed + d.phase) % 2;
        const lin = mod < 1 ? mod : 2 - mod;
        const a = 0.25 + 0.55 * lin;

        if (a > 0.6) {
          const glow = (a - 0.6) / 0.4;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 6 * glow;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = a * opacity;
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      resize();
      regenDots();
    };
    window.addEventListener('resize', handleResize);
    raf = requestAnimationFrame(draw);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      ro.disconnect();
    };
  }, [
    gap,
    radius,
    color,
    glowColor,
    opacity,
    backgroundOpacity,
    speedMin,
    speedMax,
    speedScale,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 h-full w-full"
      />
    </div>
  );
}

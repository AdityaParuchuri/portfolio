"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_BG_COLOR = "#0a0a0f";
const BIT_BASE = "rgba(100, 100, 120, 0.3)";
const DEFAULT_ACCENT_RGB: [number, number, number] = [96, 165, 250];
const DEFAULT_GLOW_COLOR = "rgba(96, 165, 250, 0.4)";
const BIT_SPACING = 40;
const BASE_FONT_SIZE = 14;
const SPOTLIGHT_RADIUS = 200;

const getThemeColor = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
};

const getAccentRgb = (): [number, number, number] => {
  const rgbRaw = getThemeColor(
    "--accent-primary-rgb",
    DEFAULT_ACCENT_RGB.join(", ")
  );
  const parsed = rgbRaw
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => !Number.isNaN(value));
  if (parsed.length !== 3) return DEFAULT_ACCENT_RGB;
  return [parsed[0], parsed[1], parsed[2]];
};

export default function SpotlightGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const bitsRef = useRef<{ x: number; y: number; value: string }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const buildGrid = () => {
      const bits: { x: number; y: number; value: string }[] = [];
      for (let x = 0; x < canvas.width; x += BIT_SPACING) {
        for (let y = 0; y < canvas.height; y += BIT_SPACING) {
          bits.push({ x, y, value: Math.random() > 0.5 ? "1" : "0" });
        }
      }
      bitsRef.current = bits;
    };

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildGrid();
    };
    updateSize();

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !animationRef.current) {
          render();
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", updateSize);

    const render = () => {
      if (!isVisibleRef.current) {
        animationRef.current = 0;
        return;
      }

      const accentRgb = getAccentRgb();
      const glowColor = getThemeColor("--glow-color", DEFAULT_GLOW_COLOR);
      const bgColor = getThemeColor("--bg-primary", DEFAULT_BG_COLOR);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const bits = bitsRef.current;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < bits.length; i++) {
        const bit = bits[i];
        const dx = mouseX - bit.x;
        const dy = mouseY - bit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let fontSize = BASE_FONT_SIZE;
        let color = BIT_BASE;

        if (distance < SPOTLIGHT_RADIUS) {
          const intensity = 1 - distance / SPOTLIGHT_RADIUS;
          fontSize = BASE_FONT_SIZE + intensity * 8;
          const opacity = 0.3 + intensity * 0.7;

          const r = Math.round(100 + intensity * Math.max(0, accentRgb[0] - 100));
          const g = Math.round(100 + intensity * Math.max(0, accentRgb[1] - 100));
          const b = Math.round(120 + intensity * Math.max(0, accentRgb[2] - 120));
          color = `rgba(${r}, ${g}, ${b}, ${opacity})`;

          if (distance < SPOTLIGHT_RADIUS * 0.3) {
            const glowIntensity = 1 - distance / (SPOTLIGHT_RADIUS * 0.3);
            ctx.shadowBlur = 20 * glowIntensity;
            ctx.shadowColor = glowColor;
          } else {
            ctx.shadowBlur = 0;
          }
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.font = `${fontSize}px "Courier New", monospace`;
        ctx.fillStyle = color;
        ctx.fillText(bit.value, bit.x, bit.y);
      }

      ctx.shadowBlur = 0;
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", updateSize);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10"
      style={{ background: "var(--bg-primary)" }}
    />
  );
}

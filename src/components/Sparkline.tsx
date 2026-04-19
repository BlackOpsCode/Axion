"use client";
import { useEffect, useRef } from "react";

interface Props {
  values: number[];
  color?: string;
  glow?: string;
  width?: number;
  height?: number;
}

export default function Sparkline({ values, color = "#3b82f6", glow = "rgba(59,130,246,0.3)", width = 240, height = 22 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c || values.length < 2) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    const mn = Math.min(...values), mx = Math.max(...values), rng = mx - mn || 1;
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - ((v - mn) / rng) * (H - 3) - 1;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineJoin = "round"; ctx.stroke();
    ctx.lineWidth = 4; ctx.globalAlpha = 0.15; ctx.strokeStyle = glow; ctx.stroke();
    ctx.globalAlpha = 1;
    const lx = W, lv = values[values.length - 1];
    const ly = H - ((lv - mn) / rng) * (H - 3) - 1;
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(lx - 1, ly, 2.5, 0, Math.PI * 2); ctx.fill();
  }, [values, color, glow]);

  return <canvas ref={ref} width={width} height={height} style={{ display: "block" }} />;
}
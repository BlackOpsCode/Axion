"use client";

import { useLayoutEffect, useRef } from "react";

interface Props {
  beamWaist: number;
  energy: number;
}

export default function GaussianPlot({ beamWaist, energy }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const draw = () => {
      const rect = wrap.getBoundingClientRect();
      const cssW = Math.max(1, Math.floor(rect.width));
      const cssH = Math.max(1, Math.floor(rect.height));
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;

      const W = cssW;
      const H = cssH;
      const pts = 600;
      const xRange = 3.5;
      const w0 = beamWaist;

      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "#020509";
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(41,98,182,0.15)";
      ctx.lineWidth = 0.5;

      for (let i = 1; i < 4; i++) {
        const gy = (H * i) / 4;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      [-2, -1, 0, 1, 2].forEach((xi) => {
        const gx = (W * (xi + xRange)) / (2 * xRange);
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      });

      // 1/e² reference lines
      const w0px = (W * w0) / (2 * xRange * 100);
      const e2y = H * (1 - Math.exp(-2));

      ctx.strokeStyle = "rgba(34,211,238,0.25)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([3, 4]);

      [-1, 1].forEach((s) => {
        const lx = W / 2 + s * w0px;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, H);
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.moveTo(0, e2y);
      ctx.lineTo(W, e2y);
      ctx.stroke();

      ctx.setLineDash([]);

      const gaussianY = (xn: number) =>
        Math.exp((-2 * xn * xn) / ((w0 * w0) / 10000));

      // Fill under curve
      ctx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const xn = (i / pts) * 2 * xRange - xRange;
        const yv = gaussianY(xn);
        const px = (W * i) / pts;
        const py = H * (1 - yv * 0.88);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(59,130,246,0.30)");
      grad.addColorStop(0.5, "rgba(34,211,238,0.12)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fill();

      // Curve
      ctx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const xn = (i / pts) * 2 * xRange - xRange;
        const yv = gaussianY(xn);
        const px = (W * i) / pts;
        const py = H * (1 - yv * 0.88);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 1.5;
      ctx.lineJoin = "round";
      ctx.stroke();

      // Peak dot
      const peakY = H * (1 - 0.88);
      ctx.fillStyle = "rgba(96,165,250,0.85)";
      ctx.beginPath();
      ctx.arc(W / 2, peakY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(74,106,154,0.8)";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText("1/e²", 4, e2y + 2);

      ctx.fillStyle = "rgba(34,211,238,0.7)";
      ctx.textAlign = "right";
      ctx.fillText(`E = ${energy.toFixed(1)} mJ`, W - 4, 3);

      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(96,165,250,0.65)";
      ctx.textBaseline = "bottom";
      ctx.fillText(`w₀ = ${w0.toFixed(1)} µm`, 4, H - 3);

      // x-axis labels
      ctx.fillStyle = "rgba(42,61,90,0.9)";
      ctx.textBaseline = "bottom";
      ctx.textAlign = "center";
      [-2, -1, 0, 1, 2].forEach((xi) => {
        const gx = (W * (xi + xRange)) / (2 * xRange);
        ctx.fillText(`${xi > 0 ? "+" : ""}${xi}σ`, gx, H - 2);
      });
    };

    draw();

    const ro = new ResizeObserver(draw);
    ro.observe(wrap);

    return () => ro.disconnect();
  }, [beamWaist, energy]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        height: "80px",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
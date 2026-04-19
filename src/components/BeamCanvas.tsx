"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Props {
  grid: number[][];
  colorFn: (v: number) => [number, number, number];
}

type Size = { w: number; h: number };

export default function BeamCanvas({ grid, colorFn }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<Size>({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const updateSize = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };

    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(wrap);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid.length || size.w <= 0 || size.h <= 0) return;

    const dpr = window.devicePixelRatio || 1;

    // Internal resolution
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);

    // CSS size stays locked to the container
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const W = canvas.width;
    const H = canvas.height;
    const N = grid.length;

    const img = ctx.createImageData(W, H);

    for (let y = 0; y < N; y++) {
      const py0 = Math.floor((y * H) / N);
      const py1 = Math.floor(((y + 1) * H) / N);

      for (let x = 0; x < N; x++) {
        const px0 = Math.floor((x * W) / N);
        const px1 = Math.floor(((x + 1) * W) / N);

        const v = grid[y][x];
        const [r, g, b] = colorFn(v);

        for (let py = py0; py < py1; py++) {
          for (let px = px0; px < px1; px++) {
            const idx = 4 * (py * W + px);
            img.data[idx] = r;
            img.data[idx + 1] = g;
            img.data[idx + 2] = b;
            img.data[idx + 3] = 255;
          }
        }
      }
    }

    ctx.putImageData(img, 0, 0);
  }, [grid, colorFn, size.w, size.h]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
"use client";
import { useCallback } from "react";
import { TelemetryData } from "@/lib/types";
import BeamCanvas from "@/components/BeamCanvas";
import GaussianPlot from "@/components/GaussianPlot";

const EMPTY: number[][] = Array.from({ length: 24 }, () => Array(24).fill(0));

// Near-field: blue/cyan false-color (black → deep blue → cyan → white)
const nfColor = (v: number): [number, number, number] => {
  if (v < 0.3) { const t = v / 0.3; return [Math.round(t * 20), Math.round(t * 30), Math.round(30 + t * 80)]; }
  if (v < 0.7) { const t = (v - 0.3) / 0.4; return [Math.round(20 + t * 80), Math.round(30 + t * 100), Math.round(110 + t * 120)]; }
  const t = (v - 0.7) / 0.3; return [Math.round(100 + t * 155), Math.round(130 + t * 100), Math.round(230 + t * 25)];
};

// Far-field: tighter hot-spot, deep blue → cyan → white core
const ffColor = (v: number): [number, number, number] => {
  if (v < 0.15) { const t = v / 0.15; return [0, Math.round(t * 10), Math.round(t * 40)]; }
  if (v < 0.45) { const t = (v - 0.15) / 0.3; return [Math.round(t * 40), Math.round(10 + t * 90), Math.round(40 + t * 160)]; }
  if (v < 0.75) { const t = (v - 0.45) / 0.3; return [Math.round(40 + t * 100), Math.round(100 + t * 130), Math.round(200 + t * 55)]; }
  const t = (v - 0.75) / 0.25; return [Math.round(140 + t * 115), Math.round(230 + t * 25), 255];
};

interface Props { data: TelemetryData | null; }

export default function OpticalDiagnostics({ data }: Props) {
  const nearMax = data ? Math.max(...data.nearField.flat()) : 0;

  return (
    <div className="axion-col">
      <div className="panel-header">
        <div className="phdr-dot" />
        <span className="panel-header-text">OPTICAL DIAGNOSTICS</span>
      </div>

      <div className="bento-card grow" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>

        {/* Near Field */}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", flexShrink: 0 }}>
            <span className="section-lbl">Near-Field · Raw intensity</span>
            <span className="sublbl">PEAK {(nearMax * 100).toFixed(0)}%</span>
          </div>
          <div className="beam-canvas-wrap">
            <BeamCanvas grid={data?.nearField ?? EMPTY} colorFn={nfColor} />
          </div>
        </div>

        {/* Far Field */}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", flexShrink: 0 }}>
            <span className="section-lbl">Far-Field · Focal plane</span>
            <span className="sublbl">M² {data ? data.m2Factor.toFixed(2) : "—"}</span>
          </div>
          <div className="beam-canvas-wrap">
            <BeamCanvas grid={data?.farField ?? EMPTY} colorFn={ffColor} />
          </div>
        </div>

        {/* Gaussian Profile */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span className="section-lbl">Energy distribution · Gaussian profile</span>
            <span className="sublbl">w₀ {data ? data.beamWaist.toFixed(1) : "—"} µm</span>
          </div>
          <div className="gauss-wrap">
            <GaussianPlot beamWaist={data?.beamWaist ?? 28} energy={data?.pulseEnergy ?? 0} />
          </div>
        </div>

        {/* Params row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px", flexShrink: 0 }}>
          {[
            { lbl: "λ (nm)", val: data ? data.wavelength.toFixed(3) : "—", col: "var(--cyan)" },
            { lbl: "Energy (mJ)", val: data ? data.pulseEnergy.toFixed(2) : "—", col: "var(--blue-b)" },
            { lbl: "Rep rate", val: "10 Hz", col: "var(--ice)" },
            { lbl: "Pulse (ns)", val: data ? data.pulseWidth.toFixed(1) : "—", col: "var(--ice)" },
          ].map(({ lbl, val, col }) => (
            <div key={lbl} className="bento-card" style={{ padding: "7px 8px" }}>
              <div className="sublbl">{lbl}</div>
              <div className="value-med" style={{ color: col }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
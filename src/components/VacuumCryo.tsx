"use client";
import { TelemetryData } from "@/lib/types";
import Sparkline from "@/components/Sparkline";

interface Props { data: TelemetryData | null; }

export default function VacuumCryo({ data }: Props) {
  const ln2 = data?.ln2Level ?? 0;
  const ln2Color = ln2 > 50 ? "#3b82f6" : ln2 > 25 ? "#fbbf24" : "#f87171";
  const pOk = data ? data.pressure < 5e-9 : true;

  return (
    <div className="axion-col">
      <div className="panel-header">
        <div className="phdr-dot" />
        <span className="panel-header-text">VACUUM &amp; CRYO</span>
      </div>

      {/* Pressure */}
      <div className="bento-card accent">
        <div className="section-lbl">Chamber Pressure · Ion Gauge B</div>
        <div className="value-huge">{data ? data.pressure.toExponential(2) : "—"}</div>
        <div className="sublbl" style={{ marginBottom: "6px" }}>mbar</div>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div className="status-led" style={{ background: pOk ? "#22d3ee" : "#f87171", boxShadow: `0 0 7px ${pOk ? "#22d3ee" : "#f87171"}` }} />
          <span className="sublbl" style={{ color: pOk ? "var(--cyan)" : "var(--red)" }}>{pOk ? "NOMINAL" : "WARNING"}</span>
          <span className="sublbl" style={{ marginLeft: "auto" }}>↓ STABLE</span>
        </div>
        <Sparkline values={data?.sparkPres ?? []} color="#22d3ee" glow="rgba(34,211,238,0.3)" />
      </div>

      {/* LN2 */}
      <div className="bento-card">
        <div className="section-lbl">LN₂ Reservoir · Cryostat</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", marginTop: "5px" }}>
          <div className="ln2-tank">
            <div className="ln2-fill" style={{ height: `${ln2}%`, background: ln2Color, boxShadow: `0 0 8px ${ln2Color}55` }} />
            {[25, 50, 75].map(t => <div key={t} className="ln2-tick" style={{ bottom: `${t}%` }} />)}
          </div>
          <div style={{ flex: 1 }}>
            <div className="value-large" style={{ color: ln2Color, textShadow: `0 0 10px ${ln2Color}` }}>
              {ln2.toFixed(1)}%
            </div>
            <div className="sublbl" style={{ marginTop: "2px" }}>Liquid level</div>
            <div className="sublbl" style={{ marginTop: "3px", color: ln2Color }}>
              {ln2 > 50 ? "ADEQUATE" : ln2 > 25 ? "LOW — REFILL" : "CRITICAL"}
            </div>
            <div style={{ marginTop: "7px", height: "3px", background: "rgba(59,130,246,0.1)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${ln2}%`, background: ln2Color, borderRadius: "2px", transition: "width 0.5s", boxShadow: `0 0 6px ${ln2Color}` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Crystal / Turbos */}
      <div className="bento-card grow">
        <div className="section-lbl">Crystal Temperature</div>
        <div className="value-large cyan">{data ? data.crystalTemp.toFixed(2) : "—"} K</div>
        <div className="sublbl" style={{ marginBottom: "4px" }}>PPLN crystal</div>
        <Sparkline values={data?.sparkTemp ?? []} color="#60a5fa" glow="rgba(96,165,250,0.3)" />

        <div className="divider" />

        <div className="section-lbl">Turbomolecular Pumps</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "3px" }}>
          <div>
            <div className="sublbl">TP-1 (fore)</div>
            <div className="value-med">{data ? Math.round(data.turbo1RPM).toLocaleString() : "—"}</div>
            <div className="sublbl">RPM</div>
          </div>
          <div>
            <div className="sublbl">TP-2 (main)</div>
            <div className="value-med">{data ? Math.round(data.turbo2RPM).toLocaleString() : "—"}</div>
            <div className="sublbl">RPM</div>
          </div>
        </div>
        <Sparkline values={data?.sparkRPM ?? []} color="#38bdf8" glow="rgba(56,189,248,0.3)" />

        <div className="divider" />
        <div className="section-lbl">Foreline Pressure</div>
        <div className="value-med">{data ? data.forelinePressure.toExponential(2) : "—"} mbar</div>
      </div>
    </div>
  );
}
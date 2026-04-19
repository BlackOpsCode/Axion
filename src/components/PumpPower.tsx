"use client";
import { useRef, useEffect, useState } from "react";
import { TelemetryData, LogEntry } from "@/lib/types";

interface Props { data: TelemetryData | null; logs: LogEntry[]; }

function ShutdownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="#f87171" strokeWidth="1.5" />
      <path d="M8 4v4" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.5 5.5A4 4 0 1 0 10.5 5.5" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function PumpPower({ data, logs }: Props) {
  const logRef = useRef<HTMLDivElement>(null);
  const [shutdown, setShutdown] = useState(false);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const diodes = data?.diodes ?? [
    { id: "LD1", voltage: 0, current: 0 },
    { id: "LD2", voltage: 0, current: 0 },
    { id: "LD3", voltage: 0, current: 0 },
  ];
  const totalPower = diodes.reduce((s, d) => s + d.voltage * d.current, 0);

  return (
    <div className="axion-col">
      <div className="panel-header">
        <div className="phdr-dot" />
        <span className="panel-header-text">PUMP POWER</span>
      </div>

      {/* Diodes */}
      <div className="bento-card">
        <div className="section-lbl" style={{ marginBottom: "7px" }}>Pump Diodes · LD Array</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {diodes.map((d) => {
            const p = d.voltage * d.current;
            const pct = Math.min(100, (p / 50) * 100);
            const col = p > 40 ? "#f87171" : p > 30 ? "#fbbf24" : "#60a5fa";
            return (
              <div key={d.id} className="diode-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <span className="diode-id">{d.id}</span>
                  <span className="sublbl">P = {p.toFixed(1)} W</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  <div>
                    <div className="sublbl">Voltage</div>
                    <div className="value-med">{d.voltage.toFixed(3)} V</div>
                  </div>
                  <div>
                    <div className="sublbl">Current</div>
                    <div className="value-med">{d.current.toFixed(2)} A</div>
                  </div>
                </div>
                <div className="mini-bar">
                  <div className="mini-fill" style={{ width: `${pct}%`, background: col, boxShadow: `0 0 4px ${col}` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total power */}
      <div className="bento-card">
        <div className="section-lbl">Total pump power</div>
        <div className="value-large" style={{ color: "var(--blue-b)" }}>{totalPower.toFixed(1)} W</div>
        <div className="sublbl">Watts delivered</div>
        <div style={{ marginTop: "6px", height: "4px", background: "rgba(59,130,246,0.08)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${Math.min(100, (totalPower / 120) * 100)}%`,
            background: "linear-gradient(90deg,#3b82f6,#22d3ee)",
            borderRadius: "2px",
            transition: "width 0.3s",
            boxShadow: "0 0 8px rgba(59,130,246,0.6)",
          }} />
        </div>
      </div>

      {/* Emergency */}
      <button
        className={`emergency-btn${shutdown ? " active" : ""}`}
        onClick={() => {
          setShutdown(true);
          setTimeout(() => setShutdown(false), 3000);
        }}
      >
        <ShutdownIcon />
        <span>{shutdown ? "SHUTTING DOWN..." : "EMERGENCY SHUTDOWN"}</span>
      </button>

      {/* Logs */}
      <div className="bento-card grow">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px", flexShrink: 0 }}>
          <span className="section-lbl">System Log</span>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div className="status-led" style={{ background: "var(--cyan)", boxShadow: "0 0 5px var(--cyan)", animation: "pled 1s infinite" }} />
            <span className="sublbl" style={{ color: "var(--cyan)" }}>LIVE</span>
          </div>
        </div>
        <div className="log-scroll" ref={logRef}>
          {logs.map((entry, i) => (
            <div
              key={i}
              className={`log-entry${entry.type !== "info" ? ` ${entry.type}` : ""}`}
              style={{ opacity: Math.max(0.18, 1 - (logs.length - 1 - i) * 0.03) }}
            >
              {entry.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
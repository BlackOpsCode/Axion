"use client";
import { useState, useEffect, useRef } from "react";
import { TelemetryData, LogEntry } from "@/lib/types";
import VacuumCryo from "@/components/VacuumCryo";
import OpticalDiagnostics from "@/components/OpticalDiagnostics";
import PumpPower from "@/components/PumpPower";

export default function Dashboard() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tick, setTick] = useState(0);
  const [time, setTime] = useState("");
  const logsRef = useRef<LogEntry[]>([]);

  useEffect(() => {
    let active = true;

    const poll = async () => {
      if (!active) return;
      try {
        const res = await fetch("/api/telemetry");
        const json: TelemetryData = await res.json();
        if (!active) return;
        setData(json);
        setTick((t) => t + 1);
        setTime(new Date().toISOString().slice(0, 19).replace("T", " ") + " UTC");
        logsRef.current = [...logsRef.current, ...json.logEntries].slice(-120);
        setLogs([...logsRef.current]);
      } catch { /* silent */ }
      if (active) setTimeout(poll, 300);
    };

    // boot log entries
    logsRef.current = [
      { msg: "[BOOT] AXION v4.1.2 — system init", type: "info" },
      { msg: "[BOOT] Vacuum system nominal", type: "info" },
      { msg: "[BOOT] Telemetry daemon started @ 300ms", type: "info" },
      { msg: "[BOOT] Beam diagnostics online", type: "info" },
      { msg: "[BOOT] Gaussian fit module loaded", type: "info" },
    ];
    setLogs([...logsRef.current]);
    poll();
    return () => { active = false; };
  }, []);

  return (
    <div className="axion-root">
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <header className="axion-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="logo-box">AX</div>
          <div>
            <div className="system-title">AXION</div>
            <div className="system-sub">LASER DIAGNOSTICS CONSOLE · v4.1.2</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div className="status-led" style={{ background: "#22d3ee", boxShadow: "0 0 8px #22d3ee", animation: "pled 1.5s infinite" }} />
            <span className="sublbl" style={{ color: "var(--cyan)" }}>SYS NOMINAL</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div className="status-led" style={{ background: "#3b82f6", boxShadow: "0 0 6px #3b82f6", animation: "pled 2.2s infinite" }} />
            <span className="sublbl">BEAM ACTIVE</span>
          </div>
          <span className="sublbl">{time}</span>
          <span className="sublbl">T+{tick}</span>
        </div>
      </header>

      <main className="axion-grid">
        <VacuumCryo data={data} />
        <OpticalDiagnostics data={data} />
        <PumpPower data={data} logs={logs} />
      </main>

      <footer className="axion-footer">
        <span>AXION PHOTONICS LAB · v4.1.2</span>
        <span>SESSION {tick > 0 ? Math.floor(tick * 0.3) : 0}s</span>
        <span>POLL 300ms</span>
        <span>NODE LAB-CTRL-01</span>
        <span style={{ color: "var(--blue-b)" }}>ALL SYSTEMS NOMINAL</span>
      </footer>
    </div>
  );
}
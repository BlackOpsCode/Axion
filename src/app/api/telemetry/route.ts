'use server'

import { NextResponse } from "next/server";

function gauss2D(x: number, y: number, cx: number, cy: number, sx: number, sy: number) {
  return Math.exp(-((x - cx) ** 2 / (2 * sx * sx) + (y - cy) ** 2 / (2 * sy * sy)));
}
function noise(a = 0.06) { return (Math.random() - 0.5) * a; }

export async function GET() {
  const t = Date.now() / 1000;
  const N = 24;

  const pressure = 1.2e-9 * (1 + 0.03 * Math.sin(t * 0.3) + Math.random() * 0.008);
  const forelinePressure = 3.2e-3 * (1 + 0.05 * Math.sin(t * 0.7) + Math.random() * 0.02);
  const ln2Level = 62 + 8 * Math.sin(t * 0.045);
  const crystalTemp = 87.4 + 0.8 * Math.sin(t * 0.2) + noise() * 2;
  const turbo1RPM = 72300 + 150 * Math.sin(t * 0.4) + Math.random() * 50;
  const turbo2RPM = 71850 + 120 * Math.sin(t * 0.35 + 0.5) + Math.random() * 50;

  const sparkTemp = Array.from({ length: 40 }, (_, i) => 87.4 + 0.8 * Math.sin((t - (40 - i) * 0.3) * 0.2));
  const sparkRPM  = Array.from({ length: 40 }, (_, i) => 72300 + 150 * Math.sin((t - (40 - i) * 0.3) * 0.4));
  const sparkPres = Array.from({ length: 40 }, (_, i) => 1.2e-9 * (1 + 0.03 * Math.sin((t - (40 - i) * 0.3) * 0.3)));

  const sx = 5.5 + 0.3 * Math.sin(t * 0.3), sy = 5.2 + 0.25 * Math.cos(t * 0.25);
  const nearField = Array.from({ length: N }, (_, y) =>
    Array.from({ length: N }, (_, x) =>
      Math.max(0, Math.min(1, gauss2D(x, y, N / 2, N / 2, sx, sy) + noise()))
    )
  );

  const fcx = N / 2 + 0.6 * Math.sin(t * 0.7), fcy = N / 2 + 0.6 * Math.cos(t * 0.5);
  const farField = Array.from({ length: N }, (_, y) =>
    Array.from({ length: N }, (_, x) =>
      Math.max(0, Math.min(1, gauss2D(x, y, fcx, fcy, 1.6, 1.6) + noise() * 0.04))
    )
  );

  const wavelength = 1064.18 + 0.04 * Math.sin(t * 0.15);
  const pulseEnergy = 48.7 + 1.2 * Math.sin(t * 0.25) + noise() * 0.4;
  const pulseWidth = 6.8 + 0.2 * Math.sin(t * 0.18);
  const beamWaist = 28 + 3 * Math.sin(t * 0.12);
  const m2Factor = 1.12 + 0.05 * Math.sin(t * 0.09);

  const diodes = [
    { id: "LD1", voltage: 2.74 + 0.018 * Math.sin(t * 0.3),  current: 14.2 + 0.14 * Math.sin(t * 0.4)  },
    { id: "LD2", voltage: 2.71 + 0.014 * Math.sin(t * 0.35), current: 13.9 + 0.11 * Math.sin(t * 0.45) },
    { id: "LD3", voltage: 2.76 + 0.016 * Math.sin(t * 0.28), current: 14.5 + 0.19 * Math.sin(t * 0.38) },
  ];

  const ts = new Date().toISOString().slice(11, 23);
  const logEntries = [
    { msg: `[${ts}] PULSE OK  E=${pulseEnergy.toFixed(2)}mJ  λ=${wavelength.toFixed(3)}nm  τ=${pulseWidth.toFixed(1)}ns`, type: "info" as const },
    { msg: `[${ts}] TP-1 ${Math.round(turbo1RPM)} RPM  TP-2 ${Math.round(turbo2RPM)} RPM  nominal`, type: "info" as const },
    { msg: `[${ts}] PRESS ${pressure.toExponential(2)} mbar  FL ${forelinePressure.toExponential(2)} mbar`, type: "info" as const },
  ];

  return NextResponse.json({
    pressure, forelinePressure, ln2Level, crystalTemp, turbo1RPM, turbo2RPM,
    sparkTemp, sparkRPM, sparkPres, nearField, farField,
    wavelength, pulseEnergy, pulseWidth, beamWaist, m2Factor,
    diodes, logEntries,
  });
}

// aici simulam de la server un raspuns cumva ce ar trimite detectorii si sitemele de control
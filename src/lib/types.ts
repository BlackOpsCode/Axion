export interface DiodeData {
  id: string;
  voltage: number;
  current: number;
}

export interface LogEntry {
  msg: string;
  type: "info" | "warn" | "err";
}

export interface TelemetryData {
  pressure: number;
  forelinePressure: number;
  ln2Level: number;
  crystalTemp: number;
  turbo1RPM: number;
  turbo2RPM: number;
  sparkTemp: number[];
  sparkRPM: number[];
  sparkPres: number[];
  nearField: number[][];
  farField: number[][];
  wavelength: number;
  pulseEnergy: number;
  pulseWidth: number;
  beamWaist: number;
  m2Factor: number;
  diodes: DiodeData[];
  logEntries: LogEntry[];
}
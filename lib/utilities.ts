import { query } from "./db";

export enum SensorProfileEnum {
  GOOD = "GOOD",
  MODERATE = "MODERATE",
  FAILING = "FAILING",
}

const TOLERANCE_C = 1.0;
const WINDOW_HOURS = 168; // 7 days
const MAX_POINTS = 1200;

/**
 * Evaluate status (same as before).
 */
export function evaluateStatus(
  min_c: number,
  max_c: number,
  hmin: number,
  hmax: number,
  temp: number | null,
  hum: number
): string {
  if (temp === null || temp === undefined) return "SENSOR FAILURE";

  let tempAlert: string | null = null;
  let humAlert: string | null = null;

  if (temp < min_c - TOLERANCE_C || temp > max_c + TOLERANCE_C) {
    tempAlert = "Temperature Exceeded";
  } else if (temp < min_c || temp > max_c) {
    tempAlert = "Temperature Warning";
  }

  if (hum < hmin) humAlert = "Humidity Too Low";
  else if (hum > hmax) humAlert = "Humidity Too High";

  if (tempAlert && humAlert) return `ALERT: ${tempAlert} and ${humAlert}`;
  if (tempAlert) return `ALERT: ${tempAlert}`;
  if (humAlert) return `ALERT: ${humAlert}`;
  return "ALL WITHIN RANGE";
}

/**
 * Compute sensor profile from recent history in DB.
 */
export async function computeProfile(sensorId: string): Promise<SensorProfileEnum> {
  const since = new Date(Date.now() - WINDOW_HOURS * 3600 * 1000);

  const rows = await query<{
    ts: string;
    temperature_c: number | null;
    humidity_pct: number | null;
    status: string;
  }>(
    `
    SELECT ts, temperature_c, humidity_pct, status
    FROM readings
    WHERE sensor_id = $1 AND ts >= $2
    ORDER BY ts ASC
    LIMIT $3
    `,
    [sensorId, since.toISOString(), MAX_POINTS]
  );

  if (!rows.length) return SensorProfileEnum.GOOD;

  const total = rows.length;
  const failures = rows.filter(r => r.status === "SENSOR FAILURE" || r.temperature_c === null).length;
  const alerts = rows.filter(r => (r.status || "").startsWith("ALERT")).length;

  const failureRate = failures / total;
  const alertRate = alerts / total;

  // Drift calculation (simple linear regression)
  let driftPerHr = 0.0;
  let varTemp = 0.0;
  const times: number[] = [];
  const temps: number[] = [];
  let t0: Date | null = null;

  rows.forEach((r) => {
    if (r.temperature_c === null || r.status === "SENSOR FAILURE") return;
    const ts = new Date(r.ts);
    if (!t0) t0 = ts;
    times.push((ts.getTime() - (t0?.getTime() || ts.getTime())) / 3600000); // hours
    temps.push(r.temperature_c);
  });

  if (temps.length >= 5) {
    const x = times;
    const y = temps;
    const n = x.length;
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;

    const num = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
    const den = x.reduce((sum, xi) => sum + (xi - xMean) ** 2, 0);
    driftPerHr = den !== 0 ? num / den : 0;

    const yMeanSquare = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
    varTemp = yMeanSquare / n;
  }

  // Heuristics (same thresholds as Python version)
  if (failureRate >= 0.01 || alertRate >= 0.05 || Math.abs(driftPerHr) >= 0.20 || varTemp >= 1.00) {
    return SensorProfileEnum.FAILING;
  }
  if (failureRate >= 0.004 || alertRate >= 0.02 || Math.abs(driftPerHr) >= 0.10 || varTemp >= 0.50) {
    return SensorProfileEnum.MODERATE;
  }
  return SensorProfileEnum.GOOD;
}

export function toLogFormat(
  ts: Date,
  zone: string,
  status: string,
  temp: number | null,
  hum: number | null
): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const ms = Math.floor(ts.getMilliseconds() / 10)
    .toString()
    .padStart(3, "0");

  const stamp = `${ts.getFullYear()}-${pad(ts.getMonth() + 1)}-${pad(
    ts.getDate()
  )} ${pad(ts.getHours())}:${pad(ts.getMinutes())}:${pad(
    ts.getSeconds()
  )},${ms}`;

  let level = "INFO";
  if (status === "SENSOR FAILURE") level = "ERROR";
  else if (status.startsWith("ALERT")) level = "WARNING";

  const zoneCode = `[${zone.replace("Zone_", "Z")}]`;
  const message =
    temp !== null && hum !== null
      ? `${status} (T=${temp.toFixed(2)}°C, RH=${hum}%)`
      : status;

  return `${stamp} - ${level} - ${zoneCode} ${message}`;
}
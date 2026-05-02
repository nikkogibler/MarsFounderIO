const SECS_PER_SOL = 88775.244;
const J2000_EPOCH_MS = Date.UTC(2000, 0, 6, 0, 0, 0);
const MARS_YEAR_SOLS = 668.5921;

export function getMarsTime(now: Date = new Date()): {
  mtc: string;
  sol: number;
  marsYear: number;
  season: "NORTHERN_SPRING" | "NORTHERN_SUMMER" | "NORTHERN_AUTUMN" | "NORTHERN_WINTER";
} {
  const elapsedSec = (now.getTime() - J2000_EPOCH_MS) / 1000;
  const sol = Math.floor(elapsedSec / SECS_PER_SOL);
  const fracSol = (elapsedSec / SECS_PER_SOL) - sol;
  const totalSec = fracSol * 86400;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  const mtc = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  const marsYear = Math.floor(sol / MARS_YEAR_SOLS) + 25;
  const seasonIdx = Math.floor(((sol % MARS_YEAR_SOLS) / MARS_YEAR_SOLS) * 4);
  const seasons = [
    "NORTHERN_SPRING",
    "NORTHERN_SUMMER",
    "NORTHERN_AUTUMN",
    "NORTHERN_WINTER",
  ] as const;
  return {
    mtc,
    sol,
    marsYear,
    season: seasons[seasonIdx] ?? "NORTHERN_SPRING",
  };
}

export function getLightDelay(now: Date = new Date()): {
  seconds: number;
  formatted: string;
  distanceKm: number;
  trend: "APPROACHING" | "RECEDING" | "STABLE";
} {
  const SYNODIC_MS = 779.94 * 86400 * 1000;
  const phase = ((now.getTime() % SYNODIC_MS) / SYNODIC_MS) * 2 * Math.PI;
  const minDistKm = 54.6e6;
  const maxDistKm = 401e6;
  const meanDistKm = (minDistKm + maxDistKm) / 2;
  const ampKm = (maxDistKm - minDistKm) / 2;
  const distanceKm = Math.round(meanDistKm + ampKm * Math.cos(phase));
  const c = 299792.458;
  const seconds = +(distanceKm / c).toFixed(1);
  const minutes = Math.floor(seconds / 60);
  const secRem = Math.floor(seconds % 60);
  const formatted = `${minutes}m ${String(secRem).padStart(2, "0")}s`;
  const sample2 = meanDistKm + ampKm * Math.cos(phase + 0.001);
  const trend: "APPROACHING" | "RECEDING" | "STABLE" =
    sample2 < distanceKm
      ? "APPROACHING"
      : sample2 > distanceKm
        ? "RECEDING"
        : "STABLE";
  return { seconds, formatted, distanceKm, trend };
}

const STORM_REGIONS = [
  "Hellas Planitia",
  "Acidalia Planitia",
  "Tharsis Plateau",
  "Arcadia Planitia",
  "Utopia Planitia",
  "Argyre Planitia",
];

export function getDustStorm(now: Date = new Date()): {
  active: boolean;
  severity: "NONE" | "LOCAL" | "REGIONAL" | "GLOBAL";
  affectedRegions: string[];
  opacityTau: number;
  startedAt: string | null;
  message: string;
} {
  const cycleMs = 6 * 60 * 60 * 1000;
  const t = (now.getTime() % cycleMs) / cycleMs;
  if (t < 0.55) {
    return {
      active: false,
      severity: "NONE",
      affectedRegions: [],
      opacityTau: 0.4,
      startedAt: null,
      message:
        "Visibility nominal. No active dust event detected.",
    };
  }
  const intensity = (t - 0.55) / 0.45;
  let severity: "LOCAL" | "REGIONAL" | "GLOBAL";
  let count: number;
  let opacityTau: number;
  if (intensity < 0.5) {
    severity = "LOCAL";
    count = 1;
    opacityTau = 0.9;
  } else if (intensity < 0.85) {
    severity = "REGIONAL";
    count = 3;
    opacityTau = 1.6;
  } else {
    severity = "GLOBAL";
    count = STORM_REGIONS.length;
    opacityTau = 3.2;
  }
  const startedAt = new Date(
    now.getTime() - Math.floor(intensity * cycleMs * 0.45),
  ).toISOString();
  const affectedRegions = STORM_REGIONS.slice(0, count);
  const message =
    severity === "GLOBAL"
      ? "Planet-wide dust event. Solar generation degraded. Exposed missions auto-paused."
      : severity === "REGIONAL"
        ? `Regional dust event across ${affectedRegions.length} sectors. Power generation degraded.`
        : `Localized dust kicking up in ${affectedRegions[0]}. Bots in zone may throttle.`;
  return {
    active: true,
    severity,
    affectedRegions,
    opacityTau,
    startedAt,
    message,
  };
}

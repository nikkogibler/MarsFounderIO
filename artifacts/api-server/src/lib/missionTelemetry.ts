import type { MissionRow, BotClassRow } from "@workspace/db";
import { getLightDelay, getDustStorm } from "./marsTime";

const SECS_PER_SOL = 88775.244;

const BOT_LINES: string[] = [
  "Wheels turning. Surface is stable.",
  "Sample bay loaded. Filter 80%.",
  "Encountered a rock the size of a Brooklyn fridge. Going around.",
  "Solar panels at 73%. Dusty.",
  "Drilling. Substrate harder than expected.",
  "Audio sensor caught the wind again. Lonely up here.",
  "Battery temp climbing. Throttling motors.",
  "Achievement unlocked: didn't fall in a crater today.",
  "Comms stable. Δ-V budget on plan.",
  "Spectrometer locked target. Reading.",
  "Gripper torque nominal. Picking up the next sample.",
  "Heat shield holding. It's 4am MTC and I'm cold.",
];

const MC_LINES: string[] = [
  "MISSION CONTROL: Telemetry acquired. Continue current ops.",
  "MISSION CONTROL: Recommend route correction +12° heading.",
  "MISSION CONTROL: Power budget within margin.",
  "MISSION CONTROL: Standby for orbital relay window.",
  "MISSION CONTROL: Acknowledged. Proceed.",
  "MISSION CONTROL: Watching for dust uptick in sector.",
];

interface ComputedMission {
  status: MissionRow["status"];
  progressPercent: number;
  currentSol: number;
  energyRemainingPercent: number;
  telemetry: Array<{
    timestamp: string;
    sol: number;
    from: "BOT" | "MISSION_CONTROL" | "FOUNDER";
    message: string;
    signalDelaySeconds: number;
  }>;
}

export function computeMissionState(
  mission: MissionRow,
  bot: BotClassRow | undefined,
  now: Date = new Date(),
): ComputedMission {
  const elapsedMs = now.getTime() - new Date(mission.createdAt).getTime();
  const elapsedSec = Math.max(0, elapsedMs / 1000);
  const elapsedSols = elapsedSec / SECS_PER_SOL;
  const totalSols = Math.max(1, mission.durationSols);

  const dust = getDustStorm(now);
  const stormPause = dust.severity === "GLOBAL";

  let status: MissionRow["status"] = mission.status;
  let progressPercent = mission.progressPercent;

  if (status === "QUEUED" || status === "IN_TRANSIT" || status === "ACTIVE" || status === "PAUSED_DUST_STORM") {
    if (elapsedSols < 0.05) {
      status = "IN_TRANSIT";
      progressPercent = Math.min(8, Math.floor(elapsedSols * 160));
    } else if (elapsedSols >= totalSols) {
      status = "COMPLETED";
      progressPercent = 100;
    } else if (stormPause) {
      status = "PAUSED_DUST_STORM";
      progressPercent = Math.min(
        99,
        Math.floor((elapsedSols / totalSols) * 100),
      );
    } else {
      status = "ACTIVE";
      progressPercent = Math.min(
        99,
        Math.floor((elapsedSols / totalSols) * 100),
      );
    }
  }

  const currentSol = Math.floor(elapsedSols);
  const energyBase = 100 - Math.min(60, currentSol * (60 / totalSols));
  const dustDrain = dust.active ? dust.opacityTau * 6 : 0;
  const energyRemainingPercent = Math.max(
    5,
    Math.round(energyBase - dustDrain),
  );

  const seed = hashString(mission.id);
  const telemetryCount = Math.min(40, 6 + currentSol * 3);
  const lightDelay = getLightDelay(now);
  const telemetry: ComputedMission["telemetry"] = [];
  for (let i = 0; i < telemetryCount; i++) {
    const tSols = (i / Math.max(1, telemetryCount - 1)) * Math.max(0.1, elapsedSols);
    const ts = new Date(
      new Date(mission.createdAt).getTime() + tSols * SECS_PER_SOL * 1000,
    ).toISOString();
    const sol = Math.floor(tSols);
    const r = pseudoRandom(seed + i);
    const fromRoll = r;
    let from: "BOT" | "MISSION_CONTROL" | "FOUNDER";
    let message: string;
    if (fromRoll < 0.65) {
      from = "BOT";
      const botLine = BOT_LINES[Math.floor(pseudoRandom(seed + i + 13) * BOT_LINES.length)] ?? BOT_LINES[0]!;
      const prefix = bot ? `[${bot.codename}] ` : "[BOT] ";
      message = prefix + botLine;
    } else if (fromRoll < 0.92) {
      from = "MISSION_CONTROL";
      message = MC_LINES[Math.floor(pseudoRandom(seed + i + 7) * MC_LINES.length)] ?? MC_LINES[0]!;
    } else {
      from = "FOUNDER";
      message = `[${mission.founderHandle}] keep going. don't break my robot.`;
    }
    telemetry.push({
      timestamp: ts,
      sol,
      from,
      message,
      signalDelaySeconds: lightDelay.seconds,
    });
  }

  if (status === "PAUSED_DUST_STORM") {
    telemetry.push({
      timestamp: now.toISOString(),
      sol: currentSol,
      from: "MISSION_CONTROL",
      message: `MISSION CONTROL: Auto-pause engaged. ${dust.message}`,
      signalDelaySeconds: lightDelay.seconds,
    });
  }
  if (status === "COMPLETED" && telemetry.length > 0) {
    telemetry.push({
      timestamp: now.toISOString(),
      sol: currentSol,
      from: "MISSION_CONTROL",
      message: "MISSION CONTROL: Mission complete. Bot returning to base. Pay your invoice.",
      signalDelaySeconds: lightDelay.seconds,
    });
  }

  return {
    status,
    progressPercent,
    currentSol,
    energyRemainingPercent,
    telemetry,
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pseudoRandom(seed: number): number {
  let x = (seed + 1) | 0;
  x = Math.imul(x ^ (x >>> 16), 2246822507);
  x = Math.imul(x ^ (x >>> 13), 3266489909);
  x ^= x >>> 16;
  return ((x >>> 0) % 100000) / 100000;
}

import { Router, type IRouter } from "express";
import { db, missionsTable, buildsTable, botClassesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import { computeMissionState } from "../lib/missionTelemetry";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const now = new Date();
  const missions = await db.select().from(missionsTable);
  const builds = await db.select().from(buildsTable);
  const bots = await db.select().from(botClassesTable);
  const buildById = new Map(builds.map((b) => [b.id, b]));
  const botById = new Map(bots.map((b) => [b.id, b]));

  let active = 0;
  let completed = 0;
  let creditsInFlight = 0;
  let totalSols = 0;
  const roleCount = new Map<string, number>();

  for (const m of missions) {
    const build = buildById.get(m.buildId);
    const bot = build ? botById.get(build.botClassId) : undefined;
    const computed = computeMissionState(m, bot, now);
    if (computed.status === "COMPLETED") completed++;
    else active++;
    if (build && computed.status !== "COMPLETED") {
      creditsInFlight += build.totalCreditsPerHour * m.durationSols * 24;
    }
    totalSols += m.durationSols;
    if (bot) {
      roleCount.set(bot.role, (roleCount.get(bot.role) ?? 0) + 1);
    }
  }

  const founders = new Set(missions.map((m) => m.founderHandle)).size;
  const averageMissionSols = missions.length
    ? +(totalSols / missions.length).toFixed(1)
    : 0;
  const topRole =
    [...roleCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "SURVEYOR";

  const launchOffsetMs = 14 * 24 * 60 * 60 * 1000;
  const nextLaunch = new Date(now.getTime() + launchOffsetMs);
  const nextLaunchWindow = `${nextLaunch.toUTCString().slice(0, 16)} UTC`;

  res.json(
    GetDashboardSummaryResponse.parse({
      activeMissions: active,
      completedMissions: completed,
      botsOnSurface: builds.length,
      founders,
      creditsInFlight,
      averageMissionSols,
      topRole,
      nextLaunchWindow,
    }),
  );
});

export default router;

import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import {
  db,
  missionsTable,
  buildsTable,
  botClassesTable,
} from "@workspace/db";
import {
  ListMissionsResponse,
  CreateMissionBody,
  GetMissionParams,
  GetMissionResponse,
  EstimateMissionFeasibilityParams,
  EstimateMissionFeasibilityResponse,
  ListRecentMissionActivityResponse,
} from "@workspace/api-zod";
import { computeMissionState } from "../lib/missionTelemetry";
import { generateFeasibility } from "../lib/feasibility";

const router: IRouter = Router();

router.get("/missions", async (_req, res): Promise<void> => {
  const now = new Date();
  const rows = await db
    .select()
    .from(missionsTable)
    .orderBy(desc(missionsTable.createdAt))
    .limit(100);

  const enriched = await Promise.all(
    rows.map(async (m) => {
      const [bot] = m.buildId
        ? await db
            .select({
              bot: botClassesTable,
            })
            .from(buildsTable)
            .leftJoin(botClassesTable, eq(buildsTable.botClassId, botClassesTable.id))
            .where(eq(buildsTable.id, m.buildId))
            .limit(1)
        : [];
      const computed = computeMissionState(m, bot?.bot ?? undefined, now);
      return {
        ...m,
        status: computed.status,
        progressPercent: computed.progressPercent,
      };
    }),
  );

  res.json(ListMissionsResponse.parse(enriched));
});

router.post("/missions", async (req, res): Promise<void> => {
  const parsed = CreateMissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const lengthChecks: Array<[string, string | undefined | null, number]> = [
    ["name", data.name, 80],
    ["locationName", data.locationName, 80],
    ["founderHandle", data.founderHandle, 40],
    ["sectorId", data.sectorId, 40],
    ["parcelId", data.parcelId, 40],
    ["targetMaterial", data.targetMaterial, 60],
    ["missionBrief", data.missionBrief, 2200],
  ];
  for (const [field, value, max] of lengthChecks) {
    if (value && value.length > max) {
      res.status(400).json({ error: `${field} exceeds ${max} characters` });
      return;
    }
  }
  if (
    data.latitude < -90 || data.latitude > 90 ||
    data.longitude < -180 || data.longitude > 180
  ) {
    res.status(400).json({ error: "coordinates out of range" });
    return;
  }
  if (data.durationSols < 1 || data.durationSols > 365) {
    res.status(400).json({ error: "durationSols must be 1-365" });
    return;
  }
  const [build] = await db
    .select()
    .from(buildsTable)
    .where(eq(buildsTable.id, data.buildId))
    .limit(1);
  if (!build) {
    res.status(400).json({ error: "Unknown build id" });
    return;
  }
  const [row] = await db
    .insert(missionsTable)
    .values({
      name: data.name,
      buildId: data.buildId,
      objective: data.objective,
      missionBrief: data.missionBrief?.trim() || null,
      targetMaterial: data.targetMaterial ?? null,
      durationSols: data.durationSols,
      locationName: data.locationName,
      sectorId: data.sectorId ?? null,
      parcelId: data.parcelId ?? null,
      latitude: data.latitude,
      longitude: data.longitude,
      founderHandle: data.founderHandle,
      status: "QUEUED",
      progressPercent: 0,
    })
    .returning();
  res.status(201).json(row);
});

router.get("/missions/recent", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(missionsTable)
    .orderBy(desc(missionsTable.createdAt))
    .limit(20);
  const now = new Date();
  const activity = rows.flatMap((m) => {
    const computed = computeMissionState(m, undefined, now);
    const events: Array<{
      missionId: string;
      missionName: string;
      founderHandle: string;
      event: string;
      timestamp: string;
      eventType:
        | "LAUNCHED"
        | "ARRIVED"
        | "MILESTONE"
        | "COMPLETED"
        | "DUST_STORM_PAUSE"
        | "RESUMED";
    }> = [];
    events.push({
      missionId: m.id,
      missionName: m.name,
      founderHandle: m.founderHandle,
      event: `Launched ${m.name} → ${m.locationName}`,
      timestamp: m.createdAt.toISOString(),
      eventType: "LAUNCHED",
    });
    if (computed.progressPercent >= 25 && computed.status !== "COMPLETED") {
      events.push({
        missionId: m.id,
        missionName: m.name,
        founderHandle: m.founderHandle,
        event: `${m.name} reached ${computed.progressPercent}% completion.`,
        timestamp: new Date(now.getTime() - 60000).toISOString(),
        eventType: "MILESTONE",
      });
    }
    if (computed.status === "PAUSED_DUST_STORM") {
      events.push({
        missionId: m.id,
        missionName: m.name,
        founderHandle: m.founderHandle,
        event: `${m.name} paused due to dust storm activity.`,
        timestamp: now.toISOString(),
        eventType: "DUST_STORM_PAUSE",
      });
    }
    if (computed.status === "COMPLETED") {
      events.push({
        missionId: m.id,
        missionName: m.name,
        founderHandle: m.founderHandle,
        event: `${m.name} completed. Asset returning to base.`,
        timestamp: now.toISOString(),
        eventType: "COMPLETED",
      });
    }
    return events;
  });
  activity.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  res.json(ListRecentMissionActivityResponse.parse(activity.slice(0, 30)));
});

router.get("/missions/:missionId", async (req, res): Promise<void> => {
  const params = GetMissionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(missionsTable)
    .where(eq(missionsTable.id, params.data.missionId))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "mission not found" });
    return;
  }
  const [join] = await db
    .select({ bot: botClassesTable })
    .from(buildsTable)
    .leftJoin(botClassesTable, eq(buildsTable.botClassId, botClassesTable.id))
    .where(eq(buildsTable.id, row.buildId))
    .limit(1);
  const computed = computeMissionState(row, join?.bot ?? undefined);
  const out = {
    ...row,
    status: computed.status,
    progressPercent: computed.progressPercent,
    currentSol: computed.currentSol,
    energyRemainingPercent: computed.energyRemainingPercent,
    telemetry: computed.telemetry,
  };
  res.json(GetMissionResponse.parse(out));
});

router.post("/missions/:missionId/feasibility", async (req, res): Promise<void> => {
  const params = EstimateMissionFeasibilityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(missionsTable)
    .where(eq(missionsTable.id, params.data.missionId))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "mission not found" });
    return;
  }
  const [join] = await db
    .select({ build: buildsTable, bot: botClassesTable })
    .from(buildsTable)
    .leftJoin(botClassesTable, eq(buildsTable.botClassId, botClassesTable.id))
    .where(eq(buildsTable.id, row.buildId))
    .limit(1);

  try {
    const report = await generateFeasibility({
      mission: row,
      build: join?.build ?? null,
      bot: join?.bot ?? null,
    });
    res.json(EstimateMissionFeasibilityResponse.parse(report));
  } catch (err) {
    req.log.error({ err }, "Feasibility generation failed");
    res.status(500).json({ error: "Feasibility report unavailable" });
  }
});

export default router;

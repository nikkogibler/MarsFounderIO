import { Router, type IRouter } from "express";
import { eq, inArray, desc } from "drizzle-orm";
import {
  db,
  buildsTable,
  botClassesTable,
  toolsTable,
  addonsTable,
} from "@workspace/db";
import {
  ListBuildsResponse,
  CreateBuildBody,
  GetBuildParams,
  GetBuildResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/builds", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(buildsTable)
    .orderBy(desc(buildsTable.createdAt))
    .limit(50);
  res.json(ListBuildsResponse.parse(rows));
});

router.post("/builds", async (req, res): Promise<void> => {
  const parsed = CreateBuildBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, botClassId, toolIds, addonIds, founderHandle } = parsed.data;

  const [bot] = await db
    .select()
    .from(botClassesTable)
    .where(eq(botClassesTable.id, botClassId))
    .limit(1);
  if (!bot) {
    res.status(400).json({ error: "Unknown bot class" });
    return;
  }

  const tools = toolIds.length
    ? await db.select().from(toolsTable).where(inArray(toolsTable.id, toolIds))
    : [];
  const addons = addonIds.length
    ? await db.select().from(addonsTable).where(inArray(addonsTable.id, addonIds))
    : [];

  if (tools.length !== toolIds.length || addons.length !== addonIds.length) {
    res.status(400).json({ error: "One or more tool/addon ids are invalid" });
    return;
  }

  if (toolIds.length > bot.toolSlots) {
    res
      .status(400)
      .json({ error: `Too many tools — ${bot.codename} has ${bot.toolSlots} tool slots` });
    return;
  }
  if (addonIds.length > bot.addonSlots) {
    res
      .status(400)
      .json({ error: `Too many addons — ${bot.codename} has ${bot.addonSlots} addon slots` });
    return;
  }

  const totalMassKg = +(
    bot.massKg +
    tools.reduce((acc, t) => acc + t.massKg, 0) +
    addons.reduce((acc, a) => acc + a.massKg, 0)
  ).toFixed(2);
  const toolPower = tools.reduce((acc, t) => acc + t.powerDrawWatts, 0);
  const addonPower = addons.reduce((acc, a) => acc + a.powerEffectWatts, 0);
  const totalPowerWatts = bot.powerWatts - toolPower + addonPower;
  const totalCreditsPerHour =
    bot.hourlyCredits +
    tools.reduce((acc, t) => acc + t.creditsPerHour, 0) +
    addons.reduce((acc, a) => acc + a.creditsPerHour, 0);

  const [row] = await db
    .insert(buildsTable)
    .values({
      name,
      botClassId,
      toolIds,
      addonIds,
      totalMassKg,
      totalPowerWatts,
      totalCreditsPerHour,
      founderHandle,
    })
    .returning();

  res.status(201).json(GetBuildResponse.parse(row));
});

router.get("/builds/:buildId", async (req, res): Promise<void> => {
  const params = GetBuildParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(buildsTable)
    .where(eq(buildsTable.id, params.data.buildId))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "build not found" });
    return;
  }
  res.json(GetBuildResponse.parse(row));
});

export default router;

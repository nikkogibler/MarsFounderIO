import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, botClassesTable } from "@workspace/db";
import {
  ListBotsResponse,
  GetBotParams,
  GetBotResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/bots", async (_req, res): Promise<void> => {
  const rows = await db.select().from(botClassesTable).orderBy(botClassesTable.codename);
  res.json(ListBotsResponse.parse(rows));
});

router.get("/bots/:botId", async (req, res): Promise<void> => {
  const params = GetBotParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(botClassesTable)
    .where(eq(botClassesTable.id, params.data.botId))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "bot not found" });
    return;
  }
  res.json(GetBotResponse.parse(row));
});

export default router;

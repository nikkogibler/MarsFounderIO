import { Router, type IRouter } from "express";
import { db, toolsTable, addonsTable } from "@workspace/db";
import { ListToolsResponse, ListAddonsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tools", async (_req, res): Promise<void> => {
  const rows = await db.select().from(toolsTable).orderBy(toolsTable.name);
  res.json(ListToolsResponse.parse(rows));
});

router.get("/addons", async (_req, res): Promise<void> => {
  const rows = await db.select().from(addonsTable).orderBy(addonsTable.name);
  res.json(ListAddonsResponse.parse(rows));
});

export default router;

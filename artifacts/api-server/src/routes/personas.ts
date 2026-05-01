import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, botClassesTable } from "@workspace/db";
import {
  GetPersonaReplyParams,
  GetPersonaReplyBody,
  GetPersonaReplyResponse,
} from "@workspace/api-zod";
import { generatePersonaReply } from "../lib/personaReply";

const router: IRouter = Router();

router.post("/personas/:botId/reply", async (req, res): Promise<void> => {
  const params = GetPersonaReplyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = GetPersonaReplyBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const message = (body.data.message ?? "").trim();
  if (message.length === 0 || message.length > 500) {
    res.status(400).json({ error: "message must be 1-500 characters" });
    return;
  }
  const [bot] = await db
    .select()
    .from(botClassesTable)
    .where(eq(botClassesTable.id, params.data.botId))
    .limit(1);
  if (!bot) {
    res.status(404).json({ error: "bot not found" });
    return;
  }
  try {
    const reply = await generatePersonaReply(bot, message);
    res.json(
      GetPersonaReplyResponse.parse({
        botId: bot.id,
        ...reply,
      }),
    );
  } catch (err) {
    req.log.error({ err }, "Persona reply failed");
    res.status(500).json({ error: "Comms degraded" });
  }
});

export default router;

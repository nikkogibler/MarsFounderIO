import { Router, type IRouter } from "express";
import { ListMarketplaceSkillsResponse } from "@workspace/api-zod";
import { MARKETPLACE_SKILLS } from "../lib/marketplaceSkills";

const router: IRouter = Router();

router.get("/marketplace/skills", (_req, res) => {
  res.json(ListMarketplaceSkillsResponse.parse(MARKETPLACE_SKILLS));
});

export default router;

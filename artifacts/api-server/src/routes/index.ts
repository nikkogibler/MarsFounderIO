import { Router, type IRouter } from "express";
import healthRouter from "./health";
import botsRouter from "./bots";
import equipmentRouter from "./equipment";
import buildsRouter from "./builds";
import missionsRouter from "./missions";
import personasRouter from "./personas";
import waitlistRouter from "./waitlist";
import ambientRouter from "./ambient";
import marketplaceRouter from "./marketplace";
import dashboardRouter from "./dashboard";
import registryRouter from "./registry";

const router: IRouter = Router();

router.use(healthRouter);
router.use(botsRouter);
router.use(equipmentRouter);
router.use(buildsRouter);
router.use(missionsRouter);
router.use(personasRouter);
router.use(waitlistRouter);
router.use(ambientRouter);
router.use(marketplaceRouter);
router.use(dashboardRouter);
router.use(registryRouter);

export default router;

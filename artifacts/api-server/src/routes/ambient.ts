import { Router, type IRouter } from "express";
import {
  GetMarsTimeResponse,
  GetLightDelayResponse,
  GetDustStormResponse,
} from "@workspace/api-zod";
import { getMarsTime, getLightDelay, getDustStorm } from "../lib/marsTime";

const router: IRouter = Router();

router.get("/ambient/mars-time", (_req, res) => {
  res.json(GetMarsTimeResponse.parse(getMarsTime()));
});

router.get("/ambient/light-delay", (_req, res) => {
  res.json(GetLightDelayResponse.parse(getLightDelay()));
});

router.get("/ambient/dust-storm", (_req, res) => {
  res.json(GetDustStormResponse.parse(getDustStorm()));
});

export default router;

import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { rateLimit } from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";
import { blockUnsafePromptFields } from "./lib/aiGuardrails";

const app: Express = express();
app.set("trust proxy", 1);

const aiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Rate limit exceeded. Slow down, founder." },
});

const feasibilityLimiter = rateLimit({
  windowMs: 60_000,
  limit: 4,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Feasibility rate limit exceeded. Slow down, founder." },
});

const writeLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Rate limit exceeded." },
});

const waitlistLimiter = rateLimit({
  windowMs: 60_000 * 10,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many waitlist signups from this address." },
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const corsOrigin = process.env["CORS_ORIGIN"];
app.use(
  cors(
    corsOrigin
      ? { origin: corsOrigin.split(",").map((o) => o.trim()) }
      : undefined,
  ),
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use("/api/personas", aiLimiter, blockUnsafePromptFields(["message"]));
app.use("/api/missions/:missionId/feasibility", feasibilityLimiter);
app.use("/api/waitlist", waitlistLimiter);
app.post("/api/builds", writeLimiter);
app.post(
  "/api/missions",
  writeLimiter,
  blockUnsafePromptFields(["missionBrief", "name", "locationName", "targetMaterial", "founderHandle"]),
);

app.use("/api", router);

export default app;

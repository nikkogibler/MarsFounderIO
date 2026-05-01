import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { rateLimit } from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
app.set("trust proxy", 1);

const aiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Rate limit exceeded. Slow down, founder." },
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
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use("/api/personas", aiLimiter);
app.use("/api/missions/:missionId/feasibility", aiLimiter);
app.use("/api/waitlist", waitlistLimiter);
app.post("/api/builds", writeLimiter);
app.post("/api/missions", writeLimiter);

app.use("/api", router);

export default app;

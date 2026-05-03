import { openrouter } from "@workspace/integrations-anthropic-ai";
import type { MissionRow, BuildRow, BotClassRow } from "@workspace/db";
import { EstimateMissionFeasibilityResponse } from "@workspace/api-zod";

interface FeasibilityInput {
  mission: MissionRow;
  build: BuildRow | null;
  bot: BotClassRow | null;
}

interface FeasibilityReport {
  verdict: "GO" | "MARGINAL" | "NO_GO";
  confidencePercent: number;
  estimatedCostCredits: number;
  estimatedEnergyKwh: number;
  estimatedDurationSols: number;
  risks: Array<{
    level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    category: string;
    description: string;
  }>;
  recommendations: string[];
  summary: string;
}

const SYSTEM_PROMPT = `You are MARS-FEAS-1, the feasibility analyst at MarsFounder — a Robots-as-a-Service company on Mars.

Your voice: concise, technical, and operationally serious. Use plain language. Avoid marketing language, jokes, sarcasm, and dramatic framing. Short sentences are preferred.

You always return STRICT JSON matching this exact shape (no markdown, no commentary outside JSON):
{
  "verdict": "GO" | "MARGINAL" | "NO_GO",
  "confidencePercent": integer 0-100,
  "estimatedCostCredits": integer,
  "estimatedEnergyKwh": integer,
  "estimatedDurationSols": integer,
  "risks": [{"level": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", "category": string, "description": string}],
  "recommendations": [string],
  "summary": string (2-3 sentences max, in voice)
}

Be direct. If the bot is undersized for the objective, return MARGINAL or NO_GO. If the selected role is mismatched, state that clearly. Risks should be Mars-specific (dust, thermal, communications blackout, terrain, radiation). Provide 3-5 risks and 2-4 recommendations. Cost is hourly rate * sols * 24. Energy is power * sols * 24 / 1000.`;

export async function generateFeasibility(
  input: FeasibilityInput,
): Promise<FeasibilityReport> {
  const { mission, build, bot } = input;

  const userPrompt = `Mission: ${mission.name}
Objective: ${mission.objective}${mission.targetMaterial ? ` (target: ${mission.targetMaterial})` : ""}
Mission brief: ${mission.missionBrief ?? "not provided"}
Location: ${mission.locationName} @ lat ${mission.latitude.toFixed(2)}, lon ${mission.longitude.toFixed(2)}
Duration: ${mission.durationSols} sols
Founder: ${mission.founderHandle}

Build: ${build?.name ?? "unknown"}
- Bot class: ${bot ? `${bot.codename} (${bot.role})` : "unknown"}
- Total mass: ${build?.totalMassKg ?? "?"} kg
- Total power: ${build?.totalPowerWatts ?? "?"} W
- Hourly cost: ${build?.totalCreditsPerHour ?? "?"} credits/hr
- Tools: ${build?.toolIds.length ?? 0} fitted
- Addons: ${build?.addonIds.length ?? 0} fitted

Generate the feasibility report. Strict JSON only.`;

  const response = await openrouter.chat.completions.create({
    model: "deepseek/deepseek-v4-flash",
    max_tokens: 1500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  }, { timeout: 30_000 });

  const text = response.choices[0]?.message?.content ?? "";
  const jsonStr = extractJson(text);
  const parsed = EstimateMissionFeasibilityResponse.parse(JSON.parse(jsonStr));

  const normalized: FeasibilityReport = {
    verdict: parsed.verdict,
    confidencePercent: clamp(Math.round(parsed.confidencePercent), 0, 100),
    estimatedCostCredits: Math.max(0, Math.round(parsed.estimatedCostCredits)),
    estimatedEnergyKwh: Math.max(0, Math.round(parsed.estimatedEnergyKwh)),
    estimatedDurationSols: Math.max(1, Math.round(parsed.estimatedDurationSols)),
    risks: parsed.risks
      .slice(0, 5)
      .map((risk) => ({
        level: risk.level,
        category: normalizeModelText(risk.category, 48),
        description: normalizeModelText(risk.description, 220),
      }))
      .filter((risk) => risk.category.length > 0 && risk.description.length > 0),
    recommendations: parsed.recommendations
      .slice(0, 4)
      .map((item) => normalizeModelText(item, 180))
      .filter((item) => item.length > 0),
    summary: normalizeModelText(parsed.summary, 360),
  };

  if (
    normalized.risks.length === 0 ||
    normalized.recommendations.length === 0 ||
    normalized.summary.length === 0
  ) {
    throw new Error("Model response missing required feasibility content");
  }

  return EstimateMissionFeasibilityResponse.parse(normalized);
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced && fenced[1]) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return text;
  return text.slice(start, end + 1);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function normalizeModelText(value: string, maxLength: number): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

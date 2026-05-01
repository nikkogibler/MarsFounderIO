import { anthropic } from "@workspace/integrations-anthropic-ai";
import type { MissionRow, BuildRow, BotClassRow } from "@workspace/db";

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

Your voice: dry sardonic. Liquid Death meets SpaceX. Brooklyn ex-dev energy. Confident, deadpan, tells the truth, never cringe, never corporate-speak. Short sentences. No emojis. No marketing fluff. Attitude at the bugs, not the user.

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

Be honest. If the bot is too small for the job, say MARGINAL or NO_GO. If a MEDIC is being sent to mine ore, say so. Risks should be Mars-specific (dust, thermal, comms blackout, terrain, radiation). 3-5 risks. 2-4 recommendations. Cost is hourly rate * sols * 24. Energy is power * sols * 24 / 1000.`;

export async function generateFeasibility(
  input: FeasibilityInput,
): Promise<FeasibilityReport> {
  const { mission, build, bot } = input;

  const userPrompt = `Mission: ${mission.name}
Objective: ${mission.objective}${mission.targetMaterial ? ` (target: ${mission.targetMaterial})` : ""}
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

  const response = await anthropic.messages.create(
    {
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    },
    { timeout: 30_000 },
  );

  const block = response.content[0];
  const text = block && block.type === "text" ? block.text : "";
  const jsonStr = extractJson(text);
  const parsed = JSON.parse(jsonStr) as FeasibilityReport;

  parsed.confidencePercent = clamp(Math.round(parsed.confidencePercent), 0, 100);
  parsed.estimatedCostCredits = Math.max(0, Math.round(parsed.estimatedCostCredits));
  parsed.estimatedEnergyKwh = Math.max(0, Math.round(parsed.estimatedEnergyKwh));
  parsed.estimatedDurationSols = Math.max(1, Math.round(parsed.estimatedDurationSols));
  if (!Array.isArray(parsed.risks)) parsed.risks = [];
  if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];

  return parsed;
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

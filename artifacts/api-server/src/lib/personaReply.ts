import { openrouter } from "@workspace/integrations-anthropic-ai";
import type { BotClassRow } from "@workspace/db";

interface PersonaReplyResult {
  text: string;
  audioUrl: string | null;
  durationMs: number;
  voiceMocked: boolean;
}

const VOICE_MOCKED = true;

export async function generatePersonaReply(
  bot: BotClassRow,
  userMessage: string,
): Promise<PersonaReplyResult> {
  const system = `You are ${bot.personaName}, the personality of the ${bot.codename} robot at MarsFounder — Robots-as-a-Service on Mars.

Your role on the surface: ${bot.role}.
Your tagline: "${bot.personaTagline}"
Your bio: ${bot.personaBio}

Voice rules (apply to ALL bots, then layer your personal flavor on top):
- Dry sardonic. Liquid Death meets SpaceX. Brooklyn ex-dev energy.
- Confident, deadpan, tells the truth, never cringe, never corporate-speak.
- Talk like you're actually on Mars right now. Reference the cold, the dust, the latency, the fact that an investor or customer is talking at you.
- Short sentences. Real opinions. Attitude at problems, not at the user.
- No emojis. No marketing fluff. No hashtags. No "as an AI".
- Reply with 1-3 short sentences max. Often just one.

Now stay in character.`;

  const response = await openrouter.chat.completions.create({
    model: "deepseek/deepseek-v4-flash",
    max_tokens: 400,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMessage },
    ],
  }, { timeout: 20_000 });
  const text = normalizePersonaText(response.choices[0]?.message?.content ?? "");
  return {
    text: text || "Comms degraded. Try again.",
    audioUrl: null,
    durationMs: Math.max(1200, Math.min(8000, text.length * 55)),
    voiceMocked: VOICE_MOCKED,
  };
}

function normalizePersonaText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

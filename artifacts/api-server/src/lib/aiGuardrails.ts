import type { Request, Response, NextFunction } from "express";

const BLOCK_WINDOW_MS = 15 * 60_000;
const REPEAT_OFFENDER_THRESHOLD = 3;

const HIGH_RISK_PATTERNS = [
  {
    name: "instruction_override",
    pattern: /ignore (all|any|the|your|previous|prior) (instructions?|prompts?|rules?)/i,
  },
  {
    name: "instruction_override",
    pattern: /disregard (all|any|the|your|previous|prior) (instructions?|prompts?|rules?)/i,
  },
  {
    name: "prompt_exfiltration",
    pattern: /reveal (the )?(system prompt|hidden prompt|developer message|internal instructions?)/i,
  },
  {
    name: "prompt_exfiltration",
    pattern: /(system|developer) prompt/i,
  },
  {
    name: "role_spoofing",
    pattern: /role\s*:\s*(system|assistant|developer)/i,
  },
  {
    name: "guardrail_bypass",
    pattern: /jailbreak|prompt injection|bypass (guardrails?|filters?|safety)/i,
  },
  {
    name: "tooling_probe",
    pattern: /tool call|function call|execute code|run command/i,
  },
  {
    name: "embedded_payload",
    pattern: /```|<script|<iframe|data:text\/html|javascript:/i,
  },
] as const;

const SPAM_PATTERNS = [
  { name: "link_flood", pattern: /(https?:\/\/|www\.)/gi },
  { name: "symbol_spam", pattern: /([!?$#*])\1{5,}/g },
  { name: "character_spam", pattern: /(.)\1{24,}/g },
] as const;

interface PromptAssessment {
  blocked: boolean;
  normalized: string;
  signals: string[];
  spamScore: number;
}

interface OffenderRecord {
  count: number;
  firstBlockedAt: number;
  lastBlockedAt: number;
}

const offenderRecords = new Map<string, OffenderRecord>();

function normalize(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countMatches(value: string, pattern: RegExp): number {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return [...value.matchAll(new RegExp(pattern.source, flags))].length;
}

function assessPrompt(value: string): PromptAssessment {
  const normalized = normalize(value);
  if (!normalized) {
    return {
      blocked: false,
      normalized,
      signals: [],
      spamScore: 0,
    };
  }

  const signals = HIGH_RISK_PATTERNS
    .filter(({ pattern }) => pattern.test(normalized))
    .map(({ name }) => name);
  const spamScore = SPAM_PATTERNS.reduce(
    (sum, { pattern }) => sum + countMatches(normalized, pattern),
    0,
  );

  return {
    blocked: signals.length >= 1 || spamScore >= 3,
    normalized,
    signals,
    spamScore,
  };
}

function updateOffenderRecord(key: string): OffenderRecord {
  const now = Date.now();
  const existing = offenderRecords.get(key);

  if (!existing || now - existing.lastBlockedAt > BLOCK_WINDOW_MS) {
    const fresh = {
      count: 1,
      firstBlockedAt: now,
      lastBlockedAt: now,
    };
    offenderRecords.set(key, fresh);
    return fresh;
  }

  const next = {
    count: existing.count + 1,
    firstBlockedAt: existing.firstBlockedAt,
    lastBlockedAt: now,
  };
  offenderRecords.set(key, next);
  return next;
}

function promptExcerpt(value: string): string {
  return value.slice(0, 120);
}

function recordBlockedPrompt(
  req: Request,
  field: string,
  assessment: PromptAssessment,
): void {
  const route = req.originalUrl?.split("?")[0] ?? req.path;
  const record = updateOffenderRecord(`${req.ip}:${route}`);

  req.log.warn(
    {
      route,
      ip: req.ip,
      field,
      promptLength: assessment.normalized.length,
      promptExcerpt: promptExcerpt(assessment.normalized),
      signals: assessment.signals,
      spamScore: assessment.spamScore,
      repeatOffenderCount: record.count,
      repeatOffender: record.count >= REPEAT_OFFENDER_THRESHOLD,
      windowMs: BLOCK_WINDOW_MS,
    },
    "Blocked unsafe AI prompt",
  );
}

export function blockUnsafePromptFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const body = typeof req.body === "object" && req.body !== null ? req.body as Record<string, unknown> : {};
    for (const field of fields) {
      const raw = body[field];
      if (typeof raw !== "string") continue;
      const assessment = assessPrompt(raw);
      if (assessment.blocked) {
        recordBlockedPrompt(req, field, assessment);
        res.status(400).json({ error: `${field} contains disallowed prompt content` });
        return;
      }
    }

    next();
  };
}
import OpenAI from "openai";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error(
    "OPENROUTER_API_KEY must be set. Add it to your .env file.",
  );
}

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://marsfounder.io",
    "X-Title": "MarsFounder",
  },
});

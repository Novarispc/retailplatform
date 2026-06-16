import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

/** Returns a shared Anthropic client, or null when no API key is configured. */
export function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export const CHAT_MODEL = process.env.AI_CHAT_MODEL || "claude-opus-4-8";
export const FAST_MODEL = process.env.AI_FAST_MODEL || "claude-haiku-4-5";

/** Extract concatenated text from a Messages API response. */
export function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

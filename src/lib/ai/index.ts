// AIGateway abstraction. Claude adapter when ANTHROPIC_API_KEY is set; stub otherwise.
// OpenAI/Gemini adapters implement the same interface later.
import { getAnthropic, aiEnabled, CHAT_MODEL, FAST_MODEL, textOf } from "./claude";

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIGateway {
  readonly name: string;
  isLive(): boolean;
  /** One-shot completion with an optional system prompt. */
  complete(system: string, messages: AIChatMessage[], opts?: { fast?: boolean }): Promise<string>;
}

class ClaudeGateway implements AIGateway {
  readonly name = "claude";
  isLive() {
    return aiEnabled();
  }
  async complete(system: string, messages: AIChatMessage[], opts?: { fast?: boolean }) {
    const client = getAnthropic();
    if (!client) return "AI is not enabled.";
    const res = await client.messages.create({
      model: opts?.fast ? FAST_MODEL : CHAT_MODEL,
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    return textOf(res);
  }
}

class StubGateway implements AIGateway {
  readonly name = "stub";
  isLive() {
    return false;
  }
  async complete() {
    return "AI assistant is not enabled yet. Add ANTHROPIC_API_KEY to .env to turn it on.";
  }
}

let gateway: AIGateway | null = null;
export function getAI(): AIGateway {
  if (!gateway) gateway = aiEnabled() ? new ClaudeGateway() : new StubGateway();
  return gateway;
}

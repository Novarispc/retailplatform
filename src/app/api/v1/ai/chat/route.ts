import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getAnthropic, aiEnabled, CHAT_MODEL, textOf } from "@/lib/ai/claude";
import { searchCatalog } from "@/server/services/catalog";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export const maxDuration = 30;

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) }))
    .min(1)
    .max(20),
});

const SYSTEM = `You are the AI shopping assistant for ASPORTS ZONE — a cricket & sports store based in Jodhpur, Rajasthan (asportszone.com). We stock cricket bats, combos, shoes and sports accessories from brands like 360, BDM, DSC, EM, GOWIN and Black Panther. Tagline: "Where the trust builds."
Help customers discover products, compare options, and answer questions.
Use the search_products tool to ground every product recommendation in the real catalog — never invent products or prices.
Be concise and friendly. When you recommend items, mention the product name and price. If nothing matches, say so honestly.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "search_products",
    description:
      "Search the ASPORTS ZONE catalog. Call this whenever the user asks about products, recommendations, comparisons, or availability.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text search terms" },
        category: { type: "string", enum: ["batting-gloves", "batting-pads", "helmets", "cricket-shoes", "kit-bags", "cricket-balls", "accessories"], description: "Optional category filter" },
      },
      required: ["query"],
    },
  },
];

async function runTool(input: { query?: string; category?: string }) {
  const result = await searchCatalog({ query: input.query, categorySlug: input.category, pageSize: 6 });
  return result.items.map((p) => ({
    name: p.name,
    slug: p.slug,
    price: formatMoney(p.priceMinor, p.currency as CurrencyCode),
    category: p.category?.name,
    rating: p.rating,
  }));
}

export async function POST(req: Request) {
  if (!aiEnabled()) {
    return NextResponse.json({
      reply: "The AI assistant isn't enabled yet. An ANTHROPIC_API_KEY needs to be set on the server.",
    });
  }

  const rl = await rateLimit(`ai-chat:${clientIp(req.headers)}`, 20, 60);
  if (!rl.allowed) return NextResponse.json({ error: "Slow down a moment." }, { status: 429 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const client = getAnthropic()!;
  const messages: Anthropic.MessageParam[] = parsed.data.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    // Manual agentic loop: let Claude call search_products until it answers.
    for (let i = 0; i < 4; i++) {
      const res = await client.messages.create({
        model: CHAT_MODEL,
        max_tokens: 1024,
        thinking: { type: "adaptive" },
        system: SYSTEM,
        tools: TOOLS,
        messages,
      });

      if (res.stop_reason !== "tool_use") {
        return NextResponse.json({ reply: textOf(res) || "How can I help you shop today?" });
      }

      messages.push({ role: "assistant", content: res.content });
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of res.content) {
        if (block.type === "tool_use" && block.name === "search_products") {
          const items = await runTool(block.input as { query?: string; category?: string });
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(items),
          });
        }
      }
      messages.push({ role: "user", content: toolResults });
    }
    return NextResponse.json({ reply: "I'm having trouble finishing that search — could you rephrase?" });
  } catch (err) {
    logger.error({ err }, "ai chat failed");
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}

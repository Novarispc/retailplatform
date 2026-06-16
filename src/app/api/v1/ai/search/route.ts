import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropic, aiEnabled, FAST_MODEL, textOf } from "@/lib/ai/claude";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

const bodySchema = z.object({ query: z.string().min(1).max(200) });

// Structured-output schema: Claude maps a natural-language query to catalog filters.
const FORMAT = {
  type: "json_schema" as const,
  schema: {
    type: "object",
    properties: {
      keywords: { type: "string", description: "Core search keywords, stripped of intent words" },
      category: { type: "string", enum: ["", "batting-gloves", "batting-pads", "helmets", "cricket-shoes", "kit-bags", "cricket-balls", "accessories"] },
      sort: { type: "string", enum: ["newest", "price_asc", "price_desc", "rating"] },
    },
    required: ["keywords", "category", "sort"],
    additionalProperties: false,
  },
};

const SYSTEM = `Map a shopper's natural-language request to catalog filters for a cricket equipment store
with these categories: batting-gloves, batting-pads, helmets, cricket-shoes, kit-bags, cricket-balls, accessories.
"cheap"/"budget"/"affordable" → sort price_asc. "premium"/"best"/"high-end" → sort price_desc or rating.
"top rated"/"popular" → sort rating. Leave category "" if unclear. Keep keywords short.`;

export async function POST(req: Request) {
  if (!aiEnabled()) return NextResponse.json({ error: "AI search not enabled" }, { status: 503 });

  const rl = await rateLimit(`ai-search:${clientIp(req.headers)}`, 30, 60);
  if (!rl.allowed) return NextResponse.json({ error: "Slow down a moment." }, { status: 429 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const client = getAnthropic()!;
    const res = await client.messages.create({
      model: FAST_MODEL,
      max_tokens: 256,
      system: SYSTEM,
      output_config: { format: FORMAT },
      messages: [{ role: "user", content: parsed.data.query }],
    });
    const filters = JSON.parse(textOf(res)) as { keywords: string; category: string; sort: string };
    return NextResponse.json(filters);
  } catch (err) {
    logger.error({ err }, "ai search failed");
    return NextResponse.json({ error: "AI search failed" }, { status: 500 });
  }
}

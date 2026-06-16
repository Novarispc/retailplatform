import { NextResponse } from "next/server";
import { signUpSchema } from "@/lib/contracts";
import { registerUser, RegistrationError } from "@/server/services/account";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const rl = await rateLimit(`signup:${ip}`, 5, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again soon." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const user = await registerUser(parsed.data);
    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (err) {
    if (err instanceof RegistrationError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    logger.error({ err }, "signup failed");
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

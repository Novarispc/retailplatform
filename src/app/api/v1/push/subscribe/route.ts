import { NextResponse } from "next/server";
import { savePushSubscription, removePushSubscription } from "@/lib/push";
import type webPush from "web-push";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }

  const { action, subscription } = body as { action?: string; subscription?: webPush.PushSubscription };
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Missing subscription" }, { status: 400 });
  }

  if (action === "unsubscribe") {
    removePushSubscription(subscription.endpoint);
    return NextResponse.json({ ok: true });
  }

  savePushSubscription(subscription);
  return NextResponse.json({ ok: true }, { status: 201 });
}

import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { subscribe } from "@/lib/realtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Server-Sent Events stream of live store activity for the admin dashboard.
export async function GET() {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "admin.access")) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => controller.enqueue(encoder.encode(data));
      send(`event: ready\ndata: {}\n\n`);

      unsubscribe = subscribe((e) => {
        send(`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`);
      });

      // Keep the connection alive through proxies.
      heartbeat = setInterval(() => send(`: ping\n\n`), 25000);
    },
    cancel() {
      unsubscribe?.();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

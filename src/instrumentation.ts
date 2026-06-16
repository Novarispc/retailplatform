// Runs once when the server boots. Wire domain-event → notification handlers.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerNotificationHandlers } = await import("@/lib/notifications/register");
    registerNotificationHandlers();
    const { registerRealtimeBridge } = await import("@/lib/realtime-register");
    registerRealtimeBridge();
    const { startWorker } = await import("@/lib/jobs");
    startWorker();
  }
}

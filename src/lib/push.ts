import webPush from "web-push";

// In-process subscription store backed by globalThis for dev HMR safety.
// For multi-instance prod, swap this backing store to Redis HSET.
declare global {
  // eslint-disable-next-line no-var
  var __pushSubs: Map<string, webPush.PushSubscription> | undefined;
}
if (!global.__pushSubs) global.__pushSubs = new Map();
const subs = global.__pushSubs;

function initVapid() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@nova.test";
  if (pub && priv) {
    webPush.setVapidDetails(subject, pub, priv);
    return true;
  }
  return false;
}

export function savePushSubscription(sub: webPush.PushSubscription) {
  subs.set(sub.endpoint, sub);
}

export function removePushSubscription(endpoint: string) {
  subs.delete(endpoint);
}

export async function sendPushToAll(payload: { title: string; body: string; url?: string }) {
  if (!initVapid()) return; // no VAPID keys configured
  const dead: string[] = [];
  await Promise.allSettled(
    [...subs.values()].map(async (sub) => {
      try {
        await webPush.sendNotification(sub, JSON.stringify(payload));
      } catch {
        dead.push(sub.endpoint);
      }
    }),
  );
  dead.forEach((ep) => subs.delete(ep));
}

export async function sendPushToUser(userId: string, payload: { title: string; body: string; url?: string }) {
  // Without a per-user subscription index, broadcast to all.
  // A real implementation would store userId → [endpoint] in Redis.
  await sendPushToAll(payload);
}

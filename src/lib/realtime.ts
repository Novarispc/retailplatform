// In-process pub/sub for SSE. Single-instance only (dev / single Node server).
// For multi-instance, back this with Redis pub/sub later — same publish/subscribe API.

export interface LiveEvent {
  type: string;
  payload: Record<string, unknown>;
  at: string;
}

type Subscriber = (e: LiveEvent) => void;

const globalForRT = globalThis as unknown as { rtSubs?: Set<Subscriber> };
const subscribers = (globalForRT.rtSubs ??= new Set<Subscriber>());

export function publish(type: string, payload: Record<string, unknown>) {
  const event: LiveEvent = { type, payload, at: new Date().toISOString() };
  for (const sub of subscribers) {
    try {
      sub(event);
    } catch {
      // ignore broken subscriber; it will be cleaned up on close
    }
  }
}

export function subscribe(sub: Subscriber): () => void {
  subscribers.add(sub);
  return () => subscribers.delete(sub);
}

export function subscriberCount() {
  return subscribers.size;
}

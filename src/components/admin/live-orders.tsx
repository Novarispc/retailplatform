"use client";

import { useEffect, useState } from "react";
import { Radio, ShoppingCart } from "lucide-react";

interface Feed {
  type: string;
  payload: { number?: string; totalMinor?: number; email?: string };
  at: string;
}

const rupees = (m?: number) => (m == null ? "" : `₹${Math.round(m / 100).toLocaleString("en-IN")}`);

export function LiveOrders() {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<Feed[]>([]);

  useEffect(() => {
    const es = new EventSource("/api/v1/admin/stream");
    es.addEventListener("ready", () => setConnected(true));
    const push = (e: MessageEvent) => {
      try {
        setEvents((prev) => [JSON.parse(e.data) as Feed, ...prev].slice(0, 8));
      } catch {
        /* ignore */
      }
    };
    es.addEventListener("order.created", push);
    es.addEventListener("payment.received", push);
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, []);

  return (
    <div className="glass rounded-[var(--radius)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted">Live activity</h3>
        <span className="flex items-center gap-1.5 text-xs">
          <Radio className={`h-3.5 w-3.5 ${connected ? "text-[var(--success)]" : "text-muted"}`} />
          <span className={connected ? "text-[var(--success)]" : "text-muted"}>{connected ? "Live" : "Connecting…"}</span>
        </span>
      </div>
      {events.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">Waiting for new orders…</p>
      ) : (
        <ul className="space-y-2">
          {events.map((e, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm">
              <ShoppingCart className="h-4 w-4 text-[var(--accent)]" />
              <span className="font-mono text-xs">{e.payload.number}</span>
              <span className="text-muted">{e.type === "payment.received" ? "paid" : "placed"}</span>
              <span className="ml-auto font-medium">{rupees(e.payload.totalMinor)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

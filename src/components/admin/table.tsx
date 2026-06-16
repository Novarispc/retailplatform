import { cn } from "@/lib/utils";

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass overflow-hidden rounded-[var(--radius)]">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-muted">
      {children}
    </thead>
  );
}

export function TH({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>;
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("border-b border-[var(--border)] last:border-0", className)}>{children}</tr>;
}

export function TD({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}

const STATUS_TONE: Record<string, string> = {
  PAID: "bg-[var(--success)]/15 text-[var(--success)]",
  DELIVERED: "bg-[var(--success)]/15 text-[var(--success)]",
  PENDING: "bg-[var(--accent)]/15 text-[var(--accent)]",
  FULFILLED: "bg-[var(--accent)]/15 text-[var(--accent)]",
  SHIPPED: "bg-[var(--accent-2)]/15 text-[var(--accent-2)]",
  CANCELLED: "bg-[var(--danger)]/15 text-[var(--danger)]",
  REFUNDED: "bg-[var(--danger)]/15 text-[var(--danger)]",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", STATUS_TONE[status] ?? "bg-[var(--surface-2)] text-muted")}>
      {status}
    </span>
  );
}

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function writeAudit(input: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
  ip?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metaJson: input.meta ? (input.meta as object) : undefined,
        ip: input.ip ?? null,
      },
    });
  } catch (err) {
    logger.error({ err, action: input.action }, "audit write failed");
  }
}

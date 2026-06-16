// BullMQ job queue. Redis-backed when REDIS_URL is set; degrades to inline
// (synchronous) execution in dev/test so nothing breaks without Redis.
import { Queue, Worker, type Job } from "bullmq";
import { logger } from "@/lib/logger";

export type JobName =
  | "send-notification"
  | "send-push"
  | "award-loyalty"
  | "reward-referral";

export type JobData = {
  "send-notification": {
    channel: "email" | "sms" | "whatsapp";
    to: string;
    subject?: string;
    body: string;
  };
  "send-push": {
    title: string;
    body: string;
    url?: string;
  };
  "award-loyalty": { userId: string; orderId: string; totalMinor: number };
  "reward-referral": { userId: string; orderId: string };
};

const QUEUE = "nova-jobs";

// Lazily created — avoids importing bullmq in edge runtimes.
let queue: Queue | null = null;

function redisConnection() {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  // BullMQ expects { host, port } or an ioredis connection.
  try {
    const u = new URL(url);
    return { host: u.hostname, port: Number(u.port) || 6379 };
  } catch {
    return { host: "localhost", port: 6379 };
  }
}

function getQueue(): Queue {
  if (!queue) {
    queue = new Queue(QUEUE, { connection: redisConnection() });
  }
  return queue;
}

/** Enqueue a job. Falls back to inline execution if Redis is unavailable. */
export async function enqueue<N extends JobName>(name: N, data: JobData[N]) {
  try {
    await getQueue().add(name, data, { attempts: 3, backoff: { type: "exponential", delay: 2000 } });
  } catch (err) {
    logger.warn({ err, name }, "job queue unavailable — executing inline");
    await runJob(name, data);
  }
}

/** Execute a job payload directly (used for inline fallback + worker). */
export async function runJob<N extends JobName>(name: N, data: JobData[N]) {
  switch (name) {
    case "send-notification": {
      const { notify } = await import("@/lib/notifications");
      await notify(data as JobData["send-notification"]);
      break;
    }
    case "send-push": {
      const { sendPushToAll } = await import("@/lib/push");
      await sendPushToAll(data as JobData["send-push"]);
      break;
    }
    case "award-loyalty": {
      const { prisma } = await import("@/lib/prisma");
      const { awardLoyaltyForOrder } = await import("@/server/services/loyalty");
      await prisma.$transaction((tx) => awardLoyaltyForOrder(tx, (data as JobData["award-loyalty"]).userId, (data as JobData["award-loyalty"]).orderId, (data as JobData["award-loyalty"]).totalMinor));
      break;
    }
    case "reward-referral": {
      const { prisma } = await import("@/lib/prisma");
      const { rewardReferralOnFirstOrder } = await import("@/server/services/loyalty");
      await prisma.$transaction((tx) => rewardReferralOnFirstOrder(tx, (data as JobData["reward-referral"]).userId, (data as JobData["reward-referral"]).orderId));
      break;
    }
    default:
      logger.warn({ name }, "unknown job name");
  }
}

let workerStarted = false;

/** Start the BullMQ worker (call once at instrumentation time). */
export function startWorker() {
  if (workerStarted) return;
  workerStarted = true;

  const worker = new Worker(
    QUEUE,
    async (job: Job) => {
      logger.info({ jobId: job.id, name: job.name }, "processing job");
      await runJob(job.name as JobName, job.data);
    },
    { connection: redisConnection(), concurrency: 5 },
  );

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, name: job?.name, err }, "job failed");
  });
}

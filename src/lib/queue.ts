// src/lib/queue.ts
import { Queue } from "bullmq";
import { redis } from "./redis";

if (!redis) throw new Error("Redis not configured — set REDIS_URL in .env");

export const dmQueue = new Queue("dm-automation", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: { count: 500, age: 86400 },
    removeOnFail:
      process.env.NODE_ENV === "production"
        ? { count: 200, age: 86400 }
        : false,
  },
});
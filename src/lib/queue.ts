import { Queue } from "bullmq";
import { redis } from "./redis";

export const dmQueue = new Queue("dm-automation", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: { count: 500, age: 86400 },
    // Bug 7 fixed: false during dev so you can inspect failed jobs;
    // swap to { count: 200, age: 86400 } for production
    removeOnFail: process.env.NODE_ENV === "production"
      ? { count: 200, age: 86400 }
      : false,
  },
});
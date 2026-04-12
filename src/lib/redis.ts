import IORedis from "ioredis";
if (!process.env.REDIS_URL) throw new Error("MISSING: REDIS_URL in .env");
export const redis = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy(times) { return Math.min(times * 50, 2000); },
});
redis.on("error", (err) => console.error("🔴 Redis Error:", err.message));
redis.on("connect", () => console.log("✅ Redis Connected"));

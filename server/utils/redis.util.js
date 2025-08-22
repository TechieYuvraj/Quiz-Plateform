import { Redis } from "ioredis";

console.log("REDIS_URL =>", process.env.REDIS_URL);
// const redis = new Redis(process.env.REDIS_URL);
const redis = new Redis({
    host: process.env.REDISHOST,
    port: process.env.REDISPORT,
    password: process.env.REDISPASSWORD,
    username: process.env.REDISUSER || "default",
});

redis.on("connect", () => {
    console.log("[Redis connected]");
});

redis.on("error", (err) => {
    console.error("[Redis error]:", err);
});

export default redis;
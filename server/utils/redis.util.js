import { Redis } from "ioredis";

console.log("REDIS_URL =>", process.env.REDIS_URL);
const redis = new Redis(process.env.REDIS_URL + "?family=0");


redis.on("connect", () => {
    console.log("[Redis connected]");
});

redis.on("error", (err) => {
    console.error("[Redis error]:", err);
});

export default redis;
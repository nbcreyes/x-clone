import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// Create the Redis client using the URL from environment variables.
// ioredis is used for Socket.io pub/sub (separate file).
// This client is for general caching (feed, notifications, etc.).
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis client connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis client ready");
});

// Connect to Redis. Called once on server startup.
const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export { redisClient, connectRedis };
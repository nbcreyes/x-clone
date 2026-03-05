import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// Publisher client - used to publish events to Redis channels
const publisher = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Subscriber client - used to subscribe to Redis channels
// Must be a separate client instance from the publisher
const subscriber = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

publisher.on("error", (err) => console.error("Redis publisher error:", err));
subscriber.on("error", (err) => console.error("Redis subscriber error:", err));

/**
 * Connects both pub/sub clients.
 * Called once during server startup.
 */
const connectPubSub = async () => {
  await Promise.all([
    publisher.connect(),
    subscriber.connect(),
  ]);
  console.log("Redis pub/sub connected");
};

/**
 * Publishes an event to a Redis channel.
 * The event is serialized to JSON before publishing.
 *
 * @param {string} channel - The Redis channel name
 * @param {object} data - The event payload
 */
const publish = async (channel, data) => {
  await publisher.publish(channel, JSON.stringify(data));
};

/**
 * Subscribes to a Redis channel.
 * The handler receives the parsed event payload.
 *
 * @param {string} channel - The Redis channel name
 * @param {function} handler - Called with the parsed event data
 */
const subscribe = async (channel, handler) => {
  await subscriber.subscribe(channel, (message) => {
    try {
      const data = JSON.parse(message);
      handler(data);
    } catch (err) {
      console.error(`Failed to parse message on channel ${channel}:`, err);
    }
  });
};

export { connectPubSub, publish, subscribe };
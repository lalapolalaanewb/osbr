import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
      password: process.env.REDIS_PASSWORD!,
    });

    redisClient.on("error", (err) => {
      console.error("Redis connection error:", err);
    });

    await redisClient.connect();
    console.log("Connected to Redis");
  }

  return redisClient;
}

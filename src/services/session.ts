import { CartType } from "../types/cart";
import { CartSession, SessionConfig } from "../types/session";
import { getRedisClient } from "./redis";

function createSessionService<T extends Record<string, unknown>>(
  config: SessionConfig,
) {
  const { prefix, ttl } = config;

  async function createSession(id: string, initialData: T): Promise<void> {
    const redis = await getRedisClient();

    await redis.set(prefix + id, JSON.stringify(initialData), {
      EX: ttl,
    });
  }

  async function getSession(id: string): Promise<T | null> {
    const redis = await getRedisClient();
    const data = await redis.get(prefix + id);

    if (!data) return null;

    // Sliding expiration (optional but recommended)
    await redis.expire(prefix + id, ttl);

    return JSON.parse(data);
  }

  async function updateSession(id: string, updates: Partial<T>): Promise<void> {
    const redis = await getRedisClient();
    const existing = await getSession(id);

    if (!existing) return;

    const updated = {
      ...existing,
      ...updates,
    };

    await redis.set(prefix + id, JSON.stringify(updated), {
      EX: ttl,
    });
  }

  async function destroySession(id: string): Promise<void> {
    const redis = await getRedisClient();
    await redis.del(prefix + id);
  }

  return {
    createSession,
    getSession,
    updateSession,
    destroySession,
  };
}

export const cartCacheService = createSessionService<CartType>({
  prefix: process.env.CACHE_PREFIX_CART,
  ttl: Number(process.env.CACHE_TTL_CART ?? 3600),
});

export const cartSessionService = createSessionService<CartSession>({
  prefix: process.env.SESSION_PREFIX_CART,
  ttl: Number(process.env.SESSION_TTL_CART ?? 3600),
});

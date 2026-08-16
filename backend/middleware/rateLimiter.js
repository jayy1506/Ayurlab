import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

let redisClient = null;

function getRedisClient() {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || !token.trim() || token === "your_upstash_redis_rest_token_here") {
    console.warn(
      "[RateLimiter Warning] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is missing or not configured. Rate limiting is running in bypass mode."
    );
    return null;
  }

  try {
    // Redis.fromEnv() automatically reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from environment
    redisClient = Redis.fromEnv();
    return redisClient;
  } catch (error) {
    console.warn(
      "[RateLimiter Warning] Upstash Redis could not be initialized from env:",
      error.message
    );
    return null;
  }
}

/**
 * Creates a rate limiting Express middleware using Upstash Redis.
 *
 * @param {Object} options
 * @param {number} [options.requests=10] - Number of allowed requests in the time window.
 * @param {string} [options.window="10 s"] - Time window (e.g., '10 s', '1 m', '1 h').
 * @param {string} [options.prefix="ratelimit"] - Redis key prefix for namespacing.
 * @param {Function} [options.getIdentifier] - Custom function to extract identifier from request.
 * @param {Object} [options.redis] - Optional custom Redis client (e.g. for testing).
 * @param {Object} [options.limiter] - Optional pre-configured Ratelimit instance.
 */
export function createRateLimiter({
  requests = 10,
  window = "10 s",
  prefix = "ratelimit",
  getIdentifier,
  redis: customRedis,
  limiter: customLimiter,
} = {}) {
  let ratelimitInstance = customLimiter || null;

  return async function rateLimiterMiddleware(req, res, next) {
    const redis = customRedis || getRedisClient();

    if (!redis && !ratelimitInstance) {
      return next();
    }

    if (!ratelimitInstance) {
      ratelimitInstance = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, window),
        prefix,
        analytics: false,
      });
    }


    try {
      const identifier =
        (getIdentifier && getIdentifier(req)) ||
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.headers["x-real-ip"] ||
        req.ip ||
        req.socket?.remoteAddress ||
        "anonymous";

      const { success, limit, remaining, reset } = await ratelimitInstance.limit(
        identifier
      );

      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, remaining));
      res.setHeader("X-RateLimit-Reset", reset);

      if (!success) {
        const retryAfterSeconds = Math.ceil(
          Math.max(0, reset - Date.now()) / 1000
        );
        res.setHeader("Retry-After", retryAfterSeconds);

        return res.status(429).json({
          error: "Too Many Requests",
          message: `Rate limit exceeded. Please try again in ${retryAfterSeconds} second(s).`,
          retryAfter: retryAfterSeconds,
        });
      }

      return next();
    } catch (error) {
      console.error("[RateLimiter Error]:", error);
      // Gracefully continue in case of temporary Redis network error
      return next();
    }
  };
}

// Pre-configured rate limiters
export const defaultRateLimiter = createRateLimiter({
  requests: 30,
  window: "10 s",
  prefix: "ratelimit:default",
});

export const aiRateLimiter = createRateLimiter({
  requests: 5,
  window: "10 s",
  prefix: "ratelimit:ai",
});

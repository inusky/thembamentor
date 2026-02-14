import { getRequestIP, type H3Event } from 'h3';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(event: H3Event) {
  return getRequestIP(event, { xForwardedFor: true }) || 'unknown';
}

export function isPasswordlessRateLimited(event: H3Event, emailNormalized: string) {
  if (import.meta.dev) return false;
  
  const ip = getClientIp(event);
  const key = `${ip}:${emailNormalized}`;
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return false;
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

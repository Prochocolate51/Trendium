/**
 * Simple in-memory rate limiter.
 * For production across multiple instances, replace with Redis or another shared store.
 */
const RATE_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 8;

type Entry = {
  count: number;
  expiresAt: number;
};

const requestStore = new Map<string, Entry>();

export function isRateLimited(identifier: string) {
  const now = Date.now();
  const current = requestStore.get(identifier);

  if (!current || current.expiresAt < now) {
    requestStore.set(identifier, { count: 1, expiresAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  current.count += 1;
  requestStore.set(identifier, current);
  return false;
}

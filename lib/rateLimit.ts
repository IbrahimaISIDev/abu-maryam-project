const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 min
const LOCKOUT_MS = 10 * 60 * 1000; // 10 min

interface AttemptState {
  count: number;
  windowStart: number;
  lockedUntil?: number;
}

// Store en mémoire — suffisant pour un seul processus Node.js, ne survit
// pas à un redémarrage et ne se partage pas entre plusieurs instances.
const attempts = new Map<string, AttemptState>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const state = attempts.get(key);
  const now = Date.now();
  if (state?.lockedUntil && state.lockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((state.lockedUntil - now) / 1000) };
  }
  return { allowed: true };
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const state = attempts.get(key);

  if (!state || now - state.windowStart > WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now });
    return;
  }

  const count = state.count + 1;
  attempts.set(key, {
    count,
    windowStart: state.windowStart,
    lockedUntil: count >= MAX_ATTEMPTS ? now + LOCKOUT_MS : undefined,
  });
}

export function resetAttempts(key: string): void {
  attempts.delete(key);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

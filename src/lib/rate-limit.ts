import { hashIpAddress } from "./crypto";
import { mutateSecurityState, readSecurityState } from "./security-store";

const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 dakika
const LOGIN_MAX_FAILURES = 5;

const CONTACT_WINDOW_MS = 15 * 60 * 1000; // 15 dakika
const CONTACT_MAX_SUBMISSIONS = 5;

interface Bucket {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

const memoryLoginBuckets = new Map<string, Bucket>();
const memoryContactBuckets = new Map<string, Bucket>();

export function getClientIp(request: Request): string {
  const vercelIp = request.headers.get("x-vercel-ip")?.trim();
  if (vercelIp) return vercelIp;

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return "127.0.0.1";
}

function evaluateBucket(bucket: Bucket | undefined, windowMs: number, maxCount: number) {
  const now = Date.now();
  if (!bucket) return { allowed: true, count: 0, retryAfterSec: 0 };
  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    return {
      allowed: false,
      count: bucket.count,
      retryAfterSec: Math.ceil((bucket.blockedUntil - now) / 1000),
    };
  }
  if (now - bucket.firstAttemptAt > windowMs) {
    return { allowed: true, count: 0, retryAfterSec: 0 };
  }
  if (bucket.count >= maxCount) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((bucket.firstAttemptAt + windowMs - now) / 1000)
    );
    return { allowed: false, count: bucket.count, retryAfterSec };
  }
  return { allowed: true, count: bucket.count, retryAfterSec: 0 };
}

export async function checkLoginRateLimit(ip: string): Promise<{
  allowed: boolean;
  failures: number;
  retryAfterSec: number;
}> {
  const key = hashIpAddress(ip);
  const memResult = evaluateBucket(
    memoryLoginBuckets.get(key),
    LOGIN_WINDOW_MS,
    LOGIN_MAX_FAILURES
  );
  if (!memResult.allowed) {
    return {
      allowed: false,
      failures: memResult.count,
      retryAfterSec: memResult.retryAfterSec,
    };
  }

  try {
    const secState = await readSecurityState();
    const persisted = secState.login_failures[key];
    const pResult = evaluateBucket(persisted, LOGIN_WINDOW_MS, LOGIN_MAX_FAILURES);
    if (persisted) {
      memoryLoginBuckets.set(key, persisted);
    }
    return {
      allowed: pResult.allowed,
      failures: Math.max(memResult.count, pResult.count),
      retryAfterSec: pResult.retryAfterSec,
    };
  } catch {
    return {
      allowed: memResult.allowed,
      failures: memResult.count,
      retryAfterSec: memResult.retryAfterSec,
    };
  }
}

export async function recordLoginFailure(ip: string): Promise<{
  count: number;
  blocked: boolean;
  retryAfterSec: number;
}> {
  const key = hashIpAddress(ip);
  const now = Date.now();

  const existing = memoryLoginBuckets.get(key);
  let nextCount = 1;
  let firstAt = now;

  if (existing && now - existing.firstAttemptAt <= LOGIN_WINDOW_MS) {
    nextCount = existing.count + 1;
    firstAt = existing.firstAttemptAt;
  }

  const blockedUntil = nextCount >= LOGIN_MAX_FAILURES ? now + LOGIN_WINDOW_MS : undefined;
  const nextBucket: Bucket = {
    count: nextCount,
    firstAttemptAt: firstAt,
    ...(blockedUntil ? { blockedUntil } : {}),
  };
  memoryLoginBuckets.set(key, nextBucket);

  // Kademeli gecikme (brute-force yavaşlatma)
  const delayMs = Math.min(nextCount * 350, 1400);
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  try {
    await mutateSecurityState((state) => {
      const cleaned: Record<string, Bucket> = {};
      for (const [k, v] of Object.entries(state.login_failures)) {
        if (now - v.firstAttemptAt <= LOGIN_WINDOW_MS || (v.blockedUntil && v.blockedUntil > now)) {
          cleaned[k] = v;
        }
      }
      const prev = cleaned[key];
      const mergedCount = prev && now - prev.firstAttemptAt <= LOGIN_WINDOW_MS
        ? Math.max(prev.count + 1, nextCount)
        : nextCount;
      const mergedFirst = prev && now - prev.firstAttemptAt <= LOGIN_WINDOW_MS
        ? prev.firstAttemptAt
        : firstAt;
      cleaned[key] = {
        count: mergedCount,
        firstAttemptAt: mergedFirst,
        ...(mergedCount >= LOGIN_MAX_FAILURES ? { blockedUntil: now + LOGIN_WINDOW_MS } : {}),
      };
      memoryLoginBuckets.set(key, cleaned[key]);
      return {
        ...state,
        login_failures: cleaned,
      };
    });
  } catch {
    // Bellek içi koruma devrede kalmaya devam eder
  }

  const finalBucket = memoryLoginBuckets.get(key) || nextBucket;
  return {
    count: finalBucket.count,
    blocked: finalBucket.count >= LOGIN_MAX_FAILURES,
    retryAfterSec: Math.ceil(LOGIN_WINDOW_MS / 1000),
  };
}

export async function resetLoginRateLimit(ip: string): Promise<void> {
  const key = hashIpAddress(ip);
  memoryLoginBuckets.delete(key);
  try {
    await mutateSecurityState((state) => {
      if (!state.login_failures[key]) return state;
      const next = { ...state.login_failures };
      delete next[key];
      return { ...state, login_failures: next };
    });
  } catch {
    // Sessizce geç
  }
}

export async function checkAndRecordContactRateLimit(ip: string): Promise<{
  allowed: boolean;
  retryAfterSec: number;
}> {
  const key = hashIpAddress(ip);
  const now = Date.now();

  const existingMem = memoryContactBuckets.get(key);
  const memEval = evaluateBucket(existingMem, CONTACT_WINDOW_MS, CONTACT_MAX_SUBMISSIONS);
  if (!memEval.allowed) {
    return { allowed: false, retryAfterSec: memEval.retryAfterSec };
  }

  const nextMemCount = existingMem && now - existingMem.firstAttemptAt <= CONTACT_WINDOW_MS
    ? existingMem.count + 1
    : 1;
  const nextMemFirst = existingMem && now - existingMem.firstAttemptAt <= CONTACT_WINDOW_MS
    ? existingMem.firstAttemptAt
    : now;

  memoryContactBuckets.set(key, {
    count: nextMemCount,
    firstAttemptAt: nextMemFirst,
    ...(nextMemCount >= CONTACT_MAX_SUBMISSIONS ? { blockedUntil: now + CONTACT_WINDOW_MS } : {}),
  });

  try {
    let blocked = false;
    let retryAfterSec = 0;

    await mutateSecurityState((state) => {
      const cleaned: Record<string, Bucket> = {};
      for (const [k, v] of Object.entries(state.contact_submissions)) {
        if (now - v.firstAttemptAt <= CONTACT_WINDOW_MS) {
          cleaned[k] = v;
        }
      }
      const prev = cleaned[key];
      const evalPrev = evaluateBucket(prev, CONTACT_WINDOW_MS, CONTACT_MAX_SUBMISSIONS);
      if (!evalPrev.allowed) {
        blocked = true;
        retryAfterSec = evalPrev.retryAfterSec;
        return { ...state, contact_submissions: cleaned };
      }

      const updatedCount = prev ? prev.count + 1 : 1;
      const updatedFirst = prev ? prev.firstAttemptAt : now;
      cleaned[key] = {
        count: updatedCount,
        firstAttemptAt: updatedFirst,
        ...(updatedCount >= CONTACT_MAX_SUBMISSIONS ? { blockedUntil: now + CONTACT_WINDOW_MS } : {}),
      };
      memoryContactBuckets.set(key, cleaned[key]);
      return { ...state, contact_submissions: cleaned };
    });

    if (blocked) {
      return { allowed: false, retryAfterSec };
    }
  } catch {
    // Bellek içi sayaç üzerinden devam et
  }

  return { allowed: true, retryAfterSec: 0 };
}

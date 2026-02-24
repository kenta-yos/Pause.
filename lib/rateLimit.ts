import { getDb } from "@/lib/db";
import { rateLimits } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { createHash } from "crypto";

const DAILY_LIMIT = 400;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(ip + (process.env.IP_HASH_SALT || "pause-salt"))
    .digest("hex");
}

// Read-only: returns current remaining count without incrementing
export async function getRemainingCount(ip: string): Promise<number> {
  const db = getDb();
  const ipHash = hashIp(ip);
  const windowStart = new Date(Date.now() - WINDOW_MS);

  const existing = await db
    .select()
    .from(rateLimits)
    .where(and(eq(rateLimits.ipHash, ipHash), gte(rateLimits.windowStart, windowStart)))
    .limit(1);

  if (existing.length === 0) return DAILY_LIMIT;
  return Math.max(0, DAILY_LIMIT - existing[0].count);
}

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const db = getDb();
  const ipHash = hashIp(ip);
  const windowStart = new Date(Date.now() - WINDOW_MS);

  const existing = await db
    .select()
    .from(rateLimits)
    .where(and(eq(rateLimits.ipHash, ipHash), gte(rateLimits.windowStart, windowStart)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(rateLimits).values({
      ipHash,
      count: 1,
      windowStart: new Date(),
    });
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }

  const record = existing[0];
  if (record.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  await db
    .update(rateLimits)
    .set({ count: record.count + 1 })
    .where(eq(rateLimits.ipHash, ipHash));

  return { allowed: true, remaining: DAILY_LIMIT - record.count - 1 };
}

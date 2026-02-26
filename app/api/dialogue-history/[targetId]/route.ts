import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { targets, dialogueHistory } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

type Params = { params: Promise<{ targetId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetId: targetIdStr } = await params;
  const targetId = parseInt(targetIdStr, 10);
  if (isNaN(targetId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const db = getDb();

  // Verify target ownership
  const [target] = await db
    .select()
    .from(targets)
    .where(and(eq(targets.id, targetId), eq(targets.userId, userId)))
    .limit(1);

  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const history = await db
    .select()
    .from(dialogueHistory)
    .where(eq(dialogueHistory.targetId, targetId))
    .orderBy(desc(dialogueHistory.createdAt));

  return NextResponse.json({ history });
}

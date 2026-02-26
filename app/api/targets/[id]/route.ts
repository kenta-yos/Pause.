import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { targets, targetInsights, dialogueHistory } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const targetId = parseInt(id, 10);
  if (isNaN(targetId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const db = getDb();
  const [target] = await db
    .select()
    .from(targets)
    .where(and(eq(targets.id, targetId), eq(targets.userId, userId)))
    .limit(1);

  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get portrait (latest insight)
  const [portrait] = await db
    .select()
    .from(targetInsights)
    .where(eq(targetInsights.targetId, targetId))
    .orderBy(desc(targetInsights.updatedAt))
    .limit(1);

  // Get recent dialogue history
  const history = await db
    .select()
    .from(dialogueHistory)
    .where(eq(dialogueHistory.targetId, targetId))
    .orderBy(desc(dialogueHistory.createdAt))
    .limit(10);

  return NextResponse.json({ target, portrait: portrait || null, history });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const targetId = parseInt(id, 10);
  if (isNaN(targetId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  let body: {
    nickname?: string;
    ageGroup?: string;
    lifeContext?: string;
    values?: string;
    infoSources?: string;
    relationship?: string;
    dialoguePattern?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const db = getDb();

  // Verify ownership
  const [existing] = await db
    .select()
    .from(targets)
    .where(and(eq(targets.id, targetId), eq(targets.userId, userId)))
    .limit(1);

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [updated] = await db
    .update(targets)
    .set({
      nickname: body.nickname?.trim() || existing.nickname,
      ageGroup: body.ageGroup?.trim() ?? existing.ageGroup,
      lifeContext: body.lifeContext?.trim() ?? existing.lifeContext,
      values: body.values?.trim() ?? existing.values,
      infoSources: body.infoSources?.trim() ?? existing.infoSources,
      relationship: body.relationship?.trim() ?? existing.relationship,
      dialoguePattern: body.dialoguePattern?.trim() ?? existing.dialoguePattern,
      updatedAt: new Date(),
    })
    .where(eq(targets.id, targetId))
    .returning();

  return NextResponse.json({ target: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const targetId = parseInt(id, 10);
  if (isNaN(targetId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const db = getDb();

  // Verify ownership
  const [existing] = await db
    .select()
    .from(targets)
    .where(and(eq(targets.id, targetId), eq(targets.userId, userId)))
    .limit(1);

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(targets).where(eq(targets.id, targetId));
  return NextResponse.json({ success: true });
}

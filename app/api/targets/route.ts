import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { targets, dialogueHistory } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();

  // Get targets with last analysis date
  const rows = await db
    .select({
      id: targets.id,
      userId: targets.userId,
      nickname: targets.nickname,
      ageGroup: targets.ageGroup,
      relationship: targets.relationship,
      createdAt: targets.createdAt,
      updatedAt: targets.updatedAt,
      lastAnalyzedAt: sql<string>`(
        SELECT MAX(${dialogueHistory.createdAt})
        FROM ${dialogueHistory}
        WHERE ${dialogueHistory.targetId} = ${targets.id}
      )`,
    })
    .from(targets)
    .where(eq(targets.userId, userId))
    .orderBy(desc(targets.updatedAt));

  return NextResponse.json({ targets: rows });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    nickname: string;
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

  if (!body.nickname?.trim()) {
    return NextResponse.json({ error: "ニックネームを入力してください" }, { status: 400 });
  }

  const db = getDb();
  const [created] = await db
    .insert(targets)
    .values({
      userId,
      nickname: body.nickname.trim(),
      ageGroup: body.ageGroup?.trim() || null,
      lifeContext: body.lifeContext?.trim() || null,
      values: body.values?.trim() || null,
      infoSources: body.infoSources?.trim() || null,
      relationship: body.relationship?.trim() || null,
      dialoguePattern: body.dialoguePattern?.trim() || null,
    })
    .returning();

  return NextResponse.json({ target: created }, { status: 201 });
}

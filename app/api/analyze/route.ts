import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { analyzePersonCentric } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rateLimit";
import { getDb } from "@/lib/db";
import { targets, targetInsights, dialogueHistory } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { AnalyzeRequestV2, TargetData, TargetInsightData, DialogueHistoryEntry, PersonCentricInsight } from "@/types/insight";

export async function POST(req: NextRequest) {
  // Auth check
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit check
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const { allowed, remaining } = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "1日のリクエスト上限（400回）に達しました。明日またお試しください。",
      },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      }
    );
  }

  let body: AnalyzeRequestV2;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { claim, targetId } = body;

  if (!claim || typeof claim !== "string" || claim.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "言説を入力してください。" },
      { status: 400 }
    );
  }

  if (claim.trim().length > 2000) {
    return NextResponse.json(
      { success: false, error: "入力が長すぎます（最大2000文字）。" },
      { status: 400 }
    );
  }

  if (!targetId || typeof targetId !== "number") {
    return NextResponse.json(
      { success: false, error: "対話相手を選択してください。" },
      { status: 400 }
    );
  }

  const db = getDb();

  // Fetch target (verify ownership)
  const [target] = await db
    .select()
    .from(targets)
    .where(and(eq(targets.id, targetId), eq(targets.userId, userId)))
    .limit(1);

  if (!target) {
    return NextResponse.json(
      { success: false, error: "対話相手が見つかりません。" },
      { status: 404 }
    );
  }

  // Fetch portrait (latest insight)
  const [portrait] = await db
    .select()
    .from(targetInsights)
    .where(eq(targetInsights.targetId, targetId))
    .orderBy(desc(targetInsights.updatedAt))
    .limit(1);

  // Fetch recent 5 dialogue history entries
  const recentHistoryRows = await db
    .select()
    .from(dialogueHistory)
    .where(eq(dialogueHistory.targetId, targetId))
    .orderBy(desc(dialogueHistory.createdAt))
    .limit(5);

  // Convert DB rows to typed data
  const targetData: TargetData = {
    id: target.id,
    userId: target.userId,
    nickname: target.nickname,
    ageGroup: target.ageGroup,
    lifeContext: target.lifeContext,
    values: target.values,
    infoSources: target.infoSources,
    relationship: target.relationship,
    dialoguePattern: target.dialoguePattern,
    createdAt: target.createdAt.toISOString(),
    updatedAt: target.updatedAt.toISOString(),
  };

  const portraitData: TargetInsightData | null = portrait
    ? {
        id: portrait.id,
        targetId: portrait.targetId,
        summary: portrait.summary,
        updatedAt: portrait.updatedAt.toISOString(),
      }
    : null;

  const historyData: DialogueHistoryEntry[] = recentHistoryRows.map((h) => ({
    id: h.id,
    targetId: h.targetId,
    claim: h.claim,
    output: h.output as PersonCentricInsight,
    createdAt: h.createdAt.toISOString(),
  }));

  try {
    const data = await analyzePersonCentric(
      claim.trim(),
      targetData,
      portraitData,
      historyData
    );

    // Supported claim — return without saving
    if (data.supported) {
      return NextResponse.json(
        { success: true, data, supported: true },
        { headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    // Save to dialogue history
    const [saved] = await db
      .insert(dialogueHistory)
      .values({
        targetId,
        claim: claim.trim(),
        output: data,
      })
      .returning();

    // Update portrait if portraitUpdate is provided
    if (data.portraitUpdate && data.portraitUpdate.trim()) {
      const newSummary = portrait
        ? `${portrait.summary}\n\n${data.portraitUpdate.trim()}`
        : data.portraitUpdate.trim();

      if (portrait) {
        await db
          .update(targetInsights)
          .set({ summary: newSummary, updatedAt: new Date() })
          .where(eq(targetInsights.id, portrait.id));
      } else {
        await db.insert(targetInsights).values({
          targetId,
          summary: newSummary,
        });
      }
    }

    return NextResponse.json(
      { success: true, data, dialogueHistoryId: saved.id },
      {
        headers: { "X-RateLimit-Remaining": String(remaining) },
      }
    );
  } catch (err) {
    console.error("Gemini analysis error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "分析中にエラーが発生しました。しばらくしてからお試しください。",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { analyzeWithGemini } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rateLimit";
import { AnalyzeRequest } from "@/types/insight";

export async function POST(req: NextRequest) {
  // Get client IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Rate limit check: 400 requests/day per IP hash
  const { allowed, remaining } = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error:
          "1日のリクエスト上限（400回）に達しました。明日またお試しください。",
      },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      }
    );
  }

  let body: AnalyzeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { claim, mode } = body;

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

  if (mode !== "self" && mode !== "others") {
    return NextResponse.json(
      { success: false, error: "Invalid mode" },
      { status: 400 }
    );
  }

  try {
    const data = await analyzeWithGemini(claim.trim(), mode);
    return NextResponse.json(
      { success: true, data },
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

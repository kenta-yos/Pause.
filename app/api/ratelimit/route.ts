import { NextRequest, NextResponse } from "next/server";
import { getRemainingCount } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const remaining = await getRemainingCount(ip);
  return NextResponse.json({ remaining });
}

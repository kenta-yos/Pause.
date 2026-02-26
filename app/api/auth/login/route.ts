import { NextRequest, NextResponse } from "next/server";
import { setUserId } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  let body: { userId: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const db = getDb();
  const user = await db.select().from(users).where(eq(users.id, body.userId)).limit(1);
  if (user.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await setUserId(body.userId);
  return NextResponse.json({ success: true, user: { id: user[0].id, name: user[0].name } });
}

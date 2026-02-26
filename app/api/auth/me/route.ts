import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const db = getDb();
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: { id: user[0].id, name: user[0].name } });
}

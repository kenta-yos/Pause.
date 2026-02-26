import { cookies } from "next/headers";

const COOKIE_NAME = "pause_user_id";

export async function setUserId(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, String(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

export async function getUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

export async function clearUserId() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

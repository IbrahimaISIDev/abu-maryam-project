import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_EMAIL = "admin@abumaryam.tv";
const ADMIN_PASSWORD = "Admin@2026";
const COOKIE_NAME = "admin_session";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8h
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

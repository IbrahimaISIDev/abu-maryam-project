import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE, checkAdminCredentials, createSessionToken } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!checkAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

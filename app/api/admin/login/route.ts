import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE, checkAdminCredentials, createSessionToken } from "@/lib/adminAuth";
import { checkRateLimit, getClientIp, recordFailedAttempt, resetAttempts } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    const retryAfter = rate.retryAfterSeconds ?? 0;
    return NextResponse.json(
      { error: `Trop de tentatives. Réessayez dans ${Math.ceil(retryAfter / 60)} min.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const { email, password } = await req.json();

  if (!checkAdminCredentials(email, password)) {
    recordFailedAttempt(ip);
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  resetAttempts(ip);

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

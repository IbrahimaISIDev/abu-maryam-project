import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/passwordHash";

export const ADMIN_COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8h

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET n'est pas défini (voir .env.example)");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

/** Vérifie les identifiants contre le compte admin stocké en base (table admin_users). */
export async function checkAdminCredentials(email: string, password: string): Promise<boolean> {
  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
  if (!admin) return false;
  return verifyPassword(password, admin.passwordHash);
}

/** Jeton `exp.signature` — la signature HMAC empêche de forger le cookie sans connaître le secret serveur. */
export function createSessionToken(): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return `${exp}.${sign(String(exp))}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [expStr, signature] = token.split(".");
  if (!expStr || !signature) return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;

  const expected = Buffer.from(sign(expStr));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export const ADMIN_SESSION_MAX_AGE = SESSION_TTL_SECONDS;

/** Vrai si la requête courante porte un cookie de session admin valide. */
export async function hasValidAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

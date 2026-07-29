import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";

interface InscriptionPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  city?: string;
  ageRange: string;
  mode: "presentiel" | "ligne";
  message?: string;
  consent: boolean;
}

function validate(data: Partial<InscriptionPayload>): string | null {
  if (!data.firstName?.trim()) return "Prénom requis";
  if (!data.lastName?.trim()) return "Nom requis";
  if (!data.phone?.trim()) return "Téléphone requis";
  if (!/^\+?[\d\s\-]{7,20}$/.test(data.phone)) return "Format de téléphone invalide";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Format d'email invalide";
  if (!data.ageRange) return "Tranche d'âge requise";
  if (data.mode !== "presentiel" && data.mode !== "ligne") return "Mode de participation invalide";
  if (!data.consent) return "Consentement requis";
  return null;
}

export async function POST(req: Request) {
  let body: Partial<InscriptionPayload>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const error = validate(body);
  if (error) {
    return NextResponse.json({ error }, { status: 422 });
  }

  const id = `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  await db.insert(registrations).values({
    id,
    fullName: `${body.firstName!.trim()} ${body.lastName!.trim()}`,
    email: body.email?.trim() || "",
    phone: body.phone!.trim(),
    city: body.city?.trim() || "",
    ageRange: body.ageRange,
    mode: body.mode,
    message: body.message?.trim() || undefined,
    status: "pending",
    paymentStatus: "unpaid",
  });

  return NextResponse.json({ ok: true, id }, { status: 201 });
}

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const items = await db.select().from(registrations).orderBy(desc(registrations.registeredAt));
  return NextResponse.json({ total: items.length, registrations: items });
}

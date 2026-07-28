import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registrations as seedRegistrations } from "@/data/registrations";
import type { Registration } from "@/lib/types";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";

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

// Store en mémoire — persiste pendant la durée du processus Node.js
// Sera remplacé par un appel NestJS une fois le backend connecté
const store: Registration[] = [...seedRegistrations];

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

  const registration: Registration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fullName: `${body.firstName!.trim()} ${body.lastName!.trim()}`,
    email: body.email?.trim() || "",
    phone: body.phone!.trim(),
    city: body.city?.trim() || "",
    ageRange: body.ageRange!,
    mode: body.mode!,
    message: body.message?.trim() || undefined,
    status: "pending",
    paymentStatus: "unpaid",
    registeredAt: new Date().toISOString(),
  };

  store.push(registration);

  return NextResponse.json({ ok: true, id: registration.id }, { status: 201 });
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!verifySessionToken(session?.value)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  return NextResponse.json({ total: store.length, registrations: store });
}

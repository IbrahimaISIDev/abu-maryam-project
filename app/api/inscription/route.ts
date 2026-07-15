import { NextResponse } from "next/server";

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

interface StoredRegistration extends InscriptionPayload {
  id: string;
  registeredAt: string;
  status: "pending";
  paymentStatus: "unpaid";
}

// Store en mémoire — persiste pendant la durée du processus Node.js
// Sera remplacé par un appel NestJS une fois le backend connecté
const store: StoredRegistration[] = [];

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

  const registration: StoredRegistration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    firstName: body.firstName!.trim(),
    lastName: body.lastName!.trim(),
    phone: body.phone!.trim(),
    email: body.email?.trim() || undefined,
    city: body.city?.trim() || undefined,
    ageRange: body.ageRange!,
    mode: body.mode!,
    message: body.message?.trim() || undefined,
    consent: true,
    status: "pending",
    paymentStatus: "unpaid",
    registeredAt: new Date().toISOString(),
  };

  store.push(registration);

  return NextResponse.json({ ok: true, id: registration.id }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({ total: store.length, registrations: store });
}

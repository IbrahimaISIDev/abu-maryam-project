import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { replays } from "@/lib/db/schema";
import { hasValidAdminSession } from "@/lib/adminAuth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;

  await db.delete(replays).where(eq(replays.id, id));
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, answerNote } = body;

    await db
      .update(questions)
      .set({
        ...(status ? { status } : {}),
        ...(answerNote !== undefined ? { answerNote } : {}),
      })
      .where(eq(questions.id, id));

    return NextResponse.json({ success: true, message: "Question mise à jour" });
  } catch (error: any) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(questions).where(eq(questions.id, id));
    return NextResponse.json({ success: true, message: "Question supprimée" });
  } catch (error: any) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

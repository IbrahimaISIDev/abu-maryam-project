import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { questions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(questions)
      .orderBy(desc(questions.createdAt));

    return NextResponse.json({ success: true, questions: list });
  } catch (error: any) {
    console.error("Error fetching questions for admin:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des questions" },
      { status: 500 }
    );
  }
}

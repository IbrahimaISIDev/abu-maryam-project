import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { questions } from "@/lib/db/schema";
import { z } from "zod";

const createQuestionSchema = z.object({
  name: z.string().min(2, "Le nom est obligatoire (minimum 2 caractères)"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  theme: z.enum([
    "tafsir",
    "tawhid",
    "akhlaq",
    "salat",
    "famille",
    "sunna",
    "sahaba",
    "khoutba",
    "conférence",
    "rappel",
  ]).default("rappel"),
  questionText: z.string().min(5, "La question doit contenir au moins 5 caractères"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = createQuestionSchema.parse(body);

    const newId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(questions).values({
      id: newId,
      name: validatedData.name,
      email: validatedData.email || null,
      phone: validatedData.phone || null,
      theme: validatedData.theme,
      questionText: validatedData.questionText,
      status: "pending",
      createdAt: new Date(),
    });

    return NextResponse.json(
      { success: true, message: "Votre question a été transmise avec succès à Oustaz !" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating question:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la soumission" },
      { status: 500 }
    );
  }
}

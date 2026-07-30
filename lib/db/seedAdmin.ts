/**
 * Bootstrap du compte admin — crée la ligne admin_users à partir de
 * ADMIN_EMAIL / ADMIN_PASSWORD (.env.local) si aucun admin n'existe encore.
 * Idempotent : ne fait rien si un compte admin est déjà présent en base.
 * Lancer avec : npm run db:seed-admin
 */
import { db } from "./client";
import { adminUsers } from "./schema";
import { hashPassword } from "@/lib/passwordHash";

async function main() {
  const existing = await db.select().from(adminUsers).limit(1);
  if (existing.length > 0) {
    console.log("Un compte admin existe déjà — rien à faire.");
    return;
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD ne sont pas définis (voir .env.example)");
  }

  const id = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  await db.insert(adminUsers).values({
    id,
    email,
    displayName: "Administrateur",
    passwordHash: hashPassword(password),
  });

  console.log(`Compte admin créé pour ${email}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

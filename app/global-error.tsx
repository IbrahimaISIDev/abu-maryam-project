"use client";

import Link from "next/link";

// Dernier filet de sécurité si app/[lang]/layout.tsx lui-même échoue — error.tsx ne peut pas
// intercepter les erreurs de son propre layout. Doit être totalement autonome (pas de contexte,
// pas de classes Tailwind garanties) : styles inline uniquement.
export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf9f3",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "0 24px", maxWidth: 440 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#6f7363",
              marginBottom: 12,
            }}
          >
            Abu Maryam TV
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: "#232a20", marginBottom: 12 }}>
            Quelque chose s&apos;est mal passé
          </h1>
          <p style={{ fontSize: 14.5, color: "#6f7363", lineHeight: 1.6, marginBottom: 28 }}>
            La page n&apos;a pas pu s&apos;afficher correctement. Vous pouvez réessayer, ou retourner à l&apos;accueil.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => unstable_retry()}
              style={{
                background: "#b58a3c",
                color: "#fbf9f3",
                fontWeight: 600,
                fontSize: 14.5,
                padding: "13px 26px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
            <Link
              href="/"
              style={{
                border: "2px solid #3c4a37",
                color: "#3c4a37",
                fontWeight: 600,
                fontSize: 14.5,
                padding: "11px 24px",
                borderRadius: 999,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const alt = "Abu Maryam TV";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Texte en latin volontairement dans les deux langues : le moteur de rendu de next/og (satori)
// ne gère pas le ligaturage contextuel arabe et casserait visuellement les lettres.
const TAGLINE = "Enseignements islamiques — Oustaz Niang Mbaye";

export default function OpengraphImage() {
  const imageData = readFileSync(join(process.cwd(), "public/images/oustaz-niang-mbaye1.jpeg"));
  const src = `data:image/jpeg;base64,${imageData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#3c4a37",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 0 0 72px",
            width: 720,
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#cda350",
              marginBottom: 28,
            }}
          >
            Abu Maryam TV
          </div>
          <div
            style={{
              fontSize: 60,
              lineHeight: 1.15,
              color: "#fbf9f3",
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            Qur&apos;an &amp; Sunna
          </div>
          <div style={{ display: "flex", width: 84, height: 4, background: "#b58a3c", marginBottom: 24 }} />
          <div style={{ fontSize: 26, color: "#d8d0bf" }}>{TAGLINE}</div>
        </div>
        <div
          style={{
            position: "relative",
            width: 480,
            height: 630,
            display: "flex",
            overflow: "hidden",
          }}
        >
          <img
            src={src}
            alt=""
            width={870}
            height={1131}
            style={{ position: "absolute", left: -195, top: -130 }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, #3c4a37 0%, rgba(60,74,55,0) 22%)",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}

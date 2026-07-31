import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const revalidate = 86400;

export async function GET() {
  const imageData = readFileSync(join(process.cwd(), "public/images/oustaz-niang-mbaye1.jpeg"));
  const src = `data:image/jpeg;base64,${imageData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1400,
          height: 1400,
          display: "flex",
          flexDirection: "column",
          background: "#3c4a37",
        }}
      >
        <div style={{ display: "flex", width: 1400, height: 980, position: "relative", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendu par next/og (satori), pas du DOM */}
          <img src={src} alt="" width={1400} height={1400} style={{ position: "absolute", left: 0, top: -230 }} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "56px 80px",
            height: 420,
          }}
        >
          <div style={{ fontSize: 34, letterSpacing: 6, textTransform: "uppercase", color: "#cda350" }}>
            Abu Maryam TV
          </div>
          <div style={{ fontSize: 52, color: "#fbf9f3", fontWeight: 600, marginTop: 12 }}>
            Enseignements — Oustaz Niang Mbaye
          </div>
        </div>
      </div>
    ),
    {
      width: 1400,
      height: 1400,
      headers: { "Cache-Control": "public, max-age=86400" },
    }
  );
}

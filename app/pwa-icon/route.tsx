import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export function GET(req: NextRequest) {
  const s = Math.min(512, Math.max(32, Number(req.nextUrl.searchParams.get("s") ?? "512")));
  const imageData = readFileSync(join(process.cwd(), "public/images/oustaz-niang-mbaye1.jpeg"));
  const src = `data:image/jpeg;base64,${imageData.toString("base64")}`;
  const scaled = s * 2.4;

  return new ImageResponse(
    (
      <div
        style={{
          width: s,
          height: s,
          background: "#3c4a37",
          borderRadius: s * 0.18,
          overflow: "hidden",
          display: "flex",
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={scaled}
          height={scaled}
          style={{ position: "absolute", left: -0.2683 * scaled, top: -0.1633 * scaled }}
        />
      </div>
    ),
    { width: s, height: s }
  );
}

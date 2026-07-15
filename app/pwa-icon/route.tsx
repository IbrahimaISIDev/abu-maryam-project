import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export function GET(req: NextRequest) {
  const s = Math.min(512, Math.max(32, Number(req.nextUrl.searchParams.get("s") ?? "512")));

  return new ImageResponse(
    (
      <div
        style={{
          width: s,
          height: s,
          background: "#3c4a37",
          borderRadius: s * 0.18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: s * 0.55,
          color: "#cda350",
          fontFamily: "serif",
        }}
      >
        أ
      </div>
    ),
    { width: s, height: s }
  );
}

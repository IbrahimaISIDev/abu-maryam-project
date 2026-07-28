import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const imageData = readFileSync(join(process.cwd(), "public/images/oustaz-niang-mbaye1.jpeg"));
  const src = `data:image/jpeg;base64,${imageData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 36,
          overflow: "hidden",
          display: "flex",
          position: "relative",
          background: "#3c4a37",
        }}
      >
        <img
          src={src}
          alt=""
          width={432}
          height={432}
          style={{ position: "absolute", left: -116, top: -70 }}
        />
      </div>
    ),
    { ...size }
  );
}

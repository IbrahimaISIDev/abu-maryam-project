import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const imageData = readFileSync(join(process.cwd(), "public/images/oustaz-niang-mbaye1.jpeg"));
  const src = `data:image/jpeg;base64,${imageData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          overflow: "hidden",
          display: "flex",
          position: "relative",
        }}
      >
        <img
          src={src}
          alt=""
          width={77}
          height={77}
          style={{ position: "absolute", left: -21, top: -13 }}
        />
      </div>
    ),
    { ...size }
  );
}

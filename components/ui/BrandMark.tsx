import Image from "next/image";

interface BrandMarkProps {
  size?: number;
}

export default function BrandMark({ size = 38 }: BrandMarkProps) {
  return (
    <div
      className="relative rounded-full overflow-hidden shrink-0 border border-[rgba(205,163,80,0.5)]"
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/oustaz-niang-mbaye1.jpeg"
        alt="Abu Maryam TV"
        fill
        sizes={`${size}px`}
        className="object-cover"
        style={{ transform: "scale(2.4)", transformOrigin: "46% 28%" }}
      />
    </div>
  );
}

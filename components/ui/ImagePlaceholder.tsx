interface ImagePlaceholderProps {
  className?: string;
  label?: string;
  aspectRatio?: string;
}

// Note: no `relative` in base class — callers control positioning (absolute/relative/static)
// The checkerboard is a CSS background-image so no child absolute div is needed.
export default function ImagePlaceholder({
  className = "",
  label,
  aspectRatio,
}: ImagePlaceholderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={{
        aspectRatio: aspectRatio ?? undefined,
        backgroundColor: "var(--placeholder-bg)",
        backgroundImage:
          "repeating-linear-gradient(45deg, var(--placeholder-pattern) 0px, var(--placeholder-pattern) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(-45deg, var(--placeholder-pattern) 0px, var(--placeholder-pattern) 1px, transparent 1px, transparent 8px)",
      }}
    >
      <div className="flex flex-col items-center gap-1 text-[#9a9483] dark:text-[#8f8973]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        {label && (
          <span className="text-xs font-[var(--font-hanken)] tracking-wide">{label}</span>
        )}
      </div>
    </div>
  );
}

export default function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block w-[7px] h-[7px] rounded-full bg-[#8a2f29] animate-live-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

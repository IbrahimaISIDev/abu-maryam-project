import BrandMark from "@/components/ui/BrandMark";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <div className="animate-pulse">
        <BrandMark size={52} />
      </div>
      <div className="w-10 h-[3px] rounded-full bg-[#e2dac9] dark:bg-[#3a4132] overflow-hidden">
        <div className="h-full w-1/2 bg-[#b58a3c] animate-loading-bar" />
      </div>
    </div>
  );
}

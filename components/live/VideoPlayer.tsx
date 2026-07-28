import { liveStatus } from "@/data/live";
import Badge from "@/components/ui/Badge";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function VideoPlayer() {
  // Si youtubeChannelId est renseigné, on embed YouTube Live
  // Sinon, on affiche un placeholder avec message
  const ytId = liveStatus.youtubeChannelId;

  return (
    <div className="rounded-[14px] overflow-hidden relative" style={{ aspectRatio: "16/9" }}>
      {ytId ? (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/live_stream?channel=${ytId}&autoplay=1`}
          title={liveStatus.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          {/* Fond placeholder */}
          <div className="absolute inset-0 bg-[#232a20]">
            <ImagePlaceholder className="w-full h-full opacity-30" />
          </div>

          {/* Badge EN DIRECT */}
          <div className="absolute top-4 left-4">
            <Badge variant="live" />
          </div>

          {/* Viewers */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[rgba(28,34,22,0.7)] text-[#fbf9f3] text-[12.5px] font-[var(--font-hanken)] px-3 py-1 rounded-full">
            <span>☁</span>
            <span>{liveStatus.viewers.toLocaleString("fr-FR")}</span>
          </div>

          {/* Bouton play central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="w-[74px] h-[74px] rounded-full bg-[rgba(251,249,243,0.18)] border-2 border-[rgba(251,249,243,0.55)] flex items-center justify-center text-[#fbf9f3] text-3xl hover:bg-[rgba(251,249,243,0.28)] transition-colors"
              aria-label="Lancer la lecture"
            >
              ▶
            </button>
          </div>

          {/* Barre de contrôle bas */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(28,34,22,.9)] to-transparent px-4 py-3 flex items-center gap-3">
            <button className="text-[#fbf9f3] text-[18px] leading-none" aria-label="Pause">⏸</button>
            {/* Barre de progression */}
            <div className="flex-1 h-[3px] bg-[rgba(251,249,243,0.3)] rounded-full">
              <div className="h-full w-[40%] bg-[#fbf9f3] rounded-full" />
            </div>
            <span className="text-[#fbf9f3] text-[12px] font-[var(--font-hanken)]">● Direct</span>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Teaching, Theme, ContentType, Language, DifficultyLevel, Series, Chapter, AgendaItem } from "@/lib/types";
import { parseTimeToSeconds, formatDurationString, buildYoutubeThumbnailUrl } from "@/lib/youtube";
import { useToast } from "@/contexts/ToastContext";
import { apiRoutes } from "@/lib/api-routes";
import Modal from "@/components/ui/Modal";
import MediaUploader from "@/components/admin/MediaUploader";

const THEME_LABELS: Record<Theme, string> = {
  tafsir: "Tafsîr", tawhid: "Tawhîd", akhlaq: "Akhlâq",
  salat: "Salât", famille: "Famille", sunna: "Sunna",
  sahaba: "Sahaba", khoutba: "Khoutba", conférence: "Conférence",
  rappel: "Rappel",
};
const THEMES = Object.keys(THEME_LABELS) as Theme[];
const LANGUAGES: Language[] = ["wolof", "arabe"];
const LEVELS: DifficultyLevel[] = ["débutant", "intermédiaire", "avancé"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] placeholder:text-[#9a9483] focus:outline-none focus:border-[#b58a3c]";
// Sans `w-full` — pour les cas où l'appelant impose sa propre largeur (ex. flex-1 / w-[90px] dans
// une même ligne). Tailwind v4 fait gagner l'ordre de génération du CSS, pas l'ordre des classes :
// mettre `w-full` et `w-[90px]` sur le même élément produirait un résultat imprévisible.
const inputClassNoWidth = inputClass.replace("w-full ", "");

interface TeachingFormModalProps {
  isOpen: boolean;
  isNew: boolean;
  editItem: Teaching | null;
  seriesList: Series[];
  agendaItems: AgendaItem[];
  onChange: (item: Teaching) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function TeachingFormModal({
  isOpen,
  isNew,
  editItem,
  seriesList,
  agendaItems,
  onChange,
  onSave,
  onClose,
}: TeachingFormModalProps) {
  const toast = useToast();
  const [youtubeUrlInput, setYoutubeUrlInput] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolvedTitle, setResolvedTitle] = useState<string | null>(null);
  const [videoSource, setVideoSource] = useState<"youtube" | "upload">(() =>
    editItem?.videoUrl && !editItem?.youtubeId ? "upload" : "youtube"
  );
  const [showAudioUrlField, setShowAudioUrlField] = useState(false);

  if (!editItem) return null;

  async function handleResolveYoutube() {
    if (!youtubeUrlInput.trim() || !editItem) return;
    setResolving(true);
    setResolvedTitle(null);
    try {
      const res = await fetch(apiRoutes.youtubeResolve(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrlInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec de la résolution");

      onChange({
        ...editItem,
        youtubeId: data.youtubeId,
        ...(data.durationAvailable
          ? { duration: data.duration, durationSeconds: data.durationSeconds }
          : {}),
      });
      setResolvedTitle(data.title);
      if (!data.durationAvailable) {
        toast(
          "Vidéo trouvée — durée pas encore disponible (fréquent juste après un direct, le temps que YouTube finisse de traiter la vidéo). Pas de souci pour enregistrer maintenant : la durée se corrigera automatiquement à la première lecture, ou réessaie \"Récupérer les infos\" plus tard.",
          "info"
        );
      } else {
        toast("Informations récupérées", "success");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Échec de la résolution", "error");
    } finally {
      setResolving(false);
    }
  }

  function updateChapter(index: number, patch: Partial<Chapter>) {
    const chapters = [...(editItem!.chapters ?? [])];
    chapters[index] = { ...chapters[index], ...patch };
    onChange({ ...editItem!, chapters });
  }

  function addChapter() {
    const chapters = [...(editItem!.chapters ?? []), { label: "", timeSeconds: 0 }];
    onChange({ ...editItem!, chapters });
  }

  function removeChapter(index: number) {
    const chapters = (editItem!.chapters ?? []).filter((_, i) => i !== index);
    onChange({ ...editItem!, chapters });
  }

  return (
    <Modal
      isOpen={isOpen}
      title={isNew ? "Nouvel enseignement" : "Modifier l'enseignement"}
      onClose={onClose}
      maxWidth="max-w-[640px]"
    >
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Titre (Français/Wolof)</FieldLabel>
            <input value={editItem.title} onChange={(e) => onChange({ ...editItem, title: e.target.value })}
              placeholder="Titre de l'enseignement"
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel>Titre en arabe (optionnel)</FieldLabel>
            <input value={editItem.titleAr ?? ""} onChange={(e) => onChange({ ...editItem, titleAr: e.target.value || null })}
              placeholder="عنوان الدرس باللغة العربية"
              dir="rtl"
              className={`${inputClass} font-[var(--font-amiri)] text-[15px]`}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Type</FieldLabel>
            <select value={editItem.type} onChange={(e) => onChange({ ...editItem, type: e.target.value as ContentType })}
              className={inputClass}>
              <option value="video">Vidéo</option>
              <option value="audio">Audio</option>
            </select>
          </div>
          <div>
            <FieldLabel>Langue</FieldLabel>
            <select value={editItem.language} onChange={(e) => onChange({ ...editItem, language: e.target.value as Language })}
              className={inputClass}>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Thème</FieldLabel>
            <select value={editItem.theme} onChange={(e) => onChange({ ...editItem, theme: e.target.value as Theme })}
              className={inputClass}>
              {THEMES.map((t) => <option key={t} value={t}>{THEME_LABELS[t]}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Niveau</FieldLabel>
            <select value={editItem.level ?? ""} onChange={(e) => onChange({ ...editItem, level: (e.target.value || undefined) as DifficultyLevel | undefined })}
              className={inputClass}>
              <option value="">—</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Média — vidéo : YouTube ou fichier direct ; audio : envoi de fichier */}
        {editItem.type === "video" ? (
          <div className="bg-[#f5f1e8] rounded-[9px] p-4 space-y-3">
            <div className="flex items-center gap-1 bg-[#e9e3d4] rounded-full p-1 w-fit">
              {(["youtube", "upload"] as const).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => {
                    setVideoSource(src);
                    if (src === "youtube") onChange({ ...editItem, videoUrl: null });
                    else onChange({ ...editItem, youtubeId: null });
                  }}
                  className={`px-4 py-1.5 rounded-full font-[var(--font-hanken)] text-[12.5px] font-medium transition-colors ${
                    videoSource === src
                      ? "bg-[#fbf9f3] text-[#232a20] shadow-sm"
                      : "text-[#6f7363] hover:text-[#3f463a]"
                  }`}
                >
                  {src === "youtube" ? "YouTube" : "Fichier direct"}
                </button>
              ))}
            </div>

            {videoSource === "youtube" ? (
              <>
                <div className="flex gap-2">
                  <input
                    value={youtubeUrlInput}
                    onChange={(e) => setYoutubeUrlInput(e.target.value)}
                    placeholder="URL YouTube ou ID (ex : https://youtube.com/watch?v=…)"
                    className={`${inputClass} bg-[#fbf9f3]`}
                  />
                  <button type="button"
                    onClick={handleResolveYoutube}
                    disabled={resolving || !youtubeUrlInput.trim()}
                    className="shrink-0 px-4 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] disabled:opacity-50 disabled:cursor-not-allowed text-[#fbf9f3] rounded-[9px] font-[var(--font-hanken)] text-[13px] font-semibold transition-colors whitespace-nowrap"
                  >
                    {resolving ? "Recherche…" : "Récupérer les infos"}
                  </button>
                </div>
                {editItem.youtubeId && (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={buildYoutubeThumbnailUrl(editItem.youtubeId, "mqdefault")}
                      alt=""
                      className="w-[100px] h-[56px] object-cover rounded-[6px] border border-[#d8d0bf]"
                    />
                    <div className="min-w-0">
                      <p className="font-[var(--font-hanken)] text-[12px] text-[#3f463a] font-medium truncate">
                        ID : <span dir="ltr">{editItem.youtubeId}</span>
                      </p>
                      {resolvedTitle && (
                        <p className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483] truncate">
                          Titre YouTube : {resolvedTitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <MediaUploader
                  kind="video"
                  currentUrl={editItem.videoUrl}
                  onUploaded={(url) => onChange({ ...editItem, videoUrl: url })}
                />
                <p className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483] mt-1.5">
                  Pour une vidéo à accès restreint ou non destinée à YouTube — hébergée directement sur la plateforme.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <FieldLabel>Fichier audio</FieldLabel>
            <MediaUploader
              kind="audio"
              currentUrl={editItem.audioUrl}
              onUploaded={(url) => onChange({ ...editItem, audioUrl: url })}
            />
            <button
              type="button"
              onClick={() => setShowAudioUrlField((v) => !v)}
              className="mt-2 font-[var(--font-hanken)] text-[11.5px] font-medium text-[#b58a3c] hover:text-[#9e7832] transition-colors"
            >
              {showAudioUrlField ? "Masquer" : "Ou coller un lien déjà hébergé"}
            </button>
            {showAudioUrlField && (
              <input
                value={editItem.audioUrl ?? ""}
                onChange={(e) => onChange({ ...editItem, audioUrl: e.target.value || null })}
                placeholder="https://…"
                dir="ltr"
                className={`${inputClass} mt-2`}
              />
            )}
          </div>
        )}

        {/* Vignette personnalisée */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <FieldLabel>Vignette personnalisée (optionnel)</FieldLabel>
            {editItem.thumbnail && (
              <button
                type="button"
                onClick={() => onChange({ ...editItem, thumbnail: null })}
                className="font-[var(--font-hanken)] text-[11.5px] font-semibold text-[#8a2f29] hover:text-[#7a2923] transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
          <p className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483] mb-2">
            Si absente, l'aperçu islamique par défaut ({editItem.type === "video" ? "mihrab vidéo" : "onde audio"}) sera utilisé.
          </p>
          <MediaUploader
            kind="image"
            currentUrl={editItem.thumbnail ?? null}
            onUploaded={(url) => onChange({ ...editItem, thumbnail: url })}
            onRemove={() => onChange({ ...editItem, thumbnail: null })}
          />
        </div>

        <div>
          <FieldLabel>Durée (ex : 1:12:04)</FieldLabel>
          <input
            value={editItem.duration}
            onChange={(e) => {
              const duration = e.target.value;
              const durationSeconds = parseTimeToSeconds(duration);
              onChange({
                ...editItem,
                duration,
                ...(durationSeconds !== null ? { durationSeconds } : {}),
              });
            }}
            placeholder="0:00:00"
            dir="ltr"
            className={inputClass}
          />
        </div>

        {/* Série / épisode */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Série (optionnel)</FieldLabel>
            <select
              value={editItem.seriesId ?? ""}
              onChange={(e) => onChange({ ...editItem, seriesId: e.target.value || null })}
              className={inputClass}
            >
              <option value="">— Aucune —</option>
              {seriesList.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          {editItem.seriesId && (
            <div>
              <FieldLabel>N° d&apos;épisode</FieldLabel>
              <input
                type="number"
                min={1}
                value={editItem.episodeNumber ?? ""}
                onChange={(e) => onChange({ ...editItem, episodeNumber: e.target.value ? Number(e.target.value) : null })}
                className={inputClass}
              />
            </div>
          )}
        </div>

        <div>
          <FieldLabel>Événement associé (optionnel)</FieldLabel>
          <select
            value={editItem.agendaItemId ?? ""}
            onChange={(e) => onChange({ ...editItem, agendaItemId: e.target.value || null })}
            className={inputClass}
          >
            <option value="">— Aucun —</option>
            {agendaItems.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({new Date(a.dateStart).toLocaleDateString("fr-FR")})
              </option>
            ))}
          </select>
          <p className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483] mt-1.5">
            Pour rattacher une vidéo/audio filmé pendant un séminaire ou une activité — apparaîtra
            groupé avec les autres contenus du même événement.
          </p>
        </div>

        <div>
          <FieldLabel>Verset arabe (optionnel)</FieldLabel>
          <input
            value={editItem.arabicVerse ?? ""}
            onChange={(e) => onChange({ ...editItem, arabicVerse: e.target.value || null })}
            dir="rtl"
            className={`${inputClass} font-[var(--font-amiri)] text-[15px]`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea value={editItem.description ?? ""} onChange={(e) => onChange({ ...editItem, description: e.target.value })}
              rows={3} placeholder="Résumé de l'enseignement…"
              className={`${inputClass} resize-none`}
            />
          </div>
          <div>
            <FieldLabel>Description en arabe (optionnel)</FieldLabel>
            <textarea value={editItem.descriptionAr ?? ""} onChange={(e) => onChange({ ...editItem, descriptionAr: e.target.value || null })}
              rows={3} placeholder="ملخص الدرس باللغة العربية…"
              dir="rtl"
              className={`${inputClass} resize-none font-[var(--font-amiri)] text-[15px]`}
            />
          </div>
        </div>

        {/* Chapitres */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <FieldLabel>Chapitres (optionnel)</FieldLabel>
            <button type="button" onClick={addChapter}
              className="font-[var(--font-hanken)] text-[12px] font-semibold text-[#b58a3c] hover:text-[#9e7832] transition-colors">
              + Ajouter
            </button>
          </div>
          {(editItem.chapters ?? []).length === 0 ? (
            <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">Aucun chapitre.</p>
          ) : (
            <div className="space-y-2">
              {(editItem.chapters ?? []).map((ch, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={ch.label}
                    onChange={(e) => updateChapter(i, { label: e.target.value })}
                    placeholder="Titre du chapitre"
                    className={`${inputClassNoWidth} flex-1`}
                  />
                  <input
                    defaultValue={formatDurationString(ch.timeSeconds)}
                    onBlur={(e) => {
                      const parsed = parseTimeToSeconds(e.target.value);
                      if (parsed !== null) updateChapter(i, { timeSeconds: parsed });
                      else e.target.value = formatDurationString(ch.timeSeconds);
                    }}
                    placeholder="mm:ss"
                    dir="ltr"
                    className={`${inputClassNoWidth} w-[90px] shrink-0 tabular-nums`}
                  />
                  <button type="button" onClick={() => removeChapter(i)}
                    aria-label="Supprimer ce chapitre"
                    className="shrink-0 w-8 h-8 flex items-center justify-center text-[#8a2f29] hover:bg-[rgba(138,47,41,0.08)] rounded-[7px] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toggle publié / brouillon */}
        <label className="flex items-center justify-between cursor-pointer bg-[#f5f1e8] rounded-[9px] px-4 py-3">
          <div>
            <p className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#232a20]">
              {editItem.published === false ? "Brouillon" : "Publié"}
            </p>
            <p className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483]">
              {editItem.published === false ? "Visible uniquement en back-office" : "Visible sur le site public"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...editItem, published: editItem.published === false ? true : false })}
            className={`relative w-10 h-6 rounded-full transition-colors ${editItem.published === false ? "bg-[#d8d0bf]" : "bg-[#3c4a37]"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${editItem.published === false ? "left-0.5" : "left-4"}`} />
          </button>
        </label>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] font-medium text-[#6f7363] hover:bg-[#f0ece3] transition-colors">
            Annuler
          </button>
          <button onClick={onSave}
            className="flex-1 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#fbf9f3] transition-colors">
            {isNew ? "Ajouter" : "Enregistrer"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

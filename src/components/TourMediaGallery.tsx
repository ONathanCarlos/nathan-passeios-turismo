import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/i18n";

interface Props {
  images: string[];
  videos?: string[];
  alt: string;
  lang?: Lang;
  className?: string;
}

type MediaItem = { type: "image" | "video"; src: string; label: string };

const LABELS: Record<Lang, { photo: string; video: string; previous: string; next: string; goTo: string }> = {
  pt: { photo: "Foto", video: "Vídeo", previous: "Mídia anterior", next: "Próxima mídia", goTo: "Ir para" },
  es: { photo: "Foto", video: "Vídeo", previous: "Medio anterior", next: "Medio siguiente", goTo: "Ir a" },
  en: { photo: "Photo", video: "Video", previous: "Previous media", next: "Next media", goTo: "Go to" },
  fr: { photo: "Photo", video: "Vidéo", previous: "Média précédent", next: "Média suivant", goTo: "Aller à" },
  it: { photo: "Foto", video: "Video", previous: "Media precedente", next: "Media successivo", goTo: "Vai a" },
};

export const TourMediaGallery = ({ images, videos = [], alt, lang = "pt", className = "" }: Props) => {
  const [index, setIndex] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const labels = LABELS[lang];
  const media = useMemo<MediaItem[]>(() => [
    ...Array.from(new Set(images.filter(Boolean))).slice(0, 4).map((src, i) => ({
      type: "image" as const,
      src,
      label: `${labels.photo} ${i + 1}`,
    })),
    ...Array.from(new Set(videos.filter(Boolean))).slice(0, 2).map((src, i) => ({
      type: "video" as const,
      src,
      label: `${labels.video} ${i + 1}`,
    })),
  ], [images, videos, labels]);
  const multiple = media.length > 1;

  useEffect(() => {
    setIndex((current) => Math.min(current, Math.max(media.length - 1, 0)));
  }, [media.length]);

  if (!media.length) return null;

  const move = (direction: 1 | -1) => {
    setIndex((current) => (current + direction + media.length) % media.length);
  };
  const isInteractiveTarget = (target: EventTarget | null) =>
    target instanceof Element && !!target.closest("video, button");

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden bg-night touch-pan-y ${className}`}
      onPointerDown={(event) => setStartX(isInteractiveTarget(event.target) ? null : event.clientX)}
      onPointerUp={(event) => {
        if (startX === null || !multiple || isInteractiveTarget(event.target)) return setStartX(null);
        const distance = event.clientX - startX;
        if (Math.abs(distance) > 40) move(distance < 0 ? 1 : -1);
        setStartX(null);
      }}
      onPointerCancel={() => setStartX(null)}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {media.map((item, mediaIndex) => (
          <div key={`${item.type}-${item.src}`} className="h-full w-full shrink-0">
            {item.type === "image" ? (
              <img
                src={item.src}
                alt={mediaIndex < 4 ? `${alt} — ${item.label.toLowerCase()}` : alt}
                loading={mediaIndex === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover"
              />
            ) : (
              <video
                src={item.src}
                poster={images.find(Boolean)}
                controls
                playsInline
                preload="metadata"
                aria-label={`${alt} — ${item.label.toLowerCase()}`}
                className="h-full w-full bg-black object-contain"
              />
            )}
          </div>
        ))}
      </div>

      {multiple && (
        <>
          <button
            type="button"
            aria-label={labels.previous}
            onClick={(event) => { event.stopPropagation(); move(-1); }}
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-night/65 p-1 text-white backdrop-blur-sm hover:bg-night/85 sm:block"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={labels.next}
            onClick={(event) => { event.stopPropagation(); move(1); }}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-night/65 p-1 text-white backdrop-blur-sm hover:bg-night/85 sm:block"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex max-w-[90%] -translate-x-1/2 gap-1.5 overflow-x-auto rounded-full bg-night/65 px-2 py-1.5 backdrop-blur-sm" aria-label={`${media[index]?.label || "Mídia"} ${index + 1} de ${media.length}`}>
            {media.map((item, dotIndex) => (
              <button
                key={`${item.type}-dot-${item.src}`}
                type="button"
                aria-label={`${labels.goTo} ${item.label.toLowerCase()}`}
                aria-current={dotIndex === index ? "true" : undefined}
                onClick={(event) => { event.stopPropagation(); setIndex(dotIndex); }}
                className={`shrink-0 rounded-full text-[9px] font-semibold leading-none transition-colors ${dotIndex === index ? "bg-white px-2 py-1 text-night" : "bg-white/45 px-1.5 py-1 text-white hover:bg-white/70"}`}
              >
                {item.type === "image" ? `F${dotIndex + 1}` : `V${dotIndex - media.filter((entry) => entry.type === "image").length + 1}`}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

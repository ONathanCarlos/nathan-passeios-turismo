import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Props {
  images: string[];
  alt: string;
  className?: string;
}

export const TourMediaGallery = ({ images, alt, className = "" }: Props) => {
  const [index, setIndex] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const safeImages = images.filter(Boolean).slice(0, 4);
  const multiple = safeImages.length > 1;

  if (!safeImages.length) return null;

  const move = (direction: 1 | -1) => {
    setIndex((current) => (current + direction + safeImages.length) % safeImages.length);
  };

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden bg-night touch-pan-y ${className}`}
      onPointerDown={(event) => setStartX(event.clientX)}
      onPointerUp={(event) => {
        if (startX === null || !multiple) return setStartX(null);
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
        {safeImages.map((src, imageIndex) => (
          <img
            key={`${src}-${imageIndex}`}
            src={src}
            alt={imageIndex === 0 ? alt : `${alt} — foto ${imageIndex + 1}`}
            loading={imageIndex === 0 ? "lazy" : "lazy"}
            decoding="async"
            draggable={false}
            className="h-full w-full shrink-0 object-cover"
          />
        ))}
      </div>

      {multiple && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(event) => { event.stopPropagation(); move(-1); }}
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-night/65 p-1 text-white backdrop-blur-sm hover:bg-night/85 sm:block"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={(event) => { event.stopPropagation(); move(1); }}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-night/65 p-1 text-white backdrop-blur-sm hover:bg-night/85 sm:block"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-night/45 px-2 py-1 backdrop-blur-sm" aria-label={`Foto ${index + 1} de ${safeImages.length}`}>
            {safeImages.map((src, dotIndex) => (
              <button
                key={`${src}-dot-${dotIndex}`}
                type="button"
                aria-label={`Ir para foto ${dotIndex + 1}`}
                onClick={(event) => { event.stopPropagation(); setIndex(dotIndex); }}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${dotIndex === index ? "bg-white" : "bg-white/45"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

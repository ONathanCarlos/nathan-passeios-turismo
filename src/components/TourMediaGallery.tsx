import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { TourImage } from "./TourImage";
import { tourPhotos, TOUR_SLIDE_INTERVAL } from "@/lib/tourMedia";

interface Props {
  images: string[];
  alt: string;
  className?: string;
}

export const TourMediaGallery = ({ images, alt, className = "" }: Props) => {
  const [index, setIndex] = useState(0);
  const safeImages = tourPhotos(images);
  const [viewportRef, carousel] = useEmblaCarousel({ loop: true });
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const multiple = safeImages.length > 1;

  useEffect(() => {
    if (!carousel) return;
    const select = () => setIndex(carousel.selectedScrollSnap());
    select();
    carousel.on("select", select).on("reInit", select);
    return () => { carousel.off("select", select).off("reInit", select); };
  }, [carousel]);

  useEffect(() => {
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  useEffect(() => {
    if (!carousel || !multiple || !visible || paused) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      if (!motion.matches && !document.hidden) {
        timer = setInterval(() => carousel.scrollNext(), TOUR_SLIDE_INTERVAL);
      }
    };
    sync();
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [carousel, multiple, visible, paused, index]);

  if (!safeImages.length) return null;

  return (
    <div
      ref={setElement}
      className={`relative aspect-[4/3] w-full overflow-hidden bg-background touch-pan-y ${className}`}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
    >
      <div ref={viewportRef} className="h-full overflow-hidden">
      <div className="flex h-full touch-pan-y">
        {safeImages.map((src, imageIndex) => (
          <div key={`${src}-${imageIndex}`} className="h-full min-w-0 flex-[0_0_100%]">
            <TourImage src={src} alt={imageIndex === 0 ? alt : `${alt} — foto ${imageIndex + 1}`} />
          </div>
        ))}
      </div>
      </div>

      {multiple && (
        <>
          <Button variant="ghost" size="icon"
            type="button"
            aria-label="Foto anterior"
            onClick={(event) => { event.stopPropagation(); carousel?.scrollPrev(); }}
            className="absolute z-20 left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-background/65 text-foreground backdrop-blur-sm hover:bg-background/85 sm:inline-flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon"
            type="button"
            aria-label="Próxima foto"
            onClick={(event) => { event.stopPropagation(); carousel?.scrollNext(); }}
            className="absolute z-20 right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-background/65 text-foreground backdrop-blur-sm hover:bg-background/85 sm:inline-flex"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="absolute top-2 right-2 z-20 flex rounded-full bg-background/65 p-1 backdrop-blur-sm" aria-label={`Foto ${index + 1} de ${safeImages.length}`}>
            {safeImages.map((src, dotIndex) => (
              <Button variant="ghost" size="icon"
                key={`${src}-dot-${dotIndex}`}
                type="button"
                aria-label={`Ir para foto ${dotIndex + 1}`}
                aria-current={dotIndex === index ? "true" : undefined}
                onClick={(event) => { event.stopPropagation(); carousel?.scrollTo(dotIndex); }}
                className="h-6 w-6 rounded-full hover:bg-foreground/15"
              ><span className={`h-1.5 w-1.5 rounded-full ${dotIndex === index ? "bg-foreground" : "bg-foreground/45"}`} /></Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

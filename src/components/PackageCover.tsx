// Composição visual de imagens de pacote.
// Reusa as imagens dos passeios que o compõem.
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  alt: string;
  className?: string;
}

export const PackageCover = ({ images, alt, className }: Props) => {
  const imgs = images.filter(Boolean);
  if (imgs.length === 0) {
    return (
      <div className={cn("bg-night/60 flex items-center justify-center text-xs text-muted-foreground", className)}>
        Sem imagens
      </div>
    );
  }
  if (imgs.length === 1) {
    return (
      <img
        src={imgs[0]}
        alt={alt}
        loading="lazy"
        className={cn("w-full h-full object-cover", className)}
      />
    );
  }
  if (imgs.length === 2) {
    return (
      <div className={cn("grid grid-cols-2 gap-0.5", className)}>
        {imgs.map((src, i) => (
          <img key={i} src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />
        ))}
      </div>
    );
  }
  // 3 imagens: 1 grande à esquerda + 2 empilhadas
  if (imgs.length === 3) {
    return (
      <div className={cn("grid grid-cols-2 grid-rows-2 gap-0.5", className)}>
        <img src={imgs[0]} alt={alt} loading="lazy" className="row-span-2 w-full h-full object-cover" />
        <img src={imgs[1]} alt={alt} loading="lazy" className="w-full h-full object-cover" />
        <img src={imgs[2]} alt={alt} loading="lazy" className="w-full h-full object-cover" />
      </div>
    );
  }
  // 4+ : grid 2x2
  return (
    <div className={cn("grid grid-cols-2 grid-rows-2 gap-0.5", className)}>
      {imgs.slice(0, 4).map((src, i) => (
        <img key={i} src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />
      ))}
    </div>
  );
};

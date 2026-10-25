import { useState } from "react";
import { isLowResolution } from "@/lib/tourMedia";

export const TourImage = ({ src, alt }: { src: string; alt: string }) => {
  const [dimensions, setDimensions] = useState<{ src: string; width: number; height: number }>();
  const low = dimensions?.src === src && isLowResolution(dimensions.width, dimensions.height);
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-background">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        onLoad={(event) => setDimensions({ src, width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
        className={low ? "max-h-full max-w-full object-contain" : "h-full w-full object-contain"}
      />
    </div>
  );
};
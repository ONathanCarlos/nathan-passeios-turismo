import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type HalfStarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
};

export const HalfStarRating = ({ value, onChange, label, disabled = false }: HalfStarRatingProps) => (
  <div className="space-y-2">
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1;
        const fill = value >= star ? "100%" : value >= star - 0.5 ? "50%" : "0%";
        return (
          <div key={star} className="relative h-11 w-11 shrink-0 sm:h-12 sm:w-12">
            <Star aria-hidden className="absolute inset-1 h-9 w-9 text-muted-foreground/35 sm:h-10 sm:w-10" />
            <span aria-hidden className="absolute inset-1 overflow-hidden text-amber-300" style={{ width: fill }}>
              <Star className="h-9 w-9 fill-current sm:h-10 sm:w-10" />
            </span>
            {[star - 0.5, star].map((ratingValue, half) => (
              <button
                key={ratingValue}
                type="button"
                role="radio"
                aria-checked={value === ratingValue}
                aria-label={`${ratingValue.toLocaleString("pt-BR")} de 5 estrelas`}
                disabled={disabled}
                onClick={() => onChange(ratingValue)}
                className={cn("absolute inset-y-0 z-10", half === 0 ? "left-0 w-1/2" : "right-0 w-1/2")}
              />
            ))}
          </div>
        );
      })}
    </div>
    <p className="min-h-5 text-sm font-bold text-amber-200" aria-live="polite">
      {value ? `${value.toLocaleString("pt-BR")} de 5 estrelas` : "Selecione uma nota"}
    </p>
  </div>
);
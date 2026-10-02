import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { getPublicReviews, type PublicReview } from "@/lib/publicReviews";

const L: Record<Lang, { title: string }> = {
  pt: { title: "Quem já foi, conta" },
  es: { title: "Quienes ya fueron, cuentan" },
  en: { title: "What our guests say" },
  fr: { title: "Ce que disent nos clients" },
  it: { title: "Cosa dicono i nostri clienti" },
};

type Props = {
  passeioKey: string;
  lang: Lang;
  className?: string;
};

export const PublicReviewsSection = ({ passeioKey, lang, className = "" }: Props) => {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const t = L[lang];

  useEffect(() => {
    let active = true;
    setReviews([]);
    setActiveIndex(0);

    getPublicReviews(passeioKey)
      .then((items) => {
        if (active) {
          setReviews(items.filter((review) => review.passeio_key === passeioKey));
        }
      })
      .catch(() => {
        if (active) setReviews([]);
      });

    return () => {
      active = false;
    };
  }, [passeioKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reviews.length < 2 || reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % reviews.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [reviews.length, reducedMotion]);

  if (reviews.length === 0) return null;

  const review = reviews[activeIndex] || reviews[0];
  const rating = Math.max(0, Math.min(5, Number(review.nota) || 0));

  return (
    <section aria-label={t.title} className={`mt-10 ${className}`}>
      <div className="text-center mb-5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
          <span className="bg-gradient-to-r from-amber-300 via-turquoise-glow to-turquoise bg-clip-text text-transparent">
            {t.title}
          </span>
        </h2>
      </div>

      <article
        className="glass-card min-h-[190px] rounded-2xl p-5 sm:p-6 flex flex-col justify-center"
        aria-live="polite"
      >
        <div
          className={`transition-opacity duration-500 ${reducedMotion ? "duration-0" : ""}`}
          key={`${review.nome}-${activeIndex}`}
        >
          <div className="flex items-center gap-1 mb-4" aria-label={`${rating} de 5 estrelas`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                aria-hidden="true"
                className={`h-4 w-4 ${
                  index + 1 <= rating
                    ? "fill-amber-300 text-amber-300"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <p className="text-sm leading-relaxed text-foreground/85 italic">
            “{review.comentario}”
          </p>
          <p className="mt-4 text-base font-bold text-foreground">{review.nome}</p>
        </div>
      </article>

      {reviews.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4" aria-label={`${activeIndex + 1} de ${reviews.length}`}>
          {reviews.map((item, index) => (
            <span
              key={`${item.nome}-${index}`}
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? "w-6 bg-turquoise-glow" : "w-1.5 bg-foreground/30"
              } ${reducedMotion ? "duration-0" : "duration-300"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

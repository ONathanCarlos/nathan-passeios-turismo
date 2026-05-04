import { Lang } from "@/lib/i18n";
import { TourKey, getTour, sectionLabels } from "@/lib/tours";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "./ui/button";
import { ArrowLeft, Star, Clock, MapPin, Users, Languages, Check, AlertCircle } from "lucide-react";
import { dict } from "@/lib/i18n";

interface Props {
  tourKey: TourKey;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onBack: () => void;
  onBook: () => void;
}

export const TourDetails = ({ tourKey, lang, onLangChange, onBack, onBook }: Props) => {
  const tour = getTour(tourKey, lang);
  const L = sectionLabels(lang);
  const t = dict[lang];

  return (
    <div className="relative min-h-screen bg-night">
      {/* Background image (faded) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${tour.image})` }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-night/85 via-deep-blue/80 to-night" />

      <div className="relative z-10">
        {/* Top bar */}
        <header className="px-4 pt-5 pb-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-foreground hover:text-turquoise hover:bg-turquoise/10 -ml-2 backdrop-blur-sm bg-night/40 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t.back}
          </Button>
          <LanguageSwitcher lang={lang} onChange={onLangChange} />
        </header>

        {/* Hero image */}
        <section className="px-4">
          <div className="relative w-full overflow-hidden rounded-3xl border border-turquoise/25 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
            <div className="aspect-[16/11] w-full">
              <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                <span className="bg-gradient-to-r from-turquoise to-turquoise-glow bg-clip-text text-transparent">
                  {tour.title}
                </span>
              </h1>
            </div>
          </div>

          {/* Hook */}
          <p className="mt-4 text-foreground/90 text-[15px] leading-relaxed italic">
            “{tour.hook}”
          </p>

          {/* Rating box */}
          <div className="mt-4 glass-card rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{L.rating}</div>
              <div className="text-2xl font-bold text-foreground leading-tight">
                {tour.rating.toFixed(1)}<span className="text-base text-muted-foreground">/5</span>
              </div>
              <div className="text-[11px] text-muted-foreground">{tour.reviews.toLocaleString()} reviews</div>
            </div>
            <div className="flex items-center gap-0.5">
              {[0,1,2,3,4].map((i) => (
                <Star key={i} className="h-5 w-5 fill-turquoise text-turquoise drop-shadow-[0_0_6px_hsl(var(--turquoise-glow)/0.6)]" />
              ))}
            </div>
          </div>

          {/* Quick cards */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <QuickCard icon={<Clock className="h-4 w-4" />} label={L.duration} value={tour.duration} />
            <QuickCard icon={<MapPin className="h-4 w-4" />} label={L.location} value={tour.location} />
            <QuickCard icon={<Users className="h-4 w-4" />} label={L.capacity} value={tour.capacity} />
            <QuickCard icon={<Languages className="h-4 w-4" />} label={L.languages} value={tour.languages} />
          </div>

          {/* Adults-only badge */}
          {tour.adultsOnly && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/5 px-3 py-2">
              <span className="text-sm">🔞</span>
              <p className="text-xs italic text-amber-200/90">{t.adultsOnlyNotice}</p>
            </div>
          )}

          {/* Sections */}
          <div className="mt-6 space-y-4">
            {tour.sections.map((s, idx) => (
              <Section key={idx} title={s.title} items={s.items} text={s.text} />
            ))}

            {tour.childrenPolicy && (
              <Section title={L.childPolicy} items={tour.childrenPolicy} />
            )}

            {tour.notice && (
              <div className="glass-card rounded-2xl p-4 flex gap-3 items-start border-amber-400/20">
                <AlertCircle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-amber-200/80 mb-1">{L.notes}</div>
                  <p className="text-sm text-foreground/85">{tour.notice}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sticky CTA */}
          <div className="mt-8 mb-10">
            <button
              type="button"
              onClick={onBook}
              className="rgb-border w-full block"
              aria-label={L.bookNow}
            >
              <span className="flex items-center justify-center gap-2 rounded-[0.7rem] bg-gradient-to-r from-deep-blue to-night px-6 py-4 text-base font-bold text-foreground tracking-wide hover:from-night hover:to-deep-blue transition-colors">
                ✨ {L.bookNow}
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

const QuickCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="glass-card rounded-2xl p-3">
    <div className="flex items-center gap-1.5 text-turquoise mb-1">
      {icon}
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
    <div className="text-sm font-semibold text-foreground leading-snug">{value}</div>
  </div>
);

const Section = ({ title, items, text }: { title: string; items?: string[]; text?: string }) => (
  <div className="glass-card rounded-2xl p-4">
    <h3 className="text-sm uppercase tracking-wider text-turquoise font-semibold mb-3">{title}</h3>
    {text && <p className="text-sm text-foreground/90 leading-relaxed">{text}</p>}
    {items && (
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
            <Check className="h-3.5 w-3.5 text-turquoise mt-1 shrink-0" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

import type { ReactNode } from "react";
import { ArrowLeft, Check } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";

interface Props {
  title: string;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onBack: () => void;
  children: ReactNode;
  backgroundImage?: string;
  wide?: boolean;
  step?: 1 | 2 | 3;
  heading?: string;
  subheading?: string;
  showPublicHeader?: boolean;
}

const STEP_COPY: Record<Lang, { progress: string; steps: [string, string, string] }> = {
  pt: { progress: "Etapas da reserva", steps: ["Passeio", "Seus dados", "Revisão"] },
  es: { progress: "Etapas de la reserva", steps: ["Paseo", "Tus datos", "Revisión"] },
  en: { progress: "Booking steps", steps: ["Tour", "Your details", "Review"] },
  fr: { progress: "Étapes de réservation", steps: ["Excursion", "Vos données", "Vérification"] },
  it: { progress: "Fasi della prenotazione", steps: ["Tour", "I tuoi dati", "Riepilogo"] },
};

export const PageShell = ({
  title,
  lang,
  onLangChange,
  onBack,
  children,
  backgroundImage,
  wide = false,
  step,
  heading,
  subheading,
  showPublicHeader = true,
}: Props) => {
  const t = dict[lang];
  const stepCopy = STEP_COPY[lang];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06131f] text-foreground">
      {backgroundImage && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.12] blur-[2px]" style={{ backgroundImage: `url(${backgroundImage})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06131f]/80 via-[#06131f]/90 to-[#06131f]" />
        </div>
      )}
      {showPublicHeader && <PublicSiteHeader lang={lang} onLangChange={onLangChange} />}

      <main className="relative z-10 px-4 pb-10 pt-4 sm:px-6 sm:pt-6 lg:px-10">
        <div className={`mx-auto ${wide ? "max-w-7xl" : "max-w-3xl"}`}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="-ml-2 min-h-10 rounded-lg border border-white/10 bg-[#0a2030]/55 text-foreground hover:border-turquoise/35 hover:bg-turquoise/10 hover:text-turquoise"
            >
              <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
              {t.back}
            </Button>
          </div>

          {step && <StepProgress lang={lang} current={step} />}

          <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{heading || title}</h1>
              {subheading && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subheading}</p>}
            </div>
            {heading && (
              <div className="flex min-w-0 items-center gap-2 self-start rounded-xl border border-white/10 bg-[#0a2030]/75 p-2 sm:self-auto">
                {backgroundImage && <img src={backgroundImage} alt="" className="h-10 w-12 shrink-0 rounded-lg object-cover" />}
                <span className="max-w-56 truncate text-xs font-semibold text-foreground/90">{title}</span>
              </div>
            )}
          </header>

          {children}
        </div>
      </main>
    </div>
  );
};

const StepProgress = ({ lang, current }: { lang: Lang; current: 1 | 2 | 3 }) => {
  const copy = STEP_COPY[lang];
  return (
    <nav aria-label={copy.progress} className="mb-6 rounded-2xl border border-white/10 bg-[#0a2030]/65 p-3 sm:p-4">
      <ol className="flex items-center gap-2 sm:gap-3">
        {copy.steps.map((label, index) => {
          const number = index + 1;
          const complete = number < current;
          const active = number === current;
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <div aria-current={active ? "step" : undefined} className={`flex min-w-0 items-center gap-2 text-[10px] font-bold sm:text-xs ${complete ? "text-emerald-200" : active ? "text-turquoise-glow" : "text-muted-foreground"}`}>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] ${complete ? "border-emerald-300/50 bg-emerald-300/10" : active ? "border-turquoise/60 bg-turquoise/10" : "border-white/15 bg-white/5"}`}>
                  {complete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : number}
                </span>
                <span className="truncate">{label}</span>
              </div>
              {number < 3 && <span aria-hidden="true" className={`h-px min-w-2 flex-1 ${number < current ? "bg-emerald-300/40" : "bg-white/10"}`} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

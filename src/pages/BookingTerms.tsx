import { useState } from "react";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Lang } from "@/lib/i18n";
import {
  BOOKING_TERMS_OPERATOR,
  BOOKING_TERMS_PATH,
  BOOKING_TERMS_TITLE,
  BOOKING_TERMS_VERSION,
  getBookingTermsDocument,
} from "@/lib/bookingTerms";

export interface BookingTermsProps {
  lang?: Lang;
  onLangChange?: (lang: Lang) => void;
  onBack?: () => void;
}

const BookingTerms = ({ lang, onLangChange, onBack }: BookingTermsProps) => {
  const [localLang, setLocalLang] = useState<Lang>(lang ?? "pt");
  const activeLang = lang ?? localLang;
  const version = new URLSearchParams(window.location.search).get("version") || BOOKING_TERMS_VERSION;
  const document = getBookingTermsDocument(version);

  const handleLangChange = (nextLang: Lang) => {
    if (!lang) setLocalLang(nextLang);
    onLangChange?.(nextLang);
  };

  const handleBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onBack) return;
    event.preventDefault();
    onBack();
  };

  if (!document) return <main className="min-h-screen bg-[#061521] p-8 text-foreground">
    <h1 className="text-2xl font-bold">Versão dos termos indisponível</h1>
    <p className="mt-4">Não foi possível localizar esta versão. Não exibiremos outra versão em seu lugar.</p>
    <a href={BOOKING_TERMS_PATH} className="mt-5 inline-block text-turquoise underline">Consultar versão atual</a>
  </main>;
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061521] px-4 py-5 text-foreground sm:px-6 sm:py-8">
      <div aria-hidden="true" className="ocean-static-bg pointer-events-none fixed inset-0 z-0 opacity-80" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-64 bg-gradient-to-b from-turquoise/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <a
            href="/passeios"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-turquoise/35 bg-night/70 px-3 py-2 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-turquoise/75 hover:bg-turquoise/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar aos passeios
          </a>
          <LanguageSwitcher lang={activeLang} onChange={handleLangChange} />
        </header>

        <section className="mb-8 overflow-hidden rounded-3xl border border-turquoise/25 bg-[#071b2a]/90 p-5 shadow-[0_24px_70px_-30px_hsl(var(--turquoise)/0.55)] backdrop-blur-md sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-turquoise/25 bg-turquoise/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-turquoise-glow">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Documento público
              </div>
              <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-4xl">{BOOKING_TERMS_TITLE}</h1>
              <p className="mt-3 text-base font-semibold text-turquoise-glow">{BOOKING_TERMS_OPERATOR}</p>
              {activeLang !== "pt" && (
                <p className="mt-4 text-sm font-medium text-amber-100/90" role="note">
                  Texto dos termos em português.
                </p>
              )}
            </div>
            <p className="shrink-0 rounded-full border border-white/10 bg-night/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
              Versão {document.version}
            </p>
          </div>
        </section>

        <article className="rounded-3xl border border-white/10 bg-[#06131f]/95 p-5 shadow-[0_28px_80px_-36px_rgba(0,0,0,0.95)] sm:p-10">
          <div className="max-w-none text-[0.98rem] leading-8 text-foreground/90 sm:text-base">
            {document.sections.map((section) => (
              <section key={section.number} className="border-b border-white/10 py-7 first:pt-0 last:border-b-0 last:pb-2">
                <h2 className="mb-4 text-xl font-bold leading-snug text-turquoise-glow sm:text-2xl">
                  {section.number}. {section.title}
                </h2>
                <div className="space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.quote && (
                  <blockquote className="mt-5 rounded-2xl border-l-4 border-turquoise bg-turquoise/10 px-4 py-4 font-semibold italic text-foreground sm:px-6">
                    “{section.quote}”
                  </blockquote>
                )}
              </section>
            ))}

            <section className="border-t border-white/10 pt-8" aria-labelledby="booking-terms-references">
              <h2 id="booking-terms-references" className="mb-4 text-xl font-bold text-turquoise-glow sm:text-2xl">
                Referências legais
              </h2>
              <ul className="space-y-4">
                {document.references.map((reference) => (
                  <li key={reference.url} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-2 font-semibold text-turquoise underline decoration-turquoise/50 underline-offset-2 hover:text-turquoise-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
                    >
                      <span>{reference.label}</span>
                      <ExternalLink className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                    </a>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{reference.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>

        <footer className="px-2 py-8 text-center text-xs text-muted-foreground">
          <a href={BOOKING_TERMS_PATH} className="text-turquoise underline underline-offset-2 hover:text-turquoise-glow">
            {BOOKING_TERMS_PATH}
          </a>
        </footer>
      </div>
    </main>
  );
};

export default BookingTerms;
export { BookingTerms };

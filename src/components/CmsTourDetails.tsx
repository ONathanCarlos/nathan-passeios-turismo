import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Users } from "lucide-react";
import type { CmsTour } from "@/lib/cms";
import { pickLang } from "@/lib/cms";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/i18n";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { TourMediaGallery } from "@/components/TourMediaGallery";
import { PaymentPriceDisplay } from "@/components/PaymentPriceDisplay";
import { PAYMENT_PRICE_LABELS } from "@/lib/paymentPricing";
import { formatBRL } from "@/lib/prices";
import { isLunchCmsTour } from "@/lib/cmsLunchBooking";
import { CmsLunchBookingForm } from "@/components/CmsLunchBookingForm";
import { cmsTourWhatsAppUrl } from "@/lib/cmsTourWhatsApp";
import { CmsBookingTermsLink } from "@/components/CmsBookingTermsLink";

const BACK: Record<Lang, string> = { pt: "Voltar", es: "Volver", en: "Back", fr: "Retour", it: "Indietro" };
const COPY: Record<Lang, { duration: string; schedule: string; departure: string; capacity: string; additional: string; notes: string; perPerson: string }> = {
  pt: { duration: "Duração", schedule: "Horário", departure: "Local de saída", capacity: "Capacidade", additional: "Mais sobre o passeio", notes: "Observações", perPerson: "por pessoa" },
  es: { duration: "Duración", schedule: "Horario", departure: "Lugar de salida", capacity: "Capacidad", additional: "Más sobre el paseo", notes: "Observaciones", perPerson: "por persona" },
  en: { duration: "Duration", schedule: "Schedule", departure: "Departure point", capacity: "Capacity", additional: "More about the tour", notes: "Notes", perPerson: "per person" },
  fr: { duration: "Durée", schedule: "Horaire", departure: "Lieu de départ", capacity: "Capacité", additional: "En savoir plus sur l'excursion", notes: "Remarques", perPerson: "par personne" },
  it: { duration: "Durata", schedule: "Orario", departure: "Luogo di partenza", capacity: "Capacità", additional: "Scopri di più sul tour", notes: "Note", perPerson: "a persona" },
};

const EMOJI_RE = /[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}\uFE0F\u200D]/gu;
const cleanDescription = (text: string) => text
  .replace(EMOJI_RE, "")
  .replace(/[ \t]+/g, " ")
  .replace(/[ \t]*\n[ \t]*/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .replace(/[ \t]+([,.;!?])/g, "$1")
  .trim();

export function CmsTourDetails({ tour, lang, onLangChange, onBack }: {
  tour: CmsTour; lang: Lang; onLangChange: (l: Lang) => void; onBack: () => void;
}) {
  const t = dict[lang];
  const copy = COPY[lang];
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookingOpen, setBookingOpen] = useState(() => searchParams.get("reservar") === "1");
  const title = pickLang(tour, "nome", lang) || tour.nome_pt;
  const desc = cleanDescription(pickLang(tour, "descricao", lang));
  const images = [tour.imagem_url, ...tour.gallery_imagens].filter((url): url is string => !!url);
  const videos = [tour.video_url, tour.video_2_url].filter((url): url is string => !!url);
  const lunch = isLunchCmsTour(tour);
  const hasPrice = tour.preco > 0;
  const info = [
    tour.duracao && { icon: Clock, label: copy.duration, text: tour.duracao },
    tour.horario && { icon: Clock, label: copy.schedule, text: tour.horario },
    tour.local_saida && { icon: MapPin, label: copy.departure, text: tour.local_saida },
    tour.capacidade_max && { icon: Users, label: copy.capacity, text: String(tour.capacidade_max) },
  ].filter(Boolean) as { icon: typeof Clock; label: string; text: string }[];

  if (lunch && bookingOpen) {
    return (
      <CmsLunchBookingForm
        tour={tour}
        lang={lang}
        onLangChange={onLangChange}
        onBack={() => {
          setBookingOpen(false);
          if (searchParams.has("reservar")) setSearchParams({}, { replace: true });
        }}
      />
    );
  }

  const renderBookingAction = (compact = false) => {
    const content = (
      <span className={`flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-turquoise to-turquoise-glow px-4 text-center text-sm font-extrabold text-night transition-transform hover:-translate-y-0.5 hover:brightness-105 ${compact ? "w-full" : "w-full"}`}>
        {t.bookNowBtn}
      </span>
    );
    return lunch ? (
      <button type="button" onClick={() => setBookingOpen(true)} className="w-full">
        {content}
      </button>
    ) : (
      <CmsBookingTermsLink href={cmsTourWhatsAppUrl(tour)} tourKey={tour.key} lang={lang} className="block w-full">
        {content}
      </CmsBookingTermsLink>
    );
  };

  return (
    <>
      <PublicSiteHeader lang={lang} onLangChange={onLangChange} />
      <main className="relative min-h-screen overflow-hidden px-4 pb-24 pt-4 sm:px-6 lg:px-10 lg:pb-12">
        <div aria-hidden="true" className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
        <div className="relative z-10 mx-auto max-w-[1440px]">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <button type="button" onClick={onBack} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-white/10 bg-[#0a2030]/55 px-3 text-foreground transition-colors hover:border-turquoise/35 hover:text-turquoise">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />{BACK[lang]}
            </button>
            <span aria-hidden="true">/</span>
            <span>{t.ourTours}</span>
            <span aria-hidden="true">/</span>
            <span className="truncate text-foreground/80">{title}</span>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,.85fr)]">
            <div className="overflow-hidden rounded-3xl border border-turquoise/20 bg-[#081b29]/80 shadow-[0_18px_48px_rgba(0,0,0,.24)] lg:col-start-1 lg:row-start-1">
              {images.length > 0 ? (
                <TourMediaGallery images={images} alt={title} className="w-full" aspect="wide" showMobileControls />
              ) : (
                <div className="grid aspect-[16/10] place-items-center bg-[#0a2030] text-sm text-muted-foreground">{title}</div>
              )}
            </div>

            <aside className="lg:sticky lg:top-5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <section className="rounded-3xl border border-turquoise/20 bg-gradient-to-br from-[#102b3b] via-[#0b1f2d] to-[#071722] p-5 shadow-[0_22px_55px_rgba(0,0,0,.32)] sm:p-6">
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">{title}</h1>
                {desc && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{desc}</p>}

                {info.length > 0 && (
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {info.map(({ icon: Icon, label, text }, index) => (
                      <li key={`${label}-${index}`} className="min-w-0 rounded-xl border border-white/10 bg-[#0a2030]/80 p-3">
                        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><Icon className="h-4 w-4 text-turquoise-glow" aria-hidden="true" />{label}</span>
                        <span className="mt-1 block text-sm font-semibold text-foreground">{text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {hasPrice && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-[#071a27]/75 p-4">
                    <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-muted-foreground">{lang === "pt" ? "Preço por pessoa" : lang === "es" ? "Precio por persona" : lang === "fr" ? "Prix par personne" : lang === "it" ? "Prezzo per persona" : "Price per person"}</p>
                    <PaymentPriceDisplay cashPixPrice={tour.preco} lang={lang} size="md" variant="cards" />
                  </div>
                )}

                {renderBookingAction()}
              </section>
            </aside>

            <div className="space-y-4 lg:col-start-1 lg:row-start-2">
              {videos.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {videos.map((src) => (
                    <video key={src} src={src} controls playsInline preload="metadata" className="aspect-video w-full rounded-2xl border border-white/10 bg-[#071722] object-contain" />
                  ))}
                </div>
              )}
              {tour.info_adicional && (
                <section className="rounded-2xl border border-turquoise/15 bg-gradient-to-br from-[#0d2635]/85 to-[#081a27]/90 p-4">
                  <h2 className="mb-2 text-xs font-extrabold uppercase tracking-[.14em] text-turquoise-glow">{copy.additional}</h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">{cleanDescription(tour.info_adicional)}</p>
                </section>
              )}
              {tour.observacoes && (
                <section className="rounded-2xl border border-amber-300/25 bg-amber-400/5 p-4">
                  <h2 className="mb-2 text-xs font-extrabold uppercase tracking-[.14em] text-amber-100">{copy.notes}</h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">{cleanDescription(tour.observacoes)}</p>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#061521]/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-12px_30px_rgba(0,0,0,.22)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0">
            {hasPrice ? (
              <>
                <p className="truncate text-sm font-extrabold text-turquoise-glow">{formatBRL(tour.preco)}</p>
                <p className="truncate text-[10px] text-muted-foreground">{PAYMENT_PRICE_LABELS[lang].cashPix} · {copy.perPerson}</p>
              </>
            ) : <span className="text-xs text-muted-foreground">{title}</span>}
          </div>
          <div className="w-[min(52%,13rem)]">{renderBookingAction(true)}</div>
        </div>
      </div>
    </>
  );
}

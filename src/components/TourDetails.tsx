import { useEffect, useState, type ReactNode } from "react";
import { AlertCircle, ArrowLeft, Check, Clock, ExternalLink, MapPin, Users } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/i18n";
import { TourKey, getTour, sectionLabels } from "@/lib/tours";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { Button } from "./ui/button";
import { TOUR_PRICES, tourPriceStatusText, formatBRL, COUPON_ELIGIBLE } from "@/lib/prices";
import { PaymentPriceDisplay } from "@/components/PaymentPriceDisplay";
import { calculateCardPrice, PAYMENT_PRICE_LABELS } from "@/lib/paymentPricing";
import { loadQrPromoForTour, subscribeQrPromo } from "@/lib/qrPromo";
import { forceRefreshCms, getCmsTourPriceStatus, subscribeCmsCache } from "@/lib/cmsCache";
import {
  CRUISE_CALENDAR_PATH,
  CRUISE_FEE_DETAIL_NOTICE,
  getCruiseEmbarkationFeePerPerson,
} from "@/lib/cruiseEmbarkation";
import { TourMediaGallery } from "./TourMediaGallery";
import { TOUR_VIDEO_LIMIT } from "@/lib/tourMedia";

interface Props {
  tourKey: TourKey;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onBack: () => void;
  onBook: () => void;
  embedded?: boolean;
}

const DETAIL_COPY: Record<Lang, {
  pricePerPerson: string;
  couponApplicable: string;
  promotionApplied: string;
  perPerson: string;
  calendar: string;
  bookingNote: string;
}> = {
  pt: {
    pricePerPerson: "Preço por pessoa",
    couponApplicable: "Cupom de desconto aplicável",
    promotionApplied: "Promoção aplicada",
    perPerson: "por pessoa",
    calendar: "Confira o calendário oficial de escalas",
    bookingNote: "O valor e as taxas aplicáveis serão discriminados no resumo da reserva.",
  },
  es: {
    pricePerPerson: "Precio por persona",
    couponApplicable: "Cupón de descuento aplicable",
    promotionApplied: "Promoción aplicada",
    perPerson: "por persona",
    calendar: "Consulta el calendario oficial de escalas",
    bookingNote: "El precio y las tasas aplicables se detallarán en el resumen de la reserva.",
  },
  en: {
    pricePerPerson: "Price per person",
    couponApplicable: "Discount coupon available",
    promotionApplied: "Promotion applied",
    perPerson: "per person",
    calendar: "View the official cruise-call calendar",
    bookingNote: "The price and any applicable fees will be itemized in your booking summary.",
  },
  fr: {
    pricePerPerson: "Prix par personne",
    couponApplicable: "Coupon de réduction disponible",
    promotionApplied: "Promotion appliquée",
    perPerson: "par personne",
    calendar: "Consulter le calendrier officiel des escales",
    bookingNote: "Le prix et les éventuels frais seront détaillés dans le récapitulatif de réservation.",
  },
  it: {
    pricePerPerson: "Prezzo per persona",
    couponApplicable: "Coupon sconto disponibile",
    promotionApplied: "Promozione applicata",
    perPerson: "a persona",
    calendar: "Consulta il calendario ufficiale degli scali",
    bookingNote: "Il prezzo e gli eventuali costi saranno dettagliati nel riepilogo della prenotazione.",
  },
};

export const TourDetails = ({ tourKey, lang, onLangChange, onBack, onBook, embedded = false }: Props) => {
  const EMOJI_RE = /[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}\uFE0F\u200D]/gu;
  const cleanDescription = (text: string) => text.replace(EMOJI_RE, "").replace(/\s+/g, " ").replace(/\s+([,.;!?])/g, "$1").trim();
  const [qr, setQr] = useState(() => loadQrPromoForTour(tourKey));
  const [, setCmsPriceVersion] = useState(0);
  useEffect(() => subscribeQrPromo(() => setQr(loadQrPromoForTour(tourKey))), [tourKey]);
  useEffect(() => subscribeCmsCache(() => setCmsPriceVersion((version) => version + 1)), []);

  const priceStatus = getCmsTourPriceStatus(tourKey);
  const priceReady = priceStatus === "ready";
  const tour = getTour(tourKey, lang);
  const priceMeta = TOUR_PRICES[tourKey];
  const cashPixPrice = qr ? priceMeta.value - (priceMeta.value * qr.percent) / 100 : priceMeta.value;
  const L = sectionLabels(lang);
  const t = dict[lang];
  const copy = DETAIL_COPY[lang];
  const hasCruiseFee = tourKey === "escuna" || tourKey === "catamara";
  const cruiseFeePerPerson = getCruiseEmbarkationFeePerPerson(tourKey);

  return (
    <div className={embedded ? "relative" : "relative min-h-screen"}>
      {!embedded && <PublicSiteHeader lang={lang} onLangChange={onLangChange} />}
      {!embedded && <div aria-hidden="true" className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />}

      <main className={`relative z-10 ${embedded ? "" : "pb-28 lg:pb-10"}`}>
        <div className={embedded ? "mx-auto" : "mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-10"}>
          {!embedded && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="-ml-2 rounded-lg text-foreground hover:bg-turquoise/10 hover:text-turquoise"
              >
                <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                {t.back}
              </Button>
              <span aria-hidden="true">/</span>
              <span>{t.ourTours}</span>
              <span aria-hidden="true">/</span>
              <span className="truncate text-foreground/80">{tour.title}</span>
            </div>
          )}

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,.85fr)]">
            <div className="overflow-hidden rounded-3xl border border-turquoise/20 bg-[#081b29]/80 shadow-[0_18px_48px_rgba(0,0,0,.24)] lg:col-start-1 lg:row-start-1">
              <TourMediaGallery
                images={tour.images || [tour.image]}
                alt={tour.title}
                className="w-full"
                aspect="wide"
                showMobileControls
              />
            </div>

            <aside className="space-y-4 lg:sticky lg:top-5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <section className="rounded-3xl border border-turquoise/20 bg-gradient-to-br from-[#102b3b] via-[#0b1f2d] to-[#071722] p-5 shadow-[0_22px_55px_rgba(0,0,0,.32)] sm:p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {COUPON_ELIGIBLE.has(tourKey) && (
                    <span className="inline-flex items-center rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-amber-100">
                      {copy.couponApplicable}
                    </span>
                  )}
                  {qr && (
                    <span className="inline-flex items-center rounded-full border border-emerald-300/35 bg-emerald-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-emerald-100">
                      {copy.promotionApplied}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">{tour.title}</h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{cleanDescription(tour.hook)}</p>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <QuickCard icon={<Clock className="h-4 w-4" />} label={L.duration} value={tour.duration} />
                  <QuickCard icon={<MapPin className="h-4 w-4" />} label={L.location} value={tour.location} />
                  <QuickCard icon={<Users className="h-4 w-4" />} label={L.capacity} value={tour.capacity} />
                </div>

                {tourKey === "escuna" && (
                  <div className="mt-3 grid grid-cols-2 gap-2" aria-label={lang === "pt" ? "Destaques do roteiro" : lang === "es" ? "Destacados del itinerario" : lang === "fr" ? "Points forts de l'itinéraire" : lang === "it" ? "Punti salienti dell'itinerario" : "Itinerary highlights"}>
                    <RouteStat value="11" label={L.beaches} />
                    <RouteStat value="3" label={L.islands} />
                  </div>
                )}

                <div className="mt-5 rounded-2xl border border-white/10 bg-[#071a27]/75 p-4">
                  <div className="mb-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-muted-foreground">{copy.pricePerPerson}</div>
                  {priceReady ? (
                    <>
                      {qr && (
                        <p className="mb-2 text-right text-xs text-muted-foreground line-through">
                          {priceMeta.from ? `${PAYMENT_PRICE_LABELS[lang].from} ${formatBRL(priceMeta.value)}` : formatBRL(priceMeta.value)}
                        </p>
                      )}
                      <PaymentPriceDisplay
                        cashPixPrice={cashPixPrice}
                        from={priceMeta.from}
                        lang={lang}
                        size="md"
                        variant="cards"
                      />
                      {priceMeta.note && <p className="mt-3 text-xs leading-relaxed text-amber-100/80">{priceMeta.note[lang]}</p>}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p role="status" className="text-sm text-muted-foreground">{tourPriceStatusText(priceStatus, lang)}</p>
                      {priceStatus === "error" && (
                        <Button variant="ghost" size="sm" onClick={() => void forceRefreshCms.tours()}>
                          {lang === "pt" ? "Tentar novamente" : lang === "es" ? "Intentar de nuevo" : lang === "fr" ? "Réessayer" : lang === "it" ? "Riprova" : "Try again"}
                        </Button>
                      )}
                    </div>
                  )}

                  {priceReady && hasCruiseFee && (
                    <div className="mt-4 rounded-xl border border-amber-300/35 bg-amber-400/10 p-3">
                      <p role="note" className="text-xs leading-relaxed text-amber-100">
                        {CRUISE_FEE_DETAIL_NOTICE[lang](cruiseFeePerPerson)}
                      </p>
                      <a href={CRUISE_CALENDAR_PATH} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-turquoise underline underline-offset-2 hover:text-turquoise-glow">
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        {copy.calendar}
                      </a>
                    </div>
                  )}
                </div>

                {tour.adultsOnly && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
                    <p className="text-xs leading-relaxed text-amber-100">{t.adultsOnlyNotice}</p>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={onBook}
                  disabled={!priceReady}
                  className="mt-5 min-h-12 w-full rounded-xl bg-gradient-to-r from-turquoise to-turquoise-glow text-sm font-extrabold text-night shadow-[0_8px_24px_rgba(72,222,212,.16)] transition-transform hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={L.bookNow}
                >
                  {L.bookNow}
                </Button>
                <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">{copy.bookingNote}</p>
              </section>
            </aside>

            <div className="space-y-4 lg:col-start-1 lg:row-start-2">
              {!!tour.videos?.length && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {tour.videos.slice(0, TOUR_VIDEO_LIMIT).map((video) => (
                    <video key={video} src={video} controls playsInline preload="metadata" className="aspect-video w-full rounded-2xl border border-white/10 bg-[#071722] object-contain" />
                  ))}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {tour.sections.map((section, index) => (
                  <Section key={`${section.title}-${index}`} title={cleanDescription(section.title)} items={section.items?.map(cleanDescription)} text={section.text ? cleanDescription(section.text) : undefined} />
                ))}
                {tour.childrenPolicy && <Section title={L.childPolicy} items={tour.childrenPolicy} />}
                {tour.notice && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-300/25 bg-amber-400/5 p-4 sm:col-span-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-[.14em] text-amber-100">{L.notes}</div>
                      <p className="text-sm leading-relaxed text-foreground/85">{cleanDescription(tour.notice)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {!embedded && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#061521]/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-12px_30px_rgba(0,0,0,.22)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div className="min-w-0">
              {priceReady ? (
                <>
                  <p className="truncate text-sm font-extrabold text-turquoise-glow">{formatBRL(cashPixPrice)}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{PAYMENT_PRICE_LABELS[lang].cashPix} · {copy.perPerson}</p>
                </>
              ) : <p className="max-w-40 text-xs text-muted-foreground">{tourPriceStatusText(priceStatus, lang)}</p>}
            </div>
            <Button type="button" onClick={onBook} disabled={!priceReady} className="min-h-11 shrink-0 rounded-xl bg-gradient-to-r from-turquoise to-turquoise-glow px-5 font-bold text-night disabled:opacity-50">
              {L.bookNow}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="min-w-0 rounded-xl border border-white/10 bg-[#0a2030]/80 p-2.5">
    <div className="mb-1 flex items-center gap-1.5 text-turquoise-glow">
      {icon}
      <span className="truncate text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
    <div className="text-xs font-semibold leading-snug text-foreground">{value}</div>
  </div>
);

const RouteStat = ({ value, label }: { value: string; label: string }) => (
  <div className="flex items-baseline gap-2 rounded-xl border border-turquoise/15 bg-turquoise/5 px-3 py-2.5">
    <span className="text-xl font-extrabold tracking-tight text-turquoise-glow">{value}</span>
    <span className="text-xs font-semibold text-foreground/80">{label}</span>
  </div>
);

const Section = ({ title, items, text }: { title: string; items?: string[]; text?: string }) => (
  <section className="rounded-2xl border border-turquoise/15 bg-gradient-to-br from-[#0d2635]/85 to-[#081a27]/90 p-4 shadow-[0_12px_32px_rgba(0,0,0,.14)]">
    <h2 className="mb-3 text-xs font-extrabold uppercase tracking-[.14em] text-turquoise-glow">{title}</h2>
    {text && <p className="text-sm leading-relaxed text-foreground/85">{text}</p>}
    {items && (
      <ul className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm leading-relaxed text-foreground/85">
            <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-turquoise" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )}
  </section>
);

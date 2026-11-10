// ============================================================
// Detalhe de um pacote — herda dados dos passeios que o compõem.
// Reutiliza TourDetails para cada passeio componente.
// "Reservar" abre StandardForm sem tourKey (cupons desabilitados),
// destino = nome do pacote, preço fixo do pacote.
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Lang, dict, loadLang, saveLang } from "@/lib/i18n";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { TourDetails } from "@/components/TourDetails";
import { StandardForm } from "@/components/StandardForm";
import { PackageCover } from "@/components/PackageCover";
import { SavingsBox, PriceWithDiscount } from "@/components/SavingsBox";
import { TourBadge, UrgencyTag } from "@/components/TourBadge";
import { usePacote, pickPacoteLang } from "@/lib/pacotes";
import { useTours, pickLang } from "@/lib/cms";
import { TOUR_PRICES } from "@/lib/prices";
import { getCmsTourPriceStatus, subscribeCmsCache } from "@/lib/cmsCache";
import { ArrowLeft, ArrowRight, CalendarCheck, Sparkles } from "lucide-react";
import { getTour, type TourKey } from "@/lib/tours";
import { runNavigationTransition } from "@/lib/viewTransition";

import escunaImg from "@/assets/escuna.jpg";
import buggyImg from "@/assets/buggy.jpg";
import arraialImg from "@/assets/arraial-do-cabo.jpg";
import mergulhoImg from "@/assets/mergulho.jpg";
import catamaraImg from "@/assets/catamara.jpg";
import caboFrioImg from "@/assets/cabo-frio.jpg";
import lanchaImg from "@/assets/lancha.jpg";
import jardineiraImg from "@/assets/jardineira.jpg";
import almocoImg from "@/assets/almoco.jpg";

const FALLBACK: Record<string, string> = {
  escuna: escunaImg, buggy: buggyImg, arraial: arraialImg, mergulho: mergulhoImg,
  catamara: catamaraImg, cabofrio: caboFrioImg, lancha: lanchaImg, jardineira: jardineiraImg,
  almoco: almocoImg,
};

const L = {
  book: { pt: "Reservar agora", es: "Reservar ahora", en: "Book now", fr: "Réserver maintenant", it: "Prenota ora" },
  back: { pt: "Voltar aos pacotes", es: "Volver a los paquetes", en: "Back to packages", fr: "Retour aux forfaits", it: "Torna ai pacchetti" },
  combo: { pt: "Combo promocional · cupons não se aplicam", es: "Combo promocional · cupones no aplicables", en: "Promo combo · coupons not applicable", fr: "Combo promo · coupons non applicables", it: "Combo promo · coupon non applicabili" },
  includes: { pt: "Este pacote inclui", es: "Este paquete incluye", en: "This package includes", fr: "Ce forfait comprend", it: "Questo pacchetto include" },
};

const EMOJI_RE = /[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}\uFE0F\u200D]/gu;
const cleanDisplayText = (text: string) => text
  .replace(EMOJI_RE, "")
  .replace(/\s+/g, " ")
  .replace(/\s+([,.;!?])/g, "$1")
  .trim();

const TOUR_KEYS: TourKey[] = ["escuna", "arraial", "buggy", "cabofrio", "jardineira", "catamara", "mergulho", "lancha"];
const isRealTour = (k: string): k is TourKey => (TOUR_KEYS as string[]).includes(k);
const PSEUDO_PRICES: Record<string, number> = { almoco: 50 };
const PSEUDO_LABELS: Record<string, Record<Lang, string>> = {
  almoco: { pt: "Almoço", es: "Almuerzo", en: "Lunch", fr: "Déjeuner", it: "Pranzo" },
};

const PacoteDetalhes = () => {
  const { key } = useParams<{ key: string }>();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const wantsBook = params.get("reservar") === "1";
  const [lang, setLangState] = useState<Lang>(() => loadLang());
  const [, setCmsPriceVersion] = useState(0);
  const setLang = (l: Lang) => { saveLang(l); setLangState(l); };
  const t = dict[lang];

  const { data: pacote, isLoading } = usePacote(key);
  const { data: tours } = useTours(false);
  const [bookingOpen, setBookingOpen] = useState(wantsBook);
  useEffect(() => subscribeCmsCache(() => setCmsPriceVersion((version) => version + 1)), []);

  useEffect(() => {
    if (pacote) document.title = `${pacote.nome_pt} · Ônix Turismo Búzios`;
  }, [pacote]);

  const imgOf = (k: string) =>
    tours?.find((x) => x.key === k)?.imagem_url || FALLBACK[k] || "";

  const labelOf = (k: string): string => {
    const cms = tours?.find((x) => x.key === k);
    if (cms) return pickLang(cms, "nome", lang) || cms.nome_pt;
    return PSEUDO_LABELS[k]?.[lang] || k;
  };

  const savingsItems = (() => {
    if (!pacote) return [];
    if (pacote.tour_keys.some((k) => isRealTour(k) && getCmsTourPriceStatus(k) !== "ready")) return [];
    return pacote.tour_keys.map((k) => {
      const real = TOUR_PRICES[k as TourKey]?.value;
      const price = typeof real === "number" ? real : (PSEUDO_PRICES[k] || 0);
      return { label: cleanDisplayText(labelOf(k)), price };
    }).filter((x) => x.price > 0);
  })();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div aria-hidden="true" className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
        <p className="relative z-10 text-foreground/70">…</p>
      </main>
    );
  }

  if (!pacote) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div aria-hidden="true" className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
        <div className="relative z-10 text-center">
          <p className="mb-4 text-foreground/70">Pacote não encontrado.</p>
          <button onClick={() => runNavigationTransition(() => nav("/pacotes"))} className="text-turquoise-glow underline">Ver pacotes</button>
        </div>
      </main>
    );
  }

  const nome = cleanDisplayText(pickPacoteLang(pacote, "nome", lang) || pacote.nome_pt);
  const desc = cleanDisplayText(pickPacoteLang(pacote, "descricao", lang));
  const imgs = pacote.imagem_url ? [pacote.imagem_url] : pacote.tour_keys.map(imgOf).filter(Boolean);
  const totalAvulso = savingsItems.reduce((a, b) => a + b.price, 0);
  const originalPrice = pacote.preco_original ?? totalAvulso;
  const packageTourNames = Array.from(new Set(pacote.tour_keys)).map((tourKey) => {
    const cms = tours?.find((tour) => tour.key === tourKey);
    if (cms?.nome_pt) return cleanDisplayText(cms.nome_pt);
    if (isRealTour(tourKey)) return cleanDisplayText(getTour(tourKey, "pt").title);
    return cleanDisplayText(PSEUDO_LABELS[tourKey]?.pt || tourKey);
  });

  if (bookingOpen) {
    return (
      <StandardForm
        lang={lang}
        onLangChange={setLang}
        onBack={() => runNavigationTransition(() => setBookingOpen(false))}
        title={nome}
        titlePt={pacote.nome_pt}
        backgroundImage={imgs[0] || escunaImg}
        packagePrice={pacote.preco}
        packageTourNames={packageTourNames}
        packageTourKeys={pacote.tour_keys}
        packageKey={pacote.key}
        bookingDraftId={key}
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden pb-16">
      <div aria-hidden="true" className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-10">
        <PublicSiteHeader lang={lang} onLangChange={setLang} />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-5 sm:pt-7">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => runNavigationTransition(() => nav("/pacotes"))}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-turquoise-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {L.back[lang]}
          </button>
        </div>

        <section className="overflow-hidden rounded-3xl border border-turquoise/20 bg-gradient-to-br from-[#10283b]/95 via-night to-[#0b1c30] shadow-[0_22px_56px_rgba(0,0,0,0.3)]">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative aspect-[16/10] min-h-0 overflow-hidden bg-night lg:aspect-auto lg:min-h-[28rem]">
              <PackageCover images={imgs} alt={nome} className="absolute inset-0 h-full w-full" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/80 via-night/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-night/10 lg:to-night/50" />
              {pacote.badge && (
                <div className="absolute right-4 top-4">
                  <TourBadge type={pacote.badge} lang={lang} />
                </div>
              )}
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-night/85 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-turquoise-glow shadow-lg backdrop-blur-sm sm:bottom-5 sm:left-5">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Combo
              </span>
            </div>

            <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-8">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-turquoise/25 bg-turquoise/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-turquoise-glow">
                <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" /> {L.combo[lang]}
              </span>
              <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">{nome}</h1>
              {desc && <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{desc}</p>}
              <UrgencyTag text={pacote.urgencia} className="mt-4" />
              <div className="mt-5 border-t border-white/10 pt-5">
                <PriceWithDiscount
                  price={pacote.preco}
                  originalPrice={originalPrice > pacote.preco ? originalPrice : null}
                  lang={lang}
                  size="lg"
                />
              </div>
              <button
                type="button"
                onClick={() => runNavigationTransition(() => setBookingOpen(true))}
                className="rgb-border mt-5 block w-full"
              >
                <span className="flex min-h-12 items-center justify-center gap-2 rounded-[0.7rem] bg-gradient-to-r from-turquoise to-[#24b7b5] px-6 py-3 text-sm font-bold text-night transition-all hover:brightness-110 sm:text-base">
                  {L.book[lang]} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
            </div>
          </div>
        </section>

        {savingsItems.length > 0 && (
          <div className="mt-6">
            <SavingsBox items={savingsItems} packagePrice={pacote.preco} lang={lang} />
          </div>
        )}

        <section aria-labelledby="package-includes-heading" className="mt-9 sm:mt-11">
          <div className="mb-4 flex items-end justify-between gap-4 border-b border-turquoise/15 pb-3">
            <h2 id="package-includes-heading" className="text-base font-extrabold text-foreground sm:text-lg">
              {L.includes[lang]}
            </h2>
            <span className="text-xs text-muted-foreground">{pacote.tour_keys.length}</span>
          </div>

          <div className="space-y-5 sm:space-y-7">
            {pacote.tour_keys.map((tk, i) => {
              if (isRealTour(tk)) {
                return (
                  <div key={`${tk}-${i}`} className="overflow-hidden rounded-2xl border border-turquoise/15 bg-gradient-to-b from-[#10283b]/85 to-night shadow-[0_16px_38px_rgba(0,0,0,0.2)]">
                    <TourDetails
                      tourKey={tk}
                      lang={lang}
                      onLangChange={setLang}
                      onBack={() => {}}
                      onBook={() => runNavigationTransition(() => setBookingOpen(true))}
                      embedded
                    />
                  </div>
                );
              }
              // pseudo-tours (ex.: almoco)
              const img = imgOf(tk);
              const cms = tours?.find((x) => x.key === tk);
              const label = cleanDisplayText(cms?.nome_pt || PSEUDO_LABELS[tk]?.pt || tk);
              const description = cleanDisplayText(cms?.descricao_pt || "");
              return (
                <article key={`${tk}-${i}`} className="overflow-hidden rounded-2xl border border-turquoise/15 bg-gradient-to-b from-[#10283b]/85 to-night shadow-[0_16px_38px_rgba(0,0,0,0.2)]">
                  {img && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-night sm:aspect-[2/1]">
                      <img src={img} alt={label} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]" />
                    </div>
                  )}
                  <div className="p-5 sm:p-6">
                    <h3 className="text-lg font-bold text-foreground">{label}</h3>
                    {description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="mt-8 sm:mt-10">
          <button
            type="button"
            onClick={() => runNavigationTransition(() => setBookingOpen(true))}
            className="rgb-border block w-full"
          >
            <span className="flex min-h-12 items-center justify-center gap-2 rounded-[0.7rem] bg-gradient-to-r from-turquoise to-[#24b7b5] px-6 py-3 text-sm font-bold text-night transition-all hover:brightness-110 sm:text-base">
              {L.book[lang]} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        </div>

        <footer className="mt-14 text-center text-xs text-muted-foreground/70">
          © {t.brand} · {t.footerRegion}
        </footer>
      </div>
    </main>
  );
};

export default PacoteDetalhes;

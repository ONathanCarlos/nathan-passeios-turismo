// ============================================================
// Listagem de pacotes promocionais.
// As imagens reaproveitam as dos passeios componentes.
// Cupons NÃO se aplicam aqui.
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lang, dict, loadLang, saveLang } from "@/lib/i18n";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { usePacotes, pickPacoteLang } from "@/lib/pacotes";
import { useTours } from "@/lib/cms";
import { TOUR_PRICES } from "@/lib/prices";
import { getCmsTourPriceStatus, subscribeCmsCache } from "@/lib/cmsCache";
import { PackageCover } from "@/components/PackageCover";
import { PriceWithDiscount } from "@/components/SavingsBox";
import { TourBadge, UrgencyTag } from "@/components/TourBadge";
import { ArrowRight, Sparkles } from "lucide-react";
import type { TourKey } from "@/lib/tours";
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

const SLOGAN: Record<Lang, string> = {
  pt: "Mais experiências por menos: aproveite os melhores combos de Búzios com preços especiais.",
  es: "Más experiencias por menos: aprovecha los mejores combos de Búzios con precios especiales.",
  en: "More experiences for less: enjoy the best Búzios combos at special prices.",
  fr: "Plus d'expériences pour moins : profitez des meilleurs combos de Búzios.",
  it: "Più esperienze a meno: approfitta dei migliori combo di Búzios.",
};

const L = {
  details: { pt: "Ver detalhes", es: "Ver detalles", en: "View details", fr: "Voir les détails", it: "Vedi dettagli" },
  book:    { pt: "Reservar agora", es: "Reservar ahora", en: "Book now", fr: "Réserver maintenant", it: "Prenota ora" },
  combo:   { pt: "Combo promocional", es: "Combo promocional", en: "Promotional combo", fr: "Combo promotionnel", it: "Combo promozionale" },
  back:    { pt: "Voltar", es: "Volver", en: "Back", fr: "Retour", it: "Indietro" },
};

const EMOJI_RE = /[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}\uFE0F\u200D]/gu;
const cleanDisplayText = (text: string) => text
  .replace(EMOJI_RE, "")
  .replace(/\s+/g, " ")
  .replace(/\s+([,.;!?])/g, "$1")
  .trim();

// Inclui pseudo-tour "almoco" como item agregável (R$50 padrão).
const PSEUDO_PRICES: Record<string, number> = { almoco: 50 };
const TOUR_KEYS: TourKey[] = ["escuna", "arraial", "buggy", "cabofrio", "jardineira", "catamara", "mergulho", "lancha"];
const isRealTour = (key: string): key is TourKey => (TOUR_KEYS as string[]).includes(key);

const Pacotes = () => {
  const nav = useNavigate();
  const [lang, setLangState] = useState<Lang>(() => loadLang());
  const [, setCmsPriceVersion] = useState(0);
  const setLang = (l: Lang) => { saveLang(l); setLangState(l); };
  const t = dict[lang];
  const { data: pacotes } = usePacotes(true);
  const { data: tours } = useTours(false);

  useEffect(() => { document.title = "Pacotes promocionais · Ônix Turismo Búzios"; }, []);
  useEffect(() => subscribeCmsCache(() => setCmsPriceVersion((version) => version + 1)), []);

  const imgOf = (key: string) =>
    tours?.find((x) => x.key === key)?.imagem_url || FALLBACK[key] || "";

  // Soma estimada se preco_original não vier do banco
  const estimateOriginal = (tour_keys: string[]): number | null => {
    if (tour_keys.some((key) => isRealTour(key) && getCmsTourPriceStatus(key) !== "ready")) return null;
    return tour_keys.reduce((sum, key) => {
      const real = isRealTour(key) ? TOUR_PRICES[key].value : null;
      return sum + (typeof real === "number" ? real : (PSEUDO_PRICES[key] || 0));
    }, 0);
  };

  return (
    <main className="relative min-h-screen overflow-hidden pb-16">
      <div aria-hidden="true" className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-10">
        <PublicSiteHeader lang={lang} onLangChange={setLang} />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-6 sm:pt-8">
        <header className="mb-7 flex flex-col gap-4 rounded-2xl border border-turquoise/15 bg-gradient-to-r from-night/90 via-[#0d2639]/85 to-night/75 p-5 shadow-[0_18px_42px_rgba(0,0,0,0.18)] sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-turquoise/25 bg-turquoise/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-turquoise-glow sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {L.combo[lang]}
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
              Pacotes <span className="text-turquoise-glow">de Búzios</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {SLOGAN[lang]}
            </p>
          </div>
        </header>

        <section aria-label={L.combo[lang]} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {(pacotes || []).map((p, index) => {
            const nome = cleanDisplayText(pickPacoteLang(p, "nome", lang) || p.nome_pt);
            const desc = cleanDisplayText(pickPacoteLang(p, "descricao", lang));
            const imgs = p.imagem_url ? [p.imagem_url] : p.tour_keys.map(imgOf).filter(Boolean);
            const originalPrice = p.preco_original ?? estimateOriginal(p.tour_keys);
            return (
              <article
                key={p.id}
                style={{ animationDelay: `${index * 60}ms` }}
                className="group glass-card flex flex-col overflow-hidden rounded-2xl border border-turquoise/15 bg-gradient-to-b from-[#10283b]/90 to-night shadow-[0_18px_42px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-turquoise/45 hover:shadow-[0_24px_50px_rgba(0,0,0,0.28)] animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-night sm:aspect-[4/3]">
                  <PackageCover images={imgs} alt={nome} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/75 via-night/5 to-transparent" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-night/85 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-turquoise-glow shadow-lg backdrop-blur-sm sm:text-[10px]">
                    <Sparkles className="h-3 w-3" aria-hidden="true" /> {L.combo[lang]}
                  </span>
                  {p.badge && (
                    <div className="absolute right-3 top-3">
                      <TourBadge type={p.badge} lang={lang} />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h2 className="text-lg font-bold leading-tight text-foreground sm:text-xl">{nome}</h2>
                  {desc && <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>}
                  <div className="mt-4">
                    <PriceWithDiscount
                      price={p.preco}
                      originalPrice={originalPrice > p.preco ? originalPrice : null}
                      lang={lang}
                      size="md"
                    />
                  </div>
                  <UrgencyTag text={p.urgencia} className="mt-3" />
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => runNavigationTransition(() => nav(`/pacotes/${p.key}`))}
                      className="min-h-11 w-full rounded-xl border border-turquoise/35 bg-night/55 px-2 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-turquoise/70 hover:bg-turquoise/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise sm:text-sm"
                    >
                      {L.details[lang]}
                    </button>
                    <button
                      type="button"
                      onClick={() => runNavigationTransition(() => nav(`/pacotes/${p.key}?reservar=1`))}
                      className="rgb-border block w-full"
                    >
                      <span className="flex min-h-11 items-center justify-center gap-1 rounded-[0.65rem] bg-gradient-to-r from-turquoise to-[#24b7b5] px-2 py-2.5 text-xs font-bold text-night transition-all hover:brightness-110 sm:text-sm">
                        {L.book[lang]} <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <footer className="mt-14 text-center text-xs text-muted-foreground/70">
          © {t.brand} · {t.footerRegion}
        </footer>
      </div>
    </main>
  );
};

export default Pacotes;

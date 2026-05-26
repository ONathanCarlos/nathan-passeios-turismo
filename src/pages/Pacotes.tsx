// ============================================================
// Listagem de pacotes promocionais.
// As imagens reaproveitam as dos passeios componentes.
// Cupons NÃO se aplicam aqui.
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lang, dict, loadLang, saveLang } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { AdminFab } from "@/components/AdminPanel";
import { isAdminMode } from "@/lib/promo";
import { usePacotes, pickPacoteLang } from "@/lib/pacotes";
import { useTours } from "@/lib/cms";
import { TOUR_PRICES } from "@/lib/prices";
import { PackageCover } from "@/components/PackageCover";
import { PriceWithDiscount } from "@/components/SavingsBox";
import { TourBadge, UrgencyTag } from "@/components/TourBadge";
import { DepoimentosSection } from "@/components/DepoimentosSection";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { TourKey } from "@/lib/tours";

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

// Inclui pseudo-tour "almoco" como item agregável (R$50 padrão).
const PSEUDO_PRICES: Record<string, number> = { almoco: 50 };

const Pacotes = () => {
  const nav = useNavigate();
  const [lang, setLangState] = useState<Lang>(() => loadLang());
  const setLang = (l: Lang) => { saveLang(l); setLangState(l); };
  const t = dict[lang];
  const { data: pacotes } = usePacotes(true);
  const { data: tours } = useTours(false);

  useEffect(() => { document.title = "Pacotes promocionais · Nathan Turismo"; }, []);

  const imgOf = (key: string) =>
    tours?.find((x) => x.key === key)?.imagem_url || FALLBACK[key] || "";

  // Soma estimada se preco_original não vier do banco
  const estimateOriginal = (tour_keys: string[]) =>
    tour_keys.reduce((sum, k) => {
      const real = TOUR_PRICES[k as TourKey]?.value;
      if (typeof real === "number") return sum + real;
      return sum + (PSEUDO_PRICES[k] || 0);
    }, 0);

  return (
    <main className="relative min-h-screen px-4 pt-10 pb-16 overflow-hidden">
      <div aria-hidden className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Topbar */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => nav("/")}
            className="inline-flex items-center gap-1 text-sm text-foreground/80 hover:text-turquoise-glow transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {L.back[lang]}
          </button>
          <LanguageSwitcher lang={lang} onChange={setLang} />
        </div>

        {/* Hero */}
        <header className="text-center mb-8 animate-in fade-in slide-in-from-top-3 duration-700">
          <div className="inline-flex items-center gap-2 text-amber-300 text-xs uppercase tracking-wider font-bold mb-2">
            <Sparkles className="w-4 h-4" /> {L.combo[lang]}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">
            <span className="bg-gradient-to-r from-amber-300 via-turquoise-glow to-turquoise bg-clip-text text-transparent drop-shadow-[0_3px_12px_rgba(0,0,0,0.85)]">
              Pacotes de Búzios
            </span>
          </h1>
          <p className="text-foreground/85 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            ✦ {SLOGAN[lang]}
          </p>
        </header>

        {/* Lista */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {(pacotes || []).map((p) => {
            const nome = pickPacoteLang(p, "nome", lang) || p.nome_pt;
            const desc = pickPacoteLang(p, "descricao", lang);
            const imgs = p.imagem_url ? [p.imagem_url] : p.tour_keys.map(imgOf).filter(Boolean);
            const originalPrice = p.preco_original ?? estimateOriginal(p.tour_keys);
            return (
              <article key={p.id} className="group glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-turquoise/60 hover:-translate-y-1 hover:turquoise-glow">
                <div className="relative aspect-[4/3] overflow-hidden bg-night">
                  <PackageCover images={imgs} alt={nome} className="absolute inset-0 w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/10 to-transparent pointer-events-none" />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-md bg-amber-400/95 px-2 py-0.5 text-[10px] font-extrabold text-night uppercase tracking-wider shadow-lg">
                    <Sparkles className="w-3 h-3" /> {L.combo[lang]}
                  </span>
                  {p.badge && (
                    <div className="absolute top-3 right-3">
                      <TourBadge type={p.badge} lang={lang} />
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-foreground leading-tight">{nome}</h3>
                  {desc && <p className="mt-1.5 text-sm text-muted-foreground leading-snug flex-1">{desc}</p>}
                  <div className="mt-3">
                    <PriceWithDiscount
                      price={p.preco}
                      originalPrice={originalPrice > p.preco ? originalPrice : null}
                      lang={lang}
                      size="md"
                    />
                  </div>
                  <UrgencyTag text={p.urgencia} className="mt-2" />
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => nav(`/pacotes/${p.key}`)}
                      className="w-full rounded-xl border border-turquoise/40 bg-turquoise/10 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-turquoise/20 hover:border-turquoise/70 transition-colors"
                    >
                      {L.details[lang]}
                    </button>
                    <button
                      type="button"
                      onClick={() => nav(`/pacotes/${p.key}?reservar=1`)}
                      className="rgb-border w-full block"
                    >
                      <span className="flex items-center justify-center gap-1.5 rounded-[0.65rem] bg-gradient-to-r from-deep-blue to-night px-4 py-2.5 text-sm font-bold text-foreground">
                        ✨ {L.book[lang]}
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <DepoimentosSection lang={lang} />

        <footer className="text-center mt-14 text-xs text-muted-foreground/70">
          © Nathan {t.brandSubtitle} · {t.footerRegion}
        </footer>
      </div>
      <WhatsAppFab lang={lang} />
    </main>
  );
};

export default Pacotes;

// ============================================================
// Detalhe de um pacote — herda dados dos passeios que o compõem.
// Reutiliza TourDetails para cada passeio componente.
// "Reservar" abre StandardForm sem tourKey (cupons desabilitados),
// destino = nome do pacote, preço fixo do pacote.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Lang, dict, loadLang, saveLang } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { AdminFab } from "@/components/AdminPanel";
import { isAdminMode } from "@/lib/promo";
import { TourDetails } from "@/components/TourDetails";
import { StandardForm } from "@/components/StandardForm";
import { PackageCover } from "@/components/PackageCover";
import { SavingsBox, PriceWithDiscount } from "@/components/SavingsBox";
import { TourBadge, UrgencyTag } from "@/components/TourBadge";
import { usePacote, pickPacoteLang } from "@/lib/pacotes";
import { useTours, pickLang } from "@/lib/cms";
import { TOUR_PRICES } from "@/lib/prices";
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

const L = {
  book: { pt: "Reservar agora", es: "Reservar ahora", en: "Book now", fr: "Réserver maintenant", it: "Prenota ora" },
  back: { pt: "Voltar aos pacotes", es: "Volver a los paquetes", en: "Back to packages", fr: "Retour aux forfaits", it: "Torna ai pacchetti" },
  combo: { pt: "Combo promocional · cupons não se aplicam", es: "Combo promocional · cupones no aplicables", en: "Promo combo · coupons not applicable", fr: "Combo promo · coupons non applicables", it: "Combo promo · coupon non applicabili" },
  includes: { pt: "Este pacote inclui", es: "Este paquete incluye", en: "This package includes", fr: "Ce forfait comprend", it: "Questo pacchetto include" },
};

const TOUR_KEYS: TourKey[] = ["escuna","arraial","buggy","cabofrio","jardineira","catamara","mergulho","lancha"];
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
  const setLang = (l: Lang) => { saveLang(l); setLangState(l); };
  const t = dict[lang];

  const { data: pacote, isLoading } = usePacote(key);
  const { data: tours } = useTours(false);
  const [bookingOpen, setBookingOpen] = useState(wantsBook);

  useEffect(() => {
    if (pacote) document.title = `${pacote.nome_pt} · Nathan Turismo`;
  }, [pacote]);

  const imgOf = (k: string) =>
    tours?.find((x) => x.key === k)?.imagem_url || FALLBACK[k] || "";

  const labelOf = (k: string): string => {
    const cms = tours?.find((x) => x.key === k);
    if (cms) return pickLang(cms as any, "nome", lang) || cms.nome_pt;
    return PSEUDO_LABELS[k]?.[lang] || k;
  };

  const savingsItems = useMemo(() => {
    if (!pacote) return [];
    return pacote.tour_keys.map((k) => {
      const real = TOUR_PRICES[k as TourKey]?.value;
      const price = typeof real === "number" ? real : (PSEUDO_PRICES[k] || 0);
      return { label: labelOf(k), price };
    }).filter((x) => x.price > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacote, tours, lang]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div aria-hidden className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
        <p className="relative z-10 text-foreground/70">…</p>
      </main>
    );
  }

  if (!pacote) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div aria-hidden className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
        <div className="relative z-10 text-center">
          <p className="text-foreground/70 mb-4">Pacote não encontrado.</p>
          <button onClick={() => nav("/pacotes")} className="text-turquoise-glow underline">Ver pacotes</button>
        </div>
      </main>
    );
  }

  const nome = pickPacoteLang(pacote, "nome", lang) || pacote.nome_pt;
  const desc = pickPacoteLang(pacote, "descricao", lang);
  const imgs = pacote.imagem_url ? [pacote.imagem_url] : pacote.tour_keys.map(imgOf).filter(Boolean);
  const totalAvulso = savingsItems.reduce((a, b) => a + b.price, 0);
  const originalPrice = pacote.preco_original ?? totalAvulso;

  if (bookingOpen) {
    return (
      <StandardForm
        lang={lang}
        onLangChange={setLang}
        onBack={() => setBookingOpen(false)}
        title={nome}
        backgroundImage={imgs[0] || escunaImg}
        packagePrice={pacote.preco}
      />
    );
  }

  return (
    <main className="relative min-h-screen px-4 pt-8 pb-16 overflow-hidden">
      <div aria-hidden className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => nav("/pacotes")}
            className="inline-flex items-center gap-1 text-sm text-foreground/80 hover:text-turquoise-glow transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {L.back[lang]}
          </button>
          <LanguageSwitcher lang={lang} onChange={setLang} />
        </div>

        {/* Hero do pacote */}
        <section className="glass-card rounded-3xl overflow-hidden border-amber-400/30">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-night">
            <PackageCover images={imgs} alt={nome} className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent pointer-events-none" />
            {pacote.badge && (
              <div className="absolute top-3 right-3">
                <TourBadge type={pacote.badge} lang={lang} />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/95 px-2 py-0.5 text-[10px] font-extrabold text-night uppercase tracking-wider shadow-lg mb-2">
                <Sparkles className="w-3 h-3" /> Combo
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight bg-gradient-to-r from-amber-200 to-turquoise-glow bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {nome}
              </h1>
            </div>
          </div>
          <div className="p-5">
            {desc && <p className="text-sm text-foreground/85 leading-relaxed mb-4">{desc}</p>}
            <UrgencyTag text={pacote.urgencia} className="mb-3" />
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <PriceWithDiscount
                price={pacote.preco}
                originalPrice={originalPrice > pacote.preco ? originalPrice : null}
                lang={lang}
                size="lg"
              />
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="rgb-border block"
              >
                <span className="flex items-center justify-center gap-2 rounded-[0.7rem] bg-gradient-to-r from-deep-blue to-night px-6 py-3 text-sm font-bold text-foreground tracking-wide">
                  ✨ {L.book[lang]}
                </span>
              </button>
            </div>
            <p className="mt-3 text-[11px] text-amber-200/80 italic">
              ✦ {L.combo[lang]}
            </p>
          </div>
        </section>

        {/* Você economiza */}
        {savingsItems.length > 0 && (
          <div className="mt-6">
            <SavingsBox items={savingsItems} packagePrice={pacote.preco} lang={lang} />
          </div>
        )}

        {/* Inclui */}
        <h2 className="mt-8 mb-3 text-sm uppercase tracking-wider font-bold text-turquoise-glow">
          {L.includes[lang]}
        </h2>

        <div className="space-y-8">
          {pacote.tour_keys.map((tk, i) => {
            if (isRealTour(tk)) {
              return (
                <div key={`${tk}-${i}`} className="glass-card rounded-2xl overflow-hidden">
                  <TourDetails
                    tourKey={tk}
                    lang={lang}
                    onLangChange={setLang}
                    onBack={() => {}}
                    onBook={() => setBookingOpen(true)}
                  />
                </div>
              );
            }
            // pseudo-tours (ex.: almoco)
            const img = imgOf(tk);
            const cms = tours?.find((x) => x.key === tk);
            const label = cms?.nome_pt || PSEUDO_LABELS[tk]?.pt || tk;
            const description = cms?.descricao_pt || "";
            return (
              <div key={`${tk}-${i}`} className="glass-card rounded-2xl overflow-hidden">
                {img && (
                  <div className="aspect-[16/9] w-full overflow-hidden bg-night">
                    <img src={img} alt={label} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-foreground">{label}</h3>
                  {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <button
            type="button"
            onClick={() => setBookingOpen(true)}
            className="rgb-border w-full block"
          >
            <span className="flex items-center justify-center gap-2 rounded-[0.7rem] bg-gradient-to-r from-deep-blue to-night px-6 py-4 text-base font-bold text-foreground">
              ✨ {L.book[lang]}
            </span>
          </button>
        </div>

        <footer className="text-center mt-14 text-xs text-muted-foreground/70">
          © Nathan {t.brandSubtitle} · {t.footerRegion}
        </footer>
      </div>
      <WhatsAppFab lang={lang} />
      {isAdminMode() && <AdminFab />}
    </main>
  );
};

export default PacoteDetalhes;

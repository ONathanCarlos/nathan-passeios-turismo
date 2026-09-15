// ============================================================
// Nova Home: duas grandes opções — Passeios Avulsos x Pacotes
// ============================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lang, dict, loadLang, saveLang } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { DepoimentosSection } from "@/components/DepoimentosSection";
import { useTours } from "@/lib/cms";
import { ChevronRight, Sparkles, Star, ShieldCheck, Globe2 } from "lucide-react";
import { isQrActive, urlHasPromoParam, subscribeQrPromo } from "@/lib/qrPromo";
import { loadPromo } from "@/lib/promo";
import { QrPromoBoot } from "@/components/QrPromo";
import { CampaignPromoModal } from "@/components/CampaignPromoModal";
import { useIsAdmin } from "@/lib/adminAuth";
import { runNavigationTransition } from "@/lib/viewTransition";

import nathanProfile from "@/assets/nathan-profile.jpg";
import escunaImg from "@/assets/escuna.jpg";
import buggyImg from "@/assets/buggy.jpg";
import arraialImg from "@/assets/arraial-do-cabo.jpg";
import mergulhoImg from "@/assets/mergulho.jpg";
import catamaraImg from "@/assets/catamara.jpg";
import caboFrioImg from "@/assets/cabo-frio.jpg";
import lanchaImg from "@/assets/lancha.jpg";
import jardineiraImg from "@/assets/jardineira.jpg";

const FALLBACK: Record<string, string> = {
  escuna: escunaImg,
  buggy: buggyImg,
  arraial: arraialImg,
  mergulho: mergulhoImg,
  catamara: catamaraImg,
  cabofrio: caboFrioImg,
  lancha: lanchaImg,
  jardineira: jardineiraImg,
};

const COPY: Record<Lang, {
  headline: string;
  subhead: string;
  trustRating: string;
  trustSecure: string;
  trustLangs: string;
  avulsosTitle: string;
  avulsosDesc: string;
  pacotesTitle: string;
  pacotesDesc: string;
  pacotesSlogan: string;
  promoHint: string;
}> = {
  pt: {
    headline: "Explore Búzios do seu jeito.",
    subhead: "Experiências incríveis, passeios inesquecíveis e os melhores combos da região.",
    trustRating: "4.9 · centenas de viagens",
    trustSecure: "Reserva segura",
    trustLangs: "Atendimento em 5 idiomas",
    avulsosTitle: "Passeios Avulsos",
    avulsosDesc: "Escolha um passeio individual: Escuna, Buggy, Arraial do Cabo, Mergulho e mais.",
    pacotesTitle: "Pacotes de Passeios",
    pacotesDesc: "Combos com mais de uma experiência por um valor especial.",
    pacotesSlogan: "Mais experiências por menos: aproveite os melhores combos de Búzios com preços especiais.",
    promoHint: "Aplique seu desconto aqui! Válido apenas nos Passeios Avulsos.",
  },
  es: {
    headline: "Explora Búzios a tu manera.",
    subhead: "Experiencias increíbles, paseos inolvidables y los mejores combos de la región.",
    trustRating: "4.9 · cientos de viajes",
    trustSecure: "Reserva segura",
    trustLangs: "Atención en 5 idiomas",
    avulsosTitle: "Paseos individuales",
    avulsosDesc: "Elige un paseo individual: Goleta, Buggy, Arraial do Cabo, Buceo y más.",
    pacotesTitle: "Paquetes de paseos",
    pacotesDesc: "Combos con más de una experiencia a un precio especial.",
    pacotesSlogan: "Más experiencias por menos: aprovecha los mejores combos de Búzios con precios especiales.",
    promoHint: "¡Aplica tu descuento aquí! Válido solo en los Paseos individuales.",
  },
  en: {
    headline: "Explore Búzios your way.",
    subhead: "Amazing experiences, unforgettable tours and the best combos in the region.",
    trustRating: "4.9 · hundreds of trips",
    trustSecure: "Secure booking",
    trustLangs: "Service in 5 languages",
    avulsosTitle: "Individual Tours",
    avulsosDesc: "Pick a single tour: Schooner, Buggy, Arraial do Cabo, Diving and more.",
    pacotesTitle: "Tour Packages",
    pacotesDesc: "Combos with more than one experience at a special price.",
    pacotesSlogan: "More experiences for less: enjoy the best Búzios combos at special prices.",
    promoHint: "Apply your discount here! Valid only on Individual Tours.",
  },
  fr: {
    headline: "Explorez Búzios à votre façon.",
    subhead: "Expériences incroyables, excursions inoubliables et les meilleurs combos de la région.",
    trustRating: "4.9 · des centaines de voyages",
    trustSecure: "Réservation sécurisée",
    trustLangs: "Service en 5 langues",
    avulsosTitle: "Excursions individuelles",
    avulsosDesc: "Choisissez une excursion : Goélette, Buggy, Arraial do Cabo, Plongée et plus.",
    pacotesTitle: "Forfaits d'excursions",
    pacotesDesc: "Combos avec plusieurs expériences à un prix spécial.",
    pacotesSlogan: "Plus d'expériences pour moins : profitez des meilleurs combos de Búzios à des prix spéciaux.",
    promoHint: "Appliquez votre réduction ici ! Valable uniquement sur les Excursions individuelles.",
  },
  it: {
    headline: "Esplora Búzios a modo tuo.",
    subhead: "Esperienze incredibili, tour indimenticabili e i migliori combo della regione.",
    trustRating: "4.9 · centinaia di viaggi",
    trustSecure: "Prenotazione sicura",
    trustLangs: "Servizio in 5 lingue",
    avulsosTitle: "Tour singoli",
    avulsosDesc: "Scegli un tour singolo: Goletta, Buggy, Arraial do Cabo, Immersione e altro.",
    pacotesTitle: "Pacchetti tour",
    pacotesDesc: "Combo con più esperienze a un prezzo speciale.",
    pacotesSlogan: "Più esperienze a meno: approfitta dei migliori combo di Búzios a prezzi speciali.",
    promoHint: "Applica il tuo sconto qui! Valido solo sui Tour singoli.",
  },
};

const Home = () => {
  const nav = useNavigate();
  const [lang, setLangState] = useState<Lang>(() => loadLang());
  const setLang = (l: Lang) => { saveLang(l); setLangState(l); };
  const t = dict[lang];
  const C = COPY[lang];
  const { data: cmsTours } = useTours(true);
  const avulsosRef = useRef<HTMLButtonElement | null>(null);
  const admin = useIsAdmin();

  // Promo state
  const [promoTick, setPromoTick] = useState(0);
  useEffect(() => subscribeQrPromo(() => setPromoTick((n) => n + 1)), []);
  const promoActive = useMemo(() => {
    if (typeof window === "undefined") return false;
    const sp = new URLSearchParams(window.location.search);
    const hasPromoParam = sp.has("promo");
    const hasLangEs = (sp.get("lang") || "").toLowerCase().startsWith("es");
    return hasPromoParam || hasLangEs || isQrActive() || urlHasPromoParam() || !!loadPromo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoTick, lang]);

  useEffect(() => { document.title = "Nathan Turismo · Búzios"; }, []);

  // Scroll suave até "Passeios Avulsos" quando promo está ativa
  useEffect(() => {
    if (!promoActive) return;
    const tm = setTimeout(() => {
      avulsosRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 700);
    return () => clearTimeout(tm);
  }, [promoActive]);

  const imgOf = (key: string) =>
    cmsTours?.find((x) => x.key === key)?.imagem_url || FALLBACK[key] || "";

  const avulsosImgs = ["escuna", "buggy", "arraial", "mergulho"].map(imgOf);
  const pacotesImgs = ["catamara", "cabofrio", "lancha", "jardineira"].map(imgOf);

  return (
    <main className="relative min-h-screen px-4 pt-10 pb-16 overflow-hidden">
      {!admin && <QrPromoBoot lang={lang} />}
      {!admin && <CampaignPromoModal lang={lang} />}
      <div aria-hidden className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Topbar */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-turquoise/40 shadow-[0_0_12px_hsl(var(--turquoise)/0.4)]">
              <img src={nathanProfile} alt="Nathan" loading="eager" decoding="async" className="w-full h-full object-cover" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-foreground">Nathan</div>
              <div className="text-[11px] text-muted-foreground">{t.brandSubtitle}</div>
            </div>
          </div>
          <LanguageSwitcher lang={lang} onChange={setLang} />
        </div>

        {/* Hero emocional */}
        <header className="text-center mb-8 animate-in fade-in slide-in-from-top-3 duration-700">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-3">
            <span className="bg-gradient-to-r from-turquoise via-turquoise-glow to-amber-300 bg-clip-text text-transparent drop-shadow-[0_3px_12px_rgba(0,0,0,0.85)]">
              {C.headline}
            </span>
          </h1>
          <p className="text-foreground/85 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {C.subhead}
          </p>

          {/* Trust strip */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] sm:text-xs text-foreground/80">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1">
              <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> {C.trustRating}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" /> {C.trustSecure}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-turquoise/30 bg-turquoise/10 px-2.5 py-1">
              <Globe2 className="w-3 h-3 text-turquoise-glow" /> {C.trustLangs}
            </span>
          </div>
        </header>

        {/* Promo hint banner */}
        {promoActive && (
          <div className="mb-5 mx-auto max-w-xl rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-turquoise/15 px-4 py-3 flex items-center gap-3 shadow-[0_0_24px_hsl(var(--turquoise)/0.25)] animate-in fade-in slide-in-from-top-2 duration-500">
            <Sparkles className="h-5 w-5 text-amber-300 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold text-amber-100 leading-snug">
              {C.promoHint}
            </p>
          </div>
        )}

        {/* Two big choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <BigChoice
            ref={avulsosRef}
            quadrants={avulsosImgs}
            title={C.avulsosTitle}
            desc={C.avulsosDesc}
            onClick={() => runNavigationTransition(() => nav("/passeios"))}
            highlight={promoActive}
            highlightLabel={promoActive ? C.promoHint : undefined}
          />
          <BigChoice
            quadrants={pacotesImgs}
            title={C.pacotesTitle}
            desc={C.pacotesDesc}
            onClick={() => runNavigationTransition(() => nav("/pacotes"))}
            badge={C.pacotesSlogan}
          />
        </div>

        <DepoimentosSection lang={lang} />

        <footer className="text-center mt-12 text-xs text-muted-foreground/70">
          © Nathan {t.brandSubtitle} · {t.footerRegion}
        </footer>
      </div>
      <WhatsAppFab lang={lang} />
    </main>
  );
};

import { forwardRef } from "react";

interface BigChoiceProps {
  quadrants: string[]; title: string; desc: string; onClick: () => void;
  badge?: string; highlight?: boolean; highlightLabel?: string;
}

const BigChoice = forwardRef<HTMLButtonElement, BigChoiceProps>(function BigChoice(
  { quadrants, title, desc, onClick, badge, highlight, highlightLabel }, ref,
) {
  return (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    className={`group glass-card rounded-3xl overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 ${
      highlight
        ? "border-amber-400/70 shadow-[0_0_28px_hsl(45_95%_60%/0.45)] ring-2 ring-amber-300/60 animate-pulse"
        : "hover:border-turquoise/60 hover:turquoise-glow"
    }`}
  >
    <div className="relative aspect-square w-full overflow-hidden bg-night">
      <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-full">
        {quadrants.slice(0, 4).map((src, i) => (
          <div key={i} className="relative w-full h-full overflow-hidden bg-night/60">
            {src ? (
              <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : null}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent pointer-events-none" />
      {highlight && (
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-amber-400 text-night text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
          ✦ Desconto aqui
        </div>
      )}
    </div>
    <div className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <ChevronRight className="w-5 h-5 text-turquoise-glow shrink-0 transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-2 text-sm text-muted-foreground leading-snug">{desc}</p>
      {highlight && highlightLabel && (
        <p className="mt-3 text-[11px] sm:text-xs font-semibold text-amber-200 italic">
          ✦ {highlightLabel}
        </p>
      )}
      {!highlight && badge && (
        <p className="mt-3 text-[11px] sm:text-xs font-semibold text-amber-200/90 italic">
          ✦ {badge}
        </p>
      )}
    </div>
  </button>
  );
});

export default Home;

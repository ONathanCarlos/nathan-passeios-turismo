// ============================================================
// Home: hero de destino + acesso claro a passeios avulsos e pacotes
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lang, dict, loadLang, saveLang } from "@/lib/i18n";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { useTours } from "@/lib/cms";
import { ArrowRight, Banknote, ChevronRight, Languages, MessageCircle, Sparkles } from "lucide-react";
import { isQrActive, urlHasPromoParam, subscribeQrPromo } from "@/lib/qrPromo";
import { loadPromo } from "@/lib/promo";
import { QrPromoBoot } from "@/components/QrPromo";
import { CampaignPromoModal } from "@/components/CampaignPromoModal";
import { useIsAdmin } from "@/lib/adminAuth";
import { runNavigationTransition } from "@/lib/viewTransition";

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
  avulsosTitle: string;
  avulsosDesc: string;
  avulsosCta: string;
  pacotesTitle: string;
  pacotesDesc: string;
  pacotesSlogan: string;
  pacotesCta: string;
  promoHint: string;
  promoBadge: string;
  heroTitle: string;
  heroAccent: string;
  heroDesc: string;
  heroAlt: string;
  heroToursCta: string;
  heroPackagesCta: string;
  trustPrice: string;
  trustWhatsapp: string;
  trustLanguages: string;
  trustSectionLabel: string;
  choiceSectionLabel: string;
}> = {
  pt: {
    avulsosTitle: "Passeios avulsos",
    avulsosDesc: "Escolha um passeio: Escuna, Buggy, Arraial do Cabo, Mergulho e mais.",
    avulsosCta: "Ver todos os passeios",
    pacotesTitle: "Pacotes de passeios",
    pacotesDesc: "Combine mais de uma experiência em um só roteiro.",
    pacotesSlogan: "Mais experiências por menos: aproveite os melhores combos de Búzios.",
    pacotesCta: "Comparar pacotes",
    promoHint: "Use seu desconto nos passeios avulsos.",
    promoBadge: "Desconto disponível",
    heroTitle: "Seu próximo dia inesquecível começa",
    heroAccent: "por aqui.",
    heroDesc: "Escolha um passeio ou combine experiências. Veja os preços de acordo com a forma de pagamento e fale com a equipe para reservar.",
    heroAlt: "Passeio de escuna nas águas de Búzios",
    heroToursCta: "Explorar passeios",
    heroPackagesCta: "Conhecer pacotes",
    trustPrice: "Valores em dinheiro/Pix e cartão indicados com clareza",
    trustWhatsapp: "Atendimento para reservas pelo WhatsApp",
    trustLanguages: "Conteúdo disponível em cinco idiomas",
    trustSectionLabel: "Informações do serviço",
    choiceSectionLabel: "Escolha como explorar",
  },
  es: {
    avulsosTitle: "Paseos individuales",
    avulsosDesc: "Elige una experiencia: Goleta, Buggy, Arraial do Cabo, Buceo y más.",
    avulsosCta: "Ver todos los paseos",
    pacotesTitle: "Paquetes de paseos",
    pacotesDesc: "Combina más de una experiencia en un solo itinerario.",
    pacotesSlogan: "Más experiencias por menos: disfruta de los mejores combos de Búzios.",
    pacotesCta: "Comparar paquetes",
    promoHint: "Usa tu descuento en los paseos individuales.",
    promoBadge: "Descuento disponible",
    heroTitle: "Tu próximo día inolvidable comienza",
    heroAccent: "aquí.",
    heroDesc: "Elige un paseo o combina experiencias. Consulta los precios según la forma de pago y habla con nuestro equipo para reservar.",
    heroAlt: "Paseo en goleta por las aguas de Búzios",
    heroToursCta: "Explorar paseos",
    heroPackagesCta: "Ver paquetes",
    trustPrice: "Precios en efectivo/Pix y tarjeta indicados con claridad",
    trustWhatsapp: "Atención para reservas por WhatsApp",
    trustLanguages: "Contenido disponible en cinco idiomas",
    trustSectionLabel: "Información del servicio",
    choiceSectionLabel: "Elige cómo explorar",
  },
  en: {
    avulsosTitle: "Individual tours",
    avulsosDesc: "Choose one experience: Schooner, Buggy, Arraial do Cabo, Diving and more.",
    avulsosCta: "See all tours",
    pacotesTitle: "Tour packages",
    pacotesDesc: "Combine more than one experience in a single itinerary.",
    pacotesSlogan: "More experiences for less: enjoy Búzios' best combos.",
    pacotesCta: "Compare packages",
    promoHint: "Use your discount on individual tours.",
    promoBadge: "Discount available",
    heroTitle: "Your next unforgettable day starts",
    heroAccent: "right here.",
    heroDesc: "Choose a tour or combine experiences. See prices by payment method and contact our team to book.",
    heroAlt: "Schooner tour on the waters of Búzios",
    heroToursCta: "Explore tours",
    heroPackagesCta: "Discover packages",
    trustPrice: "Cash/Pix and card prices clearly shown",
    trustWhatsapp: "WhatsApp support for reservations",
    trustLanguages: "Content available in five languages",
    trustSectionLabel: "Service information",
    choiceSectionLabel: "Choose how to explore",
  },
  fr: {
    avulsosTitle: "Excursions individuelles",
    avulsosDesc: "Choisissez une expérience : Goélette, Buggy, Arraial do Cabo, Plongée et plus.",
    avulsosCta: "Voir toutes les excursions",
    pacotesTitle: "Forfaits d'excursions",
    pacotesDesc: "Combinez plusieurs expériences dans un seul itinéraire.",
    pacotesSlogan: "Plus d'expériences pour moins : profitez des meilleurs combos de Búzios.",
    pacotesCta: "Comparer les forfaits",
    promoHint: "Utilisez votre réduction pour les excursions individuelles.",
    promoBadge: "Réduction disponible",
    heroTitle: "Votre prochaine journée inoubliable commence",
    heroAccent: "ici.",
    heroDesc: "Choisissez une excursion ou combinez plusieurs expériences. Consultez les tarifs selon le mode de paiement et contactez notre équipe pour réserver.",
    heroAlt: "Excursion en goélette sur les eaux de Búzios",
    heroToursCta: "Explorer les excursions",
    heroPackagesCta: "Découvrir les forfaits",
    trustPrice: "Tarifs en espèces/Pix et par carte clairement indiqués",
    trustWhatsapp: "Assistance réservation par WhatsApp",
    trustLanguages: "Contenu disponible en cinq langues",
    trustSectionLabel: "Informations sur le service",
    choiceSectionLabel: "Choisissez comment explorer",
  },
  it: {
    avulsosTitle: "Tour singoli",
    avulsosDesc: "Scegli un'esperienza: Goletta, Buggy, Arraial do Cabo, Immersione e altro.",
    avulsosCta: "Vedi tutti i tour",
    pacotesTitle: "Pacchetti tour",
    pacotesDesc: "Combina più di un'esperienza in un unico itinerario.",
    pacotesSlogan: "Più esperienze a meno: scopri i migliori combo di Búzios.",
    pacotesCta: "Confronta i pacchetti",
    promoHint: "Usa lo sconto per i tour singoli.",
    promoBadge: "Sconto disponibile",
    heroTitle: "La tua prossima giornata indimenticabile inizia",
    heroAccent: "qui.",
    heroDesc: "Scegli un tour o combina più esperienze. Consulta i prezzi in base al metodo di pagamento e contatta il nostro team per prenotare.",
    heroAlt: "Gita in goletta sulle acque di Búzios",
    heroToursCta: "Esplora i tour",
    heroPackagesCta: "Scopri i pacchetti",
    trustPrice: "Prezzi in contanti/Pix e con carta indicati chiaramente",
    trustWhatsapp: "Assistenza per le prenotazioni su WhatsApp",
    trustLanguages: "Contenuti disponibili in cinque lingue",
    trustSectionLabel: "Informazioni sul servizio",
    choiceSectionLabel: "Scegli come esplorare",
  },
};

const Home = () => {
  const nav = useNavigate();
  const [lang, setLangState] = useState<Lang>(() => loadLang());
  const setLang = (l: Lang) => { saveLang(l); setLangState(l); };
  const t = dict[lang];
  const C = COPY[lang];
  const { data: cmsTours } = useTours(true);
  const admin = useIsAdmin();

  // Mantém a detecção de campanhas/QR já usada pelo fluxo de reservas.
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

  useEffect(() => { document.title = "Ônix Turismo Búzios · Búzios"; }, []);

  const imgOf = (key: string) =>
    cmsTours?.find((x) => x.key === key)?.imagem_url || FALLBACK[key] || "";
  const heroImage = imgOf("escuna");
  const individualImage = imgOf("buggy");
  const packageImage = imgOf("catamara");
  const go = (path: string) => runNavigationTransition(() => nav(path));

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pt-3 pb-16 sm:px-6 lg:px-8">
      {!admin && <QrPromoBoot lang={lang} />}
      {!admin && <CampaignPromoModal lang={lang} />}
      <div aria-hidden className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-10 -mx-4 -mt-3 sm:-mx-6 lg:-mx-8">
        <PublicSiteHeader lang={lang} onLangChange={setLang} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <section className="grid grid-cols-1 items-center gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:grid-rows-[auto_auto] lg:gap-x-12 lg:gap-y-5 lg:py-14">
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-turquoise-glow sm:text-sm">
              {t.footerRegion}
            </p>
            <h1 className="max-w-2xl text-[2.5rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {C.heroTitle} <span className="text-turquoise-glow">{C.heroAccent}</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/75 sm:mt-5 sm:text-lg">
              {C.heroDesc}
            </p>
          </div>

          <div className="relative isolate overflow-hidden rounded-[1.75rem] border border-turquoise/20 bg-night/60 shadow-[0_22px_60px_rgba(0,0,0,0.35)] lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <img
              src={heroImage}
              alt={C.heroAlt}
              fetchPriority="high"
              decoding="async"
              className="aspect-[16/10] w-full object-cover sm:aspect-[16/9] lg:aspect-[5/4]"
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/25 via-transparent to-transparent" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:col-start-1 lg:row-start-2">
            <button
              type="button"
              onClick={() => go("/passeios")}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-turquoise px-5 py-3 font-bold text-night shadow-[0_8px_25px_hsl(var(--turquoise)/0.18)] transition-colors hover:bg-turquoise-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {C.heroToursCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go("/pacotes")}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-turquoise/30 bg-night/45 px-5 py-3 font-semibold text-foreground transition-colors hover:border-turquoise/60 hover:bg-turquoise/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {C.heroPackagesCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        {promoActive && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-turquoise/10 px-4 py-3 text-amber-100 shadow-[0_0_24px_hsl(var(--turquoise)/0.12)] sm:mb-7 sm:items-center">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-300 sm:mt-0" aria-hidden="true" />
            <p className="text-sm font-semibold leading-snug">{C.promoHint}</p>
          </div>
        )}

        <section aria-label={C.trustSectionLabel} className="grid grid-cols-1 gap-3 border-y border-turquoise/15 py-4 sm:grid-cols-3 sm:gap-5 sm:py-5">
          <div className="flex items-center gap-3 text-sm text-foreground/75">
            <Banknote className="h-5 w-5 shrink-0 text-turquoise-glow" aria-hidden="true" />
            <span>{C.trustPrice}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground/75">
            <MessageCircle className="h-5 w-5 shrink-0 text-turquoise-glow" aria-hidden="true" />
            <span>{C.trustWhatsapp}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground/75">
            <Languages className="h-5 w-5 shrink-0 text-turquoise-glow" aria-hidden="true" />
            <span>{C.trustLanguages}</span>
          </div>
        </section>

        <section aria-label={C.choiceSectionLabel} className="grid grid-cols-1 gap-4 pt-6 sm:gap-5 sm:pt-7 md:grid-cols-2">
          <BigChoice
            image={individualImage}
            title={C.avulsosTitle}
            desc={C.avulsosDesc}
            cta={C.avulsosCta}
            onClick={() => go("/passeios")}
            highlight={promoActive}
            highlightLabel={promoActive ? C.promoBadge : undefined}
          />
          <BigChoice
            image={packageImage}
            title={C.pacotesTitle}
            desc={C.pacotesDesc}
            cta={C.pacotesCta}
            onClick={() => go("/pacotes")}
            badge={C.pacotesSlogan}
          />
        </section>

        <footer className="mt-10 text-center text-xs text-muted-foreground/70 sm:mt-12">
          © {t.brand} · {t.footerRegion}
        </footer>
      </div>
    </main>
  );
};

interface BigChoiceProps {
  image: string;
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
  badge?: string;
  highlight?: boolean;
  highlightLabel?: string;
}

const BigChoice = ({ image, title, desc, cta, onClick, badge, highlight, highlightLabel }: BigChoiceProps) => (
  <button
    type="button"
    onClick={onClick}
    className="group grid min-h-32 grid-cols-[6rem_minmax(0,1fr)] items-center gap-4 overflow-hidden rounded-2xl border border-turquoise/15 bg-gradient-to-br from-turquoise/[0.08] via-night/75 to-night/90 p-3 text-left shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:border-turquoise/45 hover:shadow-[0_18px_38px_rgba(0,0,0,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise sm:min-h-36 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-5 sm:p-4"
  >
    <div className="relative aspect-square w-24 overflow-hidden rounded-xl bg-night/70 sm:w-[8.5rem]">
      {image ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : null}
      {highlight && highlightLabel && (
        <span className="absolute inset-x-1 bottom-1 rounded-full border border-amber-200/40 bg-night/85 px-1.5 py-1 text-center text-[9px] font-bold leading-tight text-amber-100 backdrop-blur-sm sm:inset-x-2 sm:bottom-2 sm:text-[10px]">
          {highlightLabel}
        </span>
      )}
    </div>
    <div className="min-w-0 py-1">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold leading-tight text-foreground sm:text-xl">{title}</h2>
        <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-turquoise-glow transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
      <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{desc}</p>
      {badge && <p className="mt-2 line-clamp-2 text-xs font-semibold text-amber-200/90">{badge}</p>}
      <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-turquoise-glow">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </div>
  </button>
);

export default Home;

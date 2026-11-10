import { useEffect, useState } from "react";
import { Lang, dict, loadLang, saveLang } from "@/lib/i18n";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";


import { StandardForm } from "@/components/StandardForm";
import { TourDetails } from "@/components/TourDetails";
import { PaymentPriceDisplay } from "@/components/PaymentPriceDisplay";
import { TourKey } from "@/lib/tours";
import { ArrowLeftRight, ArrowRight, Sparkles, Tag } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TourBadge, UrgencyTag } from "@/components/TourBadge";
import { PageTransition } from "@/components/PageTransition";
import { PromoBanner } from "@/components/PromoBanner";
import { COUPON_ELIGIBLE, tourPriceStatusText, TOUR_PRICES, formatBRL } from "@/lib/prices";
import { useIsAdmin } from "@/lib/adminAuth";
import { runNavigationTransition } from "@/lib/viewTransition";
import { forceRefreshCms, getCmsTourPriceStatus, subscribeCmsCache } from "@/lib/cmsCache";

import { QrPromoBoot } from "@/components/QrPromo";
import { SpanishLangModal } from "@/components/SpanishLangModal";
import { CampaignPromoModal } from "@/components/CampaignPromoModal";
import { loadQrPromo, urlHasPromoParam, subscribeQrPromo, qrPromoForTour } from "@/lib/qrPromo";
import { useTours, pickLang } from "@/lib/cms";
import { TourMediaGallery } from "@/components/TourMediaGallery";
import { CmsTourDetails } from "@/components/CmsTourDetails";
import { isLunchCmsTour } from "@/lib/cmsLunchBooking";
import { cmsTourWhatsAppUrl } from "@/lib/cmsTourWhatsApp";
import { CmsBookingTermsLink } from "@/components/CmsBookingTermsLink";
import arraialImg from "@/assets/arraial-do-cabo.jpg";
import escunaImg from "@/assets/escuna.jpg";
import buggyImg from "@/assets/buggy.jpg";
import catamaraImg from "@/assets/catamara.jpg";
import jardineiraImg from "@/assets/jardineira.jpg";
import mergulhoImg from "@/assets/mergulho.jpg";
import lanchaImg from "@/assets/lancha.jpg";
import caboFrioImg from "@/assets/cabo-frio.jpg";

type FormScreen = `form-${TourKey}`;
type Screen = "menu" | { details: TourKey } | FormScreen;

const FEATURED_BADGES: Partial<Record<TourKey, "destaque_mais_vendido" | "mais_procurado">> = {
  escuna: "destaque_mais_vendido",
  arraial: "mais_procurado",
};

const CATALOG_COPY: Record<Lang, {
  intro: string;
  galleryHint: string;
  galleryCaptionDesktop: string;
  galleryCaptionMobile: string;
  paymentHeading: string;
  couponLabel: string;
  promotionLabel: string;
}> = {
  pt: {
    intro: "Escolha seu passeio e veja fotos, detalhes e preços de acordo com a forma de pagamento.",
    galleryHint: "Deslize as fotos para ver cada passeio de outro ângulo",
    galleryCaptionDesktop: "Fotos do passeio",
    galleryCaptionMobile: "Deslize para ver mais fotos",
    paymentHeading: "Escolha a forma de pagamento",
    couponLabel: "Este passeio aceita cupom de desconto",
    promotionLabel: "Promoção",
  },
  es: {
    intro: "Elige tu paseo y consulta fotos, detalles y precios según el método de pago.",
    galleryHint: "Desliza las fotos para ver cada paseo desde otro ángulo",
    galleryCaptionDesktop: "Fotos del paseo",
    galleryCaptionMobile: "Desliza para ver más fotos",
    paymentHeading: "Elige la forma de pago",
    couponLabel: "Este paseo acepta cupones de descuento",
    promotionLabel: "Promoción",
  },
  en: {
    intro: "Choose a tour and explore photos, details, and prices by payment method.",
    galleryHint: "Swipe through the photos to see each tour from another angle",
    galleryCaptionDesktop: "Tour photos",
    galleryCaptionMobile: "Swipe to see more photos",
    paymentHeading: "Choose a payment method",
    couponLabel: "This tour accepts discount coupons",
    promotionLabel: "Promotion",
  },
  fr: {
    intro: "Choisissez une excursion et consultez les photos, les détails et les tarifs selon le mode de paiement.",
    galleryHint: "Faites défiler les photos pour découvrir chaque excursion sous un autre angle",
    galleryCaptionDesktop: "Photos de l'excursion",
    galleryCaptionMobile: "Faites défiler pour voir plus de photos",
    paymentHeading: "Choisissez un mode de paiement",
    couponLabel: "Cette excursion accepte les coupons de réduction",
    promotionLabel: "Promotion",
  },
  it: {
    intro: "Scegli un tour e consulta foto, dettagli e prezzi in base al metodo di pagamento.",
    galleryHint: "Scorri le foto per vedere ogni tour da un'altra angolazione",
    galleryCaptionDesktop: "Foto del tour",
    galleryCaptionMobile: "Scorri per vedere altre foto",
    paymentHeading: "Scegli il metodo di pagamento",
    couponLabel: "Questo tour accetta coupon sconto",
    promotionLabel: "Promozione",
  },
};

const EMOJI_RE = /[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}\uFE0F\u200D]/gu;
const cleanTourDescription = (description: string) => description
  .replace(EMOJI_RE, "")
  .replace(/\s+/g, " ")
  .replace(/\s+([,.;!?])/g, "$1")
  .trim();



const serialize = (s: Screen): string => (typeof s === "string" ? s : `details-${s.details}`);
const deserialize = (s: string): Screen => {
  if (s === "menu") return "menu";
  if (s.startsWith("details-")) return { details: s.slice(8) as TourKey };
  return s as FormScreen;
};

const isTourKey = (value: string | undefined): value is TourKey =>
  !!value && ["escuna", "arraial", "buggy", "cabofrio", "jardineira", "catamara", "mergulho", "lancha"].includes(value);

const Index = () => {
  const routeNavigate = useNavigate();
  const { tourKey: routeTourKey } = useParams<{ tourKey?: string }>();
  const routeDetailKey = isTourKey(routeTourKey) ? routeTourKey : null;
  const [lang, setLangState] = useState<Lang>(() => loadLang());
  const setLang = (l: Lang) => { saveLang(l); setLangState(l); };
  const [screen, setScreen] = useState<Screen>(() => routeDetailKey ? { details: routeDetailKey } : "menu");
  const [, setCmsPriceVersion] = useState(0);
  const t = dict[lang];
  // Modo admin tem prioridade absoluta: oculta banners promocionais e modal QR.
  const admin = useIsAdmin();
  const [qr, setQr] = useState(() => loadQrPromo());
  useEffect(() => subscribeQrPromo(() => setQr(loadQrPromo())), []);
  useEffect(() => subscribeCmsCache(() => setCmsPriceVersion((version) => version + 1)), []);
  const { data: cmsTours } = useTours(true);

  // Always open the tours page at the top (ignore scroll kept from the previous page)
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  // Browser/Android back-button support via history API
  useEffect(() => {
    if (!window.history.state || !window.history.state.screen) {
      window.history.replaceState({ screen: "menu" }, "");
    }
    const onPop = (e: PopStateEvent) => {
      const code = e.state?.screen ?? "menu";
      runNavigationTransition(() => setScreen(deserialize(code)));
      // Reset scroll on back/forward navigation
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    setScreen(routeDetailKey ? { details: routeDetailKey } : "menu");
  }, [routeDetailKey]);

  const navigate = (next: Screen) => {
    window.history.pushState({ screen: serialize(next) }, "");
    runNavigationTransition(() => setScreen(next));
    // Always start the next page from the top
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  };

  const back = () => {
    if (typeof screen === "object" && "details" in screen) {
      routeNavigate("/passeios");
      return;
    }
    window.history.back();
  };
  const openDetails = (key: TourKey) => routeNavigate(`/passeios/${key}`);
  const openForm = (key: TourKey) => navigate(`form-${key}` as FormScreen);

  // Passeio criado somente no CMS (sem regras especiais de reserva)
  const cmsOnlyTour = routeTourKey && !isTourKey(routeTourKey)
    ? (cmsTours || []).find((c) => c.key === routeTourKey && c.ativo)
    : undefined;
  if (cmsOnlyTour) {
    return (
      <PageTransition key={`cms-${cmsOnlyTour.key}`}>
        <CmsTourDetails tour={cmsOnlyTour} lang={lang} onLangChange={setLang} onBack={() => routeNavigate("/passeios")} />
      </PageTransition>
    );
  }

  // Details screen
  if (typeof screen === "object" && "details" in screen) {
    return (
      <>
        {!admin && <QrPromoBoot lang={lang} />}
        {!admin && <SpanishLangModal lang={lang} />}
        {!admin && <CampaignPromoModal lang={lang} />}
        {!admin && <PromoBanner lang={lang} tourKey={screen.details} />}
        <PageTransition key={`details-${screen.details}`}>
          <TourDetails
            tourKey={screen.details}
            lang={lang}
            onLangChange={setLang}
            onBack={back}
            onBook={() => openForm(screen.details)}
          />
        </PageTransition>
        </>
    );
  }

  // Booking forms
  const formNode = (() => {
    if (screen === "form-escuna")
      return <StandardForm tourKey="escuna" lang={lang} onLangChange={setLang} onBack={back} title={t.optEscuna} backgroundImage={escunaImg} />;
    if (screen === "form-arraial")
      return <StandardForm tourKey="arraial" lang={lang} onLangChange={setLang} onBack={back} title={t.optArraial} backgroundImage={arraialImg} requirePousada notice={t.noticeArraial} />;
    if (screen === "form-buggy")
      return <StandardForm tourKey="buggy" lang={lang} onLangChange={setLang} onBack={back} title={t.optBuggy} backgroundImage={buggyImg} />;
    if (screen === "form-cabofrio")
      return <StandardForm tourKey="cabofrio" lang={lang} onLangChange={setLang} onBack={back} title={t.optCaboFrio} backgroundImage={caboFrioImg} requirePousada notice={t.noticeCaboFrio} />;
    if (screen === "form-catamara")
      return <StandardForm tourKey="catamara" lang={lang} onLangChange={setLang} onBack={back} title={t.optCatamara} backgroundImage={catamaraImg} requireCpf notice={t.noticeCatamara} />;
    if (screen === "form-jardineira")
      return <StandardForm tourKey="jardineira" lang={lang} onLangChange={setLang} onBack={back} title={t.optJardineira} backgroundImage={jardineiraImg} />;
    if (screen === "form-mergulho")
      return <StandardForm tourKey="mergulho" lang={lang} onLangChange={setLang} onBack={back} title={t.optMergulho} backgroundImage={mergulhoImg} adultsOnly notice={t.adultsOnlyNotice} />;
    if (screen === "form-lancha")
      return <StandardForm tourKey="lancha" lang={lang} onLangChange={setLang} onBack={back} title={t.optLancha} backgroundImage={lanchaImg} />;
    return null;
  })();
  if (formNode) return <PageTransition key={screen as string}>{formNode}</PageTransition>;

  type Opt = { key: TourKey; image: string; title: string; desc: string; adultsOnly?: boolean };
  const cmsByKey = new Map((cmsTours || []).map((t) => [t.key, t]));
  // Fonte única: CMS (Supabase). Sem fallbacks persistidos — assets/i18n base apenas se o CMS não tiver dado.
  const ov = (k: TourKey, base: string) => cmsByKey.get(k)?.imagem_url || base;
  const od = (k: TourKey, base: string) => {
    const cms = cmsByKey.get(k);
    if (cms) {
      const v = pickLang(cms, "descricao", lang);
      if (v) return v;
    }
    return base;
  };
  const ot = (k: TourKey, base: string) => {
    const cms = cmsByKey.get(k);
    if (cms) {
      const v = pickLang(cms, "nome", lang);
      if (v) return v;
    }
    return base;
  };
  const baseOptions: Opt[] = [
    { key: "escuna",    image: ov("escuna", escunaImg),       title: ot("escuna", t.optEscuna),       desc: od("escuna", t.descEscuna) },
    { key: "arraial",   image: ov("arraial", arraialImg),     title: ot("arraial", t.optArraial),     desc: od("arraial", t.descArraial) },
    { key: "buggy",     image: ov("buggy", buggyImg),         title: ot("buggy", t.optBuggy),         desc: od("buggy", t.descBuggy) },
    { key: "cabofrio",  image: ov("cabofrio", caboFrioImg),   title: ot("cabofrio", t.optCaboFrio),   desc: od("cabofrio", t.descCaboFrio) },
    { key: "jardineira",image: ov("jardineira", jardineiraImg),title: ot("jardineira", t.optJardineira),desc: od("jardineira", t.descJardineira) },
    { key: "catamara",  image: ov("catamara", catamaraImg),   title: ot("catamara", t.optCatamara),   desc: od("catamara", t.descCatamara) },
    { key: "mergulho",  image: ov("mergulho", mergulhoImg),   title: ot("mergulho", t.optMergulho),   desc: od("mergulho", t.descMergulho), adultsOnly: true },
    { key: "lancha",    image: ov("lancha", lanchaImg),       title: ot("lancha", t.optLancha),       desc: od("lancha", t.descLancha) },
  ];
  // Filtra por "ativo" do CMS (se o passeio existe no banco e está inativo, não exibe).
  // Reordena pelos `ordem` do CMS quando disponível.
  const options: Opt[] = baseOptions
    .filter((o) => {
      const cms = cmsByKey.get(o.key);
      return cms ? cms.ativo : true;
    })
    .sort((a, b) => {
      const oa = cmsByKey.get(a.key)?.ordem ?? 999;
      const ob = cmsByKey.get(b.key)?.ordem ?? 999;
      return oa - ob;
    });

  

  return (
    <>
    {!admin && <QrPromoBoot lang={lang} />}
    {!admin && <SpanishLangModal lang={lang} />}
    {!admin && <CampaignPromoModal lang={lang} />}
    {!admin && <PromoBanner lang={lang} />}
    <PublicSiteHeader lang={lang} onLangChange={setLang} />
    <PageTransition key="menu"><main className={`relative min-h-screen px-4 ${admin ? "pt-4" : "pt-6 sm:pt-8"} pb-6 sm:pb-10 overflow-hidden`}>
      {/* Fundo estático ondulatório: gradiente azul-turquesa → azul escuro */}
      <div aria-hidden="true" className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <section id="tours" aria-labelledby="tour-list-heading">
          <div className="mb-6 sm:mb-8">
            <div className="flex min-h-0 items-start justify-between gap-4 sm:min-h-[8.5rem]">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-turquoise-glow sm:text-sm">
                  {t.footerRegion}
                </p>
                <h1 id="tour-list-heading" className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:sr-only">
                  {t.ourTours}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:hidden">
                  {CATALOG_COPY[lang].intro}
                </p>
              </div>
              <aside className="hidden max-w-[380px] items-center gap-3 rounded-xl border border-turquoise/20 bg-night/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground sm:mt-12 sm:flex">
                <span>{CATALOG_COPY[lang].galleryHint}</span>
                <ArrowLeftRight className="h-4 w-4 shrink-0 text-turquoise-glow" aria-hidden="true" />
              </aside>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {options.map((opt, i) => (
              <article
                key={opt.key}
                style={{ animationDelay: `${i * 70}ms`, order: cmsByKey.get(opt.key)?.ordem ?? 999 }}
                className="group glass-card flex flex-col overflow-hidden rounded-2xl border border-turquoise/15 bg-gradient-to-b from-night/65 to-night shadow-[0_18px_42px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-turquoise/45 hover:shadow-[0_24px_50px_rgba(0,0,0,0.28)] animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <TourMediaGallery
                    images={[opt.image, ...(cmsByKey.get(opt.key)?.gallery_imagens ?? [])]}
                    alt={opt.title}
                    showMobileControls
                    mobileAspect
                    catalogLabels={{
                      desktop: CATALOG_COPY[lang].galleryCaptionDesktop,
                      mobile: CATALOG_COPY[lang].galleryCaptionMobile,
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/65 via-night/10 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-3 flex min-h-6 flex-wrap items-center gap-2">
                    {FEATURED_BADGES[opt.key] && (
                      <TourBadge type={FEATURED_BADGES[opt.key]} lang={lang} />
                    )}
                    {opt.adultsOnly && (
                      <span className="inline-flex items-center rounded-md bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                        +18
                      </span>
                    )}
                    {(() => {
                      const c = cmsByKey.get(opt.key);
                      return c?.badge && !FEATURED_BADGES[opt.key] ? <TourBadge type={c.badge} lang={lang} /> : null;
                    })()}
                    {COUPON_ELIGIBLE.has(opt.key) && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-200">
                        <Tag className="h-3 w-3 shrink-0" aria-hidden="true" />
                        {CATALOG_COPY[lang].couponLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">{opt.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-snug flex-1">{cleanTourDescription(opt.desc)}</p>

                  {getCmsTourPriceStatus(opt.key) === "ready" ? (() => {
                    const tourQr = qrPromoForTour(qr, opt.key);
                    if (!tourQr) return (
                      <div className="mt-4">
                        <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                          {CATALOG_COPY[lang].paymentHeading}
                        </p>
                        <PaymentPriceDisplay
                          cashPixPrice={TOUR_PRICES[opt.key].value}
                          from={TOUR_PRICES[opt.key].from}
                          lang={lang}
                          size="sm"
                          variant="cards"
                        />
                      </div>
                    );
                    const meta = TOUR_PRICES[opt.key];
                    const orig = meta.value;
                    const disc = orig - (orig * tourQr.percent) / 100;
                    return (
                      <div className="mt-4">
                        <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                          {CATALOG_COPY[lang].paymentHeading}
                        </p>
                        <div className="mb-2 text-[10px] text-muted-foreground line-through leading-none">
                          {meta.from ? `A partir de ${formatBRL(orig)}` : formatBRL(orig)}
                        </div>
                        <PaymentPriceDisplay cashPixPrice={disc} from={meta.from} lang={lang} size="sm" variant="cards" />
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-200">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          {CATALOG_COPY[lang].promotionLabel}
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="mt-3 text-sm text-muted-foreground">
                      <p role="status">{tourPriceStatusText(getCmsTourPriceStatus(opt.key), lang)}</p>
                      {getCmsTourPriceStatus(opt.key) === "error" && (
                        <button type="button" className="mt-1 underline" onClick={() => void forceRefreshCms.tours()}>
                          {lang === "pt" ? "Tentar novamente" : lang === "es" ? "Intentar de nuevo" : lang === "fr" ? "Réessayer" : lang === "it" ? "Riprova" : "Try again"}
                        </button>
                      )}
                    </div>
                  )}

                  {(() => {
                    const c = cmsByKey.get(opt.key);
                    return c?.urgencia ? <UrgencyTag text={c.urgencia} className="mt-2" /> : null;
                  })()}

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openDetails(opt.key)}
                      className="min-h-10 w-full rounded-xl border border-turquoise/35 bg-night/55 px-2 py-2 text-xs font-semibold text-foreground transition-colors hover:border-turquoise/70 hover:bg-turquoise/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise sm:text-sm"
                    >
                      {t.viewDetails}
                    </button>
                    <button
                      type="button"
                      onClick={() => openForm(opt.key)}
                      disabled={getCmsTourPriceStatus(opt.key) !== "ready"}
                      className="rgb-border block w-full disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`${t.bookNowBtn} — ${opt.title}`}
                    >
                      <span className="flex min-h-10 items-center justify-center gap-1 rounded-[0.65rem] bg-gradient-to-r from-turquoise to-[#24b7b5] px-2 py-2 text-xs font-bold text-night transition-all hover:brightness-110 sm:text-sm">
                        {t.bookNowBtn}
                        <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {(cmsTours || []).filter((c) => c.ativo && !isTourKey(c.key)).map((c) => {
              const title = pickLang(c, "nome", lang) || c.nome_pt;
              return (
                <article key={c.key} style={{ order: c.ordem }} className="group glass-card flex flex-col overflow-hidden rounded-2xl border border-turquoise/15 bg-gradient-to-b from-night/65 to-night shadow-[0_18px_42px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-turquoise/45 hover:shadow-[0_24px_50px_rgba(0,0,0,0.28)]">
                  <div className="relative overflow-hidden">
                    <TourMediaGallery
                      images={[c.imagem_url, ...c.gallery_imagens].filter((u): u is string => !!u)}
                      alt={title}
                      showMobileControls
                      mobileAspect
                      catalogLabels={{
                        desktop: CATALOG_COPY[lang].galleryCaptionDesktop,
                        mobile: CATALOG_COPY[lang].galleryCaptionMobile,
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/65 via-night/10 to-transparent" />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    {c.badge && (
                      <div className="mb-3 flex min-h-6 flex-wrap items-center gap-2">
                        <TourBadge type={c.badge} lang={lang} />
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-foreground leading-tight">{title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-snug flex-1">{cleanTourDescription(pickLang(c, "descricao", lang))}</p>
                    {c.preco > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                          {CATALOG_COPY[lang].paymentHeading}
                        </p>
                        <PaymentPriceDisplay cashPixPrice={c.preco} lang={lang} size="sm" variant="cards" />
                      </div>
                    )}
                    {c.urgencia && <UrgencyTag text={c.urgencia} className="mt-2" />}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => routeNavigate(`/passeios/${c.key}`)} className="min-h-10 w-full rounded-xl border border-turquoise/35 bg-night/55 px-2 py-2 text-xs font-semibold text-foreground transition-colors hover:border-turquoise/70 hover:bg-turquoise/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise sm:text-sm">
                        {t.viewDetails}
                      </button>
                      {isLunchCmsTour(c) ? (
                      <button type="button" onClick={() => routeNavigate(`/passeios/${c.key}?reservar=1`)} className="rgb-border block w-full" aria-label={`${t.bookNowBtn} — ${title}`}>
                          <span className="flex min-h-10 items-center justify-center gap-1 rounded-[0.65rem] bg-gradient-to-r from-turquoise to-[#24b7b5] px-2 py-2 text-xs font-bold text-night transition-all hover:brightness-110 sm:text-sm">{t.bookNowBtn}<ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /></span>
                        </button>
                      ) : (
                        <CmsBookingTermsLink href={cmsTourWhatsAppUrl(c)} tourKey={c.key} lang={lang} className="rgb-border block w-full" ariaLabel={`${t.bookNowBtn} — ${title}`}>
                          <span className="flex min-h-10 items-center justify-center gap-1 rounded-[0.65rem] bg-gradient-to-r from-turquoise to-[#24b7b5] px-2 py-2 text-xs font-bold text-night transition-all hover:brightness-110 sm:text-sm">{t.bookNowBtn}<ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /></span>
                        </CmsBookingTermsLink>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="text-center mt-14 text-xs text-muted-foreground/70">
          © {t.brand} · {t.footerRegion}
        </footer>
      </div>
    </main></PageTransition>
    </>
  );
};

export default Index;

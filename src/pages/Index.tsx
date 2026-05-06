import { useEffect, useState } from "react";
import { Lang, dict } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";


import { StandardForm } from "@/components/StandardForm";
import { TourDetails } from "@/components/TourDetails";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { TourKey } from "@/lib/tours";
import { Star, Tag } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { PromoBanner } from "@/components/PromoBanner";
import { COUPON_ELIGIBLE, tourPriceLabel } from "@/lib/prices";
import nathanProfile from "@/assets/nathan-profile.jpg";
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



const serialize = (s: Screen): string => (typeof s === "string" ? s : `details-${s.details}`);
const deserialize = (s: string): Screen => {
  if (s === "menu") return "menu";
  if (s.startsWith("details-")) return { details: s.slice(8) as TourKey };
  return s as FormScreen;
};

const Index = () => {
  const [lang, setLang] = useState<Lang>("pt");
  const [screen, setScreen] = useState<Screen>("menu");
  const t = dict[lang];

  // Browser/Android back-button support via history API
  useEffect(() => {
    if (!window.history.state || !window.history.state.screen) {
      window.history.replaceState({ screen: "menu" }, "");
    }
    const onPop = (e: PopStateEvent) => {
      const code = e.state?.screen ?? "menu";
      setScreen(deserialize(code));
      // Reset scroll on back/forward navigation
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (next: Screen) => {
    window.history.pushState({ screen: serialize(next) }, "");
    setScreen(next);
    // Always start the next page from the top
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  };

  const back = () => window.history.back();
  const openDetails = (key: TourKey) => navigate({ details: key });
  const openForm = (key: TourKey) => navigate(`form-${key}` as FormScreen);

  // Details screen
  if (typeof screen === "object" && "details" in screen) {
    return (
      <>
        <PromoBanner lang={lang} />
        <div className="pt-12">
          <PageTransition key={`details-${screen.details}`}>
            <TourDetails
              tourKey={screen.details}
              lang={lang}
              onLangChange={setLang}
              onBack={back}
              onBook={() => openForm(screen.details)}
            />
          </PageTransition>
        </div>
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
  const options: Opt[] = [
    { key: "escuna", image: escunaImg, title: t.optEscuna, desc: t.descEscuna },
    { key: "arraial", image: arraialImg, title: t.optArraial, desc: t.descArraial },
    { key: "buggy", image: buggyImg, title: t.optBuggy, desc: t.descBuggy },
    { key: "cabofrio", image: caboFrioImg, title: t.optCaboFrio, desc: t.descCaboFrio },
    { key: "jardineira", image: jardineiraImg, title: t.optJardineira, desc: t.descJardineira },
    { key: "catamara", image: catamaraImg, title: t.optCatamara, desc: t.descCatamara },
    { key: "mergulho", image: mergulhoImg, title: t.optMergulho, desc: t.descMergulho, adultsOnly: true },
    { key: "lancha", image: lanchaImg, title: t.optLancha, desc: t.descLancha },
  ];

  

  return (
    <>
    <PromoBanner lang={lang} />
    <PageTransition key="menu"><main className="relative min-h-screen px-4 pt-16 sm:pt-20 py-6 sm:py-10 overflow-hidden">
      {/* Background videos: mobile + desktop */}
      <video
        className="pointer-events-none fixed inset-0 z-0 w-full h-full object-cover object-center"
        src="/videos/ocean-desktop.mp4"
        autoPlay loop muted playsInline preload="auto" aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-night/85 via-deep-blue/80 to-night/90"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-turquoise/40 shadow-[0_0_12px_hsl(var(--turquoise)/0.4)]">
              <img src={nathanProfile} alt="Nathan" className="w-full h-full object-cover" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-foreground">Nathan</div>
              <div className="text-[11px] text-muted-foreground">{t.brandSubtitle}</div>
            </div>
          </div>
          <LanguageSwitcher lang={lang} onChange={setLang} />
        </div>

        {/* Hero */}
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-3 duration-700">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 -m-3 rounded-full bg-turquoise/20 blur-2xl" aria-hidden />
            <div className="relative w-32 h-32 rounded-full border-2 border-turquoise/40 p-1 bg-night/50 backdrop-blur-sm">
              <img src={nathanProfile} alt="Nathan" className="w-full h-full rounded-full object-cover" />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-night shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-2 leading-tight">
            <span
              className="bg-gradient-to-r from-turquoise via-turquoise-glow to-turquoise bg-clip-text text-transparent"
              style={{ filter: "drop-shadow(0 3px 12px rgba(0,0,0,0.85))" }}
            >
              Nathan
            </span>
          </h1>
          <p className="float-soft text-turquoise-glow text-base sm:text-lg font-medium mb-5">{t.brandSubtitle}</p>
          <p className="float-soft text-sm sm:text-base text-foreground/80 leading-relaxed max-w-xl mx-auto px-2" style={{ animationDelay: "1.2s" }}>
            {t.welcome}
          </p>
        </header>

        {/* Tours */}
        <section id="tours">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-turquoise text-xl">≋</span>
            <h2 className="text-2xl font-bold text-foreground">{t.ourTours}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {options.map((opt, i) => (
              <article
                key={opt.key}
                style={{ animationDelay: `${i * 70}ms` }}
                className="group glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-turquoise/60 hover:-translate-y-1 hover:turquoise-glow animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={opt.image}
                    alt={opt.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent" />
                  {opt.adultsOnly && (
                    <span className="absolute top-3 left-3 inline-flex items-center rounded-md bg-rose-500/90 px-2 py-0.5 text-[11px] font-bold text-white shadow">
                      +18
                    </span>
                  )}
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md bg-night/70 backdrop-blur px-2 py-0.5 text-xs font-semibold text-foreground border border-turquoise/30">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    4.8
                  </span>
                  {COUPON_ELIGIBLE.has(opt.key) && (
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-amber-400/95 px-2 py-0.5 text-[10px] font-extrabold text-night uppercase tracking-wider shadow-lg coupon-blink">
                      <Tag className="w-3 h-3" /> Cupom de desconto aplicável!!
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-foreground leading-tight">{opt.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-snug flex-1">{opt.desc}</p>

                  <p className="float-soft mt-3 text-2xl font-extrabold bg-gradient-to-r from-turquoise to-turquoise-glow bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    {tourPriceLabel(opt.key, lang)}
                  </p>

                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => openDetails(opt.key)}
                      className="w-full rounded-xl border border-turquoise/40 bg-turquoise/10 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-turquoise/20 hover:border-turquoise/70 transition-colors"
                    >
                      {t.viewDetails}
                    </button>
                    <button
                      type="button"
                      onClick={() => openForm(opt.key)}
                      className="rgb-border w-full block"
                      aria-label={`${t.bookNowBtn} — ${opt.title}`}
                    >
                      <span className="flex items-center justify-center gap-1.5 rounded-[0.65rem] bg-gradient-to-r from-deep-blue to-night px-4 py-2.5 text-sm font-bold text-foreground">
                        ✨ {t.bookNowBtn}
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="text-center mt-14 text-xs text-muted-foreground/70">
          © Nathan {t.brandSubtitle} · {t.footerRegion}
        </footer>
      </div>
      <WhatsAppFab lang={lang} />
    </main></PageTransition>
    </>
  );
};

export default Index;

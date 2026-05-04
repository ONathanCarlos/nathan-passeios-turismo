import { useEffect, useState } from "react";
import { Lang, dict } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { EscunaForm } from "@/components/EscunaForm";

import { StandardForm } from "@/components/StandardForm";
import { TourDetails } from "@/components/TourDetails";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { TourKey } from "@/lib/tours";
import { Star } from "lucide-react";
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
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (next: Screen) => {
    window.history.pushState({ screen: serialize(next) }, "");
    setScreen(next);
  };

  const back = () => window.history.back();
  const openDetails = (key: TourKey) => navigate({ details: key });
  const openForm = (key: TourKey) => navigate(`form-${key}` as FormScreen);

  // Details screen
  if (typeof screen === "object" && "details" in screen) {
    return (
      <TourDetails
        tourKey={screen.details}
        lang={lang}
        onLangChange={setLang}
        onBack={back}
        onBook={() => openForm(screen.details)}
      />
    );
  }

  // Booking forms
  if (screen === "form-escuna") return <EscunaForm lang={lang} onLangChange={setLang} onBack={back} />;
  if (screen === "form-arraial")
    return <StandardForm lang={lang} onLangChange={setLang} onBack={back} title={t.optArraial} backgroundImage={arraialImg} requirePousada notice="Taxas de Jardineira e de Embarque, bebidas e sobremesas não inclusas." />;
  if (screen === "form-buggy")
    return <StandardForm lang={lang} onLangChange={setLang} onBack={back} title={t.optBuggy} backgroundImage={buggyImg} />;
  if (screen === "form-cabofrio")
    return <StandardForm lang={lang} onLangChange={setLang} onBack={back} title="Passeio em Cabo Frio" backgroundImage={caboFrioImg} requirePousada notice="Barco táxi até a Ilha do Japonês, bebidas e sobremesas do almoço não inclusos." />;
  if (screen === "form-catamara")
    return <StandardForm lang={lang} onLangChange={setLang} onBack={back} title={t.optCatamara} backgroundImage={catamaraImg} requireCpf notice="Não é permitido levar coolers, caixas ou bolsas térmicas para a embarcação." />;
  if (screen === "form-jardineira")
    return <StandardForm lang={lang} onLangChange={setLang} onBack={back} title={t.optJardineira} backgroundImage={jardineiraImg} />;
  if (screen === "form-mergulho")
    return <StandardForm lang={lang} onLangChange={setLang} onBack={back} title={t.optMergulho} backgroundImage={mergulhoImg} adultsOnly notice={t.adultsOnlyNotice} />;
  if (screen === "form-lancha")
    return <StandardForm lang={lang} onLangChange={setLang} onBack={back} title={t.optLancha} backgroundImage={lanchaImg} />;

  type Opt = { key: TourKey; image: string; title: string; desc: string; adultsOnly?: boolean };
  const options: Opt[] = [
    { key: "escuna", image: escunaImg, title: "Passeio de Escuna", desc: "Dois decks, dois toboáguas, 11 praias e 3 ilhas em 2h30 de puro lazer." },
    { key: "arraial", image: arraialImg, title: "Arraial do Cabo", desc: "Dia completo com translado, escuna 3h30 e almoço buffet livre." },
    { key: "buggy", image: buggyImg, title: "Passeio de Buggy", desc: "8 praias e 3 mirantes em 1h30 de aventura pelas dunas de Búzios." },
    { key: "cabofrio", image: caboFrioImg, title: "Cabo Frio", desc: "Passeio terrestre com guia bilíngue, almoço e Shopping Park Lagos." },
    { key: "jardineira", image: jardineiraImg, title: "Passeio de Jardineira", desc: "12 praias, 2 mirantes e banho na Praia do Forno em 2 horas." },
    { key: "catamara", image: catamaraImg, title: "Passeio de Catamarã", desc: "12 praias, 3 ilhas, DJ a bordo e 3 paradas para banho em 2h30." },
    { key: "mergulho", image: mergulhoImg, title: "Mergulho", desc: "Experiência de mergulho com instrutor certificado. Fotos e vídeo inclusos.", adultsOnly: true },
    { key: "lancha", image: lanchaImg, title: "Lancha Privada", desc: "Experiência privativa premium com 10 praias, 3 ilhas e churrasco." },
  ];

  

  return (
    <main className="relative min-h-screen px-4 py-6 sm:py-10 overflow-hidden">
      {/* Background video */}
      <video
        className="pointer-events-none fixed inset-0 z-0 w-full h-full object-cover"
        src="/videos/ocean-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
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
              <div className="text-[11px] text-muted-foreground">Passeios e Turismo</div>
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
          <p className="text-turquoise-glow text-base sm:text-lg font-medium mb-5">Passeios e Turismo</p>
          <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-xl mx-auto px-2">
            {t.welcome}
          </p>
        </header>

        {/* Tours */}
        <section id="tours">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-turquoise text-xl">≋</span>
            <h2 className="text-2xl font-bold text-foreground">Nossos Passeios</h2>
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
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-foreground leading-tight">{opt.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-snug flex-1">{opt.desc}</p>

                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => openDetails(opt.key)}
                      className="w-full rounded-xl border border-turquoise/40 bg-turquoise/10 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-turquoise/20 hover:border-turquoise/70 transition-colors"
                    >
                      Ver Detalhes
                    </button>
                    <button
                      type="button"
                      onClick={() => openForm(opt.key)}
                      className="rgb-border w-full block"
                      aria-label={`Reservar agora — ${opt.title}`}
                    >
                      <span className="flex items-center justify-center gap-1.5 rounded-[0.65rem] bg-gradient-to-r from-deep-blue to-night px-4 py-2.5 text-sm font-bold text-foreground">
                        ✨ Reservar agora
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="text-center mt-14 text-xs text-muted-foreground/70">
          © Nathan Passeios e Turismo · Búzios &amp; Região dos Lagos
        </footer>
      </div>
      <WhatsAppFab lang={lang} />
    </main>
  );
};

export default Index;

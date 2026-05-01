import { useState } from "react";
import { Lang, dict } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { EscunaForm } from "@/components/EscunaForm";
import { ArraialForm } from "@/components/ArraialForm";
import { StandardForm } from "@/components/StandardForm";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import nathanProfile from "@/assets/nathan-profile.jpg";
import arraialImg from "@/assets/arraial-do-cabo.jpg";
import escunaImg from "@/assets/escuna.jpg";
import buggyImg from "@/assets/buggy.jpg";
import catamaraImg from "@/assets/catamara.jpg";
import jardineiraImg from "@/assets/jardineira.jpg";
import mergulhoImg from "@/assets/mergulho.jpg";
import lanchaImg from "@/assets/lancha.jpg";

type Screen = "menu" | "escuna" | "arraial" | "buggy" | "catamara" | "jardineira" | "mergulho" | "lancha";

const Index = () => {
  const [lang, setLang] = useState<Lang>("pt");
  const [screen, setScreen] = useState<Screen>("menu");
  const t = dict[lang];

  const back = () => setScreen("menu");

  if (screen === "escuna") return <EscunaForm lang={lang} onLangChange={setLang} onBack={back} />;
  if (screen === "arraial") return <ArraialForm lang={lang} onLangChange={setLang} onBack={back} />;
  if (screen === "buggy")
    return <StandardForm lang={lang} onLangChange={setLang} onBack={back} title={t.optBuggy} backgroundImage={buggyImg} />;
  if (screen === "catamara")
    return <StandardForm lang={lang} onLangChange={setLang} onBack={back} title={t.optCatamara} backgroundImage={catamaraImg} requireCpf />;
  if (screen === "jardineira")
    return <StandardForm lang={lang} onLangChange={setLang} onBack={back} title={t.optJardineira} backgroundImage={jardineiraImg} />;
  if (screen === "mergulho")
    return <StandardForm lang={lang} onLangChange={setLang} onBack={back} title={t.optMergulho} backgroundImage={mergulhoImg} adultsOnly notice={t.adultsOnlyNotice} />;
  if (screen === "lancha")
    return <StandardForm lang={lang} onLangChange={setLang} onBack={back} title={t.optLancha} backgroundImage={lanchaImg} />;

  const options = [
    { key: "escuna" as const, image: escunaImg, title: t.optEscuna, desc: t.optEscunaDesc },
    { key: "arraial" as const, image: arraialImg, title: t.optArraial, desc: t.optArraialDesc },
    { key: "buggy" as const, image: buggyImg, title: t.optBuggy, desc: t.optBuggyDesc },
    { key: "catamara" as const, image: catamaraImg, title: t.optCatamara, desc: t.optCatamaraDesc },
    { key: "jardineira" as const, image: jardineiraImg, title: t.optJardineira, desc: t.optJardineiraDesc },
    { key: "mergulho" as const, image: mergulhoImg, title: t.optMergulho, desc: t.optMergulhoDesc },
    { key: "lancha" as const, image: lanchaImg, title: t.optLancha, desc: t.optLanchaDesc },
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-xl">
        <div className="flex justify-end mb-8">
          <LanguageSwitcher lang={lang} onChange={setLang} />
        </div>

        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-3 duration-700">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-turquoise to-turquoise-glow mb-5 turquoise-glow overflow-hidden p-1">
            <img
              src={nathanProfile}
              alt="Nathan - Passeios e Turismo"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 leading-tight">
            <span
              className="bg-gradient-to-r from-turquoise via-turquoise-glow to-turquoise bg-clip-text text-transparent"
              style={{ filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.85)) drop-shadow(0 1px 2px rgba(0,0,0,0.9))" }}
            >
              Nathan
            </span>
            <br />
            <span className="text-foreground text-2xl sm:text-3xl font-semibold">
              Passeios e Turismo
            </span>
          </h1>
          <p className="text-muted-foreground italic mb-4">{t.tagline}</p>
          <p className="text-sm text-foreground/85 leading-relaxed max-w-md mx-auto px-2">
            {t.welcome}
          </p>
        </header>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-1">{t.menuTitle}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t.menuSubtitle}</p>

          <div className="space-y-3">
            {options.map((opt, i) => (
              <button
                key={opt.key}
                onClick={() => setScreen(opt.key)}
                style={{ animationDelay: `${i * 80}ms` }}
                className="group glass-card w-full rounded-2xl p-5 text-left transition-all duration-300 hover:border-turquoise/60 hover:translate-x-1 hover:turquoise-glow animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-turquoise/15 border border-turquoise/30 flex items-center justify-center overflow-hidden">
                    <img src={opt.image} alt={opt.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-turquoise">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground text-lg leading-tight">
                      {opt.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                  <div className="text-turquoise text-xl group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <footer className="text-center mt-12 text-xs text-muted-foreground/70">
          © Nathan Passeios e Turismo · Arraial do Cabo
        </footer>
      </div>
      <WhatsAppFab lang={lang} />
    </main>
  );
};

export default Index;

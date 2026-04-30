import { useState } from "react";
import { Lang, dict } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { EscunaForm } from "@/components/EscunaForm";
import { ArraialForm } from "@/components/ArraialForm";
import { PageShell } from "@/components/PageShell";
import { Sailboat, MapPin, Anchor } from "lucide-react";

type Screen = "menu" | "escuna" | "arraial";

const Index = () => {
  const [lang, setLang] = useState<Lang>("pt");
  const [screen, setScreen] = useState<Screen>("menu");
  const t = dict[lang];

  if (screen === "escuna")
    return <EscunaForm lang={lang} onLangChange={setLang} onBack={() => setScreen("menu")} />;
  if (screen === "arraial")
    return <ArraialForm lang={lang} onLangChange={setLang} onBack={() => setScreen("menu")} />;

  const options = [
    { key: "escuna" as const, icon: Sailboat, title: t.optEscuna, desc: t.optEscunaDesc },
    { key: "arraial" as const, icon: MapPin, title: t.optArraial, desc: t.optArraialDesc },
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-xl">
        <div className="flex justify-end mb-8">
          <LanguageSwitcher lang={lang} onChange={setLang} />
        </div>

        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-3 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-turquoise to-turquoise-glow mb-5 turquoise-glow">
            <Anchor className="h-10 w-10 text-night" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 leading-tight">
            <span className="bg-gradient-to-r from-turquoise via-turquoise-glow to-turquoise bg-clip-text text-transparent">
              Nathan
            </span>
            <br />
            <span className="text-foreground text-2xl sm:text-3xl font-semibold">
              Passeios e Turismo
            </span>
          </h1>
          <p className="text-muted-foreground italic">{t.tagline}</p>
        </header>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-1">{t.menuTitle}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t.menuSubtitle}</p>

          <div className="space-y-3">
            {options.map((opt, i) => (
              <button
                key={opt.key}
                onClick={() => setScreen(opt.key)}
                style={{ animationDelay: `${i * 100}ms` }}
                className="group glass-card w-full rounded-2xl p-5 text-left transition-all duration-300 hover:border-turquoise/60 hover:translate-x-1 hover:turquoise-glow animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-turquoise/15 border border-turquoise/30 flex items-center justify-center group-hover:bg-turquoise group-hover:text-night transition-all">
                    <opt.icon className="h-7 w-7 text-turquoise group-hover:text-night transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-turquoise">0{options.indexOf(opt) + 1}</span>
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
    </main>
  );
};

export default Index;

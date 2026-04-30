import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Lang, dict } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface Props {
  title: string;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onBack: () => void;
  children: ReactNode;
  backgroundImage?: string;
}

export const PageShell = ({ title, lang, onLangChange, onBack, children, backgroundImage }: Props) => {
  const t = dict[lang];
  return (
    <div className="relative min-h-screen">
      {backgroundImage && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
        >
          <div
            className="h-full"
            style={{
              aspectRatio: "9 / 16",
              maxWidth: "100vw",
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.45, // 55% transparency
            }}
          />
          <div className="absolute inset-0 bg-deep-blue/40" />
        </div>
      )}

      <div className="relative z-10 px-4 py-6 sm:py-10">
        <div className="mx-auto max-w-xl">
          <header className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-foreground hover:text-turquoise hover:bg-turquoise/10 -ml-2 backdrop-blur-sm bg-night/30 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t.back}
            </Button>
            <LanguageSwitcher lang={lang} onChange={onLangChange} />
          </header>
          <h1 className="text-3xl sm:text-4xl font-bold mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <span className="bg-gradient-to-r from-turquoise to-turquoise-glow bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          <p className="text-foreground/95 mb-8 text-sm font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">{t.brand}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

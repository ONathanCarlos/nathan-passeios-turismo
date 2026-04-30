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
}

export const PageShell = ({ title, lang, onLangChange, onBack, children }: Props) => {
  const t = dict[lang];
  return (
    <div className="min-h-screen px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-xl">
        <header className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-foreground/80 hover:text-turquoise hover:bg-turquoise/10 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t.back}
          </Button>
          <LanguageSwitcher lang={lang} onChange={onLangChange} />
        </header>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
          <span className="bg-gradient-to-r from-turquoise to-turquoise-glow bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">{t.brand}</p>
        {children}
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { Lang, LANG_LABELS, dict } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

interface Props {
  lang: Lang;
  onChange: (l: Lang) => void;
}

const ROTATION_ORDER: Lang[] = ["pt", "es", "en", "fr", "it"];

// Localized "select your language" hints (independent of current UI lang)
const SELECT_HINT: Record<Lang, string> = {
  pt: "Selecione seu idioma",
  es: "Selecciona tu idioma",
  en: "Select your language",
  fr: "Sélectionnez votre langue",
  it: "Seleziona la tua lingua",
};

export const LanguageSwitcher = ({ lang, onChange }: Props) => {
  const [hintIdx, setHintIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setHintIdx((i) => (i + 1) % ROTATION_ORDER.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const hintLang = ROTATION_ORDER[hintIdx];

  return (
    <div className="flex flex-col items-end gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rgb-border block"
            aria-label="Language selector"
          >
            <span className="flex items-center gap-2 rounded-[0.6rem] bg-card/90 px-3 py-2 text-sm font-medium text-foreground backdrop-blur hover:bg-card transition-colors">
              <Globe className="h-4 w-4 text-turquoise" />
              <span className="text-base leading-none">{LANG_LABELS[lang].flag}</span>
              <span className="hidden sm:inline">{LANG_LABELS[lang].name}</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur border-turquoise/30">
          {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
            <DropdownMenuItem
              key={l}
              onClick={() => onChange(l)}
              className="gap-2 cursor-pointer focus:bg-turquoise/15 focus:text-turquoise"
            >
              <span className="text-lg">{LANG_LABELS[l].flag}</span>
              <span>{LANG_LABELS[l].name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <span
        key={hintLang}
        className="text-[11px] sm:text-xs text-foreground/85 font-medium tracking-wide animate-in fade-in slide-in-from-top-1 duration-500"
      >
        {LANG_LABELS[hintLang].flag} {SELECT_HINT[hintLang]}
      </span>
    </div>
  );
};

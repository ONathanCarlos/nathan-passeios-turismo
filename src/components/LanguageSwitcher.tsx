import { Lang, LANG_LABELS } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface Props {
  lang: Lang;
  onChange: (l: Lang) => void;
}

export const LanguageSwitcher = ({ lang, onChange }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-turquoise/40 bg-card/60 backdrop-blur hover:bg-turquoise/10 hover:text-turquoise"
        >
          <Globe className="h-4 w-4" />
          <span className="text-base leading-none">{LANG_LABELS[lang].flag}</span>
          <span className="hidden sm:inline">{LANG_LABELS[lang].name}</span>
        </Button>
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
  );
};

import * as React from "react";
import { format } from "date-fns";
import { ptBR, es, enUS, fr, it } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lang, dict } from "@/lib/i18n";

const locales: Record<Lang, typeof ptBR> = { pt: ptBR, es, en: enUS, fr, it };

interface Props {
  lang: Lang;
  value?: Date;
  onChange: (d: Date | undefined) => void;
  error?: boolean;
}

export const TourDatePicker = ({ lang, value, onChange, error }: Props) => {
  const t = dict[lang];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full h-12 justify-start text-left font-normal bg-night/70 backdrop-blur-sm border-turquoise/40 text-foreground hover:bg-night/80 hover:text-foreground",
            !value && "text-foreground/50",
            error && "border-rose-500",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-turquoise" />
          {value ? format(value, "PPP", { locale: locales[lang] }) : <span>{t.pickDate}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-card border-turquoise/30" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          locale={locales[lang]}
          disabled={(d) => d < today}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
};

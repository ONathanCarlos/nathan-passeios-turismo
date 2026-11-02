import * as React from "react";
import { format } from "date-fns";
import { ptBR, es, enUS, fr, it } from "date-fns/locale";
import { CalendarIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lang, dict } from "@/lib/i18n";
import { isCruiseDate } from "@/lib/cruiseEmbarkation";

const locales: Record<Lang, typeof ptBR> = { pt: ptBR, es, en: enUS, fr, it };

const CONFIRM: Record<Lang, string> = {
  pt: "Confirmar Data", es: "Confirmar Fecha", en: "Confirm Date",
  fr: "Confirmer la Date", it: "Conferma Data",
};

const LEGEND: Record<Lang, { today: string; selected: string; cruise: string }> = {
  pt: { today: "Hoje", selected: "Data escolhida", cruise: "Dia de cruzeiro" },
  es: { today: "Hoy", selected: "Fecha elegida", cruise: "Día de crucero" },
  en: { today: "Today", selected: "Selected date", cruise: "Cruise date" },
  fr: { today: "Aujourd'hui", selected: "Date choisie", cruise: "Jour de croisière" },
  it: { today: "Oggi", selected: "Data scelta", cruise: "Giorno di crociera" },
};

const LEGEND_LABEL: Record<Lang, string> = {
  pt: "Legenda do calendário", es: "Leyenda del calendario", en: "Calendar legend",
  fr: "Légende du calendrier", it: "Legenda del calendario",
};

interface Props {
  lang: Lang;
  value?: Date;
  onChange: (d: Date | undefined) => void;
  error?: boolean;
  showCruiseDates?: boolean;
}

export const TourDatePicker = ({ lang, value, onChange, error, showCruiseDates = false }: Props) => {
  const t = dict[lang];
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Date | undefined>(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  React.useEffect(() => { if (open) setDraft(value); }, [open, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          selected={draft}
          onSelect={setDraft}
          locale={locales[lang]}
          disabled={(d) => d < today}
          modifiers={showCruiseDates ? { cruiseDate: (d) => isCruiseDate(d) } : {}}
          modifiersStyles={{
            ...(showCruiseDates ? { cruiseDate: { outline: "2px solid #e5b94f", outlineOffset: "-3px", borderRadius: "9999px" } } : {}),
            today: { boxShadow: "inset 0 0 0 2px #66d9ef", borderRadius: "9999px" },
          }}
          classNames={{
            day_today: "bg-transparent font-bold",
            day_selected: "bg-turquoise text-night hover:bg-turquoise hover:text-night focus:bg-turquoise focus:text-night",
          }}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
        <div role="group" aria-label={LEGEND_LABEL[lang]} className="flex flex-wrap justify-center gap-x-3 gap-y-2 px-3 pb-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><i aria-hidden="true" className="h-3 w-3 rounded-full border-2 border-cyan-300" />{LEGEND[lang].today}</span>
          <span className="inline-flex items-center gap-1.5"><i aria-hidden="true" className="h-3 w-3 rounded-full bg-turquoise" />{LEGEND[lang].selected}</span>
          {showCruiseDates && <span className="inline-flex items-center gap-1.5"><i aria-hidden="true" className="h-3 w-3 rounded-full border-2 border-amber-300" />{LEGEND[lang].cruise}</span>}
        </div>
        <div className="p-2 border-t border-turquoise/20">
          <Button
            type="button"
            disabled={!draft}
            onClick={() => { onChange(draft); setOpen(false); }}
            className="w-full h-10 bg-gradient-to-r from-turquoise to-turquoise-glow text-night font-bold hover:opacity-90"
          >
            <Check className="h-4 w-4 mr-1" /> {CONFIRM[lang]}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

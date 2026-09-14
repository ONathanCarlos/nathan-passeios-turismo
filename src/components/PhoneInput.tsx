import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export interface PhoneValue {
  ddi: string; // e.g. "+55"
  number: string; // raw digits without ddi
}

const COUNTRIES: { code: string; flag: string; name: string }[] = [
  // South America
  { code: "+55", flag: "🇧🇷", name: "Brasil" },
  { code: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "+591", flag: "🇧🇴", name: "Bolivia" },
  { code: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "+57", flag: "🇨🇴", name: "Colombia" },
  { code: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "+595", flag: "🇵🇾", name: "Paraguay" },
  { code: "+51", flag: "🇵🇪", name: "Perú" },
  { code: "+598", flag: "🇺🇾", name: "Uruguay" },
  { code: "+58", flag: "🇻🇪", name: "Venezuela" },
  { code: "+592", flag: "🇬🇾", name: "Guyana" },
  { code: "+597", flag: "🇸🇷", name: "Suriname" },
  // North America
  { code: "+1", flag: "🇺🇸", name: "USA / Canada" },
  { code: "+52", flag: "🇲🇽", name: "México" },
  // Central America & Caribbean
  { code: "+502", flag: "🇬🇹", name: "Guatemala" },
  { code: "+503", flag: "🇸🇻", name: "El Salvador" },
  { code: "+504", flag: "🇭🇳", name: "Honduras" },
  { code: "+505", flag: "🇳🇮", name: "Nicaragua" },
  { code: "+506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+507", flag: "🇵🇦", name: "Panamá" },
  { code: "+501", flag: "🇧🇿", name: "Belize" },
  { code: "+53", flag: "🇨🇺", name: "Cuba" },
  { code: "+509", flag: "🇭🇹", name: "Haiti" },
  { code: "+1809", flag: "🇩🇴", name: "República Dominicana" },
  // Europe
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+34", flag: "🇪🇸", name: "España" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+39", flag: "🇮🇹", name: "Italia" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+49", flag: "🇩🇪", name: "Deutschland" },
  { code: "+31", flag: "🇳🇱", name: "Nederland" },
  { code: "+32", flag: "🇧🇪", name: "België" },
  { code: "+41", flag: "🇨🇭", name: "Schweiz" },
  { code: "+43", flag: "🇦🇹", name: "Österreich" },
  { code: "+45", flag: "🇩🇰", name: "Danmark" },
  { code: "+46", flag: "🇸🇪", name: "Sverige" },
  { code: "+47", flag: "🇳🇴", name: "Norge" },
  { code: "+358", flag: "🇫🇮", name: "Suomi" },
  { code: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "+30", flag: "🇬🇷", name: "Ελλάδα" },
  { code: "+48", flag: "🇵🇱", name: "Polska" },
  { code: "+420", flag: "🇨🇿", name: "Česko" },
  { code: "+36", flag: "🇭🇺", name: "Magyarország" },
  { code: "+40", flag: "🇷🇴", name: "România" },
  { code: "+359", flag: "🇧🇬", name: "България" },
  { code: "+385", flag: "🇭🇷", name: "Hrvatska" },
  { code: "+90", flag: "🇹🇷", name: "Türkiye" },
];

// Format raw digits into "DD DDD DDD DDDD..." groups: 2 + 3 + 3 + rest
export function formatPhoneDigits(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (!d) return "";
  const parts: string[] = [];
  parts.push(d.slice(0, 2));
  if (d.length > 2) parts.push(d.slice(2, 5));
  if (d.length > 5) parts.push(d.slice(5, 8));
  if (d.length > 8) parts.push(d.slice(8, 15));
  return parts.filter(Boolean).join(" ");
}

export function fullPhone(v: PhoneValue): string {
  if (!v.number) return "";
  return `${v.ddi} ${formatPhoneDigits(v.number)}`.trim();
}

interface Props {
  value: PhoneValue;
  onChange: (v: PhoneValue) => void;
  inputClassName?: string;
}

export const PhoneInput = ({ value, onChange, inputClassName }: Props) => {
  const formatted = useMemo(() => formatPhoneDigits(value.number), [value.number]);

  return (
    <div className="flex gap-2">
      <Select
        value={value.ddi}
        onValueChange={(ddi) => onChange({ ...value, ddi })}
      >
        <SelectTrigger className={`${inputClassName ?? ""} w-[7.5rem] sm:w-[10.5rem] flex-shrink-0`}>
          <SelectValue>
            {(() => {
              const c = COUNTRIES.find((x) => x.code === value.ddi);
              return c ? (
                <span className="flex items-center gap-1.5">
                  <span>{c.flag}</span>
                  <span className="font-mono text-sm">{c.code}</span>
                  <span className="hidden sm:inline text-muted-foreground text-[10px] uppercase">{c.name.slice(0, 6)}</span>
                </span>
              ) : value.ddi;
            })()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-card border-turquoise/30 max-h-72">
          {COUNTRIES.map((c) => (
            <SelectItem key={`${c.code}-${c.name}`} value={c.code}>
              <span className="mr-2">{c.flag}</span>
              <span className="font-mono">{c.code}</span>
              <span className="ml-2 text-muted-foreground text-xs">{c.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        value={formatted}
        onChange={(e) =>
          onChange({ ...value, number: e.target.value.replace(/\D/g, "").slice(0, 15) })
        }
        type="tel"
        inputMode="numeric"
        pattern="[0-9 ]*"
        placeholder="DDD + seu telefone"
        className={`${inputClassName ?? ""} flex-1 min-w-0`}
      />
    </div>
  );
};

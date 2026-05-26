// Bloco visual que compara valores avulsos vs preço do pacote e destaca economia.
import { formatBRL } from "@/lib/prices";
import type { Lang } from "@/lib/i18n";

interface Item {
  label: string;
  price: number;
}

interface Props {
  items: Item[];
  packagePrice: number;
  lang: Lang;
}

const L: Record<Lang, { title: string; sum: string; pack: string; save: string; sep: string }> = {
  pt: { title: "Você economiza", sum: "Total separado", pack: "Pacote promocional", save: "Economia", sep: "Valor avulso" },
  es: { title: "Tú ahorras", sum: "Total por separado", pack: "Paquete promocional", save: "Ahorro", sep: "Valor individual" },
  en: { title: "You save", sum: "Separate total", pack: "Promo package", save: "Savings", sep: "Individual price" },
  fr: { title: "Vous économisez", sum: "Total séparé", pack: "Forfait promo", save: "Économie", sep: "Prix individuel" },
  it: { title: "Risparmi", sum: "Totale separato", pack: "Pacchetto promo", save: "Risparmio", sep: "Prezzo singolo" },
};

export const SavingsBox = ({ items, packagePrice, lang }: Props) => {
  const sum = items.reduce((a, b) => a + b.price, 0);
  const saving = sum - packagePrice;
  if (items.length === 0 || saving <= 0) return null;
  const t = L[lang];
  return (
    <section className="glass-card rounded-2xl p-5 border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-transparent to-turquoise/10">
      <h3 className="text-sm uppercase tracking-wider font-bold text-amber-300 mb-3">✦ {t.title}</h3>
      <ul className="space-y-1.5 mb-3">
        {items.map((it, i) => (
          <li key={i} className="flex items-center justify-between text-sm text-foreground/85">
            <span>{it.label}</span>
            <span className="font-semibold tabular-nums">{formatBRL(it.price)}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-turquoise/20 pt-3 space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t.sum}</span>
          <span className="text-muted-foreground line-through tabular-nums">{formatBRL(sum)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/90 font-semibold">{t.pack}</span>
          <span className="font-bold text-turquoise-glow tabular-nums">{formatBRL(packagePrice)}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-amber-300 font-extrabold uppercase text-xs tracking-wider">✦ {t.save}</span>
          <span className="text-lg font-extrabold bg-gradient-to-r from-amber-300 to-emerald-300 bg-clip-text text-transparent tabular-nums">
            {formatBRL(saving)}
          </span>
        </div>
      </div>
    </section>
  );
};

interface PriceDisplayProps {
  price: number;
  originalPrice?: number | null;
  lang: Lang;
  size?: "sm" | "md" | "lg";
}

const PRICE_L: Record<Lang, { from: string; save: string }> = {
  pt: { from: "De", save: "Economize" },
  es: { from: "De", save: "Ahorra" },
  en: { from: "From", save: "Save" },
  fr: { from: "De", save: "Économisez" },
  it: { from: "Da", save: "Risparmia" },
};

/** Renderiza "De R$ X / por R$ Y / Economize R$ Z" quando há preço original. */
export const PriceWithDiscount = ({ price, originalPrice, lang, size = "md" }: PriceDisplayProps) => {
  const has = originalPrice && originalPrice > price;
  const t = PRICE_L[lang];
  const sz =
    size === "lg" ? "text-3xl sm:text-4xl" : size === "sm" ? "text-xl" : "text-2xl";
  return (
    <div className="space-y-0.5">
      {has && (
        <p className="text-xs text-muted-foreground/80">
          {t.from}{" "}
          <span className="line-through tabular-nums">{formatBRL(originalPrice!)}</span>
        </p>
      )}
      <p
        className={`font-extrabold bg-gradient-to-r from-amber-300 to-turquoise-glow bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${sz}`}
      >
        {formatBRL(price)}
      </p>
      {has && (
        <p className="text-[11px] font-bold text-emerald-300 inline-flex items-center gap-1">
          ✦ {t.save} {formatBRL(originalPrice! - price)}
        </p>
      )}
    </div>
  );
};

// Bloco visual que compara valores avulsos vs preço do pacote e destaca economia.
import { formatBRL } from "@/lib/prices";
import type { Lang } from "@/lib/i18n";
import { calculateCardPrice, PAYMENT_PRICE_LABELS } from "@/lib/paymentPricing";

interface Item {
  label: string;
  price: number;
}

interface Props {
  items: Item[];
  packagePrice: number;
  lang: Lang;
}

const L: Record<Lang, { title: string; sum: string; pack: string; save: string; sep: string; cashPixNote: string }> = {
  pt: { title: "Você economiza", sum: "Total separado", pack: "Pacote promocional", save: "Economia", sep: "Valor avulso", cashPixNote: "Comparação dos valores em dinheiro ou Pix." },
  es: { title: "Tú ahorras", sum: "Total por separado", pack: "Paquete promocional", save: "Ahorro", sep: "Valor individual", cashPixNote: "Comparación de precios en efectivo o Pix." },
  en: { title: "You save", sum: "Separate total", pack: "Promo package", save: "Savings", sep: "Individual price", cashPixNote: "Comparison uses cash or Pix prices." },
  fr: { title: "Vous économisez", sum: "Total séparé", pack: "Forfait promo", save: "Économie", sep: "Prix individuel", cashPixNote: "Comparaison des prix en espèces ou Pix." },
  it: { title: "Risparmi", sum: "Totale separato", pack: "Pacchetto promo", save: "Risparmio", sep: "Prezzo singolo", cashPixNote: "Confronto dei prezzi in contanti o Pix." },
};

export const SavingsBox = ({ items, packagePrice, lang }: Props) => {
  const sum = items.reduce((a, b) => a + b.price, 0);
  const saving = sum - packagePrice;
  if (items.length === 0 || saving <= 0) return null;
  const t = L[lang];
  return (
    <section className="glass-card rounded-2xl p-5 border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-transparent to-turquoise/10">
      <h3 className="text-sm uppercase tracking-wider font-bold text-amber-300 mb-3">✦ {t.title}</h3>
      <p className="mb-3 text-[11px] text-muted-foreground">{t.cashPixNote}</p>
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
  const paymentLabels = PAYMENT_PRICE_LABELS[lang];
  const sz =
    size === "lg" ? "text-3xl sm:text-4xl" : size === "sm" ? "text-xl" : "text-2xl";
  const cardSz = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return (
    <div className="space-y-1">
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1">
          {has && (
            <p className="text-xs text-muted-foreground/80">
              {t.from}{" "}
              <span className="line-through tabular-nums">{formatBRL(originalPrice!)}</span>
            </p>
          )}
          <p className={`font-extrabold bg-gradient-to-r from-amber-300 to-turquoise-glow bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${sz}`}>
            {formatBRL(price)}
          </p>
          <span className="text-[10px] leading-tight font-semibold text-foreground/80">{paymentLabels.cashPix}</span>
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className={`font-bold leading-tight ${cardSz}`} style={{ color: "#5b8fc7" }}>{formatBRL(calculateCardPrice(price))}</p>
          <span className="text-[10px] leading-tight text-muted-foreground">{paymentLabels.card}</span>
        </div>
      </div>
      {has && (
        <p className="text-[11px] font-bold text-emerald-300 inline-flex items-center gap-1">
          ✦ {t.save} {formatBRL(originalPrice! - price)}
        </p>
      )}
    </div>
  );
};

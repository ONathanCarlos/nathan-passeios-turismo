// Bloco visual que compara valores avulsos vs preço do pacote e destaca economia.
import { formatBRL } from "@/lib/prices";
import type { Lang } from "@/lib/i18n";
import { calculateCardPrice, PAYMENT_PRICE_LABELS } from "@/lib/paymentPricing";
import { BadgeCheck, PiggyBank } from "lucide-react";

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
  pt: {
    title: "Você economiza",
    sum: "Total comprando cada item separadamente",
    pack: "Pacote promocional",
    save: "Economia",
    sep: "Preço de cada item separado",
    cashPixNote: "A comparação considera os preços para pagamento em dinheiro ou Pix.",
  },
  es: {
    title: "Tú ahorras",
    sum: "Total comprando cada artículo por separado",
    pack: "Paquete promocional",
    save: "Ahorro",
    sep: "Precio de cada artículo por separado",
    cashPixNote: "La comparación considera los precios pagando en efectivo o con Pix.",
  },
  en: {
    title: "You save",
    sum: "Total when buying each item separately",
    pack: "Promo package",
    save: "Savings",
    sep: "Price of each item separately",
    cashPixNote: "The comparison is based on cash or Pix prices.",
  },
  fr: {
    title: "Vous économisez",
    sum: "Total en achetant chaque article séparément",
    pack: "Forfait promo",
    save: "Économie",
    sep: "Prix de chaque article séparément",
    cashPixNote: "La comparaison se base sur les prix en espèces ou par Pix.",
  },
  it: {
    title: "Risparmi",
    sum: "Totale acquistando ogni articolo separatamente",
    pack: "Pacchetto promo",
    save: "Risparmio",
    sep: "Prezzo di ogni articolo separatamente",
    cashPixNote: "Il confronto si basa sui prezzi in contanti o con Pix.",
  },
};

export const SavingsBox = ({ items, packagePrice, lang }: Props) => {
  const sum = items.reduce((a, b) => a + b.price, 0);
  const saving = sum - packagePrice;
  if (items.length === 0 || saving <= 0) return null;
  const t = L[lang];
  return (
    <section className="overflow-hidden rounded-2xl border border-turquoise/25 bg-gradient-to-br from-[#0c2236] via-night to-[#0b1c30] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.2)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-turquoise/25 bg-turquoise/10 text-turquoise-glow">
          <PiggyBank className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-turquoise-glow">{t.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.cashPixNote}</p>
        </div>
      </div>

      <p className="mt-5 mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{t.sep}</p>
      <ul className="space-y-2 border-b border-white/10 pb-4">
        {items.map((it, i) => (
          <li key={i} className="flex items-start justify-between gap-4 text-sm text-foreground/85">
            <span className="min-w-0">{it.label}</span>
            <span className="shrink-0 font-semibold tabular-nums">{formatBRL(it.price)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-3">
        <div className="flex items-start justify-between gap-4 text-sm">
          <span className="max-w-[75%] text-muted-foreground">{t.sum}</span>
          <span className="shrink-0 text-muted-foreground line-through tabular-nums">{formatBRL(sum)}</span>
        </div>
        <div className="flex items-start justify-between gap-4 text-sm">
          <span className="font-semibold text-foreground/90">{t.pack}</span>
          <span className="shrink-0 font-bold text-turquoise-glow tabular-nums">{formatBRL(packagePrice)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.07] px-3.5 py-3">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-200">
            <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden="true" /> {t.save}
          </span>
          <span className="text-lg font-extrabold text-emerald-200 tabular-nums">{formatBRL(saving)}</span>
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

/** Renderiza o preço em dinheiro/Pix e cartão, além da economia em reais quando aplicável. */
export const PriceWithDiscount = ({ price, originalPrice, lang, size = "md" }: PriceDisplayProps) => {
  const has = originalPrice && originalPrice > price;
  const t = PRICE_L[lang];
  const paymentLabels = PAYMENT_PRICE_LABELS[lang];
  const amountSize =
    size === "lg" ? "text-3xl sm:text-4xl" : size === "sm" ? "text-xl" : "text-2xl";
  const cardSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return (
    <div className="space-y-2.5">
      {has && (
        <p className="text-xs text-muted-foreground">
          {t.from} <span className="tabular-nums line-through">{formatBRL(originalPrice!)}</span>
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0 rounded-xl border border-turquoise/25 bg-turquoise/[0.08] p-3">
          <p className={`${amountSize} font-extrabold leading-none tracking-tight text-turquoise-glow tabular-nums`}>
            {formatBRL(price)}
          </p>
          <span className="mt-1.5 block text-[10px] font-semibold leading-tight text-foreground/80">{paymentLabels.cashPix}</span>
        </div>
        <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-right">
          <p className={`${cardSize} font-bold leading-none tracking-tight text-sky-300 tabular-nums`}>
            {formatBRL(calculateCardPrice(price))}
          </p>
          <span className="mt-1.5 block text-[10px] leading-tight text-muted-foreground">{paymentLabels.card}</span>
        </div>
      </div>
      {has && (
        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> {t.save} {formatBRL(originalPrice! - price)}
        </p>
      )}
    </div>
  );
};

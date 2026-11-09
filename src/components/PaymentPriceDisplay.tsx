import type { Lang } from "@/lib/i18n";
import { formatBRL } from "@/lib/prices";
import { calculateCardPrice, PAYMENT_PRICE_LABELS } from "@/lib/paymentPricing";

interface Props {
  cashPixPrice: number;
  lang: Lang;
  from?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const PaymentPriceDisplay = ({ cashPixPrice, lang, from = false, size = "sm", className = "" }: Props) => {
  const safeCashPrice = Number.isFinite(cashPixPrice) ? Math.max(0, cashPixPrice) : 0;
  const labels = PAYMENT_PRICE_LABELS[lang];
  const cashPrice = from ? `${labels.from} ${formatBRL(safeCashPrice)}` : formatBRL(safeCashPrice);
  const cardPriceValue = calculateCardPrice(safeCashPrice);
  const cardPrice = from ? `${labels.from} ${formatBRL(cardPriceValue)}` : formatBRL(cardPriceValue);
  const leftSize = size === "lg" ? "text-3xl sm:text-4xl" : size === "md" ? "text-3xl" : "text-[28px]";
  const rightSize = size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-lg";
  const labelSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div className={`flex items-end justify-between gap-2 ${className}`} data-testid="payment-price-display">
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <p className={`float-soft mt-0 leading-tight font-extrabold bg-gradient-to-r from-turquoise to-turquoise-glow bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${leftSize}`}>
          {cashPrice}
        </p>
        <span className={`mt-1 leading-tight font-semibold text-foreground/80 ${labelSize}`}>{labels.cashPix}</span>
      </div>
      <span aria-hidden="true" className="mx-1 h-9 w-px shrink-0 bg-border/70" />
      <div className="flex min-w-0 flex-1 flex-col items-end text-right">
        <p className={`mt-0 leading-tight font-bold ${rightSize}`} style={{ color: "#5b8fc7" }}>
          {cardPrice}
        </p>
        <span className={`mt-1 leading-tight text-muted-foreground ${labelSize}`}>{labels.card}</span>
      </div>
    </div>
  );
};

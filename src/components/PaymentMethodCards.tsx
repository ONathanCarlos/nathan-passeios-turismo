import type { Lang } from "@/lib/i18n";
import { formatBRL } from "@/lib/prices";
import { calculatePriceForPayment } from "@/lib/paymentPricing";
import { isCardPayment, type PaymentMethod } from "@/lib/payment";
import { Check } from "lucide-react";

const COPY: Record<Lang, {
  cashTitle: string;
  cardTitle: string;
  perPerson: string;
  total: string;
  cash: string;
  pix: string;
  credit: string;
  debit: string;
}> = {
  pt: { cashTitle: "Dinheiro ou Pix", cardTitle: "Cartão de crédito ou débito", perPerson: "por pessoa", total: "Total estimado", cash: "Dinheiro", pix: "Pix", credit: "Crédito", debit: "Débito" },
  es: { cashTitle: "Efectivo o Pix", cardTitle: "Tarjeta de crédito o débito", perPerson: "por persona", total: "Total estimado", cash: "Efectivo", pix: "Pix", credit: "Crédito", debit: "Débito" },
  en: { cashTitle: "Cash or Pix", cardTitle: "Credit or debit card", perPerson: "per person", total: "Estimated total", cash: "Cash", pix: "Pix", credit: "Credit", debit: "Debit" },
  fr: { cashTitle: "Espèces ou Pix", cardTitle: "Carte de crédit ou de débit", perPerson: "par personne", total: "Total estimé", cash: "Espèces", pix: "Pix", credit: "Crédit", debit: "Débit" },
  it: { cashTitle: "Contanti o Pix", cardTitle: "Carta di credito o debito", perPerson: "a persona", total: "Totale stimato", cash: "Contanti", pix: "Pix", credit: "Credito", debit: "Debito" },
};

interface Props {
  lang: Lang;
  payment: PaymentMethod | "";
  onChange: (payment: PaymentMethod) => void;
  cashPixUnitPrice: number | null;
  cashPixTotal: number | null;
  cardTotal: number | null;
  fromPrice?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "pix", "credit", "debit"];

export const PaymentMethodCards = ({
  lang,
  payment,
  onChange,
  cashPixUnitPrice,
  cashPixTotal,
  cardTotal,
  fromPrice = false,
}: Props) => {
  const copy = COPY[lang];
  const groups: { isCard: boolean; title: string; methods: PaymentMethod[]; total: number | null }[] = [
    { isCard: false, title: copy.cashTitle, methods: ["cash", "pix"], total: cashPixTotal },
    { isCard: true, title: copy.cardTitle, methods: ["credit", "debit"], total: cardTotal },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label={copy.total}>
      {groups.map((group) => {
        const selected = payment !== "" && isCardPayment(payment) === group.isCard;
        const unitPrice = cashPixUnitPrice === null
          ? null
          : calculatePriceForPayment(cashPixUnitPrice, group.isCard);
        return (
          <section
            key={group.title}
            className={`min-w-0 rounded-2xl border p-3 transition-colors sm:p-4 ${selected
              ? "border-turquoise bg-turquoise/[0.08] shadow-[0_0_22px_rgba(80,220,210,.11)]"
              : "border-white/15 bg-[#071a27]/65 hover:border-turquoise/50"}`}
            aria-label={group.title}
          >
            <h3 className="min-h-10 text-sm font-semibold leading-snug text-foreground sm:min-h-0">{group.title}</h3>
            {unitPrice !== null ? (
              <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
                {fromPrice && <span className="text-xs text-muted-foreground">{lang === "pt" ? "A partir de" : lang === "es" ? "Desde" : lang === "fr" ? "À partir de" : lang === "it" ? "Da" : "From"}</span>}
                <span className={`text-xl font-extrabold tracking-tight sm:text-2xl ${group.isCard ? "text-[#94bce9]" : "text-turquoise-glow"}`}>{formatBRL(unitPrice)}</span>
                <span className="text-[11px] text-muted-foreground">/ {copy.perPerson}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">—</p>
            )}
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-2.5">
              <span className="text-xs text-muted-foreground">{copy.total}</span>
              <span className={`text-sm font-bold tabular-nums ${group.isCard ? "text-[#94bce9]" : "text-turquoise-glow"}`}>
                {group.total === null ? "—" : formatBRL(group.total)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5" role="group" aria-label={group.title}>
              {group.methods.map((method) => {
                const active = payment === method;
                const label = copy[method];
                return (
                  <button
                    key={method}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange(method)}
                    className={`flex min-h-10 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise ${active
                      ? "border-turquoise bg-turquoise text-[#061720]"
                      : "border-white/15 bg-white/[0.03] text-foreground/85 hover:border-turquoise/50 hover:bg-turquoise/10"}`}
                  >
                    {active && <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

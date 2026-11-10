import type { CmsTour } from "@/lib/cms";
import { calculatePriceForPayment, roundMoney } from "@/lib/paymentPricing";

export interface LunchGuest {
  name: string;
  age: string;
}

export interface LunchBookingAmounts {
  guestCount: number;
  unitPrice: number;
  unitPriceForPayment: number;
  subtotal: number;
  cardPriceAdjustment: number;
  total: number;
}

const normalize = (value: string | null | undefined) =>
  (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const LUNCH_TERMS = ["almoco", "lunch", "almuerzo", "dejeuner", "pranzo"];

export const isLunchCmsTour = (tour: Pick<CmsTour,
  "key" | "nome_pt" | "nome_en" | "nome_es" | "nome_fr" | "nome_it"
>): boolean => {
  if (normalize(tour.key) === "almoco") return true;
  return [tour.nome_pt, tour.nome_en, tour.nome_es, tour.nome_fr, tour.nome_it]
    .some((name) => {
      const normalized = normalize(name);
      return LUNCH_TERMS.some((term) => new RegExp(`(^|[^a-z])${term}([^a-z]|$)`).test(normalized));
    });
};

const money = (value: number) => new Intl.NumberFormat("pt-BR", {
  style: "currency", currency: "BRL",
}).format(value);

export const calculateLunchBookingAmounts = (
  unitPrice: number,
  guestCount: number,
  isCard: boolean,
): LunchBookingAmounts => {
  const safeUnitPrice = Number.isFinite(unitPrice) && unitPrice > 0 ? roundMoney(unitPrice) : 0;
  const safeGuestCount = Number.isInteger(guestCount) && guestCount >= 1 && guestCount <= 8 ? guestCount : 0;
  const subtotal = roundMoney(safeUnitPrice * safeGuestCount);
  // Arredonda o unitário exibido antes de multiplicar, mantendo total = preço por pessoa × comensais.
  const unitPriceForPayment = calculatePriceForPayment(safeUnitPrice, isCard);
  const total = roundMoney(unitPriceForPayment * safeGuestCount);
  return {
    guestCount: safeGuestCount,
    unitPrice: safeUnitPrice,
    unitPriceForPayment,
    subtotal,
    cardPriceAdjustment: roundMoney(total - subtotal),
    total,
  };
};

export interface LunchBookingMessageInput {
  tourTitle: string;
  responsibleName: string;
  phone: string;
  date: string;
  guests: LunchGuest[];
  paymentLabel: string;
  amounts: LunchBookingAmounts;
}

export const buildLunchBookingMessage = (input: LunchBookingMessageInput): string => {
  const lines = [
    `🍽️ NOVA RESERVA — ${input.tourTitle}`,
    `👤 Responsável: ${input.responsibleName.trim()}`,
    `📞 Telefone: ${input.phone}`,
    `📅 Data: ${input.date}`,
    `👥 Pessoas no almoço: ${input.guests.length}`,
    "",
    "🧾 COMENSAIS (nome e idade)",
    ...input.guests.map((guest, index) => `${index + 1}. ${guest.name.trim()} — ${guest.age} anos${index === 0 ? " (responsável)" : ""}`),
    "",
    "💰 VALORES DA RESERVA",
  ];

  if (input.amounts.cardPriceAdjustment > 0) {
    lines.push(`Preço unitário do almoço no cartão: ${money(input.amounts.unitPriceForPayment)}`);
  }
  lines.push(
    `💰 TOTAL A PAGAR: ${money(input.amounts.total)}`,
    `💳 Forma de pagamento: ${input.paymentLabel}`,
  );
  return lines.join("\n");
};

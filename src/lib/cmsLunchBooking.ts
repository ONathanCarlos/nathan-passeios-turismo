import type { CmsTour } from "@/lib/cms";
import { BRAND_WEBSITE_URL } from "@/lib/brand";

export interface LunchGuest {
  name: string;
  age: string;
}

export interface LunchBookingAmounts {
  guestCount: number;
  unitPrice: number;
  subtotal: number;
  creditSurcharge: number;
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
  isCredit: boolean,
): LunchBookingAmounts => {
  const safeUnitPrice = Number.isFinite(unitPrice) && unitPrice > 0 ? unitPrice : 0;
  const safeGuestCount = Number.isInteger(guestCount) && guestCount >= 1 && guestCount <= 8 ? guestCount : 0;
  const subtotal = Math.round((safeUnitPrice * safeGuestCount + Number.EPSILON) * 100) / 100;
  const creditSurcharge = isCredit ? Math.round((subtotal * 0.05 + Number.EPSILON) * 100) / 100 : 0;
  return {
    guestCount: safeGuestCount,
    unitPrice: safeUnitPrice,
    subtotal,
    creditSurcharge,
    total: Math.round((subtotal + creditSurcharge + Number.EPSILON) * 100) / 100,
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
    "Olá Nathan! Aqui está minha reserva completa!",
    "",
    `🍽️ NOVA RESERVA — ${input.tourTitle}`,
    "",
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

  if (input.amounts.creditSurcharge > 0) {
    lines.push(`Almoço (${input.amounts.guestCount} × ${money(input.amounts.unitPrice)}): ${money(input.amounts.subtotal)}`);
  }
  if (input.amounts.creditSurcharge > 0) {
    lines.push(`Taxa do cartão (5%): ${money(input.amounts.creditSurcharge)}`);
  }
  lines.push(
    `💰 TOTAL A PAGAR: ${money(input.amounts.total)}`,
    `💳 Forma de pagamento: ${input.paymentLabel}`,
    ...(input.paymentLabel === "Cartão de crédito" ? ["A taxa de 5% do cartão já está incluída no total acima."] : []),
    "",
    `Reserva feita pelo site - ${BRAND_WEBSITE_URL}`,
  );
  return lines.join("\n");
};

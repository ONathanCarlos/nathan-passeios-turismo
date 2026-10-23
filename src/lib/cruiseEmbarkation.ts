import type { Lang } from "@/lib/i18n";
import type { TourKey } from "@/lib/tours";

export const EMBARKATION_FEE_PER_PERSON = 10;

/**
 * Datas copiadas do calendário de escalas 2026–2027 enviado pelo usuário.
 * Inclui toda data em que há ao menos uma escala, independentemente do píer
 * utilizado pelo navio. O PDF informa que a programação pode mudar.
 */
export const CRUISE_DATES = new Set([
  // Outubro de 2026
  "2026-10-27", "2026-10-30",
  // Novembro de 2026
  "2026-11-01", "2026-11-08", "2026-11-15", "2026-11-18", "2026-11-22",
  "2026-11-24", "2026-11-25", "2026-11-27", "2026-11-28", "2026-11-29", "2026-11-30",
  // Dezembro de 2026
  "2026-12-01", "2026-12-02", "2026-12-03", "2026-12-04", "2026-12-06", "2026-12-08",
  "2026-12-11", "2026-12-13", "2026-12-14", "2026-12-17", "2026-12-19", "2026-12-20",
  "2026-12-23", "2026-12-24", "2026-12-27", "2026-12-28", "2026-12-31",
  // Janeiro de 2027
  "2027-01-01", "2027-01-02", "2027-01-03", "2027-01-04", "2027-01-06", "2027-01-09",
  "2027-01-10", "2027-01-13", "2027-01-15", "2027-01-17", "2027-01-18", "2027-01-20",
  "2027-01-21", "2027-01-23", "2027-01-24", "2027-01-25", "2027-01-27", "2027-01-28",
  "2027-01-30", "2027-01-31",
  // Fevereiro de 2027
  "2027-02-02", "2027-02-03", "2027-02-05", "2027-02-06", "2027-02-07", "2027-02-08",
  "2027-02-10", "2027-02-11", "2027-02-13", "2027-02-14", "2027-02-16", "2027-02-17",
  "2027-02-20", "2027-02-21", "2027-02-23", "2027-02-24", "2027-02-27", "2027-02-28",
  // Março de 2027
  "2027-03-02", "2027-03-03", "2027-03-06", "2027-03-07", "2027-03-09", "2027-03-10",
  "2027-03-13", "2027-03-14", "2027-03-16", "2027-03-17", "2027-03-20", "2027-03-21",
  "2027-03-23", "2027-03-26", "2027-03-27", "2027-03-28", "2027-03-31",
  // Abril de 2027
  "2027-04-05", "2027-04-07",
]);

const CRUISE_FEE_TOURS = new Set<TourKey>(["escuna", "catamara"]);

export const packageIncludesCruiseFeeTour = (tourKeys: readonly string[] | undefined): boolean =>
  !!tourKeys?.some((key) => key === "escuna" || key === "catamara");

export const localDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isCruiseDate = (date: Date | undefined): boolean =>
  !!date && CRUISE_DATES.has(localDateKey(date));

export const cruiseFeeApplies = (tourKey: TourKey | undefined, date: Date | undefined): boolean =>
  !!tourKey && CRUISE_FEE_TOURS.has(tourKey) && isCruiseDate(date);

export const countFeeEligiblePassengers = (adultPassengers: number, childAges: string[]): number =>
  Math.max(0, adultPassengers) + childAges.filter((rawAge) => {
    const age = Number(rawAge);
    return Number.isInteger(age) && age >= 5;
  }).length;

export const calculateEmbarkationFee = (
  applies: boolean,
  adultPassengers: number,
  childAges: string[],
): { passengerCount: number; amount: number } => {
  const passengerCount = applies ? countFeeEligiblePassengers(adultPassengers, childAges) : 0;
  return { passengerCount, amount: passengerCount * EMBARKATION_FEE_PER_PERSON };
};

export const calculateCreditSurcharge = (subtotal: number, isCredit: boolean): number =>
  isCredit ? Math.round(subtotal * 0.05 * 100) / 100 : 0;

export const calculateBookingAmounts = (fareAfterDiscount: number, embarkationFee: number, isCredit: boolean) => {
  const subtotal = fareAfterDiscount + embarkationFee;
  const creditSurcharge = calculateCreditSurcharge(subtotal, isCredit);
  return { subtotal, creditSurcharge, total: subtotal + creditSurcharge };
};

export const CRUISE_FEE_DETAIL_NOTICE: Record<Lang, string> = {
  pt: "Em datas com escala de cruzeiro, o embarque do passeio será em píer privado. Taxa adicional de R$ 10 por pessoa a partir de 5 anos; menores de 5 anos não pagam. O píer será informado pela equipe.",
  es: "En fechas con escala de crucero, el embarque de la excursión será en un muelle privado. Tasa adicional de R$ 10 por persona desde los 5 años; los menores de 5 años no pagan. El equipo informará el muelle.",
  en: "On cruise-call dates, the tour will board at a private pier. An additional R$10 per person applies from age 5; children under 5 are exempt. Our team will confirm the pier.",
  fr: "Les jours d'escale de croisière, l'embarquement de l'excursion aura lieu dans un embarcadère privé. Supplément de 10 R$ par personne dès 5 ans ; les moins de 5 ans ne paient pas. L'équipe précisera l'embarcadère.",
  it: "Nei giorni di scalo delle crociere, l'imbarco dell'escursione avverrà da un molo privato. Supplemento di R$ 10 a persona dai 5 anni; i bambini sotto i 5 anni non pagano. Il nostro team comunicherà il molo.",
};

export const CRUISE_FEE_BOOKING_NOTICE: Record<Lang, string> = {
  pt: "Por conta da escala de cruzeiro nesta data, o embarque do passeio será em píer privado. A taxa é de R$ 10 por pessoa com 5 anos ou mais, inclusive crianças com tarifa grátis ou meia. O píer específico será informado pela equipe.",
  es: "Debido a la escala de crucero en esta fecha, la excursión embarcará en un muelle privado. La tasa es de R$ 10 por persona desde los 5 años, incluidos los niños con tarifa gratis o media. El equipo informará el muelle específico.",
  en: "Due to the cruise call on this date, the tour will board at a private pier. The fee is R$10 per person aged 5 or over, including children with free or half-fare tickets. Our team will confirm the specific pier.",
  fr: "En raison de l'escale de croisière à cette date, l'excursion embarquera dans un embarcadère privé. Le supplément est de 10 R$ par personne dès 5 ans, y compris les enfants gratuits ou à demi-tarif. L'équipe précisera l'embarcadère.",
  it: "A causa dello scalo della crociera in questa data, l'escursione partirà da un molo privato. La tariffa è di R$ 10 a persona dai 5 anni, anche per i bambini con biglietto gratuito o ridotto. Il nostro team comunicherà il molo specifico.",
};

export const CRUISE_CHILD_FEE_NOTICE: Record<Lang, string> = {
  pt: "Nesta data de cruzeiro, esta criança paga a taxa integral de embarque de R$ 10 (a partir de 5 anos), mesmo com tarifa grátis ou meia.",
  es: "En esta fecha de crucero, este niño paga la tasa completa de embarque de R$ 10 (desde los 5 años), incluso con tarifa gratis o media.",
  en: "On this cruise date, this child pays the full R$10 boarding fee (from age 5), even with a free or half-fare ticket.",
  fr: "À cette date de croisière, cet enfant paie le supplément d'embarquement complet de 10 R$ (dès 5 ans), même avec un tarif gratuit ou réduit.",
  it: "In questa data di crociera, questo bambino paga la tariffa d'imbarco intera di R$ 10 (dai 5 anni), anche con biglietto gratuito o ridotto.",
};

export const LABELS: Record<Lang, {
  embarkationFee: string;
  feePerPassenger: string;
  tourSubtotal: string;
  creditSurcharge: string;
  totalDue: string;
  estimatedCreditSurcharge: string;
}> = {
  pt: { embarkationFee: "Taxa de embarque", feePerPassenger: "passageiro(s) × R$ 10", tourSubtotal: "Subtotal", creditSurcharge: "Taxa do cartão (5%)", totalDue: "Total a pagar", estimatedCreditSurcharge: "Acréscimo do cartão (5%)" },
  es: { embarkationFee: "Tasa de embarque", feePerPassenger: "pasajero(s) × R$ 10", tourSubtotal: "Subtotal", creditSurcharge: "Tasa de tarjeta (5%)", totalDue: "Total a pagar", estimatedCreditSurcharge: "Recargo de tarjeta (5%)" },
  en: { embarkationFee: "Boarding fee", feePerPassenger: "passenger(s) × R$ 10", tourSubtotal: "Subtotal", creditSurcharge: "Card surcharge (5%)", totalDue: "Total due", estimatedCreditSurcharge: "Card surcharge (5%)" },
  fr: { embarkationFee: "Supplément d'embarquement", feePerPassenger: "passager(s) × 10 R$", tourSubtotal: "Sous-total", creditSurcharge: "Frais de carte (5 %)" , totalDue: "Total à payer", estimatedCreditSurcharge: "Frais de carte (5 %)" },
  it: { embarkationFee: "Tassa d'imbarco", feePerPassenger: "passeggero(i) × R$ 10", tourSubtotal: "Subtotale", creditSurcharge: "Supplemento carta (5%)", totalDue: "Totale da pagare", estimatedCreditSurcharge: "Supplemento carta (5%)" },
};

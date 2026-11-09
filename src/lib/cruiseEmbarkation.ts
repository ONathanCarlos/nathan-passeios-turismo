import type { Lang } from "@/lib/i18n";
import type { TourKey } from "@/lib/tours";
import { calculateCardPriceIncrease, calculatePriceForPayment, roundMoney } from "@/lib/paymentPricing";

export const EMBARKATION_FEE_PER_PERSON = 10;
export const ESCUNA_EMBARKATION_FEE_PER_PERSON = 5;
export const CRUISE_CALENDAR_PATH = "/calendario-cruzeiros-2026-2027";
export const CRUISE_CALENDAR_PDF = "/docs/calendario-escalas-cruzeiros-2026-2027.pdf";

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

export const getCruiseEmbarkationFeePerPerson = (
  tourKey?: TourKey,
  packageTourKeys?: readonly string[],
): number => {
  // Pacotes com Catamarã preservam a tarifa de R$ 10; Escuna isolada usa R$ 5.
  if (packageTourKeys?.includes("catamara") || tourKey === "catamara") return EMBARKATION_FEE_PER_PERSON;
  if (packageTourKeys?.includes("escuna") || tourKey === "escuna") return ESCUNA_EMBARKATION_FEE_PER_PERSON;
  return EMBARKATION_FEE_PER_PERSON;
};

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
  feePerPerson = EMBARKATION_FEE_PER_PERSON,
): { passengerCount: number; amount: number } => {
  const passengerCount = applies ? countFeeEligiblePassengers(adultPassengers, childAges) : 0;
  return { passengerCount, amount: passengerCount * feePerPerson };
};

export const calculateBookingAmounts = (fareAfterDiscount: number, additionalFees: number, isCard: boolean) => {
  const fareForPayment = calculatePriceForPayment(fareAfterDiscount, isCard);
  const cardPriceAdjustment = calculateCardPriceIncrease(fareAfterDiscount, isCard);
  const subtotal = roundMoney(fareAfterDiscount + additionalFees);
  const total = roundMoney(fareForPayment + additionalFees);
  return { subtotal, fareForPayment, cardPriceAdjustment, total };
};

export const CRUISE_FEE_DETAIL_NOTICE: Record<Lang, (feePerPerson: number) => string> = {
  pt: (fee) => `Em datas com escala de cruzeiro, o embarque do passeio será em píer privado. Taxa adicional de R$ ${fee} por pessoa a partir de 5 anos; menores de 5 anos não pagam. O píer será informado pela equipe.`,
  es: (fee) => `En fechas con escala de crucero, el embarque de la excursión será en un muelle privado. Tasa adicional de R$ ${fee} por persona desde los 5 años; los menores de 5 años no pagan. El equipo informará el muelle.`,
  en: (fee) => `On cruise-call dates, the tour will board at a private pier. An additional R$${fee} per person applies from age 5; children under 5 are exempt. Our team will confirm the pier.`,
  fr: (fee) => `Les jours d'escale de croisière, l'embarquement de l'excursion aura lieu dans un embarcadère privé. Supplément de ${fee} R$ par personne dès 5 ans ; les moins de 5 ans ne paient pas. L'équipe précisera l'embarcadère.`,
  it: (fee) => `Nei giorni di scalo delle crociere, l'imbarco dell'escursione avverrà da un molo privato. Supplemento di R$ ${fee} a persona dai 5 anni; i bambini sotto i 5 anni non pagano. Il nostro team comunicherà il molo.`,
};

export const CRUISE_FEE_BOOKING_NOTICE: Record<Lang, (feePerPerson: number) => string> = {
  pt: (fee) => `Por conta da escala de cruzeiro nesta data, o embarque do passeio será em píer privado. A taxa é de R$ ${fee} por pessoa com 5 anos ou mais, inclusive crianças com tarifa grátis ou meia. O píer específico será informado pela equipe.`,
  es: (fee) => `Debido a la escala de crucero en esta fecha, la excursión embarcará en un muelle privado. La tasa es de R$ ${fee} por persona desde los 5 años, incluidos los niños con tarifa gratis o media. El equipo informará el muelle específico.`,
  en: (fee) => `Due to the cruise call on this date, the tour will board at a private pier. The fee is R$${fee} per person aged 5 or over, including children with free or half-fare tickets. Our team will confirm the specific pier.`,
  fr: (fee) => `En raison de l'escale de croisière à cette date, l'excursion embarquera dans un embarcadère privé. Le supplément est de ${fee} R$ par personne dès 5 ans, y compris les enfants gratuits ou à demi-tarif. L'équipe précisera l'embarcadère.`,
  it: (fee) => `A causa dello scalo della crociera in questa data, l'escursione partirà da un molo privato. La tariffa è di R$ ${fee} a persona dai 5 anni, anche per i bambini con biglietto gratuito o ridotto. Il nostro team comunicherà il molo specifico.`,
};

export const CRUISE_CHILD_FEE_NOTICE: Record<Lang, (feePerPerson: number) => string> = {
  pt: (fee) => `Nesta data de cruzeiro, esta criança paga a taxa integral de embarque de R$ ${fee} (a partir de 5 anos), mesmo com tarifa grátis ou meia.`,
  es: (fee) => `En esta fecha de crucero, este niño paga la tasa completa de embarque de R$ ${fee} (desde los 5 años), incluso con tarifa gratis o media.`,
  en: (fee) => `On this cruise date, this child pays the full R$${fee} boarding fee (from age 5), even with a free or half-fare ticket.`,
  fr: (fee) => `À cette date de croisière, cet enfant paie le supplément d'embarquement complet de ${fee} R$ (dès 5 ans), même avec un tarif gratuit ou réduit.`,
  it: (fee) => `In questa data di crociera, questo bambino paga la tariffa d'imbarco intera di R$ ${fee} (dai 5 anni), anche con biglietto gratuito o ridotto.`,
};

export const LABELS: Record<Lang, {
  embarkationFee: string;
  feePerPassenger: string;
  localEmbarkationFee: string;
  jardineiraFee: string;
  passengerUnit: string;
  subtotalWithRegionalFees: string;
  tourSubtotal: string;
  cardPrice: string;
  totalDue: string;
}> = {
  pt: { embarkationFee: "Taxa de embarque", feePerPassenger: "passageiro(s)", localEmbarkationFee: "Taxa de embarque", jardineiraFee: "Taxa da jardineira", passengerUnit: "pessoa(s)", subtotalWithRegionalFees: "Subtotal (passeio + taxas de embarque e jardineira)", tourSubtotal: "Subtotal", cardPrice: "Preço do passeio no cartão (+10%)", totalDue: "Total a pagar" },
  es: { embarkationFee: "Tasa de embarque", feePerPassenger: "pasajero(s)", localEmbarkationFee: "Tasa de embarque", jardineiraFee: "Tasa de la jardinera", passengerUnit: "persona(s)", subtotalWithRegionalFees: "Subtotal (excursión + tasas de embarque y jardinera)", tourSubtotal: "Subtotal", cardPrice: "Precio de la excursión con tarjeta (+10%)", totalDue: "Total a pagar" },
  en: { embarkationFee: "Boarding fee", feePerPassenger: "passenger(s)", localEmbarkationFee: "Boarding fee", jardineiraFee: "Open-air bus fee", passengerUnit: "person(s)", subtotalWithRegionalFees: "Subtotal (tour + boarding and transfer fees)", tourSubtotal: "Subtotal", cardPrice: "Tour price by card (+10%)", totalDue: "Total due" },
  fr: { embarkationFee: "Supplément d'embarquement", feePerPassenger: "passager(s)", localEmbarkationFee: "Frais d'embarquement", jardineiraFee: "Frais de transfert en bus ouvert", passengerUnit: "personne(s)", subtotalWithRegionalFees: "Sous-total (excursion + frais d'embarquement et de transfert)", tourSubtotal: "Sous-total", cardPrice: "Prix de l'excursion par carte (+10 %)" , totalDue: "Total à payer" },
  it: { embarkationFee: "Tassa d'imbarco", feePerPassenger: "passeggero(i)", localEmbarkationFee: "Tassa d'imbarco", jardineiraFee: "Tassa del bus aperto", passengerUnit: "persona/e", subtotalWithRegionalFees: "Subtotale (escursione + tasse d'imbarco e trasferimento)", tourSubtotal: "Subtotale", cardPrice: "Prezzo dell'escursione con carta (+10%)", totalDue: "Totale da pagare" },
};

import type { Lang } from "@/lib/i18n";

export const CARD_PRICE_INCREASE_PERCENT = 10;

export const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/** The CMS price is the cash/Pix base; card/debit is 10% above that fare only. */
export const calculateCardPrice = (baseFare: number): number =>
  roundMoney(baseFare * (1 + CARD_PRICE_INCREASE_PERCENT / 100));

export const calculateCardPriceIncrease = (baseFare: number, isCard: boolean): number =>
  isCard ? roundMoney(calculateCardPrice(baseFare) - roundMoney(baseFare)) : 0;

export const calculatePriceForPayment = (baseFare: number, isCard: boolean): number =>
  isCard ? calculateCardPrice(baseFare) : roundMoney(baseFare);

export const PAYMENT_PRICE_LABELS: Record<Lang, {
  cashPix: string;
  card: string;
  cashPixPrice: string;
  cardPrice: string;
  unitPrice: string;
  discountedUnitPrice: string;
  tourFareCashPix: string;
  tourFareCard: string;
  cardNotice: string;
  from: string;
}> = {
  pt: {
    cashPix: "em dinheiro ou Pix",
    card: "no cartão de crédito ou débito",
    cashPixPrice: "Preço em dinheiro ou Pix",
    cardPrice: "Preço no cartão",
    unitPrice: "Preços por pessoa",
    discountedUnitPrice: "Preço por pessoa com desconto",
    tourFareCashPix: "Passeio (dinheiro/Pix, após descontos)",
    tourFareCard: "Passeio no cartão, após descontos",
    cardNotice: "O preço no cartão de crédito ou débito é apresentado separadamente. Taxas adicionais aplicáveis aparecem discriminadas no resumo da reserva.",
    from: "A partir de",
  },
  es: {
    cashPix: "en efectivo o Pix",
    card: "con tarjeta de crédito o débito",
    cashPixPrice: "Precio en efectivo o Pix",
    cardPrice: "Precio con tarjeta",
    unitPrice: "Precios por persona",
    discountedUnitPrice: "Precio por persona con descuento",
    tourFareCashPix: "Excursión (efectivo/Pix, después de descuentos)",
    tourFareCard: "Excursión con tarjeta, después de descuentos",
    cardNotice: "El precio con tarjeta de crédito o débito se muestra por separado. Las tasas adicionales aplicables se detallan en el resumen de la reserva.",
    from: "Desde",
  },
  en: {
    cashPix: "cash or Pix",
    card: "by credit or debit card",
    cashPixPrice: "Cash or Pix price",
    cardPrice: "Card price",
    unitPrice: "Prices per person",
    discountedUnitPrice: "Discounted price per person",
    tourFareCashPix: "Tour (cash/Pix, after discounts)",
    tourFareCard: "Tour by card, after discounts",
    cardNotice: "The credit or debit card price is shown separately. Any applicable additional fees are itemized in the booking summary.",
    from: "From",
  },
  fr: {
    cashPix: "en espèces ou Pix",
    card: "par carte de crédit ou de débit",
    cashPixPrice: "Prix en espèces ou Pix",
    cardPrice: "Prix par carte",
    unitPrice: "Prix par personne",
    discountedUnitPrice: "Prix par personne après réduction",
    tourFareCashPix: "Excursion (espèces/Pix, après réductions)",
    tourFareCard: "Excursion par carte, après réductions",
    cardNotice: "Le prix par carte de crédit ou de débit est affiché séparément. Les frais supplémentaires applicables sont détaillés dans le récapitulatif de réservation.",
    from: "À partir de",
  },
  it: {
    cashPix: "in contanti o Pix",
    card: "con carta di credito o debito",
    cashPixPrice: "Prezzo in contanti o Pix",
    cardPrice: "Prezzo con carta",
    unitPrice: "Prezzi per persona",
    discountedUnitPrice: "Prezzo per persona scontato",
    tourFareCashPix: "Escursione (contanti/Pix, dopo gli sconti)",
    tourFareCard: "Escursione con carta, dopo gli sconti",
    cardNotice: "Il prezzo con carta di credito o debito è mostrato separatamente. Gli eventuali costi aggiuntivi sono indicati nel riepilogo della prenotazione.",
    from: "A partire da",
  },
};

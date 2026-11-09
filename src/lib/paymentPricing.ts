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
    cardPrice: "Preço no cartão (+10%)",
    unitPrice: "Preços por pessoa",
    discountedUnitPrice: "Preço por pessoa com desconto",
    tourFareCashPix: "Passeio (dinheiro/Pix, após descontos)",
    tourFareCard: "Passeio no cartão (+10%, após descontos)",
    cardNotice: "O preço do passeio no cartão de crédito ou débito é 10% maior que o valor em dinheiro ou Pix. Taxas adicionais aplicáveis aparecem separadamente.",
    from: "A partir de",
  },
  es: {
    cashPix: "en efectivo o Pix",
    card: "con tarjeta de crédito o débito",
    cashPixPrice: "Precio en efectivo o Pix",
    cardPrice: "Precio con tarjeta (+10%)",
    unitPrice: "Precios por persona",
    discountedUnitPrice: "Precio por persona con descuento",
    tourFareCashPix: "Excursión (efectivo/Pix, después de descuentos)",
    tourFareCard: "Excursión con tarjeta (+10%, después de descuentos)",
    cardNotice: "El precio de la excursión con tarjeta de crédito o débito es un 10% superior al precio en efectivo o Pix. Las tasas adicionales se muestran por separado.",
    from: "Desde",
  },
  en: {
    cashPix: "cash or Pix",
    card: "by credit or debit card",
    cashPixPrice: "Cash or Pix price",
    cardPrice: "Card price (+10%)",
    unitPrice: "Prices per person",
    discountedUnitPrice: "Discounted price per person",
    tourFareCashPix: "Tour (cash/Pix, after discounts)",
    tourFareCard: "Tour by card (+10%, after discounts)",
    cardNotice: "The tour price by credit or debit card is 10% higher than the cash or Pix price. Any applicable additional fees are shown separately.",
    from: "From",
  },
  fr: {
    cashPix: "en espèces ou Pix",
    card: "par carte de crédit ou de débit",
    cashPixPrice: "Prix en espèces ou Pix",
    cardPrice: "Prix par carte (+10 %)",
    unitPrice: "Prix par personne",
    discountedUnitPrice: "Prix par personne après réduction",
    tourFareCashPix: "Excursion (espèces/Pix, après réductions)",
    tourFareCard: "Excursion par carte (+10 %, après réductions)",
    cardNotice: "Le prix de l'excursion par carte de crédit ou de débit est supérieur de 10 % au prix en espèces ou Pix. Les frais supplémentaires applicables sont affichés séparément.",
    from: "À partir de",
  },
  it: {
    cashPix: "in contanti o Pix",
    card: "con carta di credito o debito",
    cashPixPrice: "Prezzo in contanti o Pix",
    cardPrice: "Prezzo con carta (+10%)",
    unitPrice: "Prezzi per persona",
    discountedUnitPrice: "Prezzo per persona scontato",
    tourFareCashPix: "Escursione (contanti/Pix, dopo gli sconti)",
    tourFareCard: "Escursione con carta (+10%, dopo gli sconti)",
    cardNotice: "Il prezzo dell'escursione con carta di credito o debito è superiore del 10% rispetto al prezzo in contanti o Pix. Gli eventuali costi aggiuntivi sono mostrati separatamente.",
    from: "A partire da",
  },
};

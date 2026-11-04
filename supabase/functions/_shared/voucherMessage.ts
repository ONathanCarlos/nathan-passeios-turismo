export type VoucherMessageLanguage = "pt" | "es" | "en" | "fr" | "it";

const COPY: Record<VoucherMessageLanguage, {
  reservation: string;
  vouchers: string;
  instructions: string;
}> = {
  pt: {
    reservation: "Código geral da reserva",
    vouchers: "Seus vouchers virtuais",
    instructions: "Toque no link para visualizar, baixar, compartilhar ou imprimir.",
  },
  es: {
    reservation: "Código general de la reserva",
    vouchers: "Tus vouchers virtuales",
    instructions: "Abre el enlace para ver, descargar, compartir o imprimir.",
  },
  en: {
    reservation: "Booking reference",
    vouchers: "Your digital vouchers",
    instructions: "Open the link to view, download, share or print.",
  },
  fr: {
    reservation: "Code général de réservation",
    vouchers: "Vos vouchers numériques",
    instructions: "Ouvrez le lien pour consulter, télécharger, partager ou imprimer.",
  },
  it: {
    reservation: "Codice generale della prenotazione",
    vouchers: "I tuoi voucher digitali",
    instructions: "Apri il link per visualizzare, scaricare, condividere o stampare.",
  },
};

export const buildCompactVoucherMessage = (
  language: VoucherMessageLanguage,
  reservationCode: string,
  bookingMessage: string,
  voucherUrl: string,
): string => {
  const copy = COPY[language];
  return [
    `🎟 ${copy.reservation}: ${reservationCode}`,
    "",
    ...bookingMessage.trim().split("\n"),
    "",
    `🔐 ${copy.vouchers}: ${voucherUrl}`,
    copy.instructions,
  ].join("\n");
};

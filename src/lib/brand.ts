/** Shared identity and booking destination; legacy CMS contact falls back to the current destination. */
export const BRAND_NAME = "Ônix Turismo Búzios";
export const BOOKING_WHATSAPP = "5511932662509";

export const bookingWhatsApp = (configured?: string) => {
  const number = configured?.replace(/\D/g, "");
  return number && number !== "5522998216796" && number !== "5522932662509" ? number : BOOKING_WHATSAPP;
};
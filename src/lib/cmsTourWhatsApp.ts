import type { CmsTour } from "@/lib/cms";
import { bookingWhatsApp } from "@/lib/brand";
import { getCachedConfig } from "@/lib/cmsCache";

/** WhatsApp link for CMS tours that do not use a dedicated booking form. */
export const cmsTourWhatsAppUrl = (tour: CmsTour) => {
  const msg = `Olá Nathan! Gostaria de reservar o passeio: ${tour.nome_pt}`;
  return `https://wa.me/${bookingWhatsApp(getCachedConfig("whatsapp"))}?text=${encodeURIComponent(msg)}`;
};

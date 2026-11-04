import type { Lang } from "@/lib/i18n";

export type VoucherTourKey =
  | "escuna"
  | "arraial"
  | "buggy"
  | "cabofrio"
  | "jardineira"
  | "catamara"
  | "mergulho"
  | "lancha"
  | "almoco"
  | "quadriciclo_nas_dunas";

export interface VoucherTemplate {
  src: string;
  kicker: Record<Lang, string>;
  title: Record<Lang, string>;
  location: Record<Lang, string>;
}

const tr = (pt: string, es: string, en: string, fr: string, it: string): Record<Lang, string> => ({ pt, es, en, fr, it });

export const VOUCHER_TEMPLATES: Partial<Record<VoucherTourKey, VoucherTemplate>> = {
  escuna: {
    src: "/vouchers/voucher-escuna.png",
    kicker: tr("BÚZIOS VISTA DO MAR", "BÚZIOS DESDE EL MAR", "BÚZIOS FROM THE SEA", "BÚZIOS VUE DE LA MER", "BÚZIOS DAL MARE"),
    title: tr("PASSEIO DE ESCUNA", "PASEO EN GOLETA", "SCHOONER TOUR", "EXCURSION EN GOÉLETTE", "TOUR IN GOLETTA"),
    location: tr("ARMAÇÃO DOS BÚZIOS · RJ", "ARMAÇÃO DOS BÚZIOS · RJ", "ARMAÇÃO DOS BÚZIOS · RJ", "ARMAÇÃO DOS BÚZIOS · RJ", "ARMAÇÃO DOS BÚZIOS · RJ"),
  },
  buggy: {
    src: "/vouchers/voucher-buggy.png",
    kicker: tr("EXPLORE BÚZIOS POR TERRA", "EXPLORA BÚZIOS POR TIERRA", "EXPLORE BÚZIOS BY LAND", "EXPLOREZ BÚZIOS PAR LA TERRE", "ESPLORA BÚZIOS VIA TERRA"),
    title: tr("PASSEIO DE BUGGY", "PASEO EN BUGGY", "BUGGY TOUR", "EXCURSION EN BUGGY", "TOUR IN BUGGY"),
    location: tr("ARMAÇÃO DOS BÚZIOS · RJ", "ARMAÇÃO DOS BÚZIOS · RJ", "ARMAÇÃO DOS BÚZIOS · RJ", "ARMAÇÃO DOS BÚZIOS · RJ", "ARMAÇÃO DOS BÚZIOS · RJ"),
  },
  arraial: {
    src: "/vouchers/voucher-arraial-do-cabo.png",
    kicker: tr("ÁGUAS CRISTALINAS À SUA ESPERA", "AGUAS CRISTALINAS TE ESPERAN", "CRYSTAL-CLEAR WATERS AWAIT", "DES EAUX CRISTALLINES VOUS ATTENDENT", "ACQUE CRISTALLINE TI ASPETTANO"),
    title: tr("ARRAIAL DO CABO", "ARRAIAL DO CABO", "ARRAIAL DO CABO", "ARRAIAL DO CABO", "ARRAIAL DO CABO"),
    location: tr("ARRAIAL DO CABO · RJ", "ARRAIAL DO CABO · RJ", "ARRAIAL DO CABO · RJ", "ARRAIAL DO CABO · RJ", "ARRAIAL DO CABO · RJ"),
  },
  cabofrio: {
    src: "/vouchers/voucher-cabo-frio.png",
    kicker: tr("PRAIAS E CHARME EM CABO FRIO", "PLAYAS Y ENCANTO EN CABO FRIO", "BEACHES AND CHARM IN CABO FRIO", "PLAGES ET CHARME À CABO FRIO", "SPIAGGE E FASCINO A CABO FRIO"),
    title: tr("CABO FRIO", "CABO FRIO", "CABO FRIO", "CABO FRIO", "CABO FRIO"),
    location: tr("CABO FRIO · RJ", "CABO FRIO · RJ", "CABO FRIO · RJ", "CABO FRIO · RJ", "CABO FRIO · RJ"),
  },
  catamara: {
    src: "/vouchers/voucher-catamara.png",
    kicker: tr("NAVEGUE COM CONFORTO E ESTILO", "NAVEGA CON COMODIDAD Y ESTILO", "SAIL IN COMFORT AND STYLE", "NAVIGUEZ AVEC CONFORT ET STYLE", "NAVIGA CON COMFORT E STILE"),
    title: tr("PASSEIO DE CATAMARÃ", "PASEO EN CATAMARÁN", "CATAMARAN TOUR", "EXCURSION EN CATAMARAN", "TOUR IN CATAMARANO"),
    location: tr("ARMAÇÃO DOS BÚZIOS · RJ", "ARMAÇÃO DOS BÚZIOS · RJ", "ARMAÇÃO DOS BÚZIOS · RJ", "ARMAÇÃO DOS BÚZIOS · RJ", "ARMAÇÃO DOS BÚZIOS · RJ"),
  },
  mergulho: {
    src: "/vouchers/voucher-mergulho.png",
    kicker: tr("DESCUBRA O MUNDO NO PARQUE DOS CORAIS", "DESCUBRE EL MUNDO EN EL PARQUE DE CORALES", "DISCOVER THE CORAL PARK", "DÉCOUVREZ LE PARC DES CORAUX", "SCOPRI IL PARCO DEI CORALLI"),
    title: tr("MERGULHO", "BUCEO", "DIVING", "PLONGÉE", "IMMERSIONE"),
    location: tr("JOÃO FERNANDES · ARMAÇÃO DOS BÚZIOS · RJ", "JOÃO FERNANDES · ARMAÇÃO DOS BÚZIOS · RJ", "JOÃO FERNANDES · ARMAÇÃO DOS BÚZIOS · RJ", "JOÃO FERNANDES · ARMAÇÃO DOS BÚZIOS · RJ", "JOÃO FERNANDES · ARMAÇÃO DOS BÚZIOS · RJ"),
  },
  quadriciclo_nas_dunas: {
    src: "/vouchers/voucher-quadriciclo-nas-dunas.png",
    kicker: tr("SINTA A LIBERDADE NAS DUNAS", "SIENTE LA LIBERTAD EN LAS DUNAS", "FEEL THE FREEDOM IN THE DUNES", "RESSENTEZ LA LIBERTÉ DANS LES DUNES", "VIVI LA LIBERTÀ SULLE DUNE"),
    title: tr("QUADRICICLO NAS DUNAS", "CUATRIMOTO EN LAS DUNAS", "ATV RIDE ON THE DUNES", "QUAD DANS LES DUNES", "QUAD SULLE DUNE"),
    location: tr("ARRAIAL DO CABO · RJ", "ARRAIAL DO CABO · RJ", "ARRAIAL DO CABO · RJ", "ARRAIAL DO CABO · RJ", "ARRAIAL DO CABO · RJ"),
  },
};

export const normalizeVoucherTemplateKey = (key: string): VoucherTourKey | null => {
  const normalized = key.trim().toLowerCase().replace(/-/g, "_");
  return Object.prototype.hasOwnProperty.call(VOUCHER_TEMPLATES, normalized)
    ? normalized as VoucherTourKey
    : null;
};

export const getVoucherTemplate = (key: string): VoucherTemplate | undefined => {
  const normalized = normalizeVoucherTemplateKey(key);
  return normalized ? VOUCHER_TEMPLATES[normalized] : undefined;
};

export const VOUCHER_COPY: Record<Lang, {
  digital: string; reservationVoucher: string; reservationData: string; showToTeam: string;
  passenger: string; date: string; time: string; people: string; weather: string;
  validity: string; contactFrom: string; officialLookup: string; tourDetails: string;
  scan: string; officialService: string; fastSecure: string; supportHours: string;
  whatsapp: string; contact: string; confirmedAt: string; toConfirm: string;
  timeFlex: string; noTemplate: string; invalidTitle: string; invalidBody: string;
  loading: string; downloadPng: string; downloadPdf: string; share: string; print: string;
  shareTitle: string; copied: string; voucherCode: string; reservationCode: string;
  itemCode: string; openVoucher: string; bookingNotice: string; peopleUnit: string;
}> = {
  pt: { digital: "VOUCHER DIGITAL", reservationVoucher: "VOUCHER DE RESERVA", reservationData: "DADOS DA RESERVA", showToTeam: "Apresente à equipe no dia do passeio.", passenger: "PASSAGEIRO RESPONSÁVEL", date: "DATA DO PASSEIO", time: "HORÁRIO DO PASSEIO", people: "NÚMERO DE PESSOAS", weather: "Data sujeita a alterações por condições climáticas ou outros fatores externos.", validity: "Válido exclusivamente para a data e o passeio descritos.", contactFrom: "A equipe entrará em contato a partir desse horário.", officialLookup: "CONSULTA OFICIAL", tourDetails: "Confira os detalhes do passeio", scan: "Aponte a câmera para acessar a página oficial da Ônix Turismo Búzios.", officialService: "Atendimento oficial", fastSecure: "Rápido e seguro", supportHours: "Suporte das 8h às 22h", whatsapp: "WHATSAPP DA ÔNIX TURISMO BÚZIOS", contact: "CONTATO", confirmedAt: "Horário: 11:00h", toConfirm: "A confirmar", timeFlex: "Horários flexíveis das 8h às 17h, sujeitos à disponibilidade.", noTemplate: "Este passeio está vinculado à reserva, mas ainda não possui arte oficial de voucher.", invalidTitle: "Voucher indisponível", invalidBody: "Este link não é válido ou foi revogado. Peça um novo link à equipe Ônix Turismo Búzios.", loading: "Carregando seus vouchers…", downloadPng: "Baixar PNG", downloadPdf: "Baixar PDF", share: "Compartilhar", print: "Imprimir", shareTitle: "Voucher Ônix Turismo Búzios", copied: "Link copiado", voucherCode: "Código do voucher", reservationCode: "Código geral da reserva", itemCode: "Código do passeio", openVoucher: "Abrir vouchers seguros", bookingNotice: "Use este voucher na data indicada. O horário pode depender de confirmação da equipe.", peopleUnit: "pessoas" },
  es: { digital: "VALE DIGITAL", reservationVoucher: "VALE DE RESERVA", reservationData: "DATOS DE LA RESERVA", showToTeam: "Preséntalo al equipo el día del paseo.", passenger: "RESPONSABLE DE LA RESERVA", date: "FECHA DEL PASEO", time: "HORARIO DEL PASEO", people: "NÚMERO DE PERSONAS", weather: "La fecha puede cambiar por condiciones climáticas u otros factores externos.", validity: "Válido exclusivamente para la fecha y el paseo indicados.", contactFrom: "El equipo se pondrá en contacto a partir de este horario.", officialLookup: "CONSULTA OFICIAL", tourDetails: "Consulta los detalles del paseo", scan: "Apunta la cámara para acceder a la página oficial de Ônix Turismo Búzios.", officialService: "Atención oficial", fastSecure: "Rápido y seguro", supportHours: "Soporte de 8:00 a 22:00", whatsapp: "WHATSAPP DE ÔNIX TURISMO BÚZIOS", contact: "CONTACTO", confirmedAt: "Horario: 11:00h", toConfirm: "A confirmar", timeFlex: "Horarios flexibles de 8:00 a 17:00, sujetos a disponibilidad.", noTemplate: "Este paseo está vinculado a la reserva, pero aún no tiene un diseño oficial de voucher.", invalidTitle: "Voucher no disponible", invalidBody: "Este enlace no es válido o fue revocado. Solicita un nuevo enlace al equipo de Ônix Turismo Búzios.", loading: "Cargando tus vouchers…", downloadPng: "Descargar PNG", downloadPdf: "Descargar PDF", share: "Compartir", print: "Imprimir", shareTitle: "Voucher Ônix Turismo Búzios", copied: "Enlace copiado", voucherCode: "Código del voucher", reservationCode: "Código general de la reserva", itemCode: "Código del paseo", openVoucher: "Abrir vouchers seguros", bookingNotice: "Usa este voucher en la fecha indicada. El horario puede depender de la confirmación del equipo.", peopleUnit: "personas" },
  en: { digital: "DIGITAL VOUCHER", reservationVoucher: "BOOKING VOUCHER", reservationData: "BOOKING DETAILS", showToTeam: "Show this to the team on the day of the tour.", passenger: "BOOKING RESPONSIBLE", date: "TOUR DATE", time: "TOUR TIME", people: "NUMBER OF PEOPLE", weather: "Date may change due to weather or other external factors.", validity: "Valid exclusively for the date and tour shown.", contactFrom: "Our team will contact you from this time onward.", officialLookup: "OFFICIAL INFORMATION", tourDetails: "View tour details", scan: "Scan to access the official Ônix Turismo Búzios website.", officialService: "Official service", fastSecure: "Fast and secure", supportHours: "Support from 8 am to 10 pm", whatsapp: "ÔNIX TURISMO BÚZIOS WHATSAPP", contact: "CONTACT", confirmedAt: "Time: 11:00h", toConfirm: "To be confirmed", timeFlex: "Flexible times from 8 am to 5 pm, subject to availability.", noTemplate: "This tour is linked to the booking, but does not yet have an official voucher artwork.", invalidTitle: "Voucher unavailable", invalidBody: "This link is invalid or has been revoked. Ask the Ônix Turismo Búzios team for a new link.", loading: "Loading your vouchers…", downloadPng: "Download PNG", downloadPdf: "Download PDF", share: "Share", print: "Print", shareTitle: "Ônix Turismo Búzios voucher", copied: "Link copied", voucherCode: "Voucher code", reservationCode: "Booking reference", itemCode: "Tour reference", openVoucher: "Open secure vouchers", bookingNotice: "Use this voucher on the date shown. The time may depend on confirmation by our team.", peopleUnit: "people" },
  fr: { digital: "VOUCHER NUMÉRIQUE", reservationVoucher: "VOUCHER DE RÉSERVATION", reservationData: "DÉTAILS DE LA RÉSERVATION", showToTeam: "Présentez-le à l’équipe le jour de l’excursion.", passenger: "RESPONSABLE DE LA RÉSERVATION", date: "DATE DE L’EXCURSION", time: "HORAIRE DE L’EXCURSION", people: "NOMBRE DE PERSONNES", weather: "La date peut changer en raison de la météo ou d’autres facteurs externes.", validity: "Valable uniquement pour la date et l’excursion indiquées.", contactFrom: "L’équipe vous contactera à partir de cet horaire.", officialLookup: "INFORMATION OFFICIELLE", tourDetails: "Consultez les détails de l’excursion", scan: "Scannez pour accéder au site officiel d’Ônix Turismo Búzios.", officialService: "Service officiel", fastSecure: "Rapide et sécurisé", supportHours: "Assistance de 8 h à 22 h", whatsapp: "WHATSAPP ÔNIX TURISMO BÚZIOS", contact: "CONTACT", confirmedAt: "Horaire : 11:00h", toConfirm: "À confirmer", timeFlex: "Horaires flexibles de 8 h à 17 h, selon disponibilité.", noTemplate: "Cette excursion est liée à la réservation, mais ne dispose pas encore d’un visuel officiel de voucher.", invalidTitle: "Voucher indisponible", invalidBody: "Ce lien est invalide ou a été révoqué. Demandez un nouveau lien à l’équipe Ônix Turismo Búzios.", loading: "Chargement de vos vouchers…", downloadPng: "Télécharger PNG", downloadPdf: "Télécharger PDF", share: "Partager", print: "Imprimer", shareTitle: "Voucher Ônix Turismo Búzios", copied: "Lien copié", voucherCode: "Code du voucher", reservationCode: "Code général de réservation", itemCode: "Code de l’excursion", openVoucher: "Ouvrir les vouchers sécurisés", bookingNotice: "Utilisez ce voucher à la date indiquée. L’horaire peut dépendre de la confirmation de l’équipe.", peopleUnit: "personnes" },
  it: { digital: "VOUCHER DIGITALE", reservationVoucher: "VOUCHER DI PRENOTAZIONE", reservationData: "DATI DELLA PRENOTAZIONE", showToTeam: "Mostralo al team il giorno del tour.", passenger: "RESPONSABILE DELLA PRENOTAZIONE", date: "DATA DEL TOUR", time: "ORARIO DEL TOUR", people: "NUMERO DI PERSONE", weather: "La data può cambiare per condizioni meteorologiche o altri fattori esterni.", validity: "Valido esclusivamente per la data e il tour indicati.", contactFrom: "Il team ti contatterà a partire da questo orario.", officialLookup: "INFORMAZIONI UFFICIALI", tourDetails: "Consulta i dettagli del tour", scan: "Inquadra per accedere al sito ufficiale di Ônix Turismo Búzios.", officialService: "Assistenza ufficiale", fastSecure: "Rapido e sicuro", supportHours: "Supporto dalle 8 alle 22", whatsapp: "WHATSAPP ÔNIX TURISMO BÚZIOS", contact: "CONTATTO", confirmedAt: "Orario: 11:00h", toConfirm: "Da confermare", timeFlex: "Orari flessibili dalle 8 alle 17, secondo disponibilità.", noTemplate: "Questo tour è collegato alla prenotazione, ma non ha ancora una grafica ufficiale del voucher.", invalidTitle: "Voucher non disponibile", invalidBody: "Questo link non è valido o è stato revocato. Chiedi un nuovo link al team Ônix Turismo Búzios.", loading: "Caricamento dei voucher…", downloadPng: "Scarica PNG", downloadPdf: "Scarica PDF", share: "Condividi", print: "Stampa", shareTitle: "Voucher Ônix Turismo Búzios", copied: "Link copiato", voucherCode: "Codice voucher", reservationCode: "Codice generale della prenotazione", itemCode: "Codice del tour", openVoucher: "Apri i voucher sicuri", bookingNotice: "Usa questo voucher nella data indicata. L’orario può dipendere dalla conferma del team.", peopleUnit: "persone" },
};

export const voucherSchedule = (key: string, lang: Lang): string => {
  if (key === "escuna") return VOUCHER_COPY[lang].confirmedAt.replace(/^.*?:\s*/, "");
  if (key === "arraial" || key === "cabofrio") {
    const prefix = { pt: "A partir das", es: "A partir de las", en: "From", fr: "À partir de", it: "Dalle" }[lang];
    return `${prefix} 8:30h*`;
  }
  return VOUCHER_COPY[lang].toConfirm;
};

export const voucherScheduleNote = (key: string, lang: Lang): string => {
  if (key === "arraial" || key === "cabofrio") return VOUCHER_COPY[lang].contactFrom;
  if (key === "buggy" || key === "mergulho") return VOUCHER_COPY[lang].timeFlex;
  return "";
};

export const randomVoucherSecret = (): string => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const voucherTokenHash = async (token: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const voucherUrl = (token: string, origin = typeof window === "undefined" ? "https://onixturismobuzios.com.br" : window.location.origin): string =>
  `${origin}/vouchers#token=${encodeURIComponent(token)}`;

export const buildVoucherMessageAppendix = (
  lang: Lang,
  reservationCode: string,
  items: Array<{ code: string; name: string }>,
  url: string,
): string => {
  const copy = VOUCHER_COPY[lang];
  const headers: Record<Lang, { reservation: string; items: string; open: string; instructions: string }> = {
    pt: { reservation: "Código geral da reserva", items: "Identificadores dos passeios", open: "Vouchers seguros", instructions: "Acesse o link para visualizar, baixar, compartilhar ou imprimir seus vouchers." },
    es: { reservation: "Código general de la reserva", items: "Identificadores de los paseos", open: "Vouchers seguros", instructions: "Abre el enlace para ver, descargar, compartir o imprimir tus vouchers." },
    en: { reservation: "Booking reference", items: "Tour references", open: "Secure vouchers", instructions: "Open the link to view, download, share or print your vouchers." },
    fr: { reservation: "Code général de réservation", items: "Références des excursions", open: "Vouchers sécurisés", instructions: "Ouvrez le lien pour consulter, télécharger, partager ou imprimer vos vouchers." },
    it: { reservation: "Codice generale della prenotazione", items: "Codici dei tour", open: "Voucher sicuri", instructions: "Apri il link per visualizzare, scaricare, condividere o stampare i voucher." },
  };
  const h = headers[lang];
  const lines = ["", `🎟 ${h.reservation}: ${reservationCode}`];
  if (items.length) {
    lines.push(`${h.items}:`);
    items.forEach((item) => lines.push(`• ${item.name}: ${item.code}`));
  }
  lines.push(`🔐 ${h.open}: ${url}`, h.instructions);
  return lines.join("\n");
};

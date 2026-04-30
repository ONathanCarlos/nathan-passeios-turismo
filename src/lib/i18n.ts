export type Lang = "pt" | "es" | "en" | "fr" | "it";

export const LANG_LABELS: Record<Lang, { name: string; flag: string }> = {
  pt: { name: "Português", flag: "🇧🇷" },
  es: { name: "Español", flag: "🇪🇸" },
  en: { name: "English", flag: "🇬🇧" },
  fr: { name: "Français", flag: "🇫🇷" },
  it: { name: "Italiano", flag: "🇮🇹" },
};

type Dict = {
  brand: string;
  tagline: string;
  language: string;
  menuTitle: string;
  menuSubtitle: string;
  optEscuna: string;
  optEscunaDesc: string;
  optArraial: string;
  optArraialDesc: string;
  optOther: string;
  optOtherDesc: string;
  back: string;
  bookingFor: string;
  fullName: string;
  phone: string;
  passengers: string;
  hasChildren: string;
  yes: string;
  no: string;
  childrenCount: string;
  childAge: (n: number) => string;
  ageYears: string;
  free: string;
  half: string;
  freePassengers: string;
  payment: string;
  cash: string;
  debit: string;
  credit: string;
  pix: string;
  creditWarning: string;
  generate: string;
  copy: string;
  copied: string;
  share: string;
  reset: string;
  intro: string;
  pousadaName: string;
  roomNumber: string;
  optional: string;
  pousadaAddress: string;
  introArraial: string;
  otherSoon: string;
  sumTitle: string;
  sumName: string;
  sumPhone: string;
  sumPax: string;
  sumChildren: string;
  sumFree: string;
  sumHalf: string;
  sumPay: string;
  sumPousada: string;
  sumRoom: string;
  sumAddress: string;
  required: string;
};

export const dict: Record<Lang, Dict> = {
  pt: {
    brand: "Nathan Passeios e Turismo",
    tagline: "Mar, sol e aventura em Arraial do Cabo",
    language: "Idioma",
    menuTitle: "Escolha seu passeio",
    menuSubtitle: "Selecione uma das opções abaixo para iniciar sua reserva",
    optEscuna: "Passeio de Escuna",
    optEscunaDesc: "Tour completo pelas praias paradisíacas",
    optArraial: "Passeio em Arraial do Cabo",
    optArraialDesc: "Reserva com retirada na pousada",
    optOther: "Outros passeios",
    optOtherDesc: "Roteiros personalizados",
    back: "Voltar",
    bookingFor: "Reserva",
    fullName: "Nome completo do responsável",
    phone: "Número de telefone",
    passengers: "Quantidade de passageiros",
    hasChildren: "Tem passageiros criança?",
    yes: "Sim",
    no: "Não",
    childrenCount: "Quantidade de crianças (até 8)",
    childAge: (n) => `Idade da criança ${n}`,
    ageYears: "anos",
    free: "🎉 Passageiro free!",
    half: "💸 Passageiro pagando meia!",
    freePassengers: "Passageiros free",
    payment: "Forma de pagamento",
    cash: "Dinheiro",
    debit: "Cartão de débito",
    credit: "Cartão de crédito",
    pix: "Pix",
    creditWarning: "⚠️ Será adicionado um acréscimo de 5% referente à taxa da maquininha.",
    generate: "Gerar resumo da reserva",
    copy: "Copiar texto",
    copied: "Copiado!",
    share: "Compartilhar",
    reset: "Nova reserva",
    intro: "🇧🇷 Para fazer sua reserva para o passeio preciso que você me mande os seguintes dados:",
    pousadaName: "Nome da pousada",
    roomNumber: "Número do quarto",
    pousadaAddress: "Endereço da pousada",
    introArraial: "🇧🇷 Para fazer sua reserva para o passeio preciso que você me mande os seguintes dados:",
    otherSoon: "Em breve! Entre em contato direto para roteiros personalizados.",
    sumTitle: "🚤 NOVA RESERVA — Nathan Passeios",
    sumName: "Responsável",
    sumPhone: "Telefone",
    sumPax: "Passageiros",
    sumChildren: "Crianças",
    sumFree: "Passageiros free",
    sumHalf: "Passageiros meia",
    sumPay: "Pagamento",
    sumPousada: "Pousada",
    sumRoom: "Quarto",
    sumAddress: "Endereço",
    required: "Preencha todos os campos obrigatórios.",
  },
  es: {
    brand: "Nathan Paseos y Turismo",
    tagline: "Mar, sol y aventura en Arraial do Cabo",
    language: "Idioma",
    menuTitle: "Elige tu paseo",
    menuSubtitle: "Selecciona una de las opciones para iniciar tu reserva",
    optEscuna: "Paseo en Goleta",
    optEscunaDesc: "Tour completo por las playas paradisíacas",
    optArraial: "Paseo en Arraial do Cabo",
    optArraialDesc: "Reserva con recogida en la posada",
    optOther: "Otros paseos",
    optOtherDesc: "Itinerarios personalizados",
    back: "Volver",
    bookingFor: "Reserva",
    fullName: "Nombre completo del responsable",
    phone: "Número de teléfono",
    passengers: "Cantidad de pasajeros",
    hasChildren: "¿Hay pasajeros niños?",
    yes: "Sí",
    no: "No",
    childrenCount: "Cantidad de niños (hasta 8)",
    childAge: (n) => `Edad del niño ${n}`,
    ageYears: "años",
    free: "🎉 ¡Pasajero gratis!",
    half: "💸 ¡Pasajero paga media!",
    freePassengers: "Pasajeros gratis",
    payment: "Forma de pago",
    cash: "Efectivo",
    debit: "Tarjeta de débito",
    credit: "Tarjeta de crédito",
    pix: "Pix",
    creditWarning: "⚠️ Se añadirá un recargo del 5% por la tasa de la terminal.",
    generate: "Generar resumen de reserva",
    copy: "Copiar texto",
    copied: "¡Copiado!",
    share: "Compartir",
    reset: "Nueva reserva",
    intro: "🇪🇸 Para hacer tu reserva necesito que me envíes los siguientes datos:",
    pousadaName: "Nombre de la posada",
    roomNumber: "Número de habitación",
    pousadaAddress: "Dirección de la posada",
    introArraial: "🇪🇸 Para hacer tu reserva necesito que me envíes los siguientes datos:",
    otherSoon: "¡Próximamente! Contáctanos para itinerarios personalizados.",
    sumTitle: "🚤 NUEVA RESERVA — Nathan Paseos",
    sumName: "Responsable",
    sumPhone: "Teléfono",
    sumPax: "Pasajeros",
    sumChildren: "Niños",
    sumFree: "Pasajeros gratis",
    sumHalf: "Pasajeros media",
    sumPay: "Pago",
    sumPousada: "Posada",
    sumRoom: "Habitación",
    sumAddress: "Dirección",
    required: "Completa todos los campos obligatorios.",
  },
  en: {
    brand: "Nathan Tours & Tourism",
    tagline: "Sea, sun and adventure in Arraial do Cabo",
    language: "Language",
    menuTitle: "Choose your tour",
    menuSubtitle: "Select one of the options to start your booking",
    optEscuna: "Schooner Tour",
    optEscunaDesc: "Complete tour of paradise beaches",
    optArraial: "Arraial do Cabo Tour",
    optArraialDesc: "Booking with pickup at your hotel",
    optOther: "Other tours",
    optOtherDesc: "Custom itineraries",
    back: "Back",
    bookingFor: "Booking",
    fullName: "Full name of person in charge",
    phone: "Phone number",
    passengers: "Number of passengers",
    hasChildren: "Any children passengers?",
    yes: "Yes",
    no: "No",
    childrenCount: "Number of children (up to 8)",
    childAge: (n) => `Age of child ${n}`,
    ageYears: "years",
    free: "🎉 Free passenger!",
    half: "💸 Passenger pays half!",
    freePassengers: "Free passengers",
    payment: "Payment method",
    cash: "Cash",
    debit: "Debit card",
    credit: "Credit card",
    pix: "Pix",
    creditWarning: "⚠️ A 5% surcharge will be added for the card machine fee.",
    generate: "Generate booking summary",
    copy: "Copy text",
    copied: "Copied!",
    share: "Share",
    reset: "New booking",
    intro: "🇬🇧 To make your booking I need you to send me the following details:",
    pousadaName: "Hotel name",
    roomNumber: "Room number",
    pousadaAddress: "Hotel address",
    introArraial: "🇬🇧 To make your booking I need you to send me the following details:",
    otherSoon: "Coming soon! Contact us for custom itineraries.",
    sumTitle: "🚤 NEW BOOKING — Nathan Tours",
    sumName: "In charge",
    sumPhone: "Phone",
    sumPax: "Passengers",
    sumChildren: "Children",
    sumFree: "Free passengers",
    sumHalf: "Half-fare passengers",
    sumPay: "Payment",
    sumPousada: "Hotel",
    sumRoom: "Room",
    sumAddress: "Address",
    required: "Please fill in all required fields.",
  },
  fr: {
    brand: "Nathan Excursions & Tourisme",
    tagline: "Mer, soleil et aventure à Arraial do Cabo",
    language: "Langue",
    menuTitle: "Choisissez votre excursion",
    menuSubtitle: "Sélectionnez une option pour commencer votre réservation",
    optEscuna: "Excursion en Goélette",
    optEscunaDesc: "Tour complet des plages paradisiaques",
    optArraial: "Excursion à Arraial do Cabo",
    optArraialDesc: "Réservation avec prise en charge à l'hôtel",
    optOther: "Autres excursions",
    optOtherDesc: "Itinéraires personnalisés",
    back: "Retour",
    bookingFor: "Réservation",
    fullName: "Nom complet du responsable",
    phone: "Numéro de téléphone",
    passengers: "Nombre de passagers",
    hasChildren: "Y a-t-il des enfants ?",
    yes: "Oui",
    no: "Non",
    childrenCount: "Nombre d'enfants (jusqu'à 8)",
    childAge: (n) => `Âge de l'enfant ${n}`,
    ageYears: "ans",
    free: "🎉 Passager gratuit !",
    half: "💸 Passager demi-tarif !",
    freePassengers: "Passagers gratuits",
    payment: "Mode de paiement",
    cash: "Espèces",
    debit: "Carte de débit",
    credit: "Carte de crédit",
    pix: "Pix",
    creditWarning: "⚠️ Un supplément de 5% sera ajouté pour les frais du terminal.",
    generate: "Générer le résumé",
    copy: "Copier le texte",
    copied: "Copié !",
    share: "Partager",
    reset: "Nouvelle réservation",
    intro: "🇫🇷 Pour faire votre réservation, j'ai besoin des informations suivantes :",
    pousadaName: "Nom de l'hôtel",
    roomNumber: "Numéro de chambre",
    pousadaAddress: "Adresse de l'hôtel",
    introArraial: "🇫🇷 Pour faire votre réservation, j'ai besoin des informations suivantes :",
    otherSoon: "Bientôt disponible ! Contactez-nous pour des itinéraires personnalisés.",
    sumTitle: "🚤 NOUVELLE RÉSERVATION — Nathan Excursions",
    sumName: "Responsable",
    sumPhone: "Téléphone",
    sumPax: "Passagers",
    sumChildren: "Enfants",
    sumFree: "Passagers gratuits",
    sumHalf: "Passagers demi-tarif",
    sumPay: "Paiement",
    sumPousada: "Hôtel",
    sumRoom: "Chambre",
    sumAddress: "Adresse",
    required: "Veuillez remplir tous les champs obligatoires.",
  },
  it: {
    brand: "Nathan Escursioni e Turismo",
    tagline: "Mare, sole e avventura ad Arraial do Cabo",
    language: "Lingua",
    menuTitle: "Scegli la tua escursione",
    menuSubtitle: "Seleziona una delle opzioni per iniziare la prenotazione",
    optEscuna: "Tour in Goletta",
    optEscunaDesc: "Tour completo delle spiagge paradisiache",
    optArraial: "Tour ad Arraial do Cabo",
    optArraialDesc: "Prenotazione con prelievo in hotel",
    optOther: "Altri tour",
    optOtherDesc: "Itinerari personalizzati",
    back: "Indietro",
    bookingFor: "Prenotazione",
    fullName: "Nome completo del responsabile",
    phone: "Numero di telefono",
    passengers: "Numero di passeggeri",
    hasChildren: "Ci sono bambini?",
    yes: "Sì",
    no: "No",
    childrenCount: "Numero di bambini (fino a 8)",
    childAge: (n) => `Età del bambino ${n}`,
    ageYears: "anni",
    free: "🎉 Passeggero gratis!",
    half: "💸 Passeggero paga metà!",
    freePassengers: "Passeggeri gratis",
    payment: "Metodo di pagamento",
    cash: "Contanti",
    debit: "Carta di debito",
    credit: "Carta di credito",
    pix: "Pix",
    creditWarning: "⚠️ Verrà aggiunto un supplemento del 5% per la commissione del POS.",
    generate: "Genera riepilogo",
    copy: "Copia testo",
    copied: "Copiato!",
    share: "Condividi",
    reset: "Nuova prenotazione",
    intro: "🇮🇹 Per fare la prenotazione ho bisogno dei seguenti dati:",
    pousadaName: "Nome dell'hotel",
    roomNumber: "Numero di camera",
    pousadaAddress: "Indirizzo dell'hotel",
    introArraial: "🇮🇹 Per fare la prenotazione ho bisogno dei seguenti dati:",
    otherSoon: "Presto disponibile! Contattaci per itinerari personalizzati.",
    sumTitle: "🚤 NUOVA PRENOTAZIONE — Nathan Tour",
    sumName: "Responsabile",
    sumPhone: "Telefono",
    sumPax: "Passeggeri",
    sumChildren: "Bambini",
    sumFree: "Passeggeri gratis",
    sumHalf: "Passeggeri metà tariffa",
    sumPay: "Pagamento",
    sumPousada: "Hotel",
    sumRoom: "Camera",
    sumAddress: "Indirizzo",
    required: "Compila tutti i campi obbligatori.",
  },
};

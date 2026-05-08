export type Lang = "pt" | "es" | "en" | "fr" | "it";

// ----- Persistência + integração com parâmetro ?lang= -----
const LANG_KEY = "nathan_lang_v1";
const LANG_ALIASES: Record<string, Lang> = {
  pt: "pt", "pt-br": "pt", br: "pt",
  es: "es", "es-es": "es",
  en: "en", us: "en", "en-us": "en", uk: "en", gb: "en",
  fr: "fr", "fr-fr": "fr",
  it: "it", "it-it": "it",
};

export const parseLangFromUrl = (): Lang | null => {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("lang");
  if (!raw) return null;
  return LANG_ALIASES[raw.trim().toLowerCase()] || null;
};

export const loadLang = (): Lang => {
  try {
    const fromUrl = parseLangFromUrl();
    if (fromUrl) {
      localStorage.setItem(LANG_KEY, fromUrl);
      return fromUrl;
    }
    const saved = localStorage.getItem(LANG_KEY) as Lang | null;
    if (saved && ["pt","es","en","fr","it"].includes(saved)) return saved;
  } catch {}
  return "pt";
};

export const saveLang = (l: Lang) => {
  try { localStorage.setItem(LANG_KEY, l); } catch {}
};

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
  whatsappSupport: string;
  ddi: string;
  welcome: string;
  optBuggy: string;
  optBuggyDesc: string;
  optCatamara: string;
  optCatamaraDesc: string;
  optJardineira: string;
  optJardineiraDesc: string;
  optMergulho: string;
  optMergulhoDesc: string;
  optLancha: string;
  optLanchaDesc: string;
  cpfResponsible: string;
  adultsOnly: string;
  adultsOnlyNotice: string;
  tourDate: string;
  pickDate: string;
  sumDate: string;
  // Home page
  brandSubtitle: string;
  ourTours: string;
  viewDetails: string;
  bookNowBtn: string;
  footerRegion: string;
  // Cabo Frio tour
  optCaboFrio: string;
  optCaboFrioDesc: string;
  // Card descriptions (short)
  descEscuna: string;
  descArraial: string;
  descBuggy: string;
  descCaboFrio: string;
  descJardineira: string;
  descCatamara: string;
  descMergulho: string;
  descLancha: string;
  // Form notices
  noticeArraial: string;
  noticeCaboFrio: string;
  noticeCatamara: string;
};

export const dict: Record<Lang, Dict> = {
  pt: {
    brand: "Nathan Passeios e Turismo",
    tagline: "",
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
    generate: "Reservar seu passeio",
    copy: "Copiar texto",
    copied: "Copiado!",
    share: "Enviar sua reserva",
    reset: "Nova reserva",
    intro: "🇧🇷 Para fazer sua reserva para o passeio preciso que você me mande os seguintes dados:",
    pousadaName: "Nome da pousada",
    roomNumber: "Número do quarto",
    optional: "opcional",
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
    whatsappSupport: "Suporte no WhatsApp",
    ddi: "DDI",
    welcome: "Bem-vindo ao nosso espaço oficial de reservas. Criei este espaço para tornar sua reserva mais prática, segura e organizada. Escolha seu passeio e, se precisar, estou disponível no WhatsApp para te ajudar.",
    optBuggy: "Passeio de Buggy",
    optBuggyDesc: "Aventura nas dunas e praias",
    optCatamara: "Passeio de Catamarã",
    optCatamaraDesc: "Conforto e visual privilegiado no mar",
    optJardineira: "Passeio de Jardineira",
    optJardineiraDesc: "Tour terrestre pelos pontos turísticos",
    optMergulho: "Mergulho no Parque dos Corais",
    optMergulhoDesc: "Mergulho em águas cristalinas",
    optLancha: "Lancha Privada",
    optLanchaDesc: "Experiência exclusiva e privativa",
    cpfResponsible: "CPF do responsável",
    adultsOnly: "Apenas maiores de 18 anos",
    adultsOnlyNotice: "Experiência exclusiva para maiores de 18 anos.",
    tourDate: "Data do passeio",
    pickDate: "Selecione a data",
    sumDate: "Data",
    brandSubtitle: "Passeios e Turismo",
    ourTours: "Nossos Passeios",
    viewDetails: "Ver Detalhes",
    bookNowBtn: "Reservar agora",
    footerRegion: "Búzios & Região dos Lagos",
    optCaboFrio: "Cabo Frio",
    optCaboFrioDesc: "Passeio terrestre com guia bilíngue, almoço e Shopping Park Lagos.",
    descEscuna: "Dois decks, dois toboáguas, 11 praias e 3 ilhas em 2h30 de puro lazer.",
    descArraial: "Dia completo com translado, escuna 3h30 e almoço buffet livre.",
    descBuggy: "8 praias e 3 mirantes em 1h30 de aventura pelas dunas de Búzios.",
    descCaboFrio: "Passeio terrestre com guia bilíngue, almoço e Shopping Park Lagos.",
    descJardineira: "12 praias, 2 mirantes e banho na Praia do Forno em 2 horas.",
    descCatamara: "12 praias, 3 ilhas, DJ a bordo e 3 paradas para banho em 2h30.",
    descMergulho: "Experiência de mergulho com instrutor certificado. Fotos e vídeo inclusos.",
    descLancha: "Experiência privativa premium com 10 praias, 3 ilhas e churrasco.",
    noticeArraial: "Taxas de Jardineira e de Embarque, bebidas e sobremesas não inclusas.",
    noticeCaboFrio: "Barco táxi até a Ilha do Japonês, bebidas e sobremesas do almoço não inclusos.",
    noticeCatamara: "Não é permitido levar coolers, caixas ou bolsas térmicas para a embarcação.",
  },
  es: {
    brand: "Nathan Paseos y Turismo",
    tagline: "",
    language: "Idioma",
    menuTitle: "Elige tu paseo",
    menuSubtitle: "Selecciona una de las opciones para iniciar tu reserva",
    optEscuna: "Paseo en Escuna",
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
    generate: "Reservar tu paseo",
    copy: "Copiar texto",
    copied: "¡Copiado!",
    share: "Enviar tu reserva",
    reset: "Nueva reserva",
    intro: "🇪🇸 Para hacer tu reserva necesito que me envíes los siguientes datos:",
    pousadaName: "Nombre de la posada",
    roomNumber: "Número de habitación",
    optional: "opcional",
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
    whatsappSupport: "Soporte por WhatsApp",
    ddi: "DDI",
    welcome: "Bienvenido a nuestro espacio oficial de reservas. Creé este espacio para hacer tu reserva más práctica, segura y organizada. Elige tu paseo y, si lo necesitas, estoy disponible en WhatsApp para ayudarte.",
    optBuggy: "Paseo en Buggy",
    optBuggyDesc: "Aventura en dunas y playas",
    optCatamara: "Paseo en Catamarán",
    optCatamaraDesc: "Confort y vistas privilegiadas",
    optJardineira: "Paseo en Jardinera",
    optJardineiraDesc: "Tour terrestre por los puntos turísticos",
    optMergulho: "Buceo en el Parque de los Corales",
    optMergulhoDesc: "Buceo en aguas cristalinas",
    optLancha: "Lancha Privada",
    optLanchaDesc: "Experiencia exclusiva y privada",
    cpfResponsible: "CPF del responsable",
    adultsOnly: "Solo mayores de 18 años",
    adultsOnlyNotice: "Experiencia exclusiva para mayores de 18 años.",
    tourDate: "Fecha del paseo",
    pickDate: "Selecciona la fecha",
    sumDate: "Fecha",
    brandSubtitle: "Paseos y Turismo",
    ourTours: "Nuestros Paseos",
    viewDetails: "Ver Detalles",
    bookNowBtn: "Reservar ahora",
    footerRegion: "Búzios y Región de los Lagos",
    optCaboFrio: "Cabo Frio",
    optCaboFrioDesc: "Tour terrestre con guía bilingüe, almuerzo y Shopping Park Lagos.",
    descEscuna: "Dos cubiertas, dos toboganes, 11 playas y 3 islas en 2h30 de puro ocio.",
    descArraial: "Día completo con traslado, goleta 3h30 y almuerzo buffet libre.",
    descBuggy: "8 playas y 3 miradores en 1h30 de aventura por las dunas de Búzios.",
    descCaboFrio: "Tour terrestre con guía bilingüe, almuerzo y Shopping Park Lagos.",
    descJardineira: "12 playas, 2 miradores y baño en la Praia do Forno en 2 horas.",
    descCatamara: "12 playas, 3 islas, DJ a bordo y 3 paradas de baño en 2h30.",
    descMergulho: "Experiencia de buceo con instructor certificado. Fotos y vídeo incluidos.",
    descLancha: "Experiencia privada premium con 10 playas, 3 islas y barbacoa.",
    noticeArraial: "Tasas de Jardinera y de Embarque, bebidas y postres no incluidos.",
    noticeCaboFrio: "Barco taxi hasta la Isla del Japonés, bebidas y postres del almuerzo no incluidos.",
    noticeCatamara: "No se permite llevar neveras, cajas ni bolsas térmicas a bordo.",
  },
  en: {
    brand: "Nathan Tours & Tourism",
    tagline: "",
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
    generate: "Book your tour",
    copy: "Copy text",
    copied: "Copied!",
    share: "Send your booking",
    reset: "New booking",
    intro: "🇬🇧 To make your booking I need you to send me the following details:",
    pousadaName: "Hotel name",
    roomNumber: "Room number",
    optional: "optional",
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
    whatsappSupport: "WhatsApp Support",
    ddi: "Country code",
    welcome: "Welcome to our official booking space. I created this space to make your reservation more practical, secure and organized. Choose your tour and, if you need, I'm available on WhatsApp to help you.",
    optBuggy: "Buggy Tour",
    optBuggyDesc: "Adventure on dunes and beaches",
    optCatamara: "Catamaran Tour",
    optCatamaraDesc: "Comfort and privileged sea views",
    optJardineira: "Open-Bus Tour",
    optJardineiraDesc: "Land tour around the highlights",
    optMergulho: "Coral Park Diving",
    optMergulhoDesc: "Dive in crystal-clear waters",
    optLancha: "Private Speedboat",
    optLanchaDesc: "Exclusive and private experience",
    cpfResponsible: "CPF of person in charge",
    adultsOnly: "18+ only",
    adultsOnlyNotice: "Exclusive experience for guests over 18 years old.",
    tourDate: "Tour date",
    pickDate: "Pick the date",
    sumDate: "Date",
    brandSubtitle: "Tours & Tourism",
    ourTours: "Our Tours",
    viewDetails: "View Details",
    bookNowBtn: "Book now",
    footerRegion: "Búzios & Lakes Region",
    optCaboFrio: "Cabo Frio",
    optCaboFrioDesc: "Land tour with bilingual guide, lunch and Park Lagos Mall.",
    descEscuna: "Two decks, two water slides, 11 beaches and 3 islands in 2h30 of pure leisure.",
    descArraial: "Full day with transfer, 3h30 schooner ride and free buffet lunch.",
    descBuggy: "8 beaches and 3 viewpoints in 1h30 of adventure through Búzios dunes.",
    descCaboFrio: "Land tour with bilingual guide, lunch and Park Lagos Mall.",
    descJardineira: "12 beaches, 2 viewpoints and a swim at Praia do Forno in 2 hours.",
    descCatamara: "12 beaches, 3 islands, onboard DJ and 3 swim stops in 2h30.",
    descMergulho: "Diving experience with certified instructor. Photos and video included.",
    descLancha: "Premium private experience with 10 beaches, 3 islands and barbecue.",
    noticeArraial: "Open-bus and boarding fees, drinks and desserts not included.",
    noticeCaboFrio: "Water taxi to Japonês Island, drinks and lunch desserts not included.",
    noticeCatamara: "Coolers, boxes or thermal bags are not allowed onboard.",
  },
  fr: {
    brand: "Nathan Excursions & Tourisme",
    tagline: "",
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
    generate: "Réserver votre excursion",
    copy: "Copier le texte",
    copied: "Copié !",
    share: "Envoyer votre réservation",
    reset: "Nouvelle réservation",
    intro: "🇫🇷 Pour faire votre réservation, j'ai besoin des informations suivantes :",
    pousadaName: "Nom de l'hôtel",
    roomNumber: "Numéro de chambre",
    optional: "facultatif",
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
    whatsappSupport: "Support WhatsApp",
    ddi: "Indicatif",
    welcome: "Bienvenue dans notre espace officiel de réservation. J'ai créé cet espace pour rendre votre réservation plus pratique, sûre et organisée. Choisissez votre excursion et, si besoin, je suis disponible sur WhatsApp pour vous aider.",
    optBuggy: "Excursion en Buggy",
    optBuggyDesc: "Aventure sur les dunes et les plages",
    optCatamara: "Excursion en Catamaran",
    optCatamaraDesc: "Confort et vues privilégiées sur la mer",
    optJardineira: "Excursion en Bus Découvert",
    optJardineiraDesc: "Tour terrestre des points d'intérêt",
    optMergulho: "Plongée au Parc des Coraux",
    optMergulhoDesc: "Plongée en eaux cristallines",
    optLancha: "Bateau Privé",
    optLanchaDesc: "Expérience exclusive et privée",
    cpfResponsible: "CPF du responsable",
    adultsOnly: "Réservé aux +18 ans",
    adultsOnlyNotice: "Expérience exclusive réservée aux personnes de plus de 18 ans.",
    tourDate: "Date de l'excursion",
    pickDate: "Choisissez la date",
    sumDate: "Date",
    brandSubtitle: "Excursions et Tourisme",
    ourTours: "Nos Excursions",
    viewDetails: "Voir les détails",
    bookNowBtn: "Réserver",
    footerRegion: "Búzios & Région des Lacs",
    optCaboFrio: "Cabo Frio",
    optCaboFrioDesc: "Excursion terrestre avec guide bilingue, déjeuner et Shopping Park Lagos.",
    descEscuna: "Deux ponts, deux toboggans, 11 plages et 3 îles en 2h30 de pur plaisir.",
    descArraial: "Journée complète avec transfert, goélette 3h30 et déjeuner buffet libre.",
    descBuggy: "8 plages et 3 points de vue en 1h30 d'aventure dans les dunes de Búzios.",
    descCaboFrio: "Excursion terrestre avec guide bilingue, déjeuner et Shopping Park Lagos.",
    descJardineira: "12 plages, 2 points de vue et baignade à Praia do Forno en 2 heures.",
    descCatamara: "12 plages, 3 îles, DJ à bord et 3 arrêts baignade en 2h30.",
    descMergulho: "Expérience de plongée avec instructeur certifié. Photos et vidéo inclus.",
    descLancha: "Expérience privée premium avec 10 plages, 3 îles et barbecue.",
    noticeArraial: "Frais de Bus Découvert et d'Embarquement, boissons et desserts non inclus.",
    noticeCaboFrio: "Bateau-taxi vers l'Île du Japonais, boissons et desserts du déjeuner non inclus.",
    noticeCatamara: "Glacières, boîtes ou sacs isothermes ne sont pas autorisés à bord.",
  },
  it: {
    brand: "Nathan Escursioni e Turismo",
    tagline: "",
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
    generate: "Prenota la tua escursione",
    copy: "Copia testo",
    copied: "Copiato!",
    share: "Invia la tua prenotazione",
    reset: "Nuova prenotazione",
    intro: "🇮🇹 Per fare la prenotazione ho bisogno dei seguenti dati:",
    pousadaName: "Nome dell'hotel",
    roomNumber: "Numero di camera",
    optional: "facoltativo",
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
    whatsappSupport: "Supporto WhatsApp",
    ddi: "Prefisso",
    welcome: "Benvenuto nel nostro spazio ufficiale di prenotazione. Ho creato questo spazio per rendere la tua prenotazione più pratica, sicura e organizzata. Scegli la tua escursione e, se hai bisogno, sono disponibile su WhatsApp per aiutarti.",
    optBuggy: "Tour in Buggy",
    optBuggyDesc: "Avventura tra dune e spiagge",
    optCatamara: "Tour in Catamarano",
    optCatamaraDesc: "Comfort e vista privilegiata sul mare",
    optJardineira: "Tour in Bus Aperto",
    optJardineiraDesc: "Tour terrestre dei punti turistici",
    optMergulho: "Immersione al Parco dei Coralli",
    optMergulhoDesc: "Immersione in acque cristalline",
    optLancha: "Motoscafo Privato",
    optLanchaDesc: "Esperienza esclusiva e privata",
    cpfResponsible: "CPF del responsabile",
    adultsOnly: "Solo per maggiori di 18 anni",
    adultsOnlyNotice: "Esperienza esclusiva per i maggiori di 18 anni.",
    tourDate: "Data del tour",
    pickDate: "Seleziona la data",
    sumDate: "Data",
    brandSubtitle: "Escursioni e Turismo",
    ourTours: "I Nostri Tour",
    viewDetails: "Vedi dettagli",
    bookNowBtn: "Prenota ora",
    footerRegion: "Búzios & Regione dei Laghi",
    optCaboFrio: "Cabo Frio",
    optCaboFrioDesc: "Tour terrestre con guida bilingue, pranzo e Shopping Park Lagos.",
    descEscuna: "Due ponti, due scivoli, 11 spiagge e 3 isole in 2h30 di puro relax.",
    descArraial: "Giornata intera con transfer, goletta 3h30 e pranzo a buffet libero.",
    descBuggy: "8 spiagge e 3 punti panoramici in 1h30 di avventura tra le dune di Búzios.",
    descCaboFrio: "Tour terrestre con guida bilingue, pranzo e Shopping Park Lagos.",
    descJardineira: "12 spiagge, 2 punti panoramici e bagno a Praia do Forno in 2 ore.",
    descCatamara: "12 spiagge, 3 isole, DJ a bordo e 3 soste bagno in 2h30.",
    descMergulho: "Esperienza di immersione con istruttore certificato. Foto e video inclusi.",
    descLancha: "Esperienza privata premium con 10 spiagge, 3 isole e barbecue.",
    noticeArraial: "Tasse del Bus Aperto e di Imbarco, bevande e dessert non inclusi.",
    noticeCaboFrio: "Barca taxi per l'Isola del Giapponese, bevande e dessert del pranzo non inclusi.",
    noticeCatamara: "Non è consentito portare frigoriferi, scatole o borse termiche a bordo.",
  },
};

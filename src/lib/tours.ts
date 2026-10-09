import { Lang } from "./i18n";
import escunaImg from "@/assets/escuna.jpg";
import arraialImg from "@/assets/arraial-do-cabo.jpg";
import buggyImg from "@/assets/buggy.jpg";
import catamaraImg from "@/assets/catamara.jpg";
import jardineiraImg from "@/assets/jardineira.jpg";
import mergulhoImg from "@/assets/mergulho.jpg";
import lanchaImg from "@/assets/lancha.jpg";

export type TourKey =
  | "escuna"
  | "arraial"
  | "buggy"
  | "cabofrio"
  | "jardineira"
  | "catamara"
  | "mergulho"
  | "lancha";

export type TourSection = {
  title: string;
  items?: string[];
  text?: string;
};

export type TourDetail = {
  key: TourKey;
  image: string;
  images?: string[];
  video?: string;
  videos?: string[];
  title: string;
  hook: string;
  rating: number;
  reviews: number;
  duration: string;
  location: string;
  capacity: string;
  languages: string;
  sections: TourSection[];
  notice?: string;
  childrenPolicy?: string[];
  adultsOnly?: boolean;
};

// Section labels (i18n)
const L: Record<Lang, Record<string, string>> = {
  pt: {
    rating: "Avaliação",
    duration: "Duração",
    location: "Localização",
    capacity: "Capacidade",
    languages: "Idiomas",
    itinerary: "Roteiro",
    beaches: "Praias",
    islands: "Ilhas",
    stops: "Paradas",
    included: "Inclusos",
    optional: "Opcionais pagos",
    extras: "Extras",
    notes: "Observações",
    childPolicy: "Política infantil",
    bookNow: "Reservar agora",
    pickup: "Busca",
    return: "Retorno",
    boatRide: "Passeio de barco",
    departures: "Saídas",
    schedule: "Horário",
    description: "Descrição",
    instruction: "Instrução",
    practice: "Prática rasa",
    diving: "Mergulho assistido",
    exclusive: "Exclusivo",
    upTo: "Até",
    persons: "pessoas",
    languagesAll: "PT · ES · EN · FR · IT",
    locBuzios: "Búzios — RJ",
    locArraial: "Arraial do Cabo — RJ",
    locCaboFrio: "Cabo Frio — RJ",
    fullDay: "Dia completo",
  },
  es: {
    rating: "Valoración",
    duration: "Duración",
    location: "Ubicación",
    capacity: "Capacidad",
    languages: "Idiomas",
    itinerary: "Itinerario",
    beaches: "Playas",
    islands: "Islas",
    stops: "Paradas",
    included: "Incluido",
    optional: "Opcionales pagos",
    extras: "Extras",
    notes: "Observaciones",
    childPolicy: "Política infantil",
    bookNow: "Reservar ahora",
    pickup: "Recogida",
    return: "Regreso",
    boatRide: "Paseo en barco",
    departures: "Salidas",
    schedule: "Horario",
    description: "Descripción",
    instruction: "Instrucción",
    practice: "Práctica en aguas poco profundas",
    diving: "Buceo asistido",
    exclusive: "Exclusivo",
    upTo: "Hasta",
    persons: "personas",
    languagesAll: "PT · ES · EN · FR · IT",
    locBuzios: "Búzios — RJ",
    locArraial: "Arraial do Cabo — RJ",
    locCaboFrio: "Cabo Frio — RJ",
    fullDay: "Día completo",
  },
  en: {
    rating: "Rating",
    duration: "Duration",
    location: "Location",
    capacity: "Capacity",
    languages: "Languages",
    itinerary: "Itinerary",
    beaches: "Beaches",
    islands: "Islands",
    stops: "Stops",
    included: "Included",
    optional: "Paid optionals",
    extras: "Extras",
    notes: "Notes",
    childPolicy: "Child policy",
    bookNow: "Book now",
    pickup: "Pickup",
    return: "Return",
    boatRide: "Boat ride",
    departures: "Departures",
    schedule: "Schedule",
    description: "Description",
    instruction: "Instruction",
    practice: "Shallow practice",
    diving: "Assisted diving",
    exclusive: "Exclusive",
    upTo: "Up to",
    persons: "people",
    languagesAll: "PT · ES · EN · FR · IT",
    locBuzios: "Búzios — RJ",
    locArraial: "Arraial do Cabo — RJ",
    locCaboFrio: "Cabo Frio — RJ",
    fullDay: "Full day",
  },
  fr: {
    rating: "Note",
    duration: "Durée",
    location: "Emplacement",
    capacity: "Capacité",
    languages: "Langues",
    itinerary: "Itinéraire",
    beaches: "Plages",
    islands: "Îles",
    stops: "Arrêts",
    included: "Inclus",
    optional: "Options payantes",
    extras: "Extras",
    notes: "Remarques",
    childPolicy: "Politique enfants",
    bookNow: "Réserver maintenant",
    pickup: "Prise en charge",
    return: "Retour",
    boatRide: "Promenade en bateau",
    departures: "Départs",
    schedule: "Horaire",
    description: "Description",
    instruction: "Instruction",
    practice: "Pratique en eau peu profonde",
    diving: "Plongée assistée",
    exclusive: "Exclusif",
    upTo: "Jusqu'à",
    persons: "personnes",
    languagesAll: "PT · ES · EN · FR · IT",
    locBuzios: "Búzios — RJ",
    locArraial: "Arraial do Cabo — RJ",
    locCaboFrio: "Cabo Frio — RJ",
    fullDay: "Journée complète",
  },
  it: {
    rating: "Valutazione",
    duration: "Durata",
    location: "Località",
    capacity: "Capacità",
    languages: "Lingue",
    itinerary: "Itinerario",
    beaches: "Spiagge",
    islands: "Isole",
    stops: "Soste",
    included: "Incluso",
    optional: "Opzionali a pagamento",
    extras: "Extra",
    notes: "Note",
    childPolicy: "Politica bambini",
    bookNow: "Prenota ora",
    pickup: "Ritiro",
    return: "Rientro",
    boatRide: "Giro in barca",
    departures: "Partenze",
    schedule: "Orario",
    description: "Descrizione",
    instruction: "Istruzione",
    practice: "Pratica in acque basse",
    diving: "Immersione assistita",
    exclusive: "Esclusivo",
    upTo: "Fino a",
    persons: "persone",
    languagesAll: "PT · ES · EN · FR · IT",
    locBuzios: "Búzios — RJ",
    locArraial: "Arraial do Cabo — RJ",
    locCaboFrio: "Cabo Frio — RJ",
    fullDay: "Giornata intera",
  },
};

export const sectionLabels = (lang: Lang) => L[lang];

type ForeignLang = Exclude<Lang, "pt">;
const C: Record<string, Record<ForeignLang, string>> = {
  "Banheiros": { es: "Baños", en: "Restrooms", fr: "Toilettes", it: "Servizi igienici" },
  "Boias": { es: "Flotadores", en: "Floats", fr: "Bouées", it: "Galleggianti" },
  "Coletes salva-vidas": { es: "Chalecos salvavidas", en: "Life jackets", fr: "Gilets de sauvetage", it: "Giubbotti di salvataggio" },
  "Bar com barman": { es: "Bar con barman", en: "Bar with bartender", fr: "Bar avec barman", it: "Bar con barman" },
  "Churrasco (Espetos)": { es: "Parrillada (Brochetas)", en: "Barbecue (Skewers)", fr: "Barbecue (Brochettes)", it: "Barbecue (Spiedini)" },
  "Máscara de mergulho": { es: "Máscara de buceo", en: "Diving mask", fr: "Masque de plongée", it: "Maschera da immersione" },
  "Fotos profissionais": { es: "Fotos profesionales", en: "Professional photos", fr: "Photos professionnelles", it: "Foto professionali" },
  "0–5 — grátis": { es: "0–5 — gratis", en: "0–5 — free", fr: "0–5 — gratuit", it: "0–5 — gratuito" },
  "6–10 — meia passagem": { es: "6–10 — media tarifa", en: "6–10 — half fare", fr: "6–10 — demi-tarif", it: "6–10 — metà tariffa" },
  "11+ — integral": { es: "11+ — tarifa completa", en: "11+ — full fare", fr: "11+ — plein tarif", it: "11+ — tariffa intera" },
  "Roteiro sujeito às condições climáticas.": { es: "Itinerario sujeto a las condiciones climáticas.", en: "Itinerary subject to weather conditions.", fr: "Itinéraire soumis aux conditions météorologiques.", it: "Itinerario soggetto alle condizioni meteorologiche." },
  "Ao chegarmos em Arraial do Cabo, os passageiros são transferidos para uma Jardineira até o píer de embarque.": { es: "Al llegar a Arraial do Cabo, los pasajeros son trasladados en una jardinera hasta el muelle de embarque.", en: "Upon arrival in Arraial do Cabo, passengers are transferred by open-air bus to the boarding pier.", fr: "À l'arrivée à Arraial do Cabo, les passagers sont transférés en bus ouvert jusqu'au quai d'embarquement.", it: "All'arrivo ad Arraial do Cabo, i passeggeri vengono trasferiti con un bus aperto fino al molo d'imbarco." },
  "Translado": { es: "Traslado", en: "Transfer", fr: "Transfert", it: "Trasferimento" },
  "Almoço Buffet Livre": { es: "Almuerzo buffet libre", en: "All-you-can-eat buffet lunch", fr: "Déjeuner buffet à volonté", it: "Pranzo a buffet libero" },
  "Som ambiente": { es: "Música ambiente", en: "Ambient music", fr: "Musique d'ambiance", it: "Musica d'ambiente" },
  "Coletes": { es: "Chalecos salvavidas", en: "Life jackets", fr: "Gilets de sauvetage", it: "Giubbotti di salvataggio" },
  "8 praias": { es: "8 playas", en: "8 beaches", fr: "8 plages", it: "8 spiagge" },
  "3 mirantes": { es: "3 miradores", en: "3 viewpoints", fr: "3 belvédères", it: "3 punti panoramici" },
  "Paradas para fotos": { es: "Paradas para fotos", en: "Photo stops", fr: "Arrêts photo", it: "Soste fotografiche" },
  "Almoço": { es: "Almuerzo", en: "Lunch", fr: "Déjeuner", it: "Pranzo" },
  "Transporte": { es: "Transporte", en: "Transportation", fr: "Transport", it: "Trasporto" },
  "Guia bilíngue": { es: "Guía bilingüe", en: "Bilingual guide", fr: "Guide bilingue", it: "Guida bilingue" },
  "Almoço buffet": { es: "Almuerzo buffet", en: "Buffet lunch", fr: "Déjeuner buffet", it: "Pranzo a buffet" },
  "12 praias": { es: "12 playas", en: "12 beaches", fr: "12 plages", it: "12 spiagge" },
  "2 mirantes": { es: "2 miradores", en: "2 viewpoints", fr: "2 belvédères", it: "2 punti panoramici" },
  "Parada para banho na Praia do Forno": { es: "Parada para bañarse en Praia do Forno", en: "Swimming stop at Praia do Forno", fr: "Arrêt baignade à Praia do Forno", it: "Sosta per il bagno a Praia do Forno" },
  "3 ilhas": { es: "3 islas", en: "3 islands", fr: "3 îles", it: "3 isole" },
  "3 paradas": { es: "3 paradas", en: "3 stops", fr: "3 arrêts", it: "3 soste" },
  "DJ a bordo": { es: "DJ a bordo", en: "Onboard DJ", fr: "DJ à bord", it: "DJ a bordo" },
  "Ducha": { es: "Ducha", en: "Shower", fr: "Douche", it: "Doccia" },
  "Música ambiente": { es: "Música ambiente", en: "Ambient music", fr: "Musique d'ambiance", it: "Musica d'ambiente" },
  "Fotos subaquáticas": { es: "Fotos submarinas", en: "Underwater photos", fr: "Photos sous-marines", it: "Foto subacquee" },
  "Equipamento completo": { es: "Equipo completo", en: "Full equipment", fr: "Équipement complet", it: "Attrezzatura completa" },
  "4 fotos subaquáticas": { es: "4 fotos submarinas", en: "4 underwater photos", fr: "4 photos sous-marines", it: "4 foto subacquee" },
  "1 vídeo subaquático": { es: "1 vídeo submarino", en: "1 underwater video", fr: "1 vidéo sous-marine", it: "1 video subacqueo" },
  "Instrutor certificado": { es: "Instructor certificado", en: "Certified instructor", fr: "Moniteur certifié", it: "Istruttore certificato" },
  "10 praias": { es: "10 playas", en: "10 beaches", fr: "10 plages", it: "10 spiagge" },
  "Espaguetes flutuantes": { es: "Churros flotantes", en: "Pool noodles", fr: "Frites flottantes", it: "Tubi galleggianti" },
  "Gelo": { es: "Hielo", en: "Ice", fr: "Glace", it: "Ghiaccio" },
  "Valor variável conforme o modelo da lancha.": { es: "El valor varía según el modelo de la lancha.", en: "Price varies according to the speedboat model.", fr: "Le prix varie selon le modèle du bateau.", it: "Il prezzo varia in base al modello del motoscafo." },
};

const tr = (lang: Lang, value: string) => lang === "pt" ? value : C[value]?.[lang] ?? value;
const trs = (lang: Lang, values: string[]) => values.map((value) => tr(lang, value));

// Hooks (emotional phrases) and titles per language
type Texts = { title: string; hook: string };
const T: Record<TourKey, Record<Lang, Texts>> = {
  escuna: {
    pt: { title: "Passeio de Escuna em Búzios", hook: "Descubra as águas cristalinas e praias paradisíacas de Búzios em uma experiência inesquecível." },
    es: { title: "Paseo en Goleta en Búzios", hook: "Descubre las aguas cristalinas y playas paradisíacas de Búzios en una experiencia inolvidable." },
    en: { title: "Schooner Tour in Búzios", hook: "Discover the crystal-clear waters and paradise beaches of Búzios in an unforgettable experience." },
    fr: { title: "Excursion en Goélette à Búzios", hook: "Découvrez les eaux cristallines et les plages paradisiaques de Búzios dans une expérience inoubliable." },
    it: { title: "Tour in Goletta a Búzios", hook: "Scopri le acque cristalline e le spiagge paradisiache di Búzios in un'esperienza indimenticabile." },
  },
  arraial: {
    pt: { title: "Passeio em Arraial do Cabo", hook: "Conheça o Caribe brasileiro em uma experiência completa de mar, natureza e conforto." },
    es: { title: "Paseo en Arraial do Cabo", hook: "Conoce el Caribe brasileño en una experiencia completa de mar, naturaleza y confort." },
    en: { title: "Arraial do Cabo Tour", hook: "Experience the Brazilian Caribbean in a complete journey of sea, nature and comfort." },
    fr: { title: "Excursion à Arraial do Cabo", hook: "Découvrez les Caraïbes brésiliennes dans une expérience complète de mer, nature et confort." },
    it: { title: "Tour ad Arraial do Cabo", hook: "Scopri i Caraibi brasiliani in un'esperienza completa di mare, natura e comfort." },
  },
  buggy: {
    pt: { title: "Passeio de Buggy", hook: "Aventura, adrenalina e paisagens incríveis pelas praias mais belas de Búzios." },
    es: { title: "Paseo en Buggy", hook: "Aventura, adrenalina y paisajes increíbles por las playas más bellas de Búzios." },
    en: { title: "Buggy Tour", hook: "Adventure, adrenaline and stunning landscapes through the most beautiful beaches of Búzios." },
    fr: { title: "Excursion en Buggy", hook: "Aventure, adrénaline et paysages incroyables sur les plus belles plages de Búzios." },
    it: { title: "Tour in Buggy", hook: "Avventura, adrenalina e paesaggi incredibili tra le spiagge più belle di Búzios." },
  },
  cabofrio: {
    pt: { title: "Passeio em Cabo Frio", hook: "Um dia completo explorando praias incríveis, gastronomia e lazer." },
    es: { title: "Passeio em Cabo Frio", hook: "Un día completo explorando playas increíbles, gastronomía y ocio." },
    en: { title: "Passeio em Cabo Frio", hook: "A full day exploring stunning beaches, gastronomy and leisure." },
    fr: { title: "Passeio em Cabo Frio", hook: "Une journée complète à explorer plages incroyables, gastronomie et loisirs." },
    it: { title: "Passeio em Cabo Frio", hook: "Una giornata intera esplorando spiagge incredibili, gastronomia e svago." },
  },
  jardineira: {
    pt: { title: "Passeio de Jardineira", hook: "Explore os cenários mais belos de Búzios com conforto e segurança." },
    es: { title: "Paseo en Jardinera", hook: "Explora los paisajes más bellos de Búzios con confort y seguridad." },
    en: { title: "Open-Bus Tour", hook: "Explore the most beautiful sceneries of Búzios with comfort and safety." },
    fr: { title: "Excursion en Bus Découvert", hook: "Explorez les plus beaux paysages de Búzios en tout confort et sécurité." },
    it: { title: "Tour in Bus Aperto", hook: "Esplora i panorami più belli di Búzios con comfort e sicurezza." },
  },
  catamara: {
    pt: { title: "Passeio de Catamarã", hook: "Uma experiência exclusiva navegando pelo melhor de Búzios." },
    es: { title: "Paseo en Catamarán", hook: "Una experiencia exclusiva navegando por lo mejor de Búzios." },
    en: { title: "Catamaran Tour", hook: "An exclusive experience sailing through the best of Búzios." },
    fr: { title: "Excursion en Catamaran", hook: "Une expérience exclusive en naviguant à travers le meilleur de Búzios." },
    it: { title: "Tour in Catamarano", hook: "Un'esperienza esclusiva navigando attraverso il meglio di Búzios." },
  },
  mergulho: {
    pt: { title: "Mergulho em João Fernandes", hook: "Descubra um jardim submerso com segurança total e acompanhamento profissional." },
    es: { title: "Buceo en João Fernandes", hook: "Descubre un jardín submarino con total seguridad y acompañamiento profesional." },
    en: { title: "Diving at João Fernandes", hook: "Discover an underwater garden with full safety and professional guidance." },
    fr: { title: "Plongée à João Fernandes", hook: "Découvrez un jardin sous-marin en toute sécurité avec un accompagnement professionnel." },
    it: { title: "Immersione a João Fernandes", hook: "Scopri un giardino sottomarino in totale sicurezza con guida professionale." },
  },
  lancha: {
    pt: { title: "Lancha Privada", hook: "Exclusividade, conforto e liberdade para viver Búzios no seu ritmo." },
    es: { title: "Lancha Privada", hook: "Exclusividad, confort y libertad para vivir Búzios a tu ritmo." },
    en: { title: "Private Speedboat", hook: "Exclusivity, comfort and freedom to live Búzios at your own pace." },
    fr: { title: "Bateau Privé", hook: "Exclusivité, confort et liberté pour vivre Búzios à votre rythme." },
    it: { title: "Motoscafo Privato", hook: "Esclusività, comfort e libertà per vivere Búzios al tuo ritmo." },
  },
};

import { getCachedTour } from "./cmsCache";

export const getTour = (key: TourKey, lang: Lang): TourDetail => {
  const base = _getTour(key, lang);
  const db = getCachedTour(key);
  const videos = [db?.video_url, db?.video_2_url].filter((url): url is string => !!url);
  const images = [db?.imagem_url, ...(db?.gallery_imagens || [])].filter((url): url is string => !!url);
  return {
    ...base,
    images: images.length ? images : [base.image],
    video: videos[0],
    videos: videos.length ? videos : undefined,
  };
};

const _getTour = (key: TourKey, lang: Lang): TourDetail => {
  const l = L[lang];
  const t = T[key][lang];
  // Fonte única: CMS (Supabase via cmsCache). Sem overrides persistidos.
  const db = getCachedTour(key);
  const overrideImg = db?.imagem_url || undefined;
  const overrideDesc = db?.descricao?.[lang] || (lang === "pt" ? db?.descricao?.pt : undefined) || undefined;
  const overrideTitle = db?.nome?.[lang] || db?.nome?.pt || undefined;
  const tt = { title: overrideTitle || t.title, hook: overrideDesc || t.hook };


  switch (key) {
    case "escuna":
      return {
        key, image: overrideImg || escunaImg, title: tt.title, hook: tt.hook,
        rating: 4.8, reviews: 1280,
        duration: "2h30", location: l.locBuzios,
        capacity: `${l.upTo} 60 ${l.persons}`, languages: l.languagesAll,
        sections: [
          { title: l.itinerary, text: "11 " + l.beaches.toLowerCase() + " · 3 " + l.islands.toLowerCase() },
          { title: l.beaches, items: ["Praia do Canto","Praia do Osso","Praia da Azeda","Praia da Azedinha","Praia de João Fernandes","Praia de João Fernandinho","Praia da Tartaruga","Praia dos Amores","Praia das Virgens","Praia da Armação","Praia Brava"] },
          { title: l.islands, items: ["Ilha do Caboclo","Ilha Branca","Ilha Feia"] },
          { title: l.stops, items: ["João Fernandes","Ilha Feia","Praia da Tartaruga"] },
          { title: l.included, items: trs(lang, ["Banheiros","Boias","Coletes salva-vidas"]) },
          { title: l.optional, items: trs(lang, ["Bar com barman","Churrasco (Espetos)","Máscara de mergulho","Fotos profissionais"]) },
        ],
        childrenPolicy: trs(lang, ["0–5 — grátis","6–10 — meia passagem","11+ — integral"]),
        notice: tr(lang, "Roteiro sujeito às condições climáticas."),
      };
    case "arraial":
      return {
        key, image: overrideImg || arraialImg, title: tt.title, hook: tt.hook,
        rating: 4.9, reviews: 2150,
        duration: l.fullDay, location: l.locArraial,
        capacity: `${l.upTo} 50 ${l.persons}`, languages: l.languagesAll,
        sections: [
          { title: l.schedule, text: `${l.pickup}: 08h · ${l.return}: 17h` },
          { title: l.description, text: tr(lang, "Ao chegarmos em Arraial do Cabo, os passageiros são transferidos para uma Jardineira até o píer de embarque.") },
          { title: l.boatRide, text: "3h30" },
          { title: l.itinerary, items: ["Ilha do Farol","Prainhas do Pontal","Fenda de Nossa Senhora","Pedra do Macaco","Gruta Azul","Buraco do Meteorito","Gruta do Amor","Praia do Forno"] },
          { title: l.included, items: trs(lang, ["Translado","Almoço Buffet Livre","Wi-Fi","Som ambiente","Banheiros","Coletes"]) },
        ],
        notice: tr(lang, "Roteiro sujeito às condições climáticas."),
      };
    case "buggy":
      return {
        key, image: overrideImg || buggyImg, title: tt.title, hook: tt.hook,
        rating: 4.8, reviews: 640,
        duration: "1h30", location: l.locBuzios,
        capacity: `${l.upTo} 4 ${l.persons}`, languages: l.languagesAll,
        sections: [
          { title: l.itinerary, items: trs(lang, ["8 praias","3 mirantes","Paradas para fotos"]) },
        ],
      };
    case "cabofrio":
      return {
        key, image: overrideImg || arraialImg, title: tt.title, hook: tt.hook,
        rating: 4.7, reviews: 410,
        duration: l.fullDay, location: l.locCaboFrio,
        capacity: `${l.upTo} 35 ${l.persons}`, languages: l.languagesAll,
        sections: [
          { title: l.schedule, text: "08h — 17h" },
          { title: l.itinerary, items: trs(lang, ["Praia do Peró","Praia das Conchas","Ilha do Japonês","Almoço","Shopping Park Lagos"]) },
          { title: l.included, items: trs(lang, ["Transporte","Guia bilíngue","Almoço buffet"]) },
        ],
      };
    case "jardineira":
      return {
        key, image: overrideImg || jardineiraImg, title: tt.title, hook: tt.hook,
        rating: 4.7, reviews: 920,
        duration: "2h", location: l.locBuzios,
        capacity: `35 ${l.persons}`, languages: l.languagesAll,
        sections: [
          { title: l.departures, items: ["09h","12h","15h"] },
          { title: l.itinerary, items: trs(lang, ["12 praias","2 mirantes","Parada para banho na Praia do Forno"]) },
        ],
      };
    case "catamara":
      return {
        key, image: overrideImg || catamaraImg, title: tt.title, hook: tt.hook,
        rating: 4.9, reviews: 870,
        duration: "2h30", location: l.locBuzios,
        capacity: `${l.upTo} 80 ${l.persons}`, languages: l.languagesAll,
        sections: [
          { title: l.itinerary, items: trs(lang, ["12 praias","3 ilhas","3 paradas"]) },
          { title: l.included, items: trs(lang, ["DJ a bordo","Banheiros","Ducha","Música ambiente"]) },
          { title: l.extras, items: trs(lang, ["Bar","Snorkeling","Fotos subaquáticas"]) },
        ],
      };
    case "mergulho":
      return {
        key, image: overrideImg || mergulhoImg, title: tt.title, hook: tt.hook,
        rating: 5.0, reviews: 380,
        duration: "≈ 1h10", location: "João Fernandes — Búzios",
        capacity: `${l.upTo} 6 ${l.persons}`, languages: l.languagesAll,
        adultsOnly: true,
        sections: [
          { title: l.schedule, items: [
            `20 min — ${l.instruction}`,
            `20 min — ${l.practice}`,
            `30 min — ${l.diving}`,
          ]},
          { title: l.included, items: trs(lang, ["Equipamento completo","4 fotos subaquáticas","1 vídeo subaquático","Instrutor certificado"]) },
        ],
      };
    case "lancha":
      return {
        key, image: overrideImg || lanchaImg, title: tt.title, hook: tt.hook,
        rating: 5.0, reviews: 220,
        duration: "4h — 8h", location: l.locBuzios,
        capacity: `${l.upTo} 12 ${l.persons}`, languages: l.languagesAll,
        sections: [
          { title: l.itinerary, items: trs(lang, ["10 praias","3 ilhas"]) },
          { title: l.stops, items: ["Azeda","João Fernandes","Tartaruga","Ilha Feia"] },
          { title: l.included, items: trs(lang, ["Snorkel","Espaguetes flutuantes","Gelo","Música ambiente"]) },
        ],
        notice: tr(lang, "Valor variável conforme o modelo da lancha."),
      };
  }
};

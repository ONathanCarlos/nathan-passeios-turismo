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
  video?: string;
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
  const l = L[lang];
  const t = T[key][lang];
  // Fonte única: CMS (Supabase via cmsCache). Sem overrides persistidos.
  const db = getCachedTour(key);
  const overrideImg = db?.imagem_url || undefined;
  const overrideDesc = db?.descricao?.[lang] || db?.descricao?.pt || undefined;
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
          { title: l.included, items: ["Banheiros","Boias","Coletes salva-vidas"] },
          { title: l.optional, items: ["Bar com barman","Churrasco (Espetos)","Máscara de mergulho","Fotos profissionais"] },
        ],
        childrenPolicy: ["0–5 — grátis","6–10 — meia passagem","11+ — integral"],
        notice: "Roteiro sujeito às condições climáticas.",
      };
    case "arraial":
      return {
        key, image: overrideImg || arraialImg, title: tt.title, hook: tt.hook,
        rating: 4.9, reviews: 2150,
        duration: l.fullDay, location: l.locArraial,
        capacity: `${l.upTo} 50 ${l.persons}`, languages: l.languagesAll,
        sections: [
          { title: l.schedule, text: `${l.pickup}: 08h · ${l.return}: 17h` },
          { title: l.description, text: "Ao chegarmos em Arraial do Cabo, os passageiros são transferidos para uma Jardineira até o píer de embarque." },
          { title: l.boatRide, text: "3h30" },
          { title: l.itinerary, items: ["Ilha do Farol","Prainhas do Pontal","Fenda de Nossa Senhora","Pedra do Macaco","Gruta Azul","Buraco do Meteorito","Gruta do Amor","Praia do Forno"] },
          { title: l.included, items: ["Translado","Almoço Buffet Livre","Wi-Fi","Som ambiente","Banheiros","Coletes"] },
        ],
        notice: "Roteiro sujeito às condições climáticas.",
      };
    case "buggy":
      return {
        key, image: overrideImg || buggyImg, title: tt.title, hook: tt.hook,
        rating: 4.8, reviews: 640,
        duration: "1h30", location: l.locBuzios,
        capacity: `${l.upTo} 4 ${l.persons}`, languages: l.languagesAll,
        sections: [
          { title: l.itinerary, items: ["8 praias","3 mirantes","Paradas para fotos"] },
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
          { title: l.itinerary, items: ["Praia do Peró","Praia das Conchas","Ilha do Japonês","Almoço","Shopping Park Lagos"] },
          { title: l.included, items: ["Transporte","Guia bilíngue","Almoço buffet"] },
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
          { title: l.itinerary, items: ["12 praias","2 mirantes","Parada para banho na Praia do Forno"] },
        ],
      };
    case "catamara":
      return {
        key, image: overrideImg || catamaraImg, title: tt.title, hook: tt.hook,
        rating: 4.9, reviews: 870,
        duration: "2h30", location: l.locBuzios,
        capacity: `${l.upTo} 80 ${l.persons}`, languages: l.languagesAll,
        sections: [
          { title: l.itinerary, items: ["12 praias","3 ilhas","3 paradas"] },
          { title: l.included, items: ["DJ a bordo","Banheiros","Ducha","Música ambiente"] },
          { title: l.extras, items: ["Bar","Snorkeling","Fotos subaquáticas"] },
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
          { title: l.included, items: ["Equipamento completo","4 fotos subaquáticas","1 vídeo subaquático","Instrutor certificado"] },
        ],
      };
    case "lancha":
      return {
        key, image: overrideImg || lanchaImg, title: tt.title, hook: tt.hook,
        rating: 5.0, reviews: 220,
        duration: "4h — 8h", location: l.locBuzios,
        capacity: `${l.upTo} 12 ${l.persons}`, languages: l.languagesAll,
        sections: [
          { title: l.itinerary, items: ["10 praias","3 ilhas"] },
          { title: l.stops, items: ["Azeda","João Fernandes","Tartaruga","Ilha Feia"] },
          { title: l.included, items: ["Snorkel","Espaguetes flutuantes","Gelo","Música ambiente"] },
        ],
        notice: "Valor variável conforme o modelo da lancha.",
      };
  }
};

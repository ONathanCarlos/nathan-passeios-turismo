import { ExternalLink, Handshake, Instagram } from "lucide-react";
import type { Lang } from "@/lib/i18n";

export const INSTAGRAM_URL = "https://www.instagram.com/onixbuziosoficial/";
export const INSTAGRAM_HANDLE = "@onixbuziosoficial";

const COPY: Record<Lang, {
  igEyebrow: string; igTitle: string; igDesc: string; igCta: string; igAria: string;
  partnersTitle: string; partnersDesc: string; interbuziosRole: string; jubarteRole: string;
  operatorEyebrow: string; operatorText: string; operatorSales: string;
}> = {
  pt: {
    igEyebrow: "Instagram oficial", igTitle: "Acompanhe a Ônix no Instagram",
    igDesc: "Fotos dos passeios, novidades e dicas de Búzios no nosso perfil oficial.",
    igCta: "Abrir Instagram", igAria: "Abrir o Instagram oficial da Ônix Turismo Búzios em nova aba",
    partnersTitle: "Nossos parceiros", partnersDesc: "Empresas que caminham com a gente para oferecer passeios com qualidade em Búzios.",
    interbuziosRole: "Proprietária e operadora da escuna", jubarteRole: "Parceira",
    operatorEyebrow: "Operação da escuna",
    operatorText: "A escuna é de propriedade e operada pela Interbúzios Turismo e Viagens.",
    operatorSales: "A Ônix Turismo Búzios comercializa as reservas deste passeio.",
  },
  es: {
    igEyebrow: "Instagram oficial", igTitle: "Sigue a Ônix en Instagram",
    igDesc: "Fotos de los paseos, novedades y consejos de Búzios en nuestro perfil oficial.",
    igCta: "Abrir Instagram", igAria: "Abrir el Instagram oficial de Ônix Turismo Búzios en una nueva pestaña",
    partnersTitle: "Nuestros socios", partnersDesc: "Empresas que nos acompañan para ofrecer paseos de calidad en Búzios.",
    interbuziosRole: "Propietaria y operadora de la goleta", jubarteRole: "Socio",
    operatorEyebrow: "Operación de la goleta",
    operatorText: "La goleta es propiedad de Interbúzios Turismo e Viagens, que también la opera.",
    operatorSales: "Ônix Turismo Búzios comercializa las reservas de este paseo.",
  },
  en: {
    igEyebrow: "Official Instagram", igTitle: "Follow Ônix on Instagram",
    igDesc: "Tour photos, news and Búzios tips on our official profile.",
    igCta: "Open Instagram", igAria: "Open the official Ônix Turismo Búzios Instagram in a new tab",
    partnersTitle: "Our partners", partnersDesc: "Companies that work with us to offer quality tours in Búzios.",
    interbuziosRole: "Schooner owner and operator", jubarteRole: "Partner",
    operatorEyebrow: "Schooner operation",
    operatorText: "The schooner is owned and operated by Interbúzios Turismo e Viagens.",
    operatorSales: "Ônix Turismo Búzios sells the bookings for this tour.",
  },
  fr: {
    igEyebrow: "Instagram officiel", igTitle: "Suivez Ônix sur Instagram",
    igDesc: "Photos des excursions, nouveautés et conseils sur Búzios sur notre profil officiel.",
    igCta: "Ouvrir Instagram", igAria: "Ouvrir l'Instagram officiel d'Ônix Turismo Búzios dans un nouvel onglet",
    partnersTitle: "Nos partenaires", partnersDesc: "Des entreprises qui nous accompagnent pour proposer des excursions de qualité à Búzios.",
    interbuziosRole: "Propriétaire et exploitant de la goélette", jubarteRole: "Partenaire",
    operatorEyebrow: "Exploitation de la goélette",
    operatorText: "La goélette appartient à Interbúzios Turismo e Viagens, qui l'exploite.",
    operatorSales: "Ônix Turismo Búzios commercialise les réservations de cette excursion.",
  },
  it: {
    igEyebrow: "Instagram ufficiale", igTitle: "Segui Ônix su Instagram",
    igDesc: "Foto dei tour, novità e consigli su Búzios sul nostro profilo ufficiale.",
    igCta: "Apri Instagram", igAria: "Apri l'Instagram ufficiale di Ônix Turismo Búzios in una nuova scheda",
    partnersTitle: "I nostri partner", partnersDesc: "Aziende che ci accompagnano per offrire tour di qualità a Búzios.",
    interbuziosRole: "Proprietaria e gestore della goletta", jubarteRole: "Partner",
    operatorEyebrow: "Gestione della goletta",
    operatorText: "La goletta è di proprietà di Interbúzios Turismo e Viagens, che la gestisce.",
    operatorSales: "Ônix Turismo Búzios commercializza le prenotazioni di questo tour.",
  },
};

export const InstagramHighlight = ({ lang }: { lang: Lang }) => {
  const c = COPY[lang] ?? COPY.pt;
  return (
    <section aria-labelledby="instagram-title" className="mt-8 flex flex-col gap-4 rounded-2xl border border-turquoise/20 bg-gradient-to-br from-turquoise/[0.1] via-night/70 to-night/90 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-turquoise/30 bg-night/60 text-turquoise-glow" aria-hidden="true">
          <Instagram className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-turquoise-glow">{c.igEyebrow}</p>
          <h2 id="instagram-title" className="mt-1 text-lg font-bold leading-tight text-foreground sm:text-xl">{c.igTitle}</h2>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">{c.igDesc}</p>
          <p className="mt-1 text-sm font-semibold text-foreground/85">{INSTAGRAM_HANDLE}</p>
        </div>
      </div>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={c.igAria}
        className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-turquoise px-5 py-3 font-bold text-night transition-colors hover:bg-turquoise-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Instagram className="h-4 w-4" aria-hidden="true" />
        {c.igCta}
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    </section>
  );
};

const PartnerCard = ({ name, role, logo }: { name: string; role: string; logo: string }) => (
  <li className="flex items-center gap-4 rounded-2xl border border-turquoise/15 bg-night/60 p-4">
    <img src={logo} alt={`Logomarca da ${name}`} width={80} height={80} loading="lazy" className="h-20 w-20 shrink-0 rounded-full border border-turquoise/20 bg-white object-cover" />
    <div className="min-w-0">
      <p className="font-bold leading-tight text-foreground">{name}</p>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{role}</p>
    </div>
  </li>
);

export const PartnersSection = ({ lang }: { lang: Lang }) => {
  const c = COPY[lang] ?? COPY.pt;
  return (
    <section aria-labelledby="partners-title" className="mt-8">
      <div className="flex items-center gap-2">
        <Handshake className="h-5 w-5 text-turquoise-glow" aria-hidden="true" />
        <h2 id="partners-title" className="text-lg font-bold text-foreground sm:text-xl">{c.partnersTitle}</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{c.partnersDesc}</p>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PartnerCard name="Interbúzios Turismo e Viagens" role={c.interbuziosRole} logo={"/partners/interbuzios.jpg"} />
        <PartnerCard name="Turismo Jubarte" role={c.jubarteRole} logo={"/partners/jubarte.jpg"} />
      </ul>
    </section>
  );
};

export const EscunaOperatorCard = ({ lang }: { lang: Lang }) => {
  const c = COPY[lang] ?? COPY.pt;
  return (
    <aside aria-label={c.operatorEyebrow} className="mt-4 flex items-start gap-3 rounded-2xl border border-turquoise/20 bg-turquoise/[0.06] p-4">
      <img src={"/partners/interbuzios.jpg"} alt="Logomarca da Interbúzios Turismo e Viagens" width={96} height={96} loading="lazy" className="h-20 w-20 shrink-0 rounded-full border border-turquoise/20 bg-white object-cover sm:h-24 sm:w-24" />
      <div className="text-sm leading-relaxed">
        <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-turquoise-glow">{c.operatorEyebrow}</p>
        <p className="mt-1 text-foreground"><strong>{c.operatorText}</strong></p>
        <p className="mt-1 text-muted-foreground">{c.operatorSales}</p>
      </div>
    </aside>
  );
};

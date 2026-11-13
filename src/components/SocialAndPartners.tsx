import type { Lang } from "@/lib/i18n";
import { ExternalLink, Instagram, Ship } from "lucide-react";

const PARTNERS = [
  { name: "Interbúzios Turismo e Viagens", image: "/partners/interbuzios.png", initials: "INTERBÚZIOS" },
  { name: "Jubarte Turismo", image: "/partners/jubarte.png", initials: "JUBARTE" },
] as const;

const COPY: Record<Lang, { socialTitle: string; socialDesc: string; follow: string; partnersTitle: string; partnersDesc: string; operatorTitle: string; operatorDesc: string }> = {
  pt: { socialTitle: "Acompanhe nossas aventuras", socialDesc: "Novidades, paisagens e experiências em Búzios no Instagram oficial da Ônix.", follow: "Seguir @onixbuziosoficial", partnersTitle: "Nossos parceiros", partnersDesc: "Empresas parceiras que fazem parte das experiências em Búzios.", operatorTitle: "Operadora proprietária da escuna", operatorDesc: "O passeio de escuna comercializado pela Ônix Turismo Búzios é realizado pela Interbúzios Turismo e Viagens, proprietária e responsável pela operação da embarcação. A Ônix realiza o atendimento e as reservas." },
  es: { socialTitle: "Sigue nuestras aventuras", socialDesc: "Novedades, paisajes y experiencias en Búzios en el Instagram oficial de Ônix.", follow: "Seguir @onixbuziosoficial", partnersTitle: "Nuestros colaboradores", partnersDesc: "Empresas colaboradoras de nuestras experiencias en Búzios.", operatorTitle: "Propietaria y operadora de la goleta", operatorDesc: "El paseo en goleta comercializado por Ônix Turismo Búzios es operado por Interbúzios Turismo e Viagens, propietaria y responsable de la embarcación. Ônix gestiona la atención y las reservas." },
  en: { socialTitle: "Follow our adventures", socialDesc: "Updates, scenery and experiences in Búzios on Ônix's official Instagram.", follow: "Follow @onixbuziosoficial", partnersTitle: "Our partners", partnersDesc: "Partner businesses contributing to experiences in Búzios.", operatorTitle: "Schooner owner and operator", operatorDesc: "The schooner tour sold by Ônix Turismo Búzios is operated by Interbúzios Turismo e Viagens, the vessel's owner and operator. Ônix handles customer service and bookings." },
  fr: { socialTitle: "Suivez nos aventures", socialDesc: "Actualités, paysages et expériences à Búzios sur l'Instagram officiel d'Ônix.", follow: "Suivre @onixbuziosoficial", partnersTitle: "Nos partenaires", partnersDesc: "Entreprises partenaires de nos expériences à Búzios.", operatorTitle: "Propriétaire et exploitant de la goélette", operatorDesc: "L'excursion en goélette vendue par Ônix Turismo Búzios est exploitée par Interbúzios Turismo e Viagens, propriétaire et responsable du bateau. Ônix assure l'accueil et les réservations." },
  it: { socialTitle: "Segui le nostre avventure", socialDesc: "Novità, paesaggi ed esperienze a Búzios sull'Instagram ufficiale di Ônix.", follow: "Segui @onixbuziosoficial", partnersTitle: "I nostri partner", partnersDesc: "Aziende partner delle nostre esperienze a Búzios.", operatorTitle: "Proprietario e operatore della goletta", operatorDesc: "L'escursione in goletta venduta da Ônix Turismo Búzios è gestita da Interbúzios Turismo e Viagens, proprietaria e responsabile dell'imbarcazione. Ônix gestisce l'assistenza e le prenotazioni." },
};

function PartnerLogo({ image, name, initials }: { image: string; name: string; initials: string }) {
  return (
    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-turquoise/20 bg-white/95 p-1 shadow-lg sm:h-32 sm:w-32">
      <img src={image} alt={name} loading="lazy" className="h-full w-full rounded-full object-contain" onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.parentElement?.querySelector("span")?.classList.remove("hidden"); }} />
      <span className="hidden text-center text-[11px] font-extrabold text-slate-800">{initials}</span>
    </div>
  );
}

export function SocialAndPartners({ lang }: { lang: Lang }) {
  const copy = COPY[lang];
  return (
    <div className="mt-10 space-y-8 sm:mt-14">
      <section aria-labelledby="instagram-title" className="overflow-hidden rounded-3xl border border-turquoise/25 bg-gradient-to-br from-[#153d4c] via-[#0b2637] to-[#071722] p-6 shadow-xl sm:p-8">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <div className="mb-3 flex items-center gap-2 text-turquoise-glow"><Instagram className="h-6 w-6" aria-hidden="true" /><span className="text-xs font-bold uppercase tracking-widest">Instagram · Ônix Turismo Búzios</span></div>
            <h2 id="instagram-title" className="text-2xl font-extrabold text-foreground sm:text-3xl">{copy.socialTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.socialDesc}</p>
          </div>
          <a href="https://www.instagram.com/onixbuziosoficial/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-turquoise to-turquoise-glow px-5 py-3 text-sm font-extrabold text-night transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise">
            {copy.follow}<ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>
      <section aria-labelledby="partners-title" className="rounded-3xl border border-turquoise/15 bg-night/55 p-6 sm:p-8">
        <h2 id="partners-title" className="text-center text-2xl font-extrabold text-foreground">{copy.partnersTitle}</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">{copy.partnersDesc}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PARTNERS.map((partner) => (
            <div key={partner.name} className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5 text-center">
              <PartnerLogo {...partner} />
              <h3 className="text-base font-bold text-foreground">{partner.name}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SchoonerOperator({ lang }: { lang: Lang }) {
  const copy = COPY[lang];
  return (
    <section aria-labelledby="schooner-operator-title" className="rounded-2xl border border-turquoise/25 bg-gradient-to-br from-[#102d3c] to-[#081a27] p-5 shadow-lg sm:col-span-2">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <PartnerLogo {...PARTNERS[0]} />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="mb-2 flex items-center justify-center gap-2 text-turquoise-glow sm:justify-start"><Ship className="h-4 w-4" aria-hidden="true" /><span className="text-[11px] font-bold uppercase tracking-widest">{copy.operatorTitle}</span></div>
          <h2 id="schooner-operator-title" className="text-lg font-extrabold text-foreground">Interbúzios Turismo e Viagens</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">{copy.operatorDesc}</p>
        </div>
      </div>
    </section>
  );
}

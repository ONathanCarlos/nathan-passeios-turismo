import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { loadLang, saveLang, type Lang } from "@/lib/i18n";
import { getCachedConfig } from "@/lib/cmsCache";
import { bookingWhatsApp } from "@/lib/brand";

const COPY: Record<Lang, {
  eyebrow: string; title: string; intro: string; explore: string; packages: string; contact: string;
  toursTitle: string; toursText: string; packagesTitle: string; packagesText: string; location: string;
}> = {
  pt: {
    eyebrow: "Sobre a Ônix", title: "Conheça Búzios do seu jeito.",
    intro: "Este site reúne passeios e pacotes da Ônix Turismo Búzios para você conhecer as experiências disponíveis e escolher o que combina com a sua viagem.",
    explore: "Explorar passeios", packages: "Ver pacotes", contact: "Falar com a equipe",
    toursTitle: "Passeios", toursText: "Consulte as páginas de cada experiência para ver informações, fotos, valores e condições de reserva.",
    packagesTitle: "Pacotes", packagesText: "Compare combinações de experiências disponíveis em Búzios e na Região dos Lagos.",
    location: "Búzios e Região dos Lagos, RJ",
  },
  es: {
    eyebrow: "Sobre Ônix", title: "Conoce Búzios a tu manera.",
    intro: "Este sitio reúne paseos y paquetes de Ônix Turismo Búzios para que conozcas las experiencias disponibles y elijas lo que mejor acompaña tu viaje.",
    explore: "Explorar paseos", packages: "Ver paquetes", contact: "Hablar con el equipo",
    toursTitle: "Paseos", toursText: "Consulta cada experiencia para ver información, fotos, precios y condiciones de reserva.",
    packagesTitle: "Paquetes", packagesText: "Compara combinaciones de experiencias disponibles en Búzios y la Región de los Lagos.",
    location: "Búzios y Región de los Lagos, RJ",
  },
  en: {
    eyebrow: "About Ônix", title: "Discover Búzios your way.",
    intro: "This website brings together tours and packages from Ônix Turismo Búzios, so you can explore available experiences and choose what fits your trip.",
    explore: "Explore tours", packages: "View packages", contact: "Talk to the team",
    toursTitle: "Tours", toursText: "Visit each experience page for information, photos, prices and booking conditions.",
    packagesTitle: "Packages", packagesText: "Compare combinations of experiences available in Búzios and the Lakes Region.",
    location: "Búzios and the Lakes Region, RJ",
  },
  fr: {
    eyebrow: "À propos d’Ônix", title: "Découvrez Búzios à votre façon.",
    intro: "Ce site réunit les excursions et forfaits d’Ônix Turismo Búzios afin que vous puissiez découvrir les expériences disponibles et choisir celles qui vous conviennent.",
    explore: "Voir les excursions", packages: "Voir les forfaits", contact: "Contacter l’équipe",
    toursTitle: "Excursions", toursText: "Consultez chaque expérience pour connaître les informations, les photos, les prix et les conditions de réservation.",
    packagesTitle: "Forfaits", packagesText: "Comparez les combinaisons d’expériences disponibles à Búzios et dans la Région des Lacs.",
    location: "Búzios et Région des Lacs, RJ",
  },
  it: {
    eyebrow: "Chi siamo · Ônix", title: "Scopri Búzios a modo tuo.",
    intro: "Questo sito raccoglie tour e pacchetti di Ônix Turismo Búzios, così puoi conoscere le esperienze disponibili e scegliere quelle più adatte al tuo viaggio.",
    explore: "Esplora i tour", packages: "Vedi i pacchetti", contact: "Parla con il team",
    toursTitle: "Tour", toursText: "Consulta ogni esperienza per informazioni, foto, prezzi e condizioni di prenotazione.",
    packagesTitle: "Pacchetti", packagesText: "Confronta le combinazioni di esperienze disponibili a Búzios e nella Regione dei Laghi.",
    location: "Búzios e Regione dei Laghi, RJ",
  },
};

const SobreNos = () => {
  const [lang, setLang] = useState<Lang>(() => loadLang());
  const setLanguage = (next: Lang) => { saveLang(next); setLang(next); };
  const text = COPY[lang];
  const whatsapp = bookingWhatsApp(getCachedConfig("whatsapp"));

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061521] px-4 pb-14 pt-3 text-foreground sm:px-6">
      <div aria-hidden="true" className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-10">
        <PublicSiteHeader lang={lang} onLangChange={setLanguage} />
        <div className="mx-auto max-w-6xl pt-12 sm:pt-16">
          <section className="overflow-hidden rounded-[2rem] border border-turquoise/20 bg-gradient-to-br from-[#0b2638] via-[#071c2b] to-[#071522] p-7 shadow-[0_28px_80px_-40px_rgba(0,0,0,.8)] sm:p-12">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-turquoise-glow">
              <MapPin className="h-4 w-4" aria-hidden="true" /> {text.location}
            </div>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-amber-200">{text.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">{text.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{text.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/passeios" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-turquoise to-[#24b7b5] px-5 py-3 text-sm font-bold text-[#061521] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                {text.explore}<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/pacotes" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-turquoise/40 hover:bg-turquoise/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise">
                {text.packages}
              </Link>
            </div>
          </section>

          <section className="mt-5 grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#0a1d2b]/85 p-6 backdrop-blur">
              <h2 className="text-xl font-bold">{text.toursTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{text.toursText}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-[#0a1d2b]/85 p-6 backdrop-blur">
              <h2 className="text-xl font-bold">{text.packagesTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{text.packagesText}</p>
            </article>
          </section>

          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> {text.contact}
          </a>
        </div>
      </div>
    </main>
  );
};

export default SobreNos;

import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Lang, loadLang } from "@/lib/i18n";
import { CRUISE_CALENDAR_PDF } from "@/lib/cruiseEmbarkation";

const TEXT: Record<Lang, {
  back: string;
  title: string;
  subtitle: string;
  source: string;
  sourceDate: string;
  openPdf: string;
  downloadPdf: string;
  feeNote: string;
  scheduleNote: string;
  page: string;
}> = {
  pt: {
    back: "Voltar ao site",
    title: "Calendário de escalas de cruzeiros 2026–2027",
    subtitle: "Documento da Secretaria Municipal de Turismo e Desenvolvimento Econômico de Búzios.",
    source: "A versão abaixo preserva visualmente as páginas do documento recebido e foi otimizada para carregar mais rápido no celular.",
    sourceDate: "Atualização indicada no documento: 8 de outubro de 2026.",
    openPdf: "Abrir PDF em nova guia",
    downloadPdf: "Baixar PDF",
    feeNote: "Importante: o calendário informa as escalas previstas dos navios. A taxa de R$ 10 mencionada na reserva é do embarque do passeio em píer privado; não é uma cobrança da Prefeitura nem da companhia de cruzeiro.",
    scheduleNote: "O próprio documento informa que escalas podem ser alteradas ou canceladas pelas companhias, sem aviso prévio.",
    page: "Página",
  },
  es: {
    back: "Volver al sitio",
    title: "Calendario de escalas de cruceros 2026–2027",
    subtitle: "Documento de la Secretaría Municipal de Turismo y Desarrollo Económico de Búzios.",
    source: "La versión siguiente conserva visualmente las páginas del documento recibido y fue optimizada para cargar más rápido en el móvil.",
    sourceDate: "Actualización indicada en el documento: 8 de octubre de 2026.",
    openPdf: "Abrir PDF en otra pestaña",
    downloadPdf: "Descargar PDF",
    feeNote: "Importante: el calendario informa las escalas previstas de los barcos. La tasa de R$ 10 mencionada en la reserva corresponde al embarque de la excursión en un muelle privado; no la cobra el Ayuntamiento ni la compañía de cruceros.",
    scheduleNote: "El propio documento informa que las compañías pueden cambiar o cancelar escalas sin previo aviso.",
    page: "Página",
  },
  en: {
    back: "Back to the site",
    title: "Cruise-call calendar 2026–2027",
    subtitle: "Document from the Municipal Department of Tourism and Economic Development of Búzios.",
    source: "The version below preserves the pages visually and has been optimized to load faster on mobile.",
    sourceDate: "Update date shown in the document: October 8, 2026.",
    openPdf: "Open PDF in a new tab",
    downloadPdf: "Download PDF",
    feeNote: "Important: this calendar shows scheduled ship calls. The R$10 fee shown during booking is for the tour boarding at a private pier; it is not charged by the City Hall or cruise company.",
    scheduleNote: "The document itself notes that cruise lines may change or cancel calls without prior notice.",
    page: "Page",
  },
  fr: {
    back: "Retour au site",
    title: "Calendrier des escales de croisière 2026–2027",
    subtitle: "Document du Secrétariat municipal du tourisme et du développement économique de Búzios.",
    source: "La version ci-dessous conserve visuellement les pages du document reçu et a été optimisée pour un chargement plus rapide sur mobile.",
    sourceDate: "Mise à jour indiquée dans le document : 8 octobre 2026.",
    openPdf: "Ouvrir le PDF dans un nouvel onglet",
    downloadPdf: "Télécharger le PDF",
    feeNote: "Important : ce calendrier indique les escales prévues des navires. Les 10 R$ mentionnés lors de la réservation concernent l'embarquement de l'excursion dans un embarcadère privé ; ils ne sont facturés ni par la mairie ni par la compagnie de croisière.",
    scheduleNote: "Le document précise que les compagnies peuvent modifier ou annuler les escales sans préavis.",
    page: "Page",
  },
  it: {
    back: "Torna al sito",
    title: "Calendario degli scali delle crociere 2026–2027",
    subtitle: "Documento della Segreteria Municipale del Turismo e dello Sviluppo Economico di Búzios.",
    source: "La versione seguente conserva visivamente le pagine del documento ricevuto ed è stata ottimizzata per caricarsi più rapidamente sul cellulare.",
    sourceDate: "Data di aggiornamento indicata nel documento: 8 ottobre 2026.",
    openPdf: "Apri il PDF in una nuova scheda",
    downloadPdf: "Scarica il PDF",
    feeNote: "Importante: il calendario indica gli scali previsti delle navi. La tariffa di R$ 10 mostrata durante la prenotazione riguarda l'imbarco dell'escursione in un molo privato; non è applicata dal Comune né dalla compagnia di crociera.",
    scheduleNote: "Il documento stesso avverte che le compagnie possono modificare o cancellare gli scali senza preavviso.",
    page: "Pagina",
  },
};

const PAGE_IMAGES = Array.from({ length: 8 }, (_, index) =>
  `/docs/calendario-cruzeiros-2026-2027/page-${index + 1}.jpg`,
);

const CruiseCalendar = () => {
  const lang = loadLang();
  const text = TEXT[lang];

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-12 pt-6 sm:pt-10">
      <div aria-hidden="true" className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-10 mx-auto max-w-4xl">
        <Link
          to="/passeios"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-turquoise/40 bg-night/70 px-4 py-2 text-sm font-semibold text-foreground hover:border-turquoise/70"
        >
          <ArrowLeft className="h-4 w-4" /> {text.back}
        </Link>

        <header className="mb-5 rounded-2xl border border-turquoise/25 bg-night/75 p-5 shadow-xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-turquoise">Ônix Turismo · Búzios</p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">{text.title}</h1>
          <p className="mt-3 text-sm text-foreground/85">{text.subtitle}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text.source}</p>
          <p className="mt-1 text-xs text-muted-foreground">{text.sourceDate}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={CRUISE_CALENDAR_PDF} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-turquoise px-4 py-2 text-sm font-bold text-night hover:opacity-90">
              <ExternalLink className="h-4 w-4" /> {text.openPdf}
            </a>
            <a href={CRUISE_CALENDAR_PDF} download className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-turquoise/40 px-4 py-2 text-sm font-semibold text-foreground hover:bg-turquoise/10">
              <Download className="h-4 w-4" /> {text.downloadPdf}
            </a>
          </div>
        </header>

        <aside className="mb-5 rounded-xl border border-amber-300/40 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-100">
          <p>{text.feeNote}</p>
          <p className="mt-2 text-amber-100/80">{text.scheduleNote}</p>
        </aside>

        <section aria-label={text.title} className="space-y-4">
          {PAGE_IMAGES.map((src, index) => (
            <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-white/15 bg-white shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-turquoise">
              <img
                src={src}
                alt={`${text.page} ${index + 1} — ${text.title}`}
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
                className="h-auto w-full"
              />
            </a>
          ))}
        </section>
      </div>
    </main>
  );
};

export default CruiseCalendar;

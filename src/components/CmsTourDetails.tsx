import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Users } from "lucide-react";
import type { CmsTour } from "@/lib/cms";
import { pickLang } from "@/lib/cms";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { TourMediaGallery } from "@/components/TourMediaGallery";
import { formatBRL } from "@/lib/prices";
import { isLunchCmsTour } from "@/lib/cmsLunchBooking";
import { CmsLunchBookingForm } from "@/components/CmsLunchBookingForm";
import { cmsTourWhatsAppUrl } from "@/lib/cmsTourWhatsApp";

const BACK: Record<Lang, string> = { pt: "Voltar", es: "Volver", en: "Back", fr: "Retour", it: "Indietro" };

export function CmsTourDetails({ tour, lang, onLangChange, onBack }: {
  tour: CmsTour; lang: Lang; onLangChange: (l: Lang) => void; onBack: () => void;
}) {
  const t = dict[lang];
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookingOpen, setBookingOpen] = useState(() => searchParams.get("reservar") === "1");
  const title = pickLang(tour, "nome", lang) || tour.nome_pt;
  const desc = pickLang(tour, "descricao", lang);
  const images = [tour.imagem_url, ...tour.gallery_imagens].filter((u): u is string => !!u);
  const videos = [tour.video_url, tour.video_2_url].filter((u): u is string => !!u);
  const info = [
    tour.duracao && { icon: Clock, text: tour.duracao },
    tour.horario && { icon: Clock, text: tour.horario },
    tour.local_saida && { icon: MapPin, text: tour.local_saida },
    tour.capacidade_max && { icon: Users, text: String(tour.capacidade_max) },
  ].filter(Boolean) as { icon: typeof Clock; text: string }[];

  if (isLunchCmsTour(tour) && bookingOpen) {
    return (
      <CmsLunchBookingForm
        tour={tour}
        lang={lang}
        onLangChange={onLangChange}
        onBack={() => {
          setBookingOpen(false);
          if (searchParams.has("reservar")) setSearchParams({}, { replace: true });
        }}
      />
    );
  }

  return (
    <main className="relative min-h-screen px-4 pt-4 pb-10">
      <div aria-hidden="true" className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-4 gap-2">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 rounded-full border border-turquoise/40 bg-night/60 px-3 py-1.5 text-xs font-semibold text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> {BACK[lang]}
          </button>
          <LanguageSwitcher lang={lang} onChange={onLangChange} />
        </div>
        <article className="glass-card rounded-2xl overflow-hidden">
          {images.length > 0 && <TourMediaGallery images={images} alt={title} className="lg:mx-auto lg:w-2/5" />}
          <div className="p-5 space-y-4">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {desc && <p className="text-muted-foreground whitespace-pre-line">{desc}</p>}
            {info.length > 0 && (
              <ul className="space-y-1.5 text-sm text-foreground">
                {info.map(({ icon: Icon, text }, i) => (
                  <li key={i} className="flex items-center gap-2"><Icon className="h-4 w-4 text-turquoise" />{text}</li>
                ))}
              </ul>
            )}
            {tour.info_adicional && <p className="text-sm text-foreground whitespace-pre-line">{tour.info_adicional}</p>}
            {tour.observacoes && <p className="text-xs text-muted-foreground whitespace-pre-line">{tour.observacoes}</p>}
            {videos.map((src) => (
              <video key={src} src={src} controls playsInline preload="metadata" className="w-full rounded-xl bg-night" />
            ))}
            {tour.preco > 0 && (
              <p className="text-2xl font-extrabold text-turquoise">{formatBRL(tour.preco)}</p>
            )}
            {isLunchCmsTour(tour) ? (
              <button type="button" onClick={() => setBookingOpen(true)} className="rgb-border w-full block">
                <span className="flex items-center justify-center rounded-[0.65rem] bg-gradient-to-r from-deep-blue to-night px-4 py-3 text-sm font-bold text-foreground">
                  ✨ {t.bookNowBtn}
                </span>
              </button>
            ) : (
              <a href={cmsTourWhatsAppUrl(tour)} target="_blank" rel="noopener noreferrer" className="rgb-border w-full block">
                <span className="flex items-center justify-center rounded-[0.65rem] bg-gradient-to-r from-deep-blue to-night px-4 py-3 text-sm font-bold text-foreground">
                  ✨ {t.bookNowBtn}
                </span>
              </a>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}

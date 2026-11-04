import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { VoucherCard } from "@/components/vouchers/VoucherCard";
import { VoucherActions } from "@/components/vouchers/VoucherActions";
import { fetchPublicVoucher, type PublicVoucher, type IssuedVoucherItem } from "@/lib/db";
import { loadLang, saveLang, type Lang } from "@/lib/i18n";
import { VOUCHER_COPY, getVoucherTemplate, voucherTokenFromHash, voucherUrl } from "@/lib/vouchers";

const tokenFromFragment = (): string => {
  if (typeof window === "undefined") return "";
  return voucherTokenFromHash(window.location.hash);
};

const localeFor: Record<Lang, string> = { pt: "pt-BR", es: "es-ES", en: "en-GB", fr: "fr-FR", it: "it-IT" };
const formattedDate = (value: string | null, lang: Lang) => {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat(localeFor[lang], { dateStyle: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
};

const PAGE_COPY: Record<Lang, { title: string; intro: string; general: string; item: string; date: string; people: string; safe: string; loading: string; back: string; retry: string }> = {
  pt: { title: "Seus vouchers Ônix", intro: "Apresente cada voucher à equipe no dia correspondente. Baixe, compartilhe ou imprima uma cópia.", general: "Código geral da reserva", item: "Código do passeio", date: "Data da reserva", people: "Pessoas", safe: "Link privado: qualquer pessoa que o possuir poderá consultar estes vouchers. Não o publique em redes sociais.", loading: "Carregando seus vouchers…", back: "Voltar ao site", retry: "Tentar novamente" },
  es: { title: "Tus vouchers Ônix", intro: "Presenta cada voucher al equipo el día correspondiente. Descarga, comparte o imprime una copia.", general: "Código general de la reserva", item: "Código del paseo", date: "Fecha de la reserva", people: "Personas", safe: "Enlace privado: quien lo tenga podrá consultar estos vouchers. No lo publiques en redes sociales.", loading: "Cargando tus vouchers…", back: "Volver al sitio", retry: "Intentar de nuevo" },
  en: { title: "Your Ônix vouchers", intro: "Show each voucher to the team on its tour date. Download, share or print a copy.", general: "Booking reference", item: "Tour reference", date: "Booking date", people: "People", safe: "Private link: anyone who has it can view these vouchers. Do not post it publicly.", loading: "Loading your vouchers…", back: "Back to the website", retry: "Try again" },
  fr: { title: "Vos vouchers Ônix", intro: "Présentez chaque voucher à l’équipe à la date correspondante. Téléchargez, partagez ou imprimez une copie.", general: "Code général de réservation", item: "Code de l’excursion", date: "Date de réservation", people: "Personnes", safe: "Lien privé : toute personne qui le possède peut consulter ces vouchers. Ne le publiez pas.", loading: "Chargement de vos vouchers…", back: "Retour au site", retry: "Réessayer" },
  it: { title: "I tuoi voucher Ônix", intro: "Mostra ogni voucher al team nella data corrispondente. Scarica, condividi o stampa una copia.", general: "Codice generale della prenotazione", item: "Codice del tour", date: "Data della prenotazione", people: "Persone", safe: "Link privato: chiunque lo possieda può consultare questi voucher. Non pubblicarlo.", loading: "Caricamento dei voucher…", back: "Torna al sito", retry: "Riprova" },
};

const VoucherPanel = ({ voucher, item, lang, shareUrl }: { voucher: PublicVoucher; item: IssuedVoucherItem; lang: Lang; shareUrl: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const hasTemplate = !!item.template_key && !!getVoucherTemplate(item.template_key);
  const copy = VOUCHER_COPY[lang];
  const safeName = `${item.tour_key}-${item.code}`;

  if (!hasTemplate) {
    return (
      <section className="voucher-print-card space-y-3">
        <div ref={ref} className="overflow-hidden rounded-2xl border border-turquoise/35 bg-night/95 p-6 text-foreground" style={{ aspectRatio: "1080 / 1356", containerType: "inline-size", boxSizing: "border-box" }}>
          <p style={{ color: "#73edf2", fontSize: "2.2cqw", fontWeight: 800, letterSpacing: ".12em" }}>{copy.reservationVoucher}</p>
          <h3 style={{ marginTop: "2cqw", fontSize: "5cqw", lineHeight: 1.1, fontWeight: 900 }}>{item.name}</h3>
          <div style={{ marginTop: "3cqw", height: "1px", background: "rgba(115,237,242,.35)" }} />
          <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.6cqw", marginTop: "4cqw" }}>
            {[
              [copy.reservationCode, voucher.reservation_code],
              [copy.itemCode, item.code],
              [copy.passenger, voucher.passenger_name],
              [copy.date, formattedDate(item.date, lang)],
              [copy.time, item.schedule],
              [copy.people, `${voucher.total_people} ${copy.peopleUnit}`],
            ].map(([label, value]) => (
              <div key={label} style={{ minWidth: 0, padding: "1.5cqw", border: "1px solid rgba(104,207,232,.3)", borderRadius: "1.4cqw", background: "rgba(255,255,255,.04)" }}>
                <dt style={{ color: "#80ebf4", fontSize: "1.65cqw", fontWeight: 800, lineHeight: 1.2 }}>{label}</dt>
                <dd style={{ marginTop: "1.4cqw", overflowWrap: "anywhere", color: "#f5fbff", fontSize: "2.25cqw", fontWeight: 700, lineHeight: 1.2 }}>{value}</dd>
              </div>
            ))}
          </dl>
          <p style={{ marginTop: "4cqw", color: "#b9cbd5", fontSize: "1.7cqw", lineHeight: 1.4 }}>{copy.noTemplate}</p>
        </div>
        <VoucherActions elementRef={ref} lang={lang} filename={`onix-${safeName}`} shareUrl={shareUrl} />
      </section>
    );
  }

  return (
    <section className="voucher-print-card space-y-3">
      <div className="overflow-hidden rounded-2xl border border-turquoise/20 shadow-[0_18px_60px_rgba(0,0,0,.35)]">
        <VoucherCard ref={ref} voucher={voucher} item={item} lang={lang} />
      </div>
      <VoucherActions elementRef={ref} lang={lang} filename={`onix-${safeName}`} shareUrl={shareUrl} />
    </section>
  );
};

const Vouchers = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>(() => loadLang());
  const [voucher, setVoucher] = useState<PublicVoucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [lookupFinished, setLookupFinished] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const [token] = useState(() => tokenFromFragment());
  const copy = VOUCHER_COPY[lang];
  const page = PAGE_COPY[lang];
  const shareUrl = useMemo(() => voucherUrl(token), [token]);

  const onLangChange = (next: Lang) => {
    saveLang(next);
    setLang(next);
  };

  useEffect(() => {
    let active = true;
    if (!token) {
      setLoading(false);
      setLookupFinished(true);
      return;
    }
    setLoading(true);
    fetchPublicVoucher(token).then((result) => {
      if (!active) return;
      setVoucher(result);
      setLoading(false);
      setLookupFinished(true);
    });
    return () => { active = false; };
  }, [token, reloadCount]);

  useEffect(() => {
    const priorTitle = document.title;
    document.title = `${page.title} · Ônix Turismo Búzios`;
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    const previousRobots = robots.content;
    robots.content = "noindex, nofollow, noarchive";
    return () => {
      document.title = priorTitle;
      if (robots) {
        if (created) robots.remove();
        else robots.content = previousRobots;
      }
    };
  }, [page.title]);

  const returnToSite = () => navigate("/passeios");

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:py-10">
      <div aria-hidden className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <div className="no-print flex items-center justify-between gap-4">
          <Button type="button" variant="ghost" onClick={returnToSite} className="text-foreground/80 hover:text-turquoise">
            <ArrowLeft className="mr-2 h-4 w-4" />{page.back}
          </Button>
          <LanguageSwitcher lang={lang} onChange={onLangChange} />
        </div>

        {loading && <div className="rounded-2xl border border-turquoise/25 bg-night/70 p-8 text-center text-foreground">{page.loading}</div>}

        {!loading && !voucher && lookupFinished && (
          <section className="rounded-2xl border border-amber-300/40 bg-night/80 p-7 text-center shadow-xl">
            <h1 className="text-2xl font-bold text-foreground">{copy.invalidTitle}</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-foreground/75">{copy.invalidBody}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {token && <Button type="button" variant="outline" onClick={() => { setLookupFinished(false); setLoading(true); setReloadCount((count) => count + 1); }} className="border-turquoise/40 text-foreground">{page.retry}</Button>}
              <Button type="button" onClick={returnToSite} className="bg-turquoise text-night hover:bg-turquoise-glow">{page.back}</Button>
            </div>
          </section>
        )}

        {voucher && (
          <>
            <header className="no-print rounded-2xl border border-turquoise/25 bg-night/75 p-5 shadow-xl backdrop-blur sm:p-7">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-turquoise" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{page.title}</h1>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/75">{page.intro}</p>
                </div>
              </div>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-white/5 p-3"><dt className="text-foreground/65">{page.general}</dt><dd className="mt-1 break-all font-bold text-turquoise">{voucher.reservation_code}</dd></div>
                <div className="rounded-lg bg-white/5 p-3"><dt className="text-foreground/65">{page.date}</dt><dd className="mt-1 font-semibold text-foreground">{formattedDate(voucher.travel_date, lang)}</dd></div>
                <div className="rounded-lg bg-white/5 p-3"><dt className="text-foreground/65">{copy.passenger}</dt><dd className="mt-1 font-semibold text-foreground">{voucher.passenger_name}</dd></div>
                <div className="rounded-lg bg-white/5 p-3"><dt className="text-foreground/65">{page.people}</dt><dd className="mt-1 font-semibold text-foreground">{voucher.total_people}</dd></div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-amber-100/80">{page.safe}</p>
            </header>

            <div className="space-y-7">
              {voucher.items.map((item) => (
                <VoucherPanel key={item.code} voucher={voucher} item={item} lang={lang} shareUrl={shareUrl} />
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`@media print { body { background: #fff !important; } .no-print { display: none !important; } main { padding: 0 !important; min-height: auto !important; } .voucher-print-card { break-after: page; page-break-after: always; } .voucher-print-card:last-child { break-after: auto; page-break-after: auto; } .voucher-print-card { margin: 0 auto; width: 100%; max-width: 180mm; } }`}</style>
    </main>
  );
};

export default Vouchers;

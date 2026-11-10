import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/lib/i18n";
import { BOOKING_WHATSAPP } from "@/lib/brand";

interface SummaryRow {
  label: string;
  value: string;
}

interface Props {
  text: string;
  lang: Lang;
  onReset: () => void;
  rows: SummaryRow[];
  tourTitle: string;
  totalRowLabel?: string;
  onSend?: () => void;
  voucherWarning?: boolean;
  onRetryVoucher?: () => void;
  retryingVoucher?: boolean;
}

const HEADER: Record<Lang, {
  ready: string; instr: string; review: string; send: string; back: string; tour: string; details: string; edit: string;
  voucherWarning: string; voucherUnavailable: string; retry: string; retrying: string;
}> = {
  pt: { ready: "Confira sua reserva", instr: "Revise os dados e valores antes de abrir o WhatsApp. Sua reserva já foi salva no site.", review: "Revisão antes de enviar", send: "Confirmar e enviar para WhatsApp", back: "Voltar ao passeio", tour: "Passeio", details: "Detalhes da reserva", edit: "Editar dados", voucherWarning: "Sua reserva está salva, mas não conseguimos gerar o link seguro dos vouchers agora. Tente novamente antes de enviar; se continuar, você ainda pode enviar a reserva sem o link. Não exibiremos um link fictício.", voucherUnavailable: "Sua reserva está salva. O serviço de vouchers não está disponível neste momento; você ainda pode enviar a reserva pelo WhatsApp e solicitar o voucher à equipe Ônix.", retry: "Tentar gerar vouchers novamente", retrying: "Gerando vouchers…" },
  es: { ready: "Revisa tu reserva", instr: "Revisa los datos y los valores antes de abrir WhatsApp. Tu reserva ya se guardó en el sitio.", review: "Revisión antes de enviar", send: "Confirmar y enviar por WhatsApp", back: "Volver al paseo", tour: "Paseo", details: "Detalles de la reserva", edit: "Editar datos", voucherWarning: "Tu reserva está guardada, pero no pudimos generar ahora el enlace seguro de los vouchers. Inténtalo de nuevo antes de enviar; si sigue fallando, puedes enviar la reserva sin el enlace. No mostraremos un enlace ficticio.", voucherUnavailable: "Tu reserva está guardada. El servicio de vouchers no está disponible ahora; puedes enviar la reserva por WhatsApp y solicitar el voucher al equipo Ônix.", retry: "Intentar generar los vouchers", retrying: "Generando vouchers…" },
  en: { ready: "Review your booking", instr: "Review your details and prices before opening WhatsApp. Your booking has already been saved on the site.", review: "Review before sending", send: "Confirm and send to WhatsApp", back: "Back to tour", tour: "Tour", details: "Booking details", edit: "Edit details", voucherWarning: "Your booking is saved, but we could not create the secure voucher link right now. Try again before sending; if it still fails, you can send the booking without the link. We will not show a fake link.", voucherUnavailable: "Your booking is saved. The voucher service is unavailable right now; you can still send your booking via WhatsApp and request the voucher from the Ônix team.", retry: "Try generating vouchers again", retrying: "Generating vouchers…" },
  fr: { ready: "Vérifiez votre réservation", instr: "Vérifiez les données et les tarifs avant d'ouvrir WhatsApp. Votre réservation a déjà été enregistrée sur le site.", review: "Vérification avant envoi", send: "Confirmer et envoyer sur WhatsApp", back: "Retour à l'excursion", tour: "Excursion", details: "Détails de la réservation", edit: "Modifier les données", voucherWarning: "Votre réservation est enregistrée, mais le lien sécurisé des vouchers n’a pas pu être créé. Réessayez avant l’envoi ; en cas d’échec persistant, vous pouvez envoyer la réservation sans le lien. Aucun faux lien ne sera affiché.", voucherUnavailable: "Votre réservation est enregistrée. Le service de vouchers est indisponible pour le moment ; vous pouvez envoyer la réservation sur WhatsApp et demander le voucher à l’équipe Ônix.", retry: "Réessayer de générer les vouchers", retrying: "Génération des vouchers…" },
  it: { ready: "Controlla la prenotazione", instr: "Controlla i dati e i prezzi prima di aprire WhatsApp. La prenotazione è già stata salvata sul sito.", review: "Verifica prima dell'invio", send: "Conferma e invia su WhatsApp", back: "Torna al tour", tour: "Tour", details: "Dettagli della prenotazione", edit: "Modifica i dati", voucherWarning: "La prenotazione è salvata, ma non è stato possibile generare ora il link sicuro dei voucher. Riprova prima dell’invio; se continua a non funzionare, puoi inviare la prenotazione senza link. Non mostreremo un link fittizio.", voucherUnavailable: "La prenotazione è salvata. Il servizio voucher non è disponibile ora; puoi inviare la prenotazione su WhatsApp e chiedere il voucher al team Ônix.", retry: "Prova a generare di nuovo i voucher", retrying: "Generazione voucher…" },
};

export const SummaryOutput = ({ text, lang, onReset, rows, tourTitle, totalRowLabel, onSend, voucherWarning, onRetryVoucher, retryingVoucher }: Props) => {
  const h = HEADER[lang];
  const waUrl = `https://wa.me/${BOOKING_WHATSAPP}?text=${encodeURIComponent(text)}`;
  const allRows = [{ label: h.tour, value: tourTitle }, ...rows];

  return (
    <div className="mx-auto max-w-4xl space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <section className="rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-[#10352f]/80 to-[#0a1f2c]/90 px-5 py-6 text-center shadow-[0_20px_55px_rgba(0,0,0,.22)] sm:px-8">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-emerald-300/40 bg-emerald-300/10 shadow-[0_0_28px_rgba(16,185,129,0.25)]">
          <CheckCircle2 className="h-7 w-7 text-emerald-300" aria-hidden="true" />
        </div>
        <div className="mb-3 inline-flex rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-amber-100">{h.review}</div>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{h.ready}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{h.instr}</p>
      </section>

      <section className="overflow-hidden rounded-3xl border border-turquoise/20 bg-gradient-to-br from-[#102a39] to-[#091d2a] shadow-[0_22px_55px_rgba(0,0,0,.26)]">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0c2533]/80 px-5 py-4 sm:px-6">
          <h3 className="text-base font-bold text-foreground sm:text-lg">{h.details}</h3>
        </header>

        <dl className="grid grid-cols-1 gap-x-6 px-5 py-2 sm:grid-cols-2 sm:px-6">
          {allRows.map((row, index) => {
            const isTotal = !!totalRowLabel && row.label.toLocaleLowerCase() === totalRowLabel.toLocaleLowerCase();
            return <Row key={`${row.label}-${index}`} label={row.label} value={row.value} isTotal={isTotal} />;
          })}
        </dl>

        {voucherWarning && (
          <div role="status" className="mx-5 mb-5 rounded-2xl border border-amber-300/40 bg-amber-300/10 p-4 text-sm leading-relaxed text-amber-50 sm:mx-6">
            <p>{onRetryVoucher ? h.voucherWarning : h.voucherUnavailable}</p>
            {onRetryVoucher && (
              <Button type="button" onClick={onRetryVoucher} disabled={retryingVoucher} className="mt-3 min-h-11 w-full bg-amber-300 text-night hover:bg-amber-200">
                {retryingVoucher ? h.retrying : h.retry}
              </Button>
            )}
          </div>
        )}

        <div className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              onSend?.();
              try {
                localStorage.removeItem("nathan_qr_promo_v1");
                localStorage.removeItem("nathan_qr_seen_v1");
              } catch {
                // localStorage pode estar indisponível em contextos de navegação restritos.
              }
            }}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--whatsapp))] px-4 py-3 text-center text-sm font-extrabold text-[hsl(var(--whatsapp-foreground))] transition-colors hover:bg-[hsl(var(--whatsapp-hover))] sm:text-base"
          >
            <svg viewBox="0 0 32 32" className="h-5 w-5 shrink-0 fill-current" aria-hidden="true">
              <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.745.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.79 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.302.13-.561.13-.762 0-.53-.057-.72-.486-.93-.428-.215-1.43-.701-1.96-.701zM16.066 6.733c-5.244 0-9.553 4.31-9.553 9.554 0 1.79.5 3.532 1.46 5.05L6 26.067l4.818-1.502a9.482 9.482 0 0 0 5.266 1.59h.014c5.252 0 9.561-4.309 9.561-9.553 0-2.55-1.075-4.945-2.864-6.756a9.49 9.49 0 0 0-6.729-2.713zm0 17.486h-.013a7.93 7.93 0 0 1-4.046-1.103l-.288-.172-3.022.945.96-2.937-.187-.302a7.929 7.929 0 0 1-1.218-4.252c0-4.382 3.561-7.943 7.943-7.943a7.886 7.886 0 0 1 5.61 2.32 7.881 7.881 0 0 1 2.327 5.616 7.972 7.972 0 0 1-7.957 7.928z" />
            </svg>
            {h.send}
          </a>
          <Button type="button" onClick={onReset} variant="ghost" className="min-h-10 w-full text-foreground/75 hover:text-turquoise">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />{h.back}
          </Button>
        </div>
      </section>
    </div>
  );
};

const Row = ({ label, value, isTotal }: { label: string; value: string; isTotal: boolean }) => (
  <div className={`flex min-w-0 items-start justify-between gap-4 border-b border-white/[0.07] py-3 ${isTotal ? "sm:col-span-2 sm:mt-1 sm:border-t sm:border-turquoise/25" : ""}`}>
    <dt className={`min-w-0 text-xs leading-relaxed sm:text-sm ${isTotal ? "font-bold text-turquoise-glow" : "text-muted-foreground"}`}>{label}</dt>
    <dd className={`min-w-0 break-words text-right text-xs leading-relaxed sm:text-sm ${isTotal ? "font-extrabold text-turquoise-glow" : "font-semibold text-foreground"}`}>{value}</dd>
  </div>
);

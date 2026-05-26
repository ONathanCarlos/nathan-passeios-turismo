import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Lang, dict } from "@/lib/i18n";

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
  onSend?: () => void;
}

const WA_NUMBER = "5522998216796";

const HEADER: Record<Lang, { ready: string; instr: string; review: string; send: string; back: string; tour: string }> = {
  pt: { ready: "Reserva Pronta!", instr: "Revise abaixo os dados da sua reserva antes de enviar pelo WhatsApp.", review: "Revise antes de enviar", send: "Confirmar e enviar para WhatsApp", back: "Voltar ao Passeio", tour: "Passeio" },
  es: { ready: "¡Reserva Lista!", instr: "Revisa los datos de tu reserva antes de enviarla por WhatsApp.", review: "Revisa antes de enviar", send: "Confirmar y enviar por WhatsApp", back: "Volver al Paseo", tour: "Paseo" },
  en: { ready: "Booking Ready!", instr: "Review your booking details below before sending via WhatsApp.", review: "Review before sending", send: "Confirm and send to WhatsApp", back: "Back to Tour", tour: "Tour" },
  fr: { ready: "Réservation Prête !", instr: "Vérifiez les détails de votre réservation avant de l'envoyer via WhatsApp.", review: "Vérifiez avant d'envoyer", send: "Confirmer et envoyer sur WhatsApp", back: "Retour à l'Excursion", tour: "Excursion" },
  it: { ready: "Prenotazione Pronta!", instr: "Controlla i dati della tua prenotazione prima di inviarla via WhatsApp.", review: "Controlla prima di inviare", send: "Conferma e invia su WhatsApp", back: "Torna al Tour", tour: "Tour" },
};

export const SummaryOutput = ({ text, lang, onReset, rows, tourTitle, onSend }: Props) => {
  const h = HEADER[lang];
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Confirmation card */}
      <div className="glass-card rounded-2xl p-7 text-center bg-night/70 backdrop-blur-md">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center shadow-[0_0_28px_rgba(16,185,129,0.45)]">
          <CheckCircle2 className="h-9 w-9 text-emerald-400" />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 px-3 py-1 mb-3 text-[10px] font-bold uppercase tracking-wider text-amber-200">
          ✦ {h.review}
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{h.ready}</h2>
        <p className="text-sm text-foreground/75 leading-relaxed max-w-sm mx-auto">{h.instr}</p>
      </div>

      {/* Summary card */}
      <div className="glass-card rounded-2xl p-5 bg-night/70 backdrop-blur-md">
        <div className="divide-y divide-border/40">
          <Row label={h.tour} value={tourTitle} bold />
          {rows.map((r, i) => (
            <Row key={i} label={r.label} value={r.value} />
          ))}
        </div>
      </div>

      {/* Send via WhatsApp */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          onSend?.();
          // Encerrar promoção QR ao concluir reserva e recarregar em estado limpo
          try {
            localStorage.removeItem("nathan_qr_promo_v1");
            localStorage.removeItem("nathan_qr_seen_v1");
          } catch {}
          setTimeout(() => {
            window.location.replace("/");
          }, 600);
        }}
        className="block w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-base h-14 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.55)] hover:opacity-95"
      >
        <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white" aria-hidden="true">
          <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.745.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.79 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.302.13-.561.13-.762 0-.53-.057-.72-.486-.93-.428-.215-1.43-.701-1.96-.701zM16.066 6.733c-5.244 0-9.553 4.31-9.553 9.554 0 1.79.5 3.532 1.46 5.05L6 26.067l4.818-1.502a9.482 9.482 0 0 0 5.266 1.59h.014c5.252 0 9.561-4.309 9.561-9.553 0-2.55-1.075-4.945-2.864-6.756a9.49 9.49 0 0 0-6.729-2.713zm0 17.486h-.013a7.93 7.93 0 0 1-4.046-1.103l-.288-.172-3.022.945.96-2.937-.187-.302a7.929 7.929 0 0 1-1.218-4.252c0-4.382 3.561-7.943 7.943-7.943a7.886 7.886 0 0 1 5.61 2.32 7.881 7.881 0 0 1 2.327 5.616 7.972 7.972 0 0 1-7.957 7.928z" />
        </svg>
        {h.send}
      </a>

      <Button
        onClick={onReset}
        variant="ghost"
        className="w-full text-foreground/80 hover:text-turquoise"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {h.back}
      </Button>
    </div>
  );
};

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <span className="text-sm text-turquoise-glow/90">{label}</span>
    <span className={`text-sm text-right text-foreground ${bold ? "font-bold" : "font-semibold"}`}>{value}</span>
  </div>
);

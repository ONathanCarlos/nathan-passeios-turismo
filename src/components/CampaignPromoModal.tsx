// ============================================================
// Modal automático para links de campanha: /?promo=<chave>
// Ex.: /?promo=blackfri, /?promo=natal, /?promo=maes, etc.
// Lê o modal correspondente da tabela `modais` no Supabase.
// Pula chaves no formato `qrN` (essas são tratadas por QrPromoBoot).
// ============================================================
import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getCachedModal, subscribeCmsCache, ModalCache } from "@/lib/cmsCache";
import type { Lang } from "@/lib/i18n";

interface Props { lang: Lang }

const parsePromoKey = (): string | null => {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("promo");
  if (!raw) return null;
  const k = raw.trim().toLowerCase();
  if (!k || /^qr\d+$/.test(k)) return null; // qrN tratado por QrPromoBoot
  return k;
};

const pick = (m: ModalCache, base: "titulo" | "mensagem", lang: Lang) => {
  const order: Lang[] = [lang, "pt", "en", "es", "fr", "it"];
  for (const l of order) {
    const v = (m as any)[`${base}_${l}`];
    if (v) return v as string;
  }
  return "";
};

export const CampaignPromoModal = ({ lang }: Props) => {
  const promoKey = useMemo(() => parsePromoKey(), []);
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);

  useEffect(() => subscribeCmsCache(() => force((n) => n + 1)), []);

  useEffect(() => {
    if (!promoKey) return;
    const sessionKey = `nathan_campaign_modal_${promoKey}`;
    try { if (sessionStorage.getItem(sessionKey)) return; } catch {}
    const t = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(t);
  }, [promoKey]);

  if (!promoKey) return null;
  const cms = getCachedModal(promoKey);
  if (!cms || !cms.ativo) return null;

  const title = pick(cms, "titulo", lang) || "🎉 Oferta especial";
  const message = pick(cms, "mensagem", lang) || "Aproveite o desconto exclusivo deste link.";
  const percent = Number(cms.percentual) || 0;
  const code = cms.codigo?.trim().toUpperCase() || "";
  const hasCoupon = !!code && percent > 0;

  const tLabels: Record<Lang, { offer: string; manual: string; codeLabel: string; cta: string; close: string; copied: string; noCode: string; onlyTours: string }> = {
    pt: { offer: "Desconto disponível", manual: "Digite o código no formulário da reserva", codeLabel: "Código", cta: "Copiar código e continuar", close: "Continuar", copied: "Código copiado. Insira-o no campo de cupom da reserva.", noCode: "Código ainda não configurado", onlyTours: "Válido apenas para passeios individuais." },
    es: { offer: "Descuento disponible", manual: "Introduce el código en el formulario de reserva", codeLabel: "Código", cta: "Copiar código y continuar", close: "Continuar", copied: "Código copiado. Introdúcelo en el campo de cupón de la reserva.", noCode: "Código aún no configurado", onlyTours: "Válido solo para paseos individuales." },
    en: { offer: "Discount available", manual: "Enter the code in the booking form", codeLabel: "Code", cta: "Copy code and continue", close: "Continue", copied: "Code copied. Enter it in the booking coupon field.", noCode: "Code is not configured yet", onlyTours: "Valid for individual tours only." },
    fr: { offer: "Réduction disponible", manual: "Saisissez le code dans le formulaire de réservation", codeLabel: "Code", cta: "Copier le code et continuer", close: "Continuer", copied: "Code copié. Saisissez-le dans le champ coupon de la réservation.", noCode: "Code pas encore configuré", onlyTours: "Valable uniquement pour les excursions individuelles." },
    it: { offer: "Sconto disponibile", manual: "Inserisci il codice nel modulo di prenotazione", codeLabel: "Codice", cta: "Copia il codice e continua", close: "Continua", copied: "Codice copiato. Inseriscilo nel campo coupon della prenotazione.", noCode: "Codice non ancora configurato", onlyTours: "Valido solo per tour individuali." },
  };
  const L = tLabels[lang];

  const handleClose = () => {
    try { sessionStorage.setItem(`nathan_campaign_modal_${promoKey}`, "1"); } catch {}
    setOpen(false);
  };

  const handleCta = () => {
    if (hasCoupon) {
      navigator.clipboard?.writeText(code).catch(() => {});
      toast.success(L.copied);
    } else if (percent > 0) {
      toast.error(L.noCode);
    }
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="bg-card border-amber-400/40 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-amber-300" />
            {title}
          </DialogTitle>
          <DialogDescription className="leading-relaxed pt-1">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center py-5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-turquoise/15 border border-amber-400/30">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{hasCoupon ? L.offer : L.noCode}</div>
            <div className="text-5xl font-extrabold bg-gradient-to-r from-amber-300 to-turquoise-glow bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] py-1">
              {hasCoupon ? `${percent}% OFF` : "—"}
            </div>
            <div className="text-xs text-emerald-300 font-semibold mt-1">{hasCoupon ? L.manual : L.noCode}</div>
          </div>

          {hasCoupon && (
            <div className="text-center text-xs text-foreground/85">
              {L.codeLabel}: <code className="text-turquoise-glow font-bold tracking-wider">{code}</code>
            </div>
          )}
          <p className="text-center text-[10px] text-amber-200/80 italic">
            *{L.onlyTours}
          </p>

          <button type="button" onClick={handleCta} className="rgb-border w-full block">
            <span className="flex items-center justify-center w-full h-12 rounded-[0.6rem] bg-gradient-to-r from-amber-400 to-turquoise-glow text-night font-bold text-sm">
              {hasCoupon ? L.cta : L.close}
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

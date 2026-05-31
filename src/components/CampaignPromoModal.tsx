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
import { applyModalDiscount } from "@/lib/qrPromo";
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
  const percent = cms.percentual || 0;
  const code = cms.codigo || "";

  const tLabels: Record<Lang, { activated: string; applied: string; codeLabel: string; cta: string; copied: string }> = {
    pt: { activated: "Desconto ativado", applied: "Aplicado automaticamente", codeLabel: "Código", cta: "Copiar e continuar", copied: "Cupom copiado!" },
    es: { activated: "Descuento activado", applied: "Aplicado automáticamente", codeLabel: "Código", cta: "Copiar y continuar", copied: "¡Cupón copiado!" },
    en: { activated: "Discount activated", applied: "Applied automatically", codeLabel: "Code", cta: "Copy and continue", copied: "Coupon copied!" },
    fr: { activated: "Réduction activée", applied: "Appliquée automatiquement", codeLabel: "Code", cta: "Copier et continuer", copied: "Coupon copié !" },
    it: { activated: "Sconto attivato", applied: "Applicato automaticamente", codeLabel: "Codice", cta: "Copia e continua", copied: "Coupon copiato!" },
  };
  const L = tLabels[lang];

  const handleClose = () => {
    try { sessionStorage.setItem(`nathan_campaign_modal_${promoKey}`, "1"); } catch {}
    // Aplica o desconto do cupom/modal aos passeios avulsos e recarrega a página
    // para que os preços já apareçam com o desconto ativo.
    if (percent > 0) {
      try {
        saveQrPromo({
          percent,
          campaign: code || promoKey || `promo${percent}`,
          activatedAt: new Date().toISOString(),
        });
        setOpen(false);
        window.location.reload();
        return;
      } catch {}
    }
    setOpen(false);
  };

  const handleCta = () => {
    if (code) {
      navigator.clipboard?.writeText(code).catch(() => {});
      toast.success(L.copied);
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
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{L.activated}</div>
            <div className="text-5xl font-extrabold bg-gradient-to-r from-amber-300 to-turquoise-glow bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] py-1">
              {percent}% OFF
            </div>
            <div className="text-xs text-emerald-300 font-semibold mt-1">{L.applied}</div>
          </div>

          {code && (
            <div className="text-center text-xs text-foreground/85">
              {L.codeLabel}: <code className="text-turquoise-glow font-bold tracking-wider">{code}</code>
            </div>
          )}
          <p className="text-center text-[10px] text-amber-200/80 italic">
            *Desconto válido apenas para passeios avulsos.
          </p>

          <button type="button" onClick={handleCta} className="rgb-border w-full block">
            <span className="flex items-center justify-center w-full h-12 rounded-[0.6rem] bg-gradient-to-r from-amber-400 to-turquoise-glow text-night font-bold text-sm">
              {L.cta}
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

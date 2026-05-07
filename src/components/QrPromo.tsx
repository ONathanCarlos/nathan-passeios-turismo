// ============================================================
// Modal de boas-vindas + selo flutuante para promo via QR Code
// ============================================================
import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles, Tag } from "lucide-react";
import {
  parseQrFromUrl, loadQrPromo, saveQrPromo, hasSeenCampaign, markSeenCampaign,
  subscribeQrPromo, QrPromo,
} from "@/lib/qrPromo";

export const QrPromoBoot = () => {
  const [promo, setPromo] = useState<QrPromo | null>(() => loadQrPromo());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const parsed = parseQrFromUrl();
    if (parsed) {
      const next: QrPromo = {
        percent: parsed.percent,
        campaign: parsed.campaign,
        activatedAt: new Date().toISOString(),
      };
      saveQrPromo(next);
      setPromo(next);
      if (!hasSeenCampaign(parsed.campaign)) {
        setOpen(true);
        markSeenCampaign(parsed.campaign);
      }
    }
    return subscribeQrPromo(() => setPromo(loadQrPromo()));
  }, []);

  if (!promo) return null;

  return (
    <>
      {/* Selo flutuante */}
      <div
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-full
                   bg-gradient-to-r from-amber-400/95 to-turquoise-glow/95 text-night
                   text-[11px] sm:text-xs font-extrabold uppercase tracking-wider
                   shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)] flex items-center gap-1.5
                   animate-in fade-in slide-in-from-bottom-3 duration-500"
      >
        <Tag className="h-3.5 w-3.5" />
        🎟 {promo.percent}% OFF aplicado via QR Code ✓
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-amber-400/40 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-xl">
              <Sparkles className="h-6 w-6 text-amber-300" />
              Opa... você por aqui? 🎉
            </DialogTitle>
            <DialogDescription className="leading-relaxed pt-1">
              Vimos que você chegou escaneando nosso QR Code.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center py-5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-turquoise/15 border border-amber-400/30">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Desconto ativado
              </div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-amber-300 to-turquoise-glow bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] py-1">
                {promo.percent}% OFF
              </div>
              <div className="text-xs text-emerald-300 font-semibold mt-1">
                Aplicado automaticamente na sua reserva
              </div>
            </div>

            <p className="text-xs text-foreground/85 text-center leading-relaxed">
              Como recompensa, seu desconto de <strong>{promo.percent}% OFF</strong> foi ativado
              automaticamente. Seu valor promocional já está aplicado na sua reserva.
            </p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rgb-border w-full block"
            >
              <span className="flex items-center justify-center w-full h-12 rounded-[0.6rem] bg-gradient-to-r from-amber-400 to-turquoise-glow text-night font-bold text-sm">
                Continuar
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

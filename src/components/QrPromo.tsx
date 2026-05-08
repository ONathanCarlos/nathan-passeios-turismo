// ============================================================
// Modal de boas-vindas para promo via QR Code.
// (O selo visual fica no PromoBanner, no topo do site.)
// ============================================================
import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import {
  parseQrFromUrl, loadQrPromo, saveQrPromo, clearQrPromo,
  hasSeenCampaign, markSeenCampaign, urlHasPromoParam,
  subscribeQrPromo, QrPromo,
} from "@/lib/qrPromo";
import { clearPromo } from "@/lib/promo";

export const QrPromoBoot = () => {
  const [promo, setPromo] = useState<QrPromo | null>(() => loadQrPromo());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const parsed = parseQrFromUrl();
    if (parsed) {
      // Ativar QR + limpar cupons comuns (boas-vindas)
      const next: QrPromo = {
        percent: parsed.percent,
        campaign: parsed.campaign,
        activatedAt: new Date().toISOString(),
      };
      saveQrPromo(next);
      clearPromo();
      setPromo(next);
      if (!hasSeenCampaign(parsed.campaign)) {
        setOpen(true);
        markSeenCampaign(parsed.campaign);
      }
    } else if (!urlHasPromoParam() && loadQrPromo()) {
      // URL limpa: encerra QR e restaura sistema normal
      clearQrPromo();
      setPromo(null);
    }
    return subscribeQrPromo(() => setPromo(loadQrPromo()));
  }, []);

  if (!promo) return null;

  return (
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
  );
};

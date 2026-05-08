// ============================================================
// Modal de boas-vindas para promo via QR Code (multilíngue)
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
import { Lang, loadLang } from "@/lib/i18n";

interface Props { lang?: Lang }

const T: Record<Lang, {
  title: string; desc: string; activated: string;
  applied: string; reward: (n: number) => string; cta: string;
}> = {
  pt: {
    title: "Opa... você por aqui? 🎉",
    desc: "Vimos que você chegou escaneando nosso QR Code.",
    activated: "Desconto ativado",
    applied: "Aplicado automaticamente na sua reserva",
    reward: (n) => `Como recompensa, seu desconto de ${n}% OFF foi ativado automaticamente. Seu valor promocional já está aplicado na sua reserva.`,
    cta: "Continuar",
  },
  es: {
    title: "¡Vaya... tú por aquí! 🎉",
    desc: "Vimos que llegaste escaneando nuestro QR Code.",
    activated: "Descuento activado",
    applied: "Aplicado automáticamente en tu reserva",
    reward: (n) => `Como recompensa, tu descuento de ${n}% OFF fue activado automáticamente. Tu valor promocional ya está aplicado en tu reserva.`,
    cta: "Continuar",
  },
  en: {
    title: "Hey... look who's here! 🎉",
    desc: "We noticed you arrived by scanning our QR Code.",
    activated: "Discount activated",
    applied: "Automatically applied to your booking",
    reward: (n) => `As a reward, your ${n}% OFF discount has been activated automatically. The promo price already applies to your booking.`,
    cta: "Continue",
  },
  fr: {
    title: "Tiens... vous voilà ! 🎉",
    desc: "Nous avons vu que vous êtes arrivé en scannant notre QR Code.",
    activated: "Réduction activée",
    applied: "Appliquée automatiquement à votre réservation",
    reward: (n) => `En récompense, votre réduction de ${n}% OFF a été activée automatiquement. Le prix promotionnel s'applique déjà à votre réservation.`,
    cta: "Continuer",
  },
  it: {
    title: "Ehi... ma sei tu! 🎉",
    desc: "Abbiamo visto che sei arrivato scansionando il nostro QR Code.",
    activated: "Sconto attivato",
    applied: "Applicato automaticamente alla tua prenotazione",
    reward: (n) => `Come ricompensa, il tuo sconto del ${n}% OFF è stato attivato automaticamente. Il prezzo promozionale è già applicato alla tua prenotazione.`,
    cta: "Continua",
  },
};

export const QrPromoBoot = ({ lang }: Props) => {
  const [promo, setPromo] = useState<QrPromo | null>(() => loadQrPromo());
  const [open, setOpen] = useState(false);
  const activeLang: Lang = lang || loadLang();
  const t = T[activeLang];

  useEffect(() => {
    const parsed = parseQrFromUrl();
    if (parsed) {
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
            {t.title}
          </DialogTitle>
          <DialogDescription className="leading-relaxed pt-1">
            {t.desc}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center py-5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-turquoise/15 border border-amber-400/30">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t.activated}
            </div>
            <div className="text-5xl font-extrabold bg-gradient-to-r from-amber-300 to-turquoise-glow bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] py-1">
              {promo.percent}% OFF
            </div>
            <div className="text-xs text-emerald-300 font-semibold mt-1">
              {t.applied}
            </div>
          </div>

          <p className="text-xs text-foreground/85 text-center leading-relaxed">
            {t.reward(promo.percent)}
          </p>

          <button
            type="button"
            onClick={() => {
              if (promo) markSeenCampaign(promo.campaign);
              setOpen(false);
              window.location.reload();
            }}
            className="rgb-border w-full block"
          >
            <span className="flex items-center justify-center w-full h-12 rounded-[0.6rem] bg-gradient-to-r from-amber-400 to-turquoise-glow text-night font-bold text-sm">
              {t.cta}
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

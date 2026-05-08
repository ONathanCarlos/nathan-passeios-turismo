import { useEffect, useState } from "react";
import { Lang } from "@/lib/i18n";
import {
  createPromo,
  formatCountdown,
  hoursLeft,
  isExpired,
  loadPromo,
  PromoData,
  savePromo,
  getTodaySpecialCoupon,
  SpecificCoupon,
  isAdminMode,
  hasHolidayActiveToday,
  isWelcomeBlockedForPhone,
} from "@/lib/promo";
import { isQrActive, loadQrPromo, subscribeQrPromo } from "@/lib/qrPromo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput, PhoneValue, fullPhone } from "./PhoneInput";
import { toast } from "sonner";
import { Gift, X, Sparkles } from "lucide-react";

// i18n simples para o banner/modal
const T: Record<Lang, {
  banner: string; cta: string; welcome: string; expires: string;
  modalTitle: string; modalDesc: string;
  name: string; whats: string; email: string; emailOpt: string;
  remind: string; submit: string; close: string;
  errName: string; errWhats: string;
  successTitle: string; couponLabel: string; copy: string; copied: string;
  alert24: string; alertLast: string; usedTitle: string; usedDesc: string;
}> = {
  pt: {
    banner: "🎟️ Ganhe desconto exclusivo no seu primeiro passeio",
    cta: "Resgatar Cupom",
    welcome: "Bem-vindo de volta",
    expires: "Expira em",
    modalTitle: "Resgate seu cupom",
    modalDesc: "Preencha rapidamente para liberar seu desconto exclusivo.",
    name: "Nome completo",
    whats: "WhatsApp",
    email: "E-mail",
    emailOpt: "opcional",
    remind: "Concordo em receber lembretes promocionais via WhatsApp",
    submit: "Liberar meu desconto",
    close: "Fechar",
    errName: "Nome deve ter ao menos 3 caracteres",
    errWhats: "Informe um WhatsApp brasileiro válido (DDD + número)",
    successTitle: "Cupom liberado!",
    couponLabel: "Seu cupom",
    copy: "Copiar",
    copied: "Copiado!",
    alert24: "⚠ Seu desconto expira em breve",
    alertLast: "⏳ Último dia para reservar",
    usedTitle: "Cupom já utilizado",
    usedDesc: "Você já utilizou este cupom promocional.",
  },
  es: {
    banner: "🎟️ Gana descuento exclusivo en tu primer paseo",
    cta: "Canjear Cupón",
    welcome: "Bienvenido de vuelta",
    expires: "Expira en",
    modalTitle: "Canjea tu cupón",
    modalDesc: "Completa rápidamente para liberar tu descuento exclusivo.",
    name: "Nombre completo",
    whats: "WhatsApp",
    email: "E-mail",
    emailOpt: "opcional",
    remind: "Acepto recibir recordatorios promocionales por WhatsApp",
    submit: "Liberar mi descuento",
    close: "Cerrar",
    errName: "El nombre debe tener al menos 3 caracteres",
    errWhats: "Ingresa un WhatsApp brasileño válido (DDD + número)",
    successTitle: "¡Cupón liberado!",
    couponLabel: "Tu cupón",
    copy: "Copiar",
    copied: "¡Copiado!",
    alert24: "⚠ Tu descuento expira pronto",
    alertLast: "⏳ Último día para reservar",
    usedTitle: "Cupón ya utilizado",
    usedDesc: "Ya has utilizado este cupón promocional.",
  },
  en: {
    banner: "🎟️ Get an exclusive discount on your first tour",
    cta: "Claim Coupon",
    welcome: "Welcome back",
    expires: "Expires in",
    modalTitle: "Claim your coupon",
    modalDesc: "Quick sign-up to unlock your exclusive discount.",
    name: "Full name",
    whats: "WhatsApp",
    email: "Email",
    emailOpt: "optional",
    remind: "I agree to receive promotional reminders via WhatsApp",
    submit: "Unlock my discount",
    close: "Close",
    errName: "Name must be at least 3 characters",
    errWhats: "Enter a valid Brazilian WhatsApp (DDD + number)",
    successTitle: "Coupon unlocked!",
    couponLabel: "Your coupon",
    copy: "Copy",
    copied: "Copied!",
    alert24: "⚠ Your discount expires soon",
    alertLast: "⏳ Last day to book",
    usedTitle: "Coupon already used",
    usedDesc: "You have already used this promotional coupon.",
  },
  fr: {
    banner: "🎟️ Gagnez une réduction exclusive sur votre première excursion",
    cta: "Obtenir le Coupon",
    welcome: "Bon retour",
    expires: "Expire dans",
    modalTitle: "Obtenez votre coupon",
    modalDesc: "Inscription rapide pour débloquer votre réduction exclusive.",
    name: "Nom complet",
    whats: "WhatsApp",
    email: "E-mail",
    emailOpt: "facultatif",
    remind: "J'accepte de recevoir des rappels promotionnels via WhatsApp",
    submit: "Débloquer ma réduction",
    close: "Fermer",
    errName: "Le nom doit comporter au moins 3 caractères",
    errWhats: "Entrez un WhatsApp brésilien valide (DDD + numéro)",
    successTitle: "Coupon débloqué !",
    couponLabel: "Votre coupon",
    copy: "Copier",
    copied: "Copié !",
    alert24: "⚠ Votre réduction expire bientôt",
    alertLast: "⏳ Dernier jour pour réserver",
    usedTitle: "Coupon déjà utilisé",
    usedDesc: "Vous avez déjà utilisé ce coupon promotionnel.",
  },
  it: {
    banner: "🎟️ Ottieni uno sconto esclusivo sul tuo primo tour",
    cta: "Riscatta Coupon",
    welcome: "Bentornato",
    expires: "Scade tra",
    modalTitle: "Riscatta il tuo coupon",
    modalDesc: "Registrazione rapida per sbloccare il tuo sconto esclusivo.",
    name: "Nome completo",
    whats: "WhatsApp",
    email: "Email",
    emailOpt: "facoltativo",
    remind: "Accetto di ricevere promemoria promozionali via WhatsApp",
    submit: "Sblocca il mio sconto",
    close: "Chiudi",
    errName: "Il nome deve avere almeno 3 caratteri",
    errWhats: "Inserisci un WhatsApp brasiliano valido (DDD + numero)",
    successTitle: "Coupon sbloccato!",
    couponLabel: "Il tuo coupon",
    copy: "Copia",
    copied: "Copiato!",
    alert24: "⚠ Il tuo sconto scade presto",
    alertLast: "⏳ Ultimo giorno per prenotare",
    usedTitle: "Coupon già utilizzato",
    usedDesc: "Hai già utilizzato questo coupon promozionale.",
  },
};

interface Props {
  lang: Lang;
  /** controlled open from outside (e.g. "Apply Coupon" button) */
  forceOpen?: boolean;
  onForceOpenChange?: (v: boolean) => void;
  onPromoCreated?: (p: PromoData) => void;
}

export const PromoBanner = ({ lang, forceOpen, onForceOpenChange, onPromoCreated }: Props) => {
  const t = T[lang];
  const [promo, setPromo] = useState<PromoData | null>(null);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [special, setSpecial] = useState<SpecificCoupon | null>(null);
  const [specialOpen, setSpecialOpen] = useState(false);
  const admin = isAdminMode();
  const [qrActive, setQrActive] = useState<boolean>(() => isQrActive());

  useEffect(() => {
    setPromo(loadPromo());
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    const unsub = subscribeQrPromo(() => setQrActive(isQrActive()));
    return () => { clearInterval(id); unsub(); };
  }, []);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  // Cupom comemorativo do dia + modal automático (1x por sessão)
  useEffect(() => {
    const sp = getTodaySpecialCoupon(loadPromo());
    if (!sp) return;
    setSpecial(sp);
    const flag = sessionStorage.getItem("nathan_special_modal_" + sp.code);
    if (flag) return;
    setSpecialOpen(true);
    sessionStorage.setItem("nathan_special_modal_" + sp.code, "1");
  }, []);

  // Alert one-time per session quando expira
  useEffect(() => {
    const p = loadPromo();
    if (!p || p.cupomUsado || isExpired(p)) return;
    const h = hoursLeft(p);
    const flag = sessionStorage.getItem("nathan_promo_alert");
    if (h <= 24 && h > 12 && flag !== "24") {
      toast.warning(t.alert24);
      sessionStorage.setItem("nathan_promo_alert", "24");
    } else if (h <= 12 && flag !== "last") {
      toast.warning(t.alertLast);
      sessionStorage.setItem("nathan_promo_alert", "last");
    }
  }, [t]);

  // Hide banner se cupom usado/expirado
  const expired = promo ? isExpired(promo) : false;
  const used = promo?.cupomUsado ?? false;
  const holidayActive = hasHolidayActiveToday();

  return (
    <>
      {/* BANNER FIXO TOPO */}
      <div className="fixed top-0 left-0 right-0 z-40 px-3 py-2 bg-gradient-to-r from-night via-deep-blue to-night border-b border-turquoise/30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6)] backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
          {holidayActive && special ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                <span className="text-[12px] sm:text-sm font-semibold text-foreground truncate">
                  {special.message}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSpecialOpen(true)}
                className="rgb-border shrink-0"
              >
                <span className="block rounded-[0.55rem] bg-gradient-to-r from-amber-400 to-turquoise-glow text-night font-bold text-[11px] sm:text-xs px-3 py-1.5">
                  {special.code} · -{special.percent}%
                </span>
              </button>
            </>
          ) : promo && !expired && !used && !holidayActive && !qrActive ? (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] sm:text-sm font-semibold text-foreground truncate">
                  👋 {t.welcome}, <span className="text-turquoise-glow">{promo.nome.split(" ")[0]}</span>
                </div>
                <div className="text-[10px] sm:text-xs text-turquoise-glow font-mono">
                  {promo.cupom} · -{promo.percentualDesconto}% · {t.expires}: {formatCountdown(promo)}
                </div>
              </div>
            </>
          ) : qrActive ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
              <span className="text-[12px] sm:text-sm font-semibold text-foreground truncate">
                🎟 {loadQrPromo()?.percent}% OFF aplicado via QR Code
              </span>
            </div>
          ) : !holidayActive ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <Gift className="h-4 w-4 text-turquoise-glow shrink-0" />
                <span className="text-[12px] sm:text-sm font-semibold text-foreground truncate">
                  {t.banner}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rgb-border shrink-0"
              >
                <span className="block rounded-[0.55rem] bg-gradient-to-r from-turquoise to-turquoise-glow text-night font-bold text-[11px] sm:text-xs px-3 py-1.5">
                  {t.cta}
                </span>
              </button>
            </>
          ) : (
            <div className="flex-1" />
          )}
          {admin && (
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-400/40 rounded px-1.5 py-0.5 shrink-0">
              ADMIN
            </span>
          )}
        </div>
      </div>

      <PromoModal
        lang={lang}
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) onForceOpenChange?.(false);
        }}
        existing={promo}
        onCreated={(p) => {
          setPromo(p);
          onPromoCreated?.(p);
        }}
      />

      {/* Modal de cupom especial */}
      <Dialog open={specialOpen} onOpenChange={setSpecialOpen}>
        <DialogContent className="bg-card border-amber-400/40 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-300" />
              {lang === "pt" ? "Hoje é dia especial 🎉" : "Today is a special day 🎉"}
            </DialogTitle>
            <DialogDescription>{special?.message}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-center py-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-turquoise/15 border border-amber-400/30">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{lang === "pt" ? "Código" : "Code"}</div>
              <div className="text-2xl font-extrabold text-amber-200 font-mono tracking-wider">{special?.code}</div>
              <div className="text-sm text-emerald-300 font-semibold">-{special?.percent}%</div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (special) navigator.clipboard?.writeText(special.code).catch(() => {});
                toast.success(lang === "pt" ? "Cupom copiado!" : "Coupon copied!");
                setSpecialOpen(false);
              }}
              className="rgb-border w-full block"
            >
              <span className="flex items-center justify-center w-full h-12 rounded-[0.6rem] bg-gradient-to-r from-amber-400 to-turquoise-glow text-night font-bold text-sm">
                {lang === "pt" ? "Resgate seu cupom agora!" : "Claim your coupon now!"}
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ------------------ Modal -----------------------------------

interface ModalProps {
  lang: Lang;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing: PromoData | null;
  onCreated: (p: PromoData) => void;
}

const PromoModal = ({ lang, open, onOpenChange, existing, onCreated }: ModalProps) => {
  const t = T[lang];
  const [nome, setNome] = useState("");
  const [phone, setPhone] = useState<PhoneValue>({ ddi: "+55", number: "" });
  const [email, setEmail] = useState("");
  const [aceita, setAceita] = useState(false);
  const [errors, setErrors] = useState<{ nome?: string; whats?: string }>({});

  // BR DDD válido: 11..99 (sem 0 ou 1 inicial); número 10 ou 11 dígitos.
  const validBrPhone = (digits: string) => {
    if (phone.ddi !== "+55") return digits.length >= 8; // outros países: básico
    if (digits.length < 10 || digits.length > 11) return false;
    const ddd = parseInt(digits.slice(0, 2), 10);
    return ddd >= 11 && ddd <= 99;
  };

  const handleSubmit = () => {
    const e: typeof errors = {};
    if (nome.trim().length < 3) e.nome = t.errName;
    if (!validBrPhone(phone.number)) e.whats = t.errWhats;
    setErrors(e);
    if (Object.keys(e).length) return;
    const wa = fullPhone(phone);
    if (isWelcomeBlockedForPhone(wa) && !isAdminMode()) {
      toast.error(lang === "pt"
        ? "Este WhatsApp já utilizou o cupom de boas-vindas."
        : "This WhatsApp has already used the welcome coupon.");
      return;
    }
    const created = createPromo({
      nome: nome.trim(),
      whatsapp: wa,
      email: email.trim(),
      aceitaLembretes: aceita,
    });
    savePromo(created);
    onCreated(created);
    toast.success(`${t.successTitle} ${created.cupom}`);
    onOpenChange(false);
  };

  // Se já existe e foi usado: aviso
  if (existing?.cupomUsado && !isAdminMode()) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-turquoise/30">
          <DialogHeader>
            <DialogTitle className="text-foreground">{t.usedTitle}</DialogTitle>
            <DialogDescription>{t.usedDesc}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-turquoise/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Gift className="h-5 w-5 text-turquoise-glow" /> {t.modalTitle}
          </DialogTitle>
          <DialogDescription>{t.modalDesc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-foreground font-semibold">{t.name}</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="bg-night/70 border-turquoise/40 text-foreground h-11"
            />
            {errors.nome && <p className="text-xs text-rose-400">{errors.nome}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground font-semibold">{t.whats}</Label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              inputClassName="bg-night/70 border-turquoise/40 text-foreground h-11"
            />
            {errors.whats && <p className="text-xs text-rose-400">{errors.whats}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground font-semibold">
              {t.email} <span className="text-muted-foreground text-xs">({t.emailOpt})</span>
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-night/70 border-turquoise/40 text-foreground h-11"
            />
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              checked={aceita}
              onCheckedChange={(v) => setAceita(v === true)}
              className="mt-0.5"
            />
            <span className="text-xs text-foreground/85 leading-snug">{t.remind}</span>
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            className="rgb-border w-full block"
          >
            <span className="flex items-center justify-center w-full h-12 rounded-[0.6rem] bg-gradient-to-r from-turquoise to-turquoise-glow text-night font-bold text-sm">
              {t.submit}
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

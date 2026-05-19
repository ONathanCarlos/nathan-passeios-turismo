// ============================================================
// Modal automático para visitantes em espanhol (?lang=es).
// Não depende de criação manual no painel — abre 1x por sessão.
// Texto e % vêm da tabela `modais` (key='espanhol') quando
// disponíveis; caso contrário usa defaults estáticos (5%/HERMANO5).
// ============================================================
import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { getCachedModal, subscribeCmsCache } from "@/lib/cmsCache";
import type { Lang } from "@/lib/i18n";

const SESSION_KEY = "nathan_es_modal_seen_v1";

interface Props { lang: Lang }

const DEFAULTS = {
  title: "¡Bienvenido, hermano! 🎉",
  message: "Como hablas español, te regalamos un descuento exclusivo para tu reserva.",
  cta: "Continuar",
  activated: "Descuento activado",
  applied: "Aplicado automáticamente",
  percent: 5,
  code: "HERMANO5",
};

const urlHasLangEs = (): boolean => {
  if (typeof window === "undefined") return false;
  const raw = new URLSearchParams(window.location.search).get("lang");
  return !!raw && raw.trim().toLowerCase().startsWith("es");
};

export const SpanishLangModal = ({ lang }: Props) => {
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);

  // Re-render quando o cache CMS atualizar (modal `espanhol`).
  useEffect(() => subscribeCmsCache(() => force((n) => n + 1)), []);

  useEffect(() => {
    if (lang !== "es") return;
    // Quando o link ?lang=es é compartilhado, sempre abrimos o modal.
    // Quando o usuário apenas trocou o idioma manualmente, respeita gate de sessão.
    const fromUrl = urlHasLangEs();
    if (!fromUrl) {
      try { if (sessionStorage.getItem(SESSION_KEY)) return; } catch {}
    }
    const t = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(t);
  }, [lang]);

  if (lang !== "es") return null;

  const cms = getCachedModal("espanhol");
  const active = cms ? cms.ativo : true;
  if (!active) return null;

  const percent = cms?.percentual || DEFAULTS.percent;
  const code = cms?.codigo || DEFAULTS.code;
  const title = cms?.titulo_es || DEFAULTS.title;
  const message = cms?.mensagem_es || DEFAULTS.message;

  const handleClose = () => {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
    setOpen(false);
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
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {DEFAULTS.activated}
            </div>
            <div className="text-5xl font-extrabold bg-gradient-to-r from-amber-300 to-turquoise-glow bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] py-1">
              {percent}% OFF
            </div>
            <div className="text-xs text-emerald-300 font-semibold mt-1">
              {DEFAULTS.applied}
            </div>
          </div>

          {code && (
            <div className="text-center text-xs text-foreground/85">
              Código: <code className="text-turquoise-glow font-bold tracking-wider">{code}</code>
            </div>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="rgb-border w-full block"
          >
            <span className="flex items-center justify-center w-full h-12 rounded-[0.6rem] bg-gradient-to-r from-amber-400 to-turquoise-glow text-night font-bold text-sm">
              {DEFAULTS.cta}
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================
// Rota /admin — autenticação por senha e ativação do modo admin
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { enableAdminMode } from "@/lib/promo";
import { adminBlockedByQr } from "@/lib/qrPromo";
import { Lock, ShieldAlert } from "lucide-react";

const ADMIN_PASSWORD = "turismoadmin";

const Admin = () => {
  const nav = useNavigate();
  const [pwd, setPwd] = useState("");
  const [open, setOpen] = useState(true);
  const blocked = adminBlockedByQr();

  useEffect(() => {
    document.title = "Admin · Nathan Turismo";
  }, []);

  const submit = () => {
    if (blocked) {
      toast.error("Acesso administrativo bloqueado durante campanha promocional.");
      return;
    }
    if (pwd === ADMIN_PASSWORD) {
      enableAdminMode();
      toast.success("Modo administrador ativado");
      nav("/", { replace: true });
    } else {
      toast.error("Senha incorreta");
      setPwd("");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-night">
      <div aria-hidden="true" className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) nav("/", { replace: true }); }}>
        <DialogContent className="bg-card border-turquoise/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              {blocked ? <ShieldAlert className="h-5 w-5 text-rose-400" /> : <Lock className="h-5 w-5 text-turquoise-glow" />}
              {blocked ? "Acesso bloqueado" : "Modo administrador"}
            </DialogTitle>
            <DialogDescription>
              {blocked
                ? "Visitantes promocionais não podem acessar controles administrativos."
                : "Digite a senha para liberar o painel administrativo."}
            </DialogDescription>
          </DialogHeader>

          {!blocked && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-foreground font-semibold">Senha</Label>
                <Input
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                  className="bg-night/70 border-turquoise/40 text-foreground h-11"
                  autoFocus
                />
              </div>
              <Button
                onClick={submit}
                className="w-full h-11 bg-gradient-to-r from-turquoise to-turquoise-glow text-night font-bold hover:opacity-90"
              >
                Entrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Admin;

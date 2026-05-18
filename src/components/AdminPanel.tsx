// ============================================================
// CMS Unificado — painel administrativo único.
// 9 abas: Dashboard, Passeios, Conteúdo, Modais, Cupons,
// Reservas, Leads, Mídia, Configurações.
// Toda configuração administrativa do site vive aqui.
// ============================================================
import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Settings2, Trash2, Upload, Plus, Save, Sparkles, Gift, Eye,
  LayoutDashboard, Compass, FileText, MessageSquare, Ticket,
  CalendarCheck2, Users, Image as ImageIcon, Settings, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { TourKey } from "@/lib/tours";
import { Lang, dict } from "@/lib/i18n";
import {
  AdminConfig, loadAdminConfig, saveAdminConfig, useAdminConfig,
} from "@/lib/adminConfig";
import {
  disableAdminMode,
} from "@/lib/promo";
import { isQrActive } from "@/lib/qrPromo";
import { fetchPendingReservationPhones, subscribeAdminRealtime, type PendingReservationPhone } from "@/lib/db";
import { useModais, type CmsModal } from "@/lib/cms";
import {
  ToursSection, ModaisSection, ConfigSection, DepoimentosSection,
} from "./admin/CmsAdminTab";
import { DashboardSection } from "./admin/sections/DashboardSection";
import { ReservasSection } from "./admin/sections/ReservasSection";
import { LeadsSection } from "./admin/sections/LeadsSection";

const TOUR_KEYS: { key: TourKey; label: string }[] = [
  { key: "escuna", label: "Escuna" },
  { key: "arraial", label: "Arraial do Cabo" },
  { key: "buggy", label: "Buggy" },
  { key: "cabofrio", label: "Cabo Frio" },
  { key: "jardineira", label: "Jardineira" },
  { key: "catamara", label: "Catamarã" },
  { key: "mergulho", label: "Mergulho" },
  { key: "lancha", label: "Lancha Privada" },
];

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export const AdminPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const cfg = useAdminConfig();
  const modais = useModais();
  const update = (patch: Partial<AdminConfig>) => saveAdminConfig({ ...loadAdminConfig(), ...patch });
  const [pendingPhones, setPendingPhones] = useState<PendingReservationPhone[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  const [modalPreview, setModalPreview] = useState<CmsModal | null>(null);

  const loadPendingPhones = async () => {
    setPendingLoading(true);
    try {
      setPendingPhones(await fetchPendingReservationPhones());
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    loadPendingPhones();
    return subscribeAdminRealtime(loadPendingPhones);
  }, []);

  const tabBtn = "flex flex-col items-center gap-0.5 text-[10px] py-1.5 data-[state=active]:text-turquoise-glow";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-turquoise/30 max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-turquoise-glow" />
            CMS — Nathan Turismo
          </DialogTitle>
          <DialogDescription>
            Painel central. Toda configuração, conteúdo e gestão do site acontece aqui.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-9 w-full bg-night/60 h-auto">
            <TabsTrigger value="dashboard" className={tabBtn}><LayoutDashboard className="h-3.5 w-3.5" />Dashboard</TabsTrigger>
            <TabsTrigger value="tours" className={tabBtn}><Compass className="h-3.5 w-3.5" />Passeios</TabsTrigger>
            <TabsTrigger value="content" className={tabBtn}><FileText className="h-3.5 w-3.5" />Conteúdo</TabsTrigger>
            <TabsTrigger value="modais" className={tabBtn}><MessageSquare className="h-3.5 w-3.5" />Modais</TabsTrigger>
            <TabsTrigger value="coupons" className={tabBtn}><Ticket className="h-3.5 w-3.5" />Cupons</TabsTrigger>
            <TabsTrigger value="reservas" className={tabBtn}><CalendarCheck2 className="h-3.5 w-3.5" />Reservas</TabsTrigger>
            <TabsTrigger value="leads" className={tabBtn}><Users className="h-3.5 w-3.5" />Leads</TabsTrigger>
            <TabsTrigger value="media" className={tabBtn}><ImageIcon className="h-3.5 w-3.5" />Mídia</TabsTrigger>
            <TabsTrigger value="config" className={tabBtn}><Settings className="h-3.5 w-3.5" />Config</TabsTrigger>
          </TabsList>

          {/* ---------------- DASHBOARD ---------------- */}
          <TabsContent value="dashboard" className="mt-4">
            <DashboardSection />
          </TabsContent>

          {/* ---------------- PASSEIOS (CMS persistente) ---------------- */}
          <TabsContent value="tours" className="mt-4">
            <ToursSection />
          </TabsContent>

          {/* ---------------- CONTEÚDO (depoimentos + textos institucionais) ---------------- */}
          <TabsContent value="content" className="mt-4 space-y-6">
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-turquoise-glow">Depoimentos</h3>
              <DepoimentosSection />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-turquoise-glow">Descrições por passeio</h3>
              <div className="glass-card rounded-xl p-3 border-turquoise/30 bg-turquoise/5 text-xs text-turquoise-glow">
                ✍️ Edite em <b>Português</b> e clique em <b>Salvar</b>. O tradutor multilíngue do site (PT/ES/EN/FR/IT) usará este texto como base.
              </div>
              <TourDescriptionsEditor />
            </section>
          </TabsContent>

          {/* ---------------- MODAIS ---------------- */}
          <TabsContent value="modais" className="mt-4 space-y-4">
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-turquoise-glow">Modais persistentes</h3>
              <ModaisSection />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-turquoise-glow">Pré-visualizar modais promocionais</h3>
              <div className="text-xs text-muted-foreground">
                Visualização apenas — nenhum desconto é aplicado nem persistido.
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(modais.data || []).map((m) => (
                  <Button key={m.id} variant="outline" className="border-amber-400/40 text-amber-200 hover:bg-amber-500/10 h-auto py-3 flex flex-col items-center gap-1"
                    onClick={() => setModalPreview(m)}>
                    <Eye className="h-4 w-4" />
                    <span className="text-xs font-semibold">{m.titulo_pt || m.key}</span>
                  </Button>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* ---------------- CUPONS ---------------- */}
          <TabsContent value="coupons" className="mt-4 space-y-4">
            <div className="glass-card rounded-xl p-3 border-turquoise/40 bg-turquoise/10 text-xs text-turquoise-glow">
              ⚠ Percentuais, códigos e ativação de cupons promocionais agora vivem na aba <strong>Modais</strong> (fonte oficial: Lovable Cloud).
              Os controles abaixo de percentual/validade/ativação são apenas histórico e <strong>não têm mais efeito no site público</strong>.
              Use esta aba apenas para gerenciar <strong>cupons ativos no navegador</strong> e <strong>bloqueios por WhatsApp</strong>.
            </div>
            {isQrActive() && (
              <div className="glass-card rounded-xl p-3 border-amber-400/40 bg-amber-500/10 text-xs text-amber-200">
                🎟 Promoção QR ativa. Cupons manuais desativados enquanto a URL contiver <code>?promo=qrN</code>.
              </div>
            )}
            <div className="glass-card rounded-xl p-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-turquoise-glow">Sistema de cupons</h4>
                <p className="text-[11px] text-muted-foreground">Liga/desliga todos os cupons do site.</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={cfg.coupon.allEnabled !== false}
                  onCheckedChange={(v) => update({ coupon: { ...cfg.coupon, allEnabled: v } })} />
                <span className="text-xs">{cfg.coupon.allEnabled !== false ? "Ativo" : "Desativado"}</span>
              </div>
            </div>

            {/* Boas-vindas */}
            <div className="glass-card rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-turquoise-glow">Boas-vindas (BEMVINDOXXXX)</h4>
                <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200"
                  onClick={() => { update({ coupon: { ...cfg.coupon, welcomePercent: undefined, welcomeValidityDays: undefined, welcomeEnabled: false } }); toast.success("Cupom de boas-vindas removido"); }}>
                  <Trash2 className="h-3 w-3 mr-1" /> Remover
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 items-end">
                <div><Label className="text-xs">Percentual</Label>
                  <Input type="number" min={0} max={100} value={cfg.coupon.welcomePercent ?? ""} placeholder="10" className="bg-night/70 border-turquoise/40"
                    onChange={(e) => update({ coupon: { ...cfg.coupon, welcomePercent: e.target.value === "" ? undefined : parseInt(e.target.value) } })} /></div>
                <div><Label className="text-xs">Validade (dias)</Label>
                  <Input type="number" min={1} value={cfg.coupon.welcomeValidityDays ?? ""} placeholder="3" className="bg-night/70 border-turquoise/40"
                    onChange={(e) => update({ coupon: { ...cfg.coupon, welcomeValidityDays: e.target.value === "" ? undefined : parseInt(e.target.value) } })} /></div>
                <div className="flex items-center gap-2">
                  <Switch checked={cfg.coupon.welcomeEnabled !== false}
                    onCheckedChange={(v) => update({ coupon: { ...cfg.coupon, welcomeEnabled: v } })} />
                  <span className="text-xs">Ativo</span>
                </div>
              </div>
            </div>

            {/* Telefones com reserva pendente */}
            <div className="glass-card rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-turquoise-glow">Telefones com reserva pendente</h4>
                <Button size="sm" variant="outline" className="border-turquoise/40" onClick={loadPendingPhones} disabled={pendingLoading}>
                  <RefreshCw className={`h-3 w-3 mr-1 ${pendingLoading ? "animate-spin" : ""}`} /> Atualizar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Lista em tempo real baseada na tabela oficial de reservas pendentes.
              </p>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {pendingPhones.length === 0 ? (
                  <div className="text-xs text-muted-foreground">Nenhum telefone pendente no momento.</div>
                ) : pendingPhones.map((row) => (
                  <div key={`${row.telefone}-${row.created_at}`} className="flex items-center justify-between gap-3 rounded-md bg-night/40 border border-turquoise/20 px-3 py-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">{row.nome}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{row.telefone} · {row.destino}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(row.created_at).toLocaleDateString("pt-BR")}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recuperação */}
            <div className="glass-card rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-turquoise-glow">Recuperação (TODEVOLTA12)</h4>
                <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200"
                  onClick={() => { update({ coupon: { ...cfg.coupon, recoveryPercent: undefined, recoveryAfterHours: undefined, recoveryEnabled: false } }); toast.success("Cupom de recuperação removido"); }}>
                  <Trash2 className="h-3 w-3 mr-1" /> Remover
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 items-end">
                <div><Label className="text-xs">Percentual</Label>
                  <Input type="number" min={0} max={100} value={cfg.coupon.recoveryPercent ?? ""} placeholder="12" className="bg-night/70 border-turquoise/40"
                    onChange={(e) => update({ coupon: { ...cfg.coupon, recoveryPercent: e.target.value === "" ? undefined : parseInt(e.target.value) } })} /></div>
                <div><Label className="text-xs">Após (horas)</Label>
                  <Input type="number" min={1} value={cfg.coupon.recoveryAfterHours ?? ""} placeholder="72" className="bg-night/70 border-turquoise/40"
                    onChange={(e) => update({ coupon: { ...cfg.coupon, recoveryAfterHours: e.target.value === "" ? undefined : parseInt(e.target.value) } })} /></div>
                <div className="flex items-center gap-2">
                  <Switch checked={cfg.coupon.recoveryEnabled !== false}
                    onCheckedChange={(v) => update({ coupon: { ...cfg.coupon, recoveryEnabled: v } })} />
                  <span className="text-xs">Ativo</span>
                </div>
              </div>
            </div>

            {/* Comemorativos */}
            <div className="glass-card rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-turquoise-glow">Comemorativos</h4>
                <div className="flex items-center gap-2">
                  <Switch checked={cfg.coupon.holidayEnabled !== false}
                    onCheckedChange={(v) => update({ coupon: { ...cfg.coupon, holidayEnabled: v } })} />
                  <span className="text-xs">Ativos globalmente</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">Percentual padrão (todos comemorativos)</Label>
                <Input type="number" min={0} max={100} value={cfg.coupon.holidayPercent ?? ""} placeholder="12" className="bg-night/70 border-turquoise/40 w-32"
                  onChange={(e) => update({ coupon: { ...cfg.coupon, holidayPercent: e.target.value === "" ? undefined : parseInt(e.target.value) } })} />
              </div>
              <div className="space-y-2">
                {cfg.specials.map((s, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center bg-night/40 rounded-md p-2">
                    <Input className="col-span-3 bg-night/70 border-turquoise/30 text-xs uppercase" value={s.code}
                      onChange={(e) => { const next = [...cfg.specials]; next[i] = { ...s, code: e.target.value.toUpperCase() }; update({ specials: next }); }} />
                    <Input className="col-span-2 bg-night/70 border-turquoise/30" type="number" value={s.percent}
                      onChange={(e) => { const next = [...cfg.specials]; next[i] = { ...s, percent: parseInt(e.target.value) || 0 }; update({ specials: next }); }} />
                    <Input className="col-span-3 bg-night/70 border-turquoise/30" type="date" value={s.onlyDate || ""}
                      onChange={(e) => { const next = [...cfg.specials]; next[i] = { ...s, onlyDate: e.target.value || undefined }; update({ specials: next }); }} />
                    <Input className="col-span-3 bg-night/70 border-turquoise/30 text-xs" placeholder="mensagem" value={s.message || ""}
                      onChange={(e) => { const next = [...cfg.specials]; next[i] = { ...s, message: e.target.value }; update({ specials: next }); }} />
                    <div className="col-span-1 flex items-center gap-1">
                      <Switch checked={s.enabled !== false}
                        onCheckedChange={(v) => { const next = [...cfg.specials]; next[i] = { ...s, enabled: v }; update({ specials: next }); }} />
                      <Button size="sm" variant="ghost" onClick={() => { const next = cfg.specials.filter((_, j) => j !== i); update({ specials: next }); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="border-turquoise/40"
                  onClick={() => update({ specials: [...cfg.specials, { code: "NOVO12", percent: 12, enabled: true, message: "" }] })}>
                  <Plus className="h-3 w-3 mr-1" /> Adicionar cupom
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ---------------- RESERVAS ---------------- */}
          <TabsContent value="reservas" className="mt-4">
            <ReservasSection />
          </TabsContent>

          {/* ---------------- LEADS ---------------- */}
          <TabsContent value="leads" className="mt-4">
            <LeadsSection />
          </TabsContent>

          {/* ---------------- MÍDIA ---------------- */}
          <TabsContent value="media" className="mt-4 space-y-4">
            <div className="glass-card rounded-xl p-3 border-turquoise/30 bg-turquoise/5 text-xs text-turquoise-glow">
              📷 Imagens e vídeos dos passeios são gerenciados na aba <b>Passeios</b> (persistente no backend).
              Esta aba mantém os <b>vídeos de fundo</b> e overrides locais de imagens dos cards (compatibilidade).
            </div>

            <section className="space-y-3">
              <h4 className="text-sm font-bold text-turquoise-glow">Vídeos de fundo</h4>
              {(["mobile", "desktop"] as const).map((w) => (
                <div key={w} className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <Label className="flex-1 text-foreground capitalize">{w}</Label>
                  {cfg.videos[w] && <span className="text-[10px] text-emerald-300">customizado</span>}
                  <label className="cursor-pointer inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-turquoise/15 border border-turquoise/40 hover:bg-turquoise/25">
                    <Upload className="h-3 w-3" /> Upload
                    <input type="file" accept="video/*" className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0]; if (!f) return;
                        if (f.size > 15 * 1024 * 1024) { toast.error("Vídeo > 15MB; use arquivo menor."); return; }
                        const url = await fileToDataUrl(f);
                        update({ videos: { ...cfg.videos, [w]: url } });
                        toast.success(`Vídeo ${w} atualizado`);
                      }} />
                  </label>
                  {cfg.videos[w] && (
                    <Button size="sm" variant="ghost" onClick={() => { const next = { ...cfg.videos }; delete next[w]; update({ videos: next }); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-bold text-turquoise-glow">Overrides locais de imagens dos cards</h4>
              {TOUR_KEYS.map(({ key, label }) => (
                <div key={key} className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <div className="w-16 h-12 rounded-md overflow-hidden border border-turquoise/30 bg-night/50 shrink-0">
                    {cfg.images[key] && <img src={cfg.images[key]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <Label className="flex-1 text-foreground">{label}</Label>
                  <label className="cursor-pointer inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-turquoise/15 border border-turquoise/40 hover:bg-turquoise/25">
                    <Upload className="h-3 w-3" /> Upload
                    <input type="file" accept="image/*" className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0]; if (!f) return;
                        const url = await fileToDataUrl(f);
                        update({ images: { ...cfg.images, [key]: url } });
                        toast.success(`Imagem ${label} atualizada (local)`);
                      }} />
                  </label>
                  {cfg.images[key] && (
                    <Button size="sm" variant="ghost" onClick={() => { const next = { ...cfg.images }; delete next[key]; update({ images: next }); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </section>
          </TabsContent>

          {/* ---------------- CONFIGURAÇÕES ---------------- */}
          <TabsContent value="config" className="mt-4 space-y-6">
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-turquoise-glow">Configurações globais (persistentes)</h3>
              <ConfigSection />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-turquoise-glow">Sistema</h3>
              <div className="glass-card rounded-xl p-3 space-y-2 text-sm">
                <p className="text-foreground/80">Ações administrativas locais.</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="border-turquoise/40"
                    onClick={() => { saveAdminConfig({ prices: {}, descriptions: {}, titles: {}, images: {}, videos: {}, coupon: {}, specials: [] }); toast.success("Overrides locais resetados"); }}>
                    <Trash2 className="h-3 w-3 mr-1" /> Resetar overrides locais
                  </Button>
                  <Button variant="outline" className="border-turquoise/40"
                    onClick={() => { const data = JSON.stringify(loadAdminConfig(), null, 2); navigator.clipboard?.writeText(data); toast.success("Config copiada"); }}>
                    <Save className="h-3 w-3 mr-1" /> Exportar JSON
                  </Button>
                  <Button variant="outline" className="border-rose-400/40 text-rose-300"
                    onClick={() => { disableAdminMode(); toast.success("Modo administrador desativado"); onOpenChange(false); setTimeout(() => location.reload(), 400); }}>
                    Sair do modo admin
                  </Button>
                </div>
              </div>
            </section>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-turquoise/20 mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>

        <Dialog open={!!modalPreview} onOpenChange={(v) => !v && setModalPreview(null)}>
          <DialogContent className={`bg-card max-w-sm ${modalPreview?.key?.startsWith("qr") ? "border-amber-400/40" : "border-emerald-400/40"}`}>
            {modalPreview && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-foreground flex items-center gap-2 text-xl">
                    {modalPreview.key?.startsWith("qr") ? (
                      <Sparkles className="h-6 w-6 text-amber-300" />
                    ) : (
                      <Gift className="h-6 w-6 text-emerald-300" />
                    )}
                    {modalPreview.titulo_pt || modalPreview.key}
                  </DialogTitle>
                  <DialogDescription className="leading-relaxed pt-1">
                    {modalPreview.mensagem_pt || "Pré-visualização do modal persistido no CMS."}
                  </DialogDescription>
                </DialogHeader>
                <div className={`text-center py-5 rounded-2xl bg-gradient-to-r border ${modalPreview.key?.startsWith("qr") ? "from-amber-500/15 border-amber-400/30" : "from-emerald-500/15 border-emerald-400/30"} to-turquoise/15`}>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {modalPreview.codigo || modalPreview.key}
                  </div>
                  <div className="text-5xl font-extrabold bg-gradient-to-r from-emerald-300 to-turquoise-glow bg-clip-text text-transparent py-1">
                    {modalPreview.percentual}% OFF
                  </div>
                  <div className="text-sm font-bold text-foreground mt-1">{modalPreview.codigo || "—"}</div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================
// AdminFab — floating action button to open the unified CMS
// ============================================================
export const AdminFab = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Abrir CMS"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full bg-gradient-to-br from-turquoise to-turquoise-glow text-night shadow-lg shadow-turquoise/30 flex items-center justify-center hover:scale-105 transition-transform"
      >
        <Settings2 className="h-5 w-5" />
      </button>
      <AdminPanel open={open} onOpenChange={setOpen} />
    </>
  );
};

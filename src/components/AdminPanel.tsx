import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings2, Trash2, Upload, Plus, Save, Sparkles, Gift, Eye } from "lucide-react";
import { toast } from "sonner";
import { TourKey } from "@/lib/tours";
import { Lang, dict } from "@/lib/i18n";
import {
  AdminConfig, loadAdminConfig, saveAdminConfig, useAdminConfig,
} from "@/lib/adminConfig";
import {
  disableAdminMode, blockWelcomeForPhone, unblockWelcomeForPhone,
  getBlockedWelcomePhones, clearPromo, loadPromo,
} from "@/lib/promo";
import { isQrActive } from "@/lib/qrPromo";

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
  const update = (patch: Partial<AdminConfig>) => saveAdminConfig({ ...loadAdminConfig(), ...patch });
  const [blockedPhones, setBlockedPhones] = useState<string[]>(() => getBlockedWelcomePhones());
  const [phoneInput, setPhoneInput] = useState("");
  const refreshBlocked = () => setBlockedPhones(getBlockedWelcomePhones());
  const activePromo = loadPromo();

  // Previews de modais (visualização apenas — não alteram estado real)
  const [qrPreview, setQrPreview] = useState<{ percent: number; lang: Lang } | null>(null);
  const [holidayPreview, setHolidayPreview] = useState<{ code: string; message: string; percent: number } | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-turquoise/30 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-turquoise-glow" />
            Painel Administrativo
          </DialogTitle>
          <DialogDescription>
            Edição local de valores, descrições, imagens, vídeos e cupons.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="prices" className="w-full">
          <TabsList className="grid grid-cols-6 w-full bg-night/60">
            <TabsTrigger value="prices">Preços</TabsTrigger>
            <TabsTrigger value="texts">Textos</TabsTrigger>
            <TabsTrigger value="media">Mídia</TabsTrigger>
            <TabsTrigger value="coupons">Cupons</TabsTrigger>
            <TabsTrigger value="modals">Modais</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          {/* ---------------- PREÇOS ---------------- */}
          <TabsContent value="prices" className="mt-4 space-y-3">
            {TOUR_KEYS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3 glass-card rounded-xl p-3">
                <Label className="flex-1 text-foreground font-semibold">{label}</Label>
                <Input
                  type="number" min={0}
                  className="w-32 bg-night/70 border-turquoise/40"
                  value={cfg.prices[key] ?? ""}
                  placeholder="padrão"
                  onChange={(e) => {
                    const v = e.target.value;
                    const next = { ...cfg.prices };
                    if (v === "") delete next[key]; else next[key] = parseFloat(v);
                    update({ prices: next });
                  }}
                />
                <span className="text-xs text-muted-foreground">BRL</span>
              </div>
            ))}
          </TabsContent>

          {/* ---------------- TEXTOS (apenas PT — base para tradutor) ---------------- */}
          <TabsContent value="texts" className="mt-4 space-y-4">
            <div className="glass-card rounded-xl p-3 border-turquoise/30 bg-turquoise/5 text-xs text-turquoise-glow">
              ✍️ Edite somente em <b>Português</b>. O texto será exibido como base e o tradutor multilíngue do site (PT/ES/EN/FR/IT) refletirá automaticamente nas demais versões. Veja a prévia logo abaixo.
            </div>
            {TOUR_KEYS.map(({ key, label }) => {
              const baseDesc = dict.pt[`desc${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof dict["pt"]] as string | undefined;
              const ptOverride = cfg.descriptions[key]?.pt;
              const effectivePt = ptOverride || baseDesc || "";
              const LANGS: { code: Lang; flag: string; name: string }[] = [
                { code: "pt", flag: "🇧🇷", name: "Português" },
                { code: "es", flag: "🇪🇸", name: "Español" },
                { code: "en", flag: "🇬🇧", name: "English" },
                { code: "fr", flag: "🇫🇷", name: "Français" },
                { code: "it", flag: "🇮🇹", name: "Italiano" },
              ];
              return (
                <div key={key} className="glass-card rounded-xl p-3 space-y-2">
                  <Label className="font-semibold text-foreground">{label}</Label>
                  <Textarea
                    rows={2}
                    placeholder={baseDesc || "descrição em português"}
                    className="bg-night/70 border-turquoise/30 text-foreground"
                    value={ptOverride ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      const all = { ...cfg.descriptions };
                      const cur = { ...(all[key] || {}) };
                      if (v === "") delete cur.pt; else cur.pt = v;
                      all[key] = cur;
                      update({ descriptions: all });
                    }}
                  />
                  <div className="rounded-lg border border-turquoise/20 bg-night/40 p-2 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Prévia em todos os idiomas
                    </div>
                    {LANGS.map((L) => {
                      const dictKey = `desc${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof dict["pt"];
                      const baseForLang = (dict[L.code][dictKey] as string) || "";
                      // Regra: se admin editou o PT, ele é usado como base para todos os idiomas;
                      // caso contrário, cada idioma usa sua própria tradução do dicionário.
                      const shown = ptOverride ? effectivePt : baseForLang;
                      return (
                        <div key={L.code} className="flex items-start gap-2 text-[11px] leading-snug">
                          <span className="shrink-0 w-12 text-muted-foreground">{L.flag} {L.code.toUpperCase()}</span>
                          <span className="text-foreground/90">{shown}</span>
                        </div>
                      );
                    })}
                    {ptOverride && (
                      <div className="text-[10px] text-amber-300/80 pt-1">
                        ⚠️ Texto personalizado em PT — está sendo usado como base nas demais línguas.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* ---------------- MÍDIA ---------------- */}
          <TabsContent value="media" className="mt-4 space-y-3">
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
                      toast.success(`Imagem ${label} atualizada`);
                    }}
                  />
                </label>
                {cfg.images[key] && (
                  <Button size="sm" variant="ghost" onClick={() => {
                    const next = { ...cfg.images }; delete next[key];
                    update({ images: next });
                  }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}

            <div className="border-t border-turquoise/20 pt-3 mt-4 space-y-3">
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
                        if (f.size > 15 * 1024 * 1024) {
                          toast.error("Vídeo > 15MB; use arquivo menor.");
                          return;
                        }
                        const url = await fileToDataUrl(f);
                        update({ videos: { ...cfg.videos, [w]: url } });
                        toast.success(`Vídeo ${w} atualizado`);
                      }}
                    />
                  </label>
                  {cfg.videos[w] && (
                    <Button size="sm" variant="ghost" onClick={() => {
                      const next = { ...cfg.videos }; delete next[w];
                      update({ videos: next });
                    }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ---------------- CUPONS ---------------- */}
          <TabsContent value="coupons" className="mt-4 space-y-4">
            {isQrActive() && (
              <div className="glass-card rounded-xl p-3 border-amber-400/40 bg-amber-500/10 text-xs text-amber-200">
                🎟 Promoção QR ativa. Cupons manuais desativados enquanto a URL contiver <code>?promo=qrN</code>.
              </div>
            )}
            <div className="glass-card rounded-xl p-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-turquoise-glow">Sistema de cupons</h4>
                <p className="text-[11px] text-muted-foreground">Ativa/desativa todos os cupons do site (boas-vindas, recuperação e comemorativos).</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={cfg.coupon.allEnabled !== false}
                  onCheckedChange={(v) => update({ coupon: { ...cfg.coupon, allEnabled: v } })}
                />
                <span className="text-xs">{cfg.coupon.allEnabled !== false ? "Ativo" : "Desativado"}</span>
              </div>
            </div>

            <div className="glass-card rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-turquoise-glow">Boas-vindas (BEMVINDOXXXX)</h4>
                <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200"
                  onClick={() => {
                    update({ coupon: { ...cfg.coupon, welcomePercent: undefined, welcomeValidityDays: undefined, welcomeEnabled: false } });
                    toast.success("Cupom de boas-vindas removido");
                  }}>
                  <Trash2 className="h-3 w-3 mr-1" /> Remover
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 items-end">
                <div>
                  <Label className="text-xs">Percentual</Label>
                  <Input type="number" min={0} max={100}
                    value={cfg.coupon.welcomePercent ?? ""}
                    placeholder="10"
                    className="bg-night/70 border-turquoise/40"
                    onChange={(e) => update({ coupon: { ...cfg.coupon, welcomePercent: e.target.value === "" ? undefined : parseInt(e.target.value) } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Validade (dias)</Label>
                  <Input type="number" min={1}
                    value={cfg.coupon.welcomeValidityDays ?? ""}
                    placeholder="3"
                    className="bg-night/70 border-turquoise/40"
                    onChange={(e) => update({ coupon: { ...cfg.coupon, welcomeValidityDays: e.target.value === "" ? undefined : parseInt(e.target.value) } })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={cfg.coupon.welcomeEnabled !== false}
                    onCheckedChange={(v) => update({ coupon: { ...cfg.coupon, welcomeEnabled: v } })}
                  />
                  <span className="text-xs">Ativo</span>
                </div>
              </div>
            </div>

            {/* Cupom ativo no navegador + bloqueio por WhatsApp */}
            <div className="glass-card rounded-xl p-3 space-y-3">
              <h4 className="text-sm font-bold text-turquoise-glow">Cupom ativo / Bloqueios</h4>
              {activePromo ? (
                <div className="flex items-center justify-between gap-2 bg-night/40 rounded-md p-2">
                  <div className="text-xs">
                    <div className="font-bold text-foreground">{activePromo.cupom}</div>
                    <div className="text-muted-foreground">{activePromo.nome} · {activePromo.whatsapp}</div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200"
                    onClick={() => {
                      blockWelcomeForPhone(activePromo.whatsapp);
                      clearPromo();
                      refreshBlocked();
                      toast.success(`Cupom ${activePromo.cupom} removido e bloqueado`);
                    }}>
                    <Trash2 className="h-3 w-3 mr-1" /> Remover
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Nenhum cupom de boas-vindas ativo neste navegador.</p>
              )}

              <div>
                <Label className="text-xs">Adicionar / Remover cupom por WhatsApp ou código</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Ex.: +5522998216796 ou NAT8523"
                    className="bg-night/70 border-turquoise/40 flex-1"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                  />
                  <Button size="sm" variant="outline" className="border-turquoise/40"
                    onClick={() => {
                      const v = phoneInput.trim();
                      if (!v) return;
                      const ap = loadPromo();
                      if (ap && ap.cupom.toUpperCase() === v.toUpperCase()) {
                        blockWelcomeForPhone(ap.whatsapp);
                        clearPromo();
                        refreshBlocked();
                        toast.success(`Cupom ${ap.cupom} removido e WhatsApp bloqueado`);
                      } else {
                        blockWelcomeForPhone(v);
                        refreshBlocked();
                        toast.success("WhatsApp bloqueado para boas-vindas");
                      }
                      setPhoneInput("");
                    }}>
                    <Plus className="h-3 w-3 mr-1" /> Bloquear
                  </Button>
                  <Button size="sm" variant="ghost" className="text-rose-300"
                    onClick={() => {
                      const v = phoneInput.trim();
                      if (!v) return;
                      unblockWelcomeForPhone(v);
                      refreshBlocked();
                      toast.success("WhatsApp desbloqueado");
                      setPhoneInput("");
                    }}>
                    <Trash2 className="h-3 w-3 mr-1" /> Desbloquear
                  </Button>
                </div>
              </div>

              {blockedPhones.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs">Bloqueados ({blockedPhones.length})</Label>
                  <div className="flex flex-wrap gap-1">
                    {blockedPhones.map((p) => (
                      <span key={p} className="inline-flex items-center gap-1 text-[11px] bg-night/60 border border-turquoise/30 rounded-md px-2 py-0.5">
                        {p}
                        <button type="button" className="text-rose-300 hover:text-rose-200"
                          onClick={() => { unblockWelcomeForPhone(p); refreshBlocked(); }}>
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-turquoise-glow">Recuperação (TODEVOLTA12)</h4>
                <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200"
                  onClick={() => {
                    update({ coupon: { ...cfg.coupon, recoveryPercent: undefined, recoveryAfterHours: undefined, recoveryEnabled: false } });
                    toast.success("Cupom de recuperação removido");
                  }}>
                  <Trash2 className="h-3 w-3 mr-1" /> Remover
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 items-end">
                <div>
                  <Label className="text-xs">Percentual</Label>
                  <Input type="number" min={0} max={100}
                    value={cfg.coupon.recoveryPercent ?? ""}
                    placeholder="12"
                    className="bg-night/70 border-turquoise/40"
                    onChange={(e) => update({ coupon: { ...cfg.coupon, recoveryPercent: e.target.value === "" ? undefined : parseInt(e.target.value) } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Após (horas)</Label>
                  <Input type="number" min={1}
                    value={cfg.coupon.recoveryAfterHours ?? ""}
                    placeholder="72"
                    className="bg-night/70 border-turquoise/40"
                    onChange={(e) => update({ coupon: { ...cfg.coupon, recoveryAfterHours: e.target.value === "" ? undefined : parseInt(e.target.value) } })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={cfg.coupon.recoveryEnabled !== false}
                    onCheckedChange={(v) => update({ coupon: { ...cfg.coupon, recoveryEnabled: v } })}
                  />
                  <span className="text-xs">Ativo</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-turquoise-glow">Comemorativos</h4>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={cfg.coupon.holidayEnabled !== false}
                    onCheckedChange={(v) => update({ coupon: { ...cfg.coupon, holidayEnabled: v } })}
                  />
                  <span className="text-xs">Ativos globalmente</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">Percentual padrão (todos comemorativos)</Label>
                <Input type="number" min={0} max={100}
                  value={cfg.coupon.holidayPercent ?? ""}
                  placeholder="12"
                  className="bg-night/70 border-turquoise/40 w-32"
                  onChange={(e) => update({ coupon: { ...cfg.coupon, holidayPercent: e.target.value === "" ? undefined : parseInt(e.target.value) } })}
                />
              </div>

              <div className="space-y-2">
                {cfg.specials.map((s, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center bg-night/40 rounded-md p-2">
                    <Input className="col-span-3 bg-night/70 border-turquoise/30 text-xs uppercase"
                      value={s.code}
                      onChange={(e) => {
                        const next = [...cfg.specials]; next[i] = { ...s, code: e.target.value.toUpperCase() };
                        update({ specials: next });
                      }} />
                    <Input className="col-span-2 bg-night/70 border-turquoise/30" type="number"
                      value={s.percent}
                      onChange={(e) => {
                        const next = [...cfg.specials]; next[i] = { ...s, percent: parseInt(e.target.value) || 0 };
                        update({ specials: next });
                      }} />
                    <Input className="col-span-3 bg-night/70 border-turquoise/30" type="date"
                      value={s.onlyDate || ""}
                      onChange={(e) => {
                        const next = [...cfg.specials]; next[i] = { ...s, onlyDate: e.target.value || undefined };
                        update({ specials: next });
                      }} />
                    <Input className="col-span-3 bg-night/70 border-turquoise/30 text-xs"
                      placeholder="mensagem"
                      value={s.message || ""}
                      onChange={(e) => {
                        const next = [...cfg.specials]; next[i] = { ...s, message: e.target.value };
                        update({ specials: next });
                      }} />
                    <div className="col-span-1 flex items-center gap-1">
                      <Switch checked={s.enabled !== false}
                        onCheckedChange={(v) => {
                          const next = [...cfg.specials]; next[i] = { ...s, enabled: v };
                          update({ specials: next });
                        }} />
                      <Button size="sm" variant="ghost" onClick={() => {
                        const next = cfg.specials.filter((_, j) => j !== i);
                        update({ specials: next });
                      }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="border-turquoise/40"
                  onClick={() => update({ specials: [...cfg.specials, { code: "NOVO12", percent: 12, enabled: true, message: "" }] })}
                >
                  <Plus className="h-3 w-3 mr-1" /> Adicionar cupom
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ---------------- MODAIS (previews visuais) ---------------- */}
          <TabsContent value="modals" className="mt-4 space-y-4">
            <div className="text-xs text-muted-foreground">
              Os botões abaixo exibem apenas a visualização dos modais. Nenhum desconto é aplicado, nenhum estado é salvo e a sessão não é modificada.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="border-amber-400/40 text-amber-200 hover:bg-amber-500/10 h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => setQrPreview({ percent: 5, lang: "pt" })}
              >
                <Eye className="h-4 w-4" />
                <span className="text-xs font-semibold">Visualizar QR 5%</span>
                <span className="text-[10px] text-muted-foreground">?promo=qr5</span>
              </Button>

              <Button
                variant="outline"
                className="border-amber-400/40 text-amber-200 hover:bg-amber-500/10 h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => setQrPreview({ percent: 10, lang: "pt" })}
              >
                <Eye className="h-4 w-4" />
                <span className="text-xs font-semibold">Visualizar QR 10%</span>
                <span className="text-[10px] text-muted-foreground">?promo=qr10</span>
              </Button>

              <Button
                variant="outline"
                className="border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10 h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => setHolidayPreview({ code: "NATAL15", message: "Feliz Natal! Aproveite 15% de desconto especial 🎄", percent: 15 })}
              >
                <Gift className="h-4 w-4" />
                <span className="text-xs font-semibold">Visualizar Natal</span>
                <span className="text-[10px] text-muted-foreground">Modal comemorativo</span>
              </Button>

              <Button
                variant="outline"
                className="border-turquoise/40 text-turquoise-glow hover:bg-turquoise/10 h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => setHolidayPreview({ code: "ANONOVO15", message: "Feliz Ano Novo! Aproveite 15% de desconto especial 🎆", percent: 15 })}
              >
                <Gift className="h-4 w-4" />
                <span className="text-xs font-semibold">Visualizar Ano Novo</span>
                <span className="text-[10px] text-muted-foreground">Modal comemorativo</span>
              </Button>

              <Button
                variant="outline"
                className="border-violet-400/40 text-violet-200 hover:bg-violet-500/10 h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => setHolidayPreview({ code: "BLACK20", message: "Black Friday! 20% de desconto por tempo limitado 🖤", percent: 20 })}
              >
                <Gift className="h-4 w-4" />
                <span className="text-xs font-semibold">Visualizar Black Friday</span>
                <span className="text-[10px] text-muted-foreground">Modal comemorativo</span>
              </Button>

              <Button
                variant="outline"
                className="border-amber-400/40 text-amber-200 hover:bg-amber-500/10 h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => setQrPreview({ percent: 10, lang: "es" })}
              >
                <Eye className="h-4 w-4" />
                <span className="text-xs font-semibold">Visualizar Espanhol</span>
                <span className="text-[10px] text-muted-foreground">QR promo em ES</span>
              </Button>
            </div>
          </TabsContent>

          {/* ---------------- SISTEMA ---------------- */}
          <TabsContent value="system" className="mt-4 space-y-3">
            <div className="glass-card rounded-xl p-3 space-y-2 text-sm">
              <p className="text-foreground/80">
                Todas as alterações são salvas localmente no seu navegador.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="border-turquoise/40"
                  onClick={() => {
                    saveAdminConfig({ prices: {}, descriptions: {}, titles: {}, images: {}, videos: {}, coupon: {}, specials: [] });
                    toast.success("Configurações resetadas");
                  }}>
                  <Trash2 className="h-3 w-3 mr-1" /> Resetar tudo
                </Button>
                <Button variant="outline" className="border-rose-400/40 text-rose-300"
                  onClick={() => {
                    disableAdminMode();
                    toast.success("Modo administrador desativado");
                    onOpenChange(false);
                    setTimeout(() => location.reload(), 400);
                  }}>
                  Sair do modo admin
                </Button>
                <Button variant="outline" className="border-turquoise/40"
                  onClick={() => {
                    const data = JSON.stringify(loadAdminConfig(), null, 2);
                    navigator.clipboard?.writeText(data);
                    toast.success("Config copiada para a área de transferência");
                  }}>
                  <Save className="h-3 w-3 mr-1" /> Exportar JSON
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-turquoise/20 mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-gradient-to-r from-turquoise to-turquoise-glow text-night font-bold hover:opacity-90"
            onClick={() => {
              // saveAdminConfig já é chamado a cada update; aqui apenas reforça e confirma.
              saveAdminConfig(loadAdminConfig());
              toast.success("✅ Alterações aplicadas com sucesso");
              onOpenChange(false);
            }}
          >
            <Save className="h-4 w-4 mr-1" /> Aplicar Alterações
          </Button>
        </div>

        {/* Preview: Modal QR */}
        <Dialog open={!!qrPreview} onOpenChange={(v) => !v && setQrPreview(null)}>
          <DialogContent className="bg-card border-amber-400/40 max-w-sm">
            {qrPreview && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-foreground flex items-center gap-2 text-xl">
                    <Sparkles className="h-6 w-6 text-amber-300" />
                    {qrPreview.lang === "es" ? "¡Vaya... tú por aquí! 🎉" : "Opa... você por aqui? 🎉"}
                  </DialogTitle>
                  <DialogDescription className="leading-relaxed pt-1">
                    {qrPreview.lang === "es"
                      ? "Vimos que llegaste escaneando nuestro QR Code."
                      : "Vimos que você chegou escaneando nosso QR Code."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-center py-5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-turquoise/15 border border-amber-400/30">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {qrPreview.lang === "es" ? "Descuento activado" : "Desconto ativado"}
                    </div>
                    <div className="text-5xl font-extrabold bg-gradient-to-r from-amber-300 to-turquoise-glow bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] py-1">
                      {qrPreview.percent}% OFF
                    </div>
                    <div className="text-xs text-emerald-300 font-semibold mt-1">
                      {qrPreview.lang === "es" ? "Aplicado automáticamente en tu reserva" : "Aplicado automaticamente na sua reserva"}
                    </div>
                  </div>
                  <p className="text-xs text-foreground/85 text-center leading-relaxed">
                    {qrPreview.lang === "es"
                      ? `Como recompensa, tu descuento de ${qrPreview.percent}% OFF fue activado automáticamente. Tu valor promocional ya está aplicado en tu reserva.`
                      : `Como recompensa, seu desconto de ${qrPreview.percent}% OFF foi ativado automaticamente. Seu valor promocional já está aplicado na sua reserva.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setQrPreview(null)}
                    className="rgb-border w-full block"
                  >
                    <span className="flex items-center justify-center w-full h-12 rounded-[0.6rem] bg-gradient-to-r from-amber-400 to-turquoise-glow text-night font-bold text-sm">
                      {qrPreview.lang === "es" ? "Continuar" : "Continuar"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Preview: Modal Comemorativo */}
        <Dialog open={!!holidayPreview} onOpenChange={(v) => !v && setHolidayPreview(null)}>
          <DialogContent className="bg-card border-amber-400/40 max-w-sm">
            {holidayPreview && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-300" />
                    Hoje é dia especial 🎉
                  </DialogTitle>
                  <DialogDescription>{holidayPreview.message}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="text-center py-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-turquoise/15 border border-amber-400/30">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Código</div>
                    <div className="text-2xl font-extrabold text-amber-200 font-mono tracking-wider">{holidayPreview.code}</div>
                    <div className="text-sm text-emerald-300 font-semibold">-{holidayPreview.percent}%</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHolidayPreview(null)}
                    className="rgb-border w-full block"
                  >
                    <span className="flex items-center justify-center w-full h-12 rounded-[0.6rem] bg-gradient-to-r from-amber-400 to-turquoise-glow text-night font-bold text-sm">
                      Resgate seu cupom agora!
                    </span>
                  </button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

/** Badge administrativo no canto superior direito (visível apenas autenticado). */
export const AdminFab = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Painel Administrativo"
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-50 px-3 py-1.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider text-amber-200 bg-amber-500/20 border border-amber-400/60 backdrop-blur-md shadow-[0_4px_16px_-4px_rgba(0,0,0,0.6)] hover:bg-amber-500/30 hover:text-amber-100 transition-colors flex items-center gap-1.5"
      >
        <Settings2 className="h-3.5 w-3.5" />
        ⚠️ ADMIN
      </button>
      <AdminPanel open={open} onOpenChange={setOpen} />
    </>
  );
};

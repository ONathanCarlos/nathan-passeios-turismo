// ============================================================
// CMS Admin Tab — gerencia tours, modais, config global,
// depoimentos e upload de mídia direto no Supabase.
// Tudo persiste e reflete globalmente após salvar.
// ============================================================
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Upload, Trash2, Save, Plus, Loader2, HelpCircle, CheckCircle2,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useTours, useModais, useConfig, useDepoimentos,
  useUpsertTour, useDeleteTour, useUpsertModal,
  useUpsertConfig, useUpsertDepoimento, useDeleteDepoimento,
  uploadMedia, type CmsTour, type CmsModal, type CmsDepoimento,
} from "@/lib/cms";

// ---------------- Sub: Help Tooltip ----------------
const HelpTooltip = ({ children }: { children: React.ReactNode }) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-turquoise-glow cursor-help inline-block ml-1" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
        {children}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// ---------------- Sub: Tour Editor ----------------
const TourRow = ({ t }: { t: CmsTour }) => {
  const upsert = useUpsertTour();
  const del = useDeleteTour();
  const [draft, setDraft] = useState<CmsTour>(t);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await upsert.mutateAsync(draft);
    setSaved(true);
    toast.success("Alterações salvas e publicadas");
    setTimeout(() => setSaved(false), 2500);
  };
  const onUpload = async (file: File, kind: "imagem_url" | "video_url") => {
    try {
      setUploading(true);
      const url = await uploadMedia(file, kind === "video_url" ? "videos" : "tours");
      const next = { ...draft, [kind]: url };
      setDraft(next);
      await upsert.mutateAsync(next);
      toast.success("Mídia enviada e publicada");
    } catch (e: any) { toast.error(e?.message || "Erro no upload"); }
    finally { setUploading(false); }
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      {/* Header: nome + preço + ordem + ativo */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Nome */}
        <div className="sm:col-span-5 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Nome do passeio
          </Label>
          <Input
            className="bg-night/70 border-turquoise/40"
            value={draft.nome_pt}
            onChange={(e) => setDraft({ ...draft, nome_pt: e.target.value })}
            placeholder="Passeio de Escuna em Búzios"
          />
        </div>

        {/* Preço */}
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Preço (R$)
          </Label>
          <Input
            type="number" min={0}
            className="bg-night/70 border-turquoise/40"
            value={draft.preco}
            onChange={(e) => setDraft({ ...draft, preco: parseFloat(e.target.value) || 0 })}
            placeholder="Ex: 220"
          />
        </div>

        {/* Ordem */}
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center">
            Ordem de exibição
            <HelpTooltip>
              Define a posição em que o passeio aparece no site.<br />
              Exemplo: 1 = aparece primeiro
            </HelpTooltip>
          </Label>
          <Input
            type="number"
            className="bg-night/70 border-turquoise/40"
            value={draft.ordem}
            onChange={(e) => setDraft({ ...draft, ordem: parseInt(e.target.value) || 0 })}
            placeholder="Ex: 1"
          />
        </div>

        {/* Ativo/Inativo */}
        <div className="sm:col-span-3 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center">
            Ativo / Inativo
            <HelpTooltip>
              Controla se o passeio aparece publicamente no site.<br />
              Desativado = invisível para visitantes.
            </HelpTooltip>
          </Label>
          <div className="flex items-center gap-2 h-10">
            <Switch
              checked={draft.ativo}
              onCheckedChange={(v) => setDraft({ ...draft, ativo: v })}
            />
            <span className={`text-xs font-medium ${draft.ativo ? "text-emerald-400" : "text-rose-300"}`}>
              {draft.ativo ? "Ativo — visível no site" : "Inativo — oculto"}
            </span>
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-1">
        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          Descrição
        </Label>
        <Textarea
          rows={2}
          placeholder="Texto exibido no card público"
          value={draft.descricao_pt ?? ""}
          onChange={(e) => setDraft({ ...draft, descricao_pt: e.target.value })}
          className="bg-night/70 border-turquoise/30"
        />
      </div>

      {/* Imagem + Vídeo + Ações */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Mini preview */}
        <div className="w-16 h-12 rounded-md overflow-hidden border border-turquoise/30 bg-night/50 shrink-0">
          {draft.imagem_url ? (
            <img src={draft.imagem_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">sem img</div>
          )}
        </div>

        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-turquoise/15 border border-turquoise/40 hover:bg-turquoise/25 transition-colors">
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          Imagem principal
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, "imagem_url"); }} />
        </label>

        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-turquoise/15 border border-turquoise/40 hover:bg-turquoise/25 transition-colors">
          <Upload className="h-3 w-3" /> Vídeo
          <input type="file" accept="video/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, "video_url"); }} />
        </label>

        <Button size="sm" onClick={save} disabled={upsert.isPending}
          className={`transition-colors ${saved ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-turquoise text-night hover:bg-turquoise/80"}`}>
          {saved ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Save className="h-3 w-3 mr-1" />}
          {saved ? "Publicado" : "Salvar"}
        </Button>

        <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200"
          onClick={() => { if (confirm(`Excluir ${draft.nome_pt}?`)) del.mutate(draft.id); }}>
          <Trash2 className="h-3 w-3" />
        </Button>

        {/* Identificador interno (somente leitura) */}
        <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground bg-night/40 px-2 py-1 rounded">
          <span>ID interno:</span>
          <code className="text-turquoise-glow/80">{draft.key}</code>
          <HelpTooltip>
            Usado pelo sistema internamente.<br />
            Não deve ser alterado manualmente.
          </HelpTooltip>
        </div>
      </div>
    </div>
  );
};

// ---------------- Sub: Modal Editor ----------------
const ModalRow = ({ m }: { m: CmsModal }) => {
  const upsert = useUpsertModal();
  const [d, setD] = useState<CmsModal>(m);
  const [saved, setSaved] = useState(false);
  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Identificador</Label>
          <span className="text-xs font-bold text-turquoise-glow uppercase block py-2">{d.key}</span>
        </div>
        <div className="sm:col-span-5 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Título PT</Label>
          <Input className="bg-night/70 border-turquoise/40" placeholder="Título do modal"
            value={d.titulo_pt ?? ""} onChange={(e) => setD({ ...d, titulo_pt: e.target.value })} />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">% desconto</Label>
          <Input type="number" className="bg-night/70 border-turquoise/40" placeholder="15"
            value={d.percentual} onChange={(e) => setD({ ...d, percentual: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="sm:col-span-3 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Código</Label>
          <Input className="bg-night/70 border-turquoise/40" placeholder="MAES15"
            value={d.codigo ?? ""} onChange={(e) => setD({ ...d, codigo: e.target.value })} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={d.ativo} onCheckedChange={(v) => setD({ ...d, ativo: v })} />
        <span className={`text-xs font-medium ${d.ativo ? "text-emerald-400" : "text-rose-300"}`}>
          {d.ativo ? "Ativo" : "Inativo"}
        </span>
      </div>
      <Textarea rows={2} placeholder="Mensagem PT" className="bg-night/70 border-turquoise/30"
        value={d.mensagem_pt ?? ""} onChange={(e) => setD({ ...d, mensagem_pt: e.target.value })} />
      <Button size="sm" className={`transition-colors ${saved ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-turquoise text-night hover:bg-turquoise/80"}`}
        onClick={async () => { await upsert.mutateAsync(d); setSaved(true); toast.success("Alterações salvas e publicadas"); setTimeout(() => setSaved(false), 2500); }}>
        {saved ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Save className="h-3 w-3 mr-1" />}
        {saved ? "Publicado" : "Salvar"}
      </Button>
    </div>
  );
};

// ---------------- Sub: Depoimento Editor ----------------
const DepRow = ({ d }: { d: CmsDepoimento }) => {
  const upsert = useUpsertDepoimento();
  const del = useDeleteDepoimento();
  const [s, setS] = useState<CmsDepoimento>(d);
  const [saved, setSaved] = useState(false);
  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-7 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Nome do cliente</Label>
          <Input className="bg-night/70 border-turquoise/40" placeholder="Maria Silva"
            value={s.nome} onChange={(e) => setS({ ...s, nome: e.target.value })} />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Nota (1-5)</Label>
          <Input type="number" min={1} max={5} className="bg-night/70 border-turquoise/40" placeholder="5"
            value={s.nota} onChange={(e) => setS({ ...s, nota: parseInt(e.target.value) || 5 })} />
        </div>
        <div className="sm:col-span-3 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Visível?</Label>
          <div className="flex items-center gap-2 h-10">
            <Switch checked={s.ativo} onCheckedChange={(v) => setS({ ...s, ativo: v })} />
            <span className={`text-xs font-medium ${s.ativo ? "text-emerald-400" : "text-rose-300"}`}>
              {s.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Texto do depoimento</Label>
        <Textarea rows={2} placeholder="Texto PT" className="bg-night/70 border-turquoise/30"
          value={s.texto_pt ?? ""} onChange={(e) => setS({ ...s, texto_pt: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <Button size="sm" className={`transition-colors ${saved ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-turquoise text-night hover:bg-turquoise/80"}`}
          onClick={async () => { await upsert.mutateAsync(s); setSaved(true); toast.success("Alterações salvas e publicadas"); setTimeout(() => setSaved(false), 2500); }}>
          {saved ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Save className="h-3 w-3 mr-1" />}
          {saved ? "Publicado" : "Salvar"}
        </Button>
        {s.id && (
          <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200"
            onClick={() => { if (confirm("Excluir depoimento?")) del.mutate(s.id); }}>
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

// ============================================================
// SECTIONS — exported individually for the unified admin panel
// ============================================================

export const ToursSection = () => {
  const tours = useTours(false);
  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="glass-card rounded-xl p-4 border-turquoise/30 bg-turquoise/5 space-y-2">
          <h4 className="text-sm font-bold text-turquoise-glow flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            COMO EDITAR PASSEIOS
          </h4>
          <ol className="text-xs text-foreground/80 space-y-1 list-decimal list-inside">
            <li>Edite nome, preço ou descrição nos campos abaixo</li>
            <li>Ajuste a ordem de exibição (menor número = aparece primeiro)</li>
            <li>Ative ou desative o passeio conforme disponibilidade</li>
            <li>Clique em <b>Salvar</b> em cada card</li>
            <li>As alterações aparecem automaticamente no site para todos os visitantes</li>
          </ol>
        </div>
        {tours.isLoading && <Loader2 className="h-4 w-4 animate-spin text-turquoise mx-auto" />}
        {tours.data?.map((t) => <TourRow key={t.id} t={t} />)}
      </div>
    </TooltipProvider>
  );
};

export const ModaisSection = () => {
  const modais = useModais();
  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="text-[11px] text-muted-foreground">
          Edite título, percentual, código e mensagem dos modais promocionais.
        </div>
        {modais.data?.map((m) => <ModalRow key={m.id} m={m} />)}
      </div>
    </TooltipProvider>
  );
};

export const ConfigSection = () => {
  const cfg = useConfig();
  const upsertCfg = useUpsertConfig();
  return (
    <div className="space-y-3">
      {[
        { k: "whatsapp",         label: "WhatsApp (somente dígitos com DDI)", placeholder: "5522998216796" },
        { k: "desconto_padrao",  label: "Desconto padrão (%)",                placeholder: "10" },
        { k: "texto_promo_topo", label: "Texto promocional do topo",          placeholder: "Ganhe 10% OFF..." },
        { k: "instagram_url",    label: "Instagram URL",                       placeholder: "https://instagram.com/..." },
        { k: "footer_region",    label: "Texto do rodapé",                     placeholder: "Búzios — RJ" },
      ].map(({ k, label, placeholder }) => (
        <ConfigRow key={k} chave={k} label={label} placeholder={placeholder}
          current={cfg.data?.[k] ?? ""}
          onSave={async (v) => { await upsertCfg.mutateAsync({ chave: k, valor: v }); toast.success("Alterações salvas e publicadas"); }} />
      ))}
    </div>
  );
};

export const DepoimentosSection = () => {
  const deps = useDepoimentos(false);
  const upsertDep = useUpsertDepoimento();
  const [newDep, setNewDep] = useState({ nome: "", texto_pt: "", nota: 5 });
  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="glass-card rounded-xl p-4 space-y-3 border-turquoise/40">
          <div className="text-xs font-bold text-turquoise-glow">Adicionar depoimento</div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7 space-y-1">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Nome do cliente</Label>
              <Input className="bg-night/70 border-turquoise/40" placeholder="João Pereira"
                value={newDep.nome} onChange={(e) => setNewDep({ ...newDep, nome: e.target.value })} />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Nota (1-5)</Label>
              <Input type="number" min={1} max={5} className="bg-night/70 border-turquoise/40" placeholder="5"
                value={newDep.nota} onChange={(e) => setNewDep({ ...newDep, nota: parseInt(e.target.value) || 5 })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Texto do depoimento</Label>
            <Textarea rows={2} className="bg-night/70 border-turquoise/30" placeholder="Texto PT"
              value={newDep.texto_pt} onChange={(e) => setNewDep({ ...newDep, texto_pt: e.target.value })} />
          </div>
          <Button size="sm" className="bg-turquoise text-night hover:bg-turquoise/80"
            disabled={!newDep.nome.trim()}
            onClick={async () => {
              await upsertDep.mutateAsync({ nome: newDep.nome, texto_pt: newDep.texto_pt, nota: newDep.nota, ativo: true, ordem: 0 });
              setNewDep({ nome: "", texto_pt: "", nota: 5 });
              toast.success("Depoimento adicionado e publicado");
            }}>
            <Plus className="h-3 w-3 mr-1" /> Adicionar
          </Button>
        </div>
        {deps.data?.map((d) => <DepRow key={d.id} d={d} />)}
        {deps.data?.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum depoimento ainda.</p>
        )}
      </div>
    </TooltipProvider>
  );
};

// ---------------- Backward-compat wrapper ----------------
export const CmsAdminTab = () => (
  <TooltipProvider>
    <Tabs defaultValue="tours" className="w-full">
      <TabsList className="grid grid-cols-4 w-full bg-night/60">
        <TabsTrigger value="tours">Passeios</TabsTrigger>
        <TabsTrigger value="modais">Modais</TabsTrigger>
        <TabsTrigger value="config">Config</TabsTrigger>
        <TabsTrigger value="deps">Depoimentos</TabsTrigger>
      </TabsList>
      <TabsContent value="tours" className="mt-3"><ToursSection /></TabsContent>
      <TabsContent value="modais" className="mt-3"><ModaisSection /></TabsContent>
      <TabsContent value="config" className="mt-3"><ConfigSection /></TabsContent>
      <TabsContent value="deps" className="mt-3"><DepoimentosSection /></TabsContent>
    </Tabs>
  </TooltipProvider>
);

const ConfigRow = ({ chave, label, placeholder, current, onSave }: {
  chave: string; label: string; placeholder?: string; current: string;
  onSave: (v: string) => Promise<void>;
}) => {
  const [v, setV] = useState(current);
  const [saved, setSaved] = useState(false);
  if (current && !v) setV(current);
  return (
    <div className="glass-card rounded-xl p-4 space-y-2">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</Label>
      <div className="flex gap-2">
        <Input className="flex-1 bg-night/70 border-turquoise/40" placeholder={placeholder}
          value={v} onChange={(e) => setV(e.target.value)} />
        <Button size="sm" className={`transition-colors ${saved ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-turquoise text-night hover:bg-turquoise/80"}`}
          onClick={() => { onSave(v); setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
          {saved ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Save className="h-3 w-3 mr-1" />}
          {saved ? "Publicado" : "Salvar"}
        </Button>
      </div>
    </div>
  );
};


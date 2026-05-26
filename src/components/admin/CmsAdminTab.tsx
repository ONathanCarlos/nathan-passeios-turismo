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
  useUpsertTour, useDeleteTour, useUpsertModal, useDeleteModal,
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
  const [expanded, setExpanded] = useState(false);

  const update = <K extends keyof CmsTour>(key: K, value: CmsTour[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

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
        <div className="sm:col-span-5 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Nome do passeio
          </Label>
          <Input
            className="bg-night/70 border-turquoise/40 text-foreground"
            value={draft.nome_pt ?? ""}
            onChange={(e) => update("nome_pt", e.target.value)}
            placeholder="Passeio de Escuna em Búzios"
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Preço (R$)
          </Label>
          <Input
            type="number" min={0}
            className="bg-night/70 border-turquoise/40 text-foreground"
            value={draft.preco ?? 0}
            onChange={(e) => update("preco", parseFloat(e.target.value) || 0)}
            placeholder="Ex: 220"
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center">
            Ordem
            <HelpTooltip>Posição em que o passeio aparece. 1 = primeiro.</HelpTooltip>
          </Label>
          <Input
            type="number"
            className="bg-night/70 border-turquoise/40 text-foreground"
            value={draft.ordem ?? 0}
            onChange={(e) => update("ordem", parseInt(e.target.value) || 0)}
            placeholder="Ex: 1"
          />
        </div>

        <div className="sm:col-span-3 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center">
            Ativo / Inativo
            <HelpTooltip>Controla se o passeio aparece publicamente no site.</HelpTooltip>
          </Label>
          <div className="flex items-center gap-2 h-10">
            <Switch
              checked={!!draft.ativo}
              onCheckedChange={(v) => update("ativo", v)}
            />
            <span className={`text-xs font-medium ${draft.ativo ? "text-emerald-400" : "text-rose-300"}`}>
              {draft.ativo ? "Ativo — visível" : "Inativo — oculto"}
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
          onChange={(e) => update("descricao_pt", e.target.value)}
          className="bg-night/70 border-turquoise/30 text-foreground"
        />
      </div>

      {/* Toggle detalhes */}
      <button type="button" onClick={() => setExpanded((v) => !v)}
        className="text-[11px] text-turquoise-glow hover:underline">
        {expanded ? "− Ocultar detalhes do passeio" : "+ Editar detalhes (capacidade, duração, horário, local, info, observações)"}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-t border-turquoise/20 pt-3">
          <div className="sm:col-span-3 space-y-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Capacidade máx. (passageiros)
            </Label>
            <Input type="number" min={0}
              className="bg-night/70 border-turquoise/40 text-foreground"
              value={draft.capacidade_max ?? ""}
              onChange={(e) => update("capacidade_max", e.target.value === "" ? null : parseInt(e.target.value) || 0)}
              placeholder="Ex: 30" />
          </div>
          <div className="sm:col-span-3 space-y-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Duração</Label>
            <Input
              className="bg-night/70 border-turquoise/40 text-foreground"
              value={draft.duracao ?? ""}
              onChange={(e) => update("duracao", e.target.value)}
              placeholder="Ex: 4 horas" />
          </div>
          <div className="sm:col-span-3 space-y-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Horário</Label>
            <Input
              className="bg-night/70 border-turquoise/40 text-foreground"
              value={draft.horario ?? ""}
              onChange={(e) => update("horario", e.target.value)}
              placeholder="Ex: 09h às 13h" />
          </div>
          <div className="sm:col-span-3 space-y-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Local de saída</Label>
            <Input
              className="bg-night/70 border-turquoise/40 text-foreground"
              value={draft.local_saida ?? ""}
              onChange={(e) => update("local_saida", e.target.value)}
              placeholder="Ex: Píer da Orla Bardot" />
          </div>
          <div className="sm:col-span-6 space-y-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Informações adicionais</Label>
            <Textarea rows={3}
              className="bg-night/70 border-turquoise/30 text-foreground"
              value={draft.info_adicional ?? ""}
              onChange={(e) => update("info_adicional", e.target.value)}
              placeholder="O que está incluso, paradas, almoço..." />
          </div>
          <div className="sm:col-span-6 space-y-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Observações importantes</Label>
            <Textarea rows={3}
              className="bg-night/70 border-turquoise/30 text-foreground"
              value={draft.observacoes ?? ""}
              onChange={(e) => update("observacoes", e.target.value)}
              placeholder="Levar protetor solar, água..." />
          </div>
        </div>
      )}

      {/* Imagem + Vídeo + Ações */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-16 h-12 rounded-md overflow-hidden border border-turquoise/30 bg-night/50 shrink-0">
          {draft.imagem_url ? (
            <img src={draft.imagem_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">sem img</div>
          )}
        </div>

        <div className="w-16 h-12 rounded-md overflow-hidden border border-turquoise/30 bg-night/50 shrink-0 relative">
          {draft.video_url ? (
            <>
              <video src={draft.video_url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center text-white/90 text-xs">▶</span>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">sem vídeo</div>
          )}
        </div>

        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-turquoise/15 border border-turquoise/40 hover:bg-turquoise/25 transition-colors">
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          Imagem (capa)
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, "imagem_url"); }} />
        </label>

        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-turquoise/15 border border-turquoise/40 hover:bg-turquoise/25 transition-colors">
          <Upload className="h-3 w-3" /> Vídeo (página de detalhes)
          <input type="file" accept="video/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, "video_url"); }} />
        </label>

        {draft.video_url && (
          <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200 text-xs"
            onClick={async () => {
              const next = { ...draft, video_url: null };
              setDraft(next);
              await upsert.mutateAsync(next);
              toast.success("Vídeo removido");
            }}>
            <Trash2 className="h-3 w-3 mr-1" /> Remover vídeo
          </Button>
        )}

        <Button size="sm" onClick={save} disabled={upsert.isPending}
          className={`transition-colors ${saved ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-turquoise text-night hover:bg-turquoise/80"}`}>
          {saved ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Save className="h-3 w-3 mr-1" />}
          {saved ? "Publicado" : "Salvar"}
        </Button>

        <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200"
          onClick={() => { if (confirm(`Excluir definitivamente "${draft.nome_pt}"? Esta ação não pode ser desfeita.`)) del.mutate(draft.id); }}>
          <Trash2 className="h-3 w-3 mr-1" /> Excluir
        </Button>

        <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground bg-night/40 px-2 py-1 rounded">
          <span>ID interno:</span>
          <code className="text-turquoise-glow/80">{draft.key}</code>
          <HelpTooltip>Identificador interno — não altere manualmente.</HelpTooltip>
        </div>
      </div>
    </div>
  );
};

// ---------------- Sub: Modal Editor ----------------
const ModalRow = ({ m }: { m: CmsModal }) => {
  const upsert = useUpsertModal();
  const del = useDeleteModal();
  const [d, setD] = useState<CmsModal>(m);
  const [saved, setSaved] = useState(false);
  const [showI18n, setShowI18n] = useState(false);
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

      <button type="button" onClick={() => setShowI18n((v) => !v)}
        className="text-[11px] text-turquoise-glow hover:underline">
        {showI18n ? "− Ocultar idiomas" : "+ Editar idiomas (ES/EN/FR/IT)"}
      </button>
      {showI18n && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["es", "en", "fr", "it"] as const).map((lng) => (
            <div key={lng} className="space-y-1.5 border border-turquoise/20 rounded-lg p-2 bg-night/40">
              <div className="text-[10px] uppercase font-bold text-turquoise-glow">{lng}</div>
              <Input className="bg-night/70 border-turquoise/30 h-8 text-xs" placeholder={`Título ${lng.toUpperCase()}`}
                value={(d as any)[`titulo_${lng}`] ?? ""}
                onChange={(e) => setD({ ...d, [`titulo_${lng}`]: e.target.value } as any)} />
              <Textarea rows={2} className="bg-night/70 border-turquoise/30 text-xs" placeholder={`Mensagem ${lng.toUpperCase()}`}
                value={(d as any)[`mensagem_${lng}`] ?? ""}
                onChange={(e) => setD({ ...d, [`mensagem_${lng}`]: e.target.value } as any)} />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" className={`transition-colors ${saved ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-turquoise text-night hover:bg-turquoise/80"}`}
          onClick={async () => { await upsert.mutateAsync(d); setSaved(true); toast.success("Modal salvo e publicado"); setTimeout(() => setSaved(false), 2500); }}>
          {saved ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Save className="h-3 w-3 mr-1" />}
          {saved ? "Publicado" : "Salvar"}
        </Button>
        <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200"
          onClick={() => { if (confirm(`Excluir modal "${d.key}"? Esta ação não pode ser desfeita.`)) del.mutate(d.id); }}>
          <Trash2 className="h-3 w-3 mr-1" /> Excluir
        </Button>
      </div>
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
  const upsert = useUpsertTour();
  const [nv, setNv] = useState({ key: "", nome_pt: "", preco: 0, descricao_pt: "" });
  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="glass-card rounded-xl p-4 border-turquoise/30 bg-turquoise/5 space-y-2">
          <h4 className="text-sm font-bold text-turquoise-glow flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            COMO GERENCIAR PASSEIOS
          </h4>
          <ol className="text-xs text-foreground/80 space-y-1 list-decimal list-inside">
            <li>Crie um novo passeio no formulário abaixo, ou edite um existente</li>
            <li>Use "+ Editar detalhes" para capacidade, duração, horário, local de saída, info e observações</li>
            <li>Envie imagem (capa) e vídeo (página de detalhes) com os botões de upload</li>
            <li>Clique em <b>Salvar</b> para publicar — as mudanças aparecem em tempo real no site</li>
            <li>Use <b>Excluir</b> para remover um passeio (pede confirmação)</li>
          </ol>
        </div>

        {/* Criar novo passeio */}
        <div className="glass-card rounded-xl p-4 space-y-2 border-turquoise/40">
          <div className="text-xs font-bold text-turquoise-glow">+ Criar novo passeio</div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <Input className="sm:col-span-3 bg-night/70 border-turquoise/40 h-9 text-xs text-foreground"
              placeholder="ID interno (ex: lagoa_azul)"
              value={nv.key}
              onChange={(e) => setNv({ ...nv, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })} />
            <Input className="sm:col-span-6 bg-night/70 border-turquoise/40 h-9 text-xs text-foreground"
              placeholder="Nome do passeio"
              value={nv.nome_pt}
              onChange={(e) => setNv({ ...nv, nome_pt: e.target.value })} />
            <Input type="number" className="sm:col-span-3 bg-night/70 border-turquoise/40 h-9 text-xs text-foreground"
              placeholder="Preço (R$)"
              value={nv.preco}
              onChange={(e) => setNv({ ...nv, preco: parseFloat(e.target.value) || 0 })} />
          </div>
          <Textarea rows={2} className="bg-night/70 border-turquoise/30 text-xs text-foreground"
            placeholder="Descrição curta"
            value={nv.descricao_pt}
            onChange={(e) => setNv({ ...nv, descricao_pt: e.target.value })} />
          <Button size="sm" className="bg-turquoise text-night hover:bg-turquoise/80"
            disabled={!nv.key.trim() || !nv.nome_pt.trim() || upsert.isPending}
            onClick={async () => {
              try {
                await upsert.mutateAsync({
                  key: nv.key.trim(),
                  nome_pt: nv.nome_pt.trim(),
                  preco: nv.preco,
                  descricao_pt: nv.descricao_pt,
                  ativo: true,
                  ordem: (tours.data?.length ?? 0) + 1,
                } as any);
                setNv({ key: "", nome_pt: "", preco: 0, descricao_pt: "" });
                toast.success("Passeio criado e publicado");
              } catch (e: any) { toast.error(e?.message || "Erro ao criar passeio"); }
            }}>
            <Plus className="h-3 w-3 mr-1" /> Criar passeio
          </Button>
        </div>

        {tours.isLoading && <Loader2 className="h-4 w-4 animate-spin text-turquoise mx-auto" />}
        {tours.data?.map((t) => <TourRow key={t.id} t={t} />)}
        {tours.data?.length === 0 && !tours.isLoading && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum passeio cadastrado ainda.</p>
        )}
      </div>
    </TooltipProvider>
  );
};

export const ModaisSection = () => {
  const modais = useModais();
  const upsert = useUpsertModal();
  const [nv, setNv] = useState({ key: "", titulo_pt: "", mensagem_pt: "", percentual: 10, codigo: "" });
  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="text-[11px] text-muted-foreground">
          Edite, ative/desative, traduza ou exclua qualquer modal promocional. Tudo é salvo no banco e refletido em tempo real no site.
        </div>

        {/* Criar novo modal */}
        <div className="glass-card rounded-xl p-4 space-y-2 border-turquoise/40">
          <div className="text-xs font-bold text-turquoise-glow">+ Criar novo modal</div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <Input className="sm:col-span-3 bg-night/70 border-turquoise/40 h-9 text-xs"
              placeholder="ID interno (ex: blackfri)"
              value={nv.key} onChange={(e) => setNv({ ...nv, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })} />
            <Input className="sm:col-span-5 bg-night/70 border-turquoise/40 h-9 text-xs"
              placeholder="Título PT"
              value={nv.titulo_pt} onChange={(e) => setNv({ ...nv, titulo_pt: e.target.value })} />
            <Input type="number" className="sm:col-span-1 bg-night/70 border-turquoise/40 h-9 text-xs"
              placeholder="%"
              value={nv.percentual} onChange={(e) => setNv({ ...nv, percentual: parseInt(e.target.value) || 0 })} />
            <Input className="sm:col-span-3 bg-night/70 border-turquoise/40 h-9 text-xs"
              placeholder="Código (ex: BF20)"
              value={nv.codigo} onChange={(e) => setNv({ ...nv, codigo: e.target.value.toUpperCase() })} />
          </div>
          <Textarea rows={2} className="bg-night/70 border-turquoise/30 text-xs"
            placeholder="Mensagem PT"
            value={nv.mensagem_pt} onChange={(e) => setNv({ ...nv, mensagem_pt: e.target.value })} />
          <Button size="sm" className="bg-turquoise text-night hover:bg-turquoise/80"
            disabled={!nv.key.trim() || !nv.titulo_pt.trim()}
            onClick={async () => {
              try {
                await upsert.mutateAsync({
                  key: nv.key.trim(),
                  titulo_pt: nv.titulo_pt,
                  mensagem_pt: nv.mensagem_pt,
                  percentual: nv.percentual,
                  codigo: nv.codigo || null,
                  ativo: true,
                });
                setNv({ key: "", titulo_pt: "", mensagem_pt: "", percentual: 10, codigo: "" });
                toast.success("Modal criado e publicado");
              } catch (e: any) { toast.error(e?.message || "Erro ao criar"); }
            }}>
            <Plus className="h-3 w-3 mr-1" /> Criar modal
          </Button>
        </div>

        {modais.data?.map((m) => <ModalRow key={m.id} m={m} />)}
        {modais.data?.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum modal cadastrado.</p>
        )}
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

// ---------------- Sub: Pacotes Editor ----------------
import { usePacotes, useUpsertPacote, useDeletePacote, type Pacote } from "@/lib/pacotes";

const PacoteRow = ({ p, allTourKeys }: { p: Pacote; allTourKeys: { key: string; nome_pt: string }[] }) => {
  const upsert = useUpsertPacote();
  const del = useDeletePacote();
  const [d, setD] = useState<Pacote>(p);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showI18n, setShowI18n] = useState(false);

  const toggleTour = (k: string) => {
    const has = d.tour_keys.includes(k);
    setD({ ...d, tour_keys: has ? d.tour_keys.filter((x) => x !== k) : [...d.tour_keys, k] });
  };

  const save = async () => {
    await upsert.mutateAsync(d);
    setSaved(true);
    toast.success("Pacote salvo e publicado");
    setTimeout(() => setSaved(false), 2500);
  };

  const onUpload = async (file: File, kind: "imagem_url" | "video_url") => {
    try {
      setUploading(true);
      const url = await uploadMedia(file, kind === "video_url" ? "videos" : "tours");
      const next = { ...d, [kind]: url } as Pacote;
      setD(next);
      await upsert.mutateAsync(next);
      toast.success("Mídia enviada e publicada");
    } catch (e: any) { toast.error(e?.message || "Erro no upload"); }
    finally { setUploading(false); }
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Nome do pacote</Label>
          <Input className="bg-night/70 border-turquoise/40 text-foreground"
            value={d.nome_pt} onChange={(e) => setD({ ...d, nome_pt: e.target.value })} />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Preço (R$)</Label>
          <Input type="number" className="bg-night/70 border-turquoise/40 text-foreground"
            value={d.preco} onChange={(e) => setD({ ...d, preco: parseFloat(e.target.value) || 0 })} />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center">
            Ordem<HelpTooltip>Posição na listagem. 1 = primeiro.</HelpTooltip>
          </Label>
          <Input type="number" className="bg-night/70 border-turquoise/40 text-foreground"
            value={d.ordem ?? 0} onChange={(e) => setD({ ...d, ordem: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="sm:col-span-3 space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Ativo / Destaque</Label>
          <div className="flex items-center gap-3 h-10">
            <div className="flex items-center gap-1.5">
              <Switch checked={d.ativo} onCheckedChange={(v) => setD({ ...d, ativo: v })} />
              <span className={`text-[10px] font-semibold ${d.ativo ? "text-emerald-400" : "text-rose-300"}`}>
                {d.ativo ? "Visível" : "Oculto"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Switch checked={d.destaque} onCheckedChange={(v) => setD({ ...d, destaque: v })} />
              <span className={`text-[10px] font-semibold ${d.destaque ? "text-amber-300" : "text-muted-foreground"}`}>
                Destaque
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Descrição (PT)</Label>
        <Textarea rows={2} placeholder="Ex.: Passeio de Escuna + Passeio de Buggy + Almoço"
          className="bg-night/70 border-turquoise/30 text-foreground"
          value={d.descricao_pt ?? ""} onChange={(e) => setD({ ...d, descricao_pt: e.target.value })} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          Composição do pacote (passeios incluídos)
        </Label>
        <div className="flex flex-wrap gap-2">
          {allTourKeys.map((tk) => {
            const on = d.tour_keys.includes(tk.key);
            return (
              <button key={tk.key} type="button" onClick={() => toggleTour(tk.key)}
                className={`text-xs px-2 py-1 rounded border transition-colors ${on
                  ? "bg-turquoise/30 border-turquoise/70 text-foreground"
                  : "bg-night/40 border-turquoise/20 text-muted-foreground hover:border-turquoise/40"}`}>
                {tk.nome_pt} {on && "✓"}
              </button>
            );
          })}
          {(() => {
            const on = d.tour_keys.includes("almoco");
            return (
              <button type="button" onClick={() => toggleTour("almoco")}
                className={`text-xs px-2 py-1 rounded border transition-colors ${on
                  ? "bg-amber-400/30 border-amber-400/70 text-foreground"
                  : "bg-night/40 border-amber-400/20 text-muted-foreground hover:border-amber-400/40"}`}>
                Almoço {on && "✓"}
              </button>
            );
          })()}
        </div>
      </div>

      <button type="button" onClick={() => setExpanded((v) => !v)}
        className="text-[11px] text-turquoise-glow hover:underline">
        {expanded ? "− Ocultar detalhes avançados" : "+ Editar detalhes (textos promocionais, observações)"}
      </button>
      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-turquoise/20 pt-3">
          <div className="space-y-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Texto promocional / Info adicional</Label>
            <Textarea rows={3} className="bg-night/70 border-turquoise/30 text-foreground"
              value={d.info_adicional ?? ""} onChange={(e) => setD({ ...d, info_adicional: e.target.value })}
              placeholder="Ex.: Inclui translado, almoço buffet livre..." />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Observações</Label>
            <Textarea rows={3} className="bg-night/70 border-turquoise/30 text-foreground"
              value={d.observacoes ?? ""} onChange={(e) => setD({ ...d, observacoes: e.target.value })}
              placeholder="Ex.: Sujeito às condições climáticas." />
          </div>
        </div>
      )}

      <button type="button" onClick={() => setShowI18n((v) => !v)}
        className="text-[11px] text-turquoise-glow hover:underline">
        {showI18n ? "− Ocultar idiomas" : "+ Editar idiomas (ES/EN/FR/IT)"}
      </button>
      {showI18n && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["es", "en", "fr", "it"] as const).map((lng) => (
            <div key={lng} className="space-y-1.5 border border-turquoise/20 rounded-lg p-2 bg-night/40">
              <div className="text-[10px] uppercase font-bold text-turquoise-glow">{lng}</div>
              <Input className="bg-night/70 border-turquoise/30 h-8 text-xs" placeholder={`Nome ${lng.toUpperCase()}`}
                value={(d as any)[`nome_${lng}`] ?? ""}
                onChange={(e) => setD({ ...d, [`nome_${lng}`]: e.target.value } as any)} />
              <Textarea rows={2} className="bg-night/70 border-turquoise/30 text-xs" placeholder={`Descrição ${lng.toUpperCase()}`}
                value={(d as any)[`descricao_${lng}`] ?? ""}
                onChange={(e) => setD({ ...d, [`descricao_${lng}`]: e.target.value } as any)} />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="w-16 h-12 rounded-md overflow-hidden border border-turquoise/30 bg-night/50 shrink-0">
          {d.imagem_url ? (
            <img src={d.imagem_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">auto</div>
          )}
        </div>
        <div className="w-16 h-12 rounded-md overflow-hidden border border-turquoise/30 bg-night/50 shrink-0 relative">
          {d.video_url ? (
            <>
              <video src={d.video_url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center text-white/90 text-xs">▶</span>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">sem vídeo</div>
          )}
        </div>

        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-turquoise/15 border border-turquoise/40 hover:bg-turquoise/25 transition-colors">
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          Imagem (capa)
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, "imagem_url"); }} />
        </label>
        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-turquoise/15 border border-turquoise/40 hover:bg-turquoise/25 transition-colors">
          <Upload className="h-3 w-3" /> Vídeo
          <input type="file" accept="video/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, "video_url"); }} />
        </label>
        {d.imagem_url && (
          <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200 text-xs"
            onClick={async () => {
              const next = { ...d, imagem_url: null } as Pacote;
              setD(next);
              await upsert.mutateAsync(next);
              toast.success("Imagem removida");
            }}>
            <Trash2 className="h-3 w-3 mr-1" /> Remover imagem
          </Button>
        )}

        <Button size="sm" onClick={save} disabled={upsert.isPending}
          className={`transition-colors ${saved ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-turquoise text-night hover:bg-turquoise/80"}`}>
          {saved ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Save className="h-3 w-3 mr-1" />}
          {saved ? "Publicado" : "Salvar"}
        </Button>
        <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200"
          onClick={() => { if (confirm(`Excluir pacote "${d.nome_pt}"?`)) del.mutate(d.id); }}>
          <Trash2 className="h-3 w-3 mr-1" /> Excluir
        </Button>
        <div className="ml-auto text-[10px] text-muted-foreground bg-night/40 px-2 py-1 rounded">
          ID: <code className="text-turquoise-glow/80">{d.key}</code>
        </div>
      </div>
    </div>
  );
};

export const PacotesSection = () => {
  const pacotes = usePacotes(false);
  const tours = useTours(false);
  const upsert = useUpsertPacote();
  const [nv, setNv] = useState({ key: "", nome_pt: "", preco: 0, descricao_pt: "" });
  const allTours = (tours.data || []).map((t) => ({ key: t.key, nome_pt: t.nome_pt }));
  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="glass-card rounded-xl p-4 border-amber-400/30 bg-amber-500/5 space-y-2">
          <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            COMO GERENCIAR PACOTES DE PASSEIOS
          </h4>
          <ol className="text-xs text-foreground/80 space-y-1 list-decimal list-inside">
            <li>Crie um novo pacote no formulário abaixo, ou edite um existente</li>
            <li>Marque os passeios incluídos na composição (e "Almoço" quando aplicável)</li>
            <li>Use "+ Editar detalhes" e "+ Editar idiomas" para textos promocionais e traduções</li>
            <li>Envie imagem/vídeo próprios (opcional — se vazio, a capa é montada automaticamente)</li>
            <li>Cupons promocionais <b>não</b> se aplicam a pacotes (já têm desconto embutido)</li>
          </ol>
        </div>

        <div className="glass-card rounded-xl p-4 space-y-2 border-turquoise/40">
          <div className="text-xs font-bold text-turquoise-glow">+ Criar novo pacote</div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <Input className="sm:col-span-3 bg-night/70 border-turquoise/40 h-9 text-xs text-foreground"
              placeholder="ID (ex: combo_lua)"
              value={nv.key} onChange={(e) => setNv({ ...nv, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })} />
            <Input className="sm:col-span-6 bg-night/70 border-turquoise/40 h-9 text-xs text-foreground"
              placeholder="Nome do pacote"
              value={nv.nome_pt} onChange={(e) => setNv({ ...nv, nome_pt: e.target.value })} />
            <Input type="number" className="sm:col-span-3 bg-night/70 border-turquoise/40 h-9 text-xs text-foreground"
              placeholder="Preço (R$)"
              value={nv.preco} onChange={(e) => setNv({ ...nv, preco: parseFloat(e.target.value) || 0 })} />
          </div>
          <Textarea rows={2} className="bg-night/70 border-turquoise/30 text-xs text-foreground"
            placeholder="Descrição curta (ex.: Passeio de Escuna + Passeio de Buggy + Almoço)"
            value={nv.descricao_pt} onChange={(e) => setNv({ ...nv, descricao_pt: e.target.value })} />
          <Button size="sm" className="bg-turquoise text-night hover:bg-turquoise/80"
            disabled={!nv.key || !nv.nome_pt || upsert.isPending}
            onClick={async () => {
              try {
                await upsert.mutateAsync({
                  key: nv.key, nome_pt: nv.nome_pt, preco: nv.preco,
                  descricao_pt: nv.descricao_pt, ativo: true, tour_keys: [],
                  ordem: (pacotes.data?.length ?? 0) + 1,
                } as any);
                setNv({ key: "", nome_pt: "", preco: 0, descricao_pt: "" });
                toast.success("Pacote criado e publicado");
              } catch (e: any) { toast.error(e?.message || "Erro ao criar pacote"); }
            }}>
            <Plus className="h-3 w-3 mr-1" /> Criar pacote
          </Button>
        </div>

        {pacotes.isLoading && <Loader2 className="h-4 w-4 animate-spin text-turquoise mx-auto" />}
        {pacotes.data?.map((p) => <PacoteRow key={p.id} p={p} allTourKeys={allTours} />)}
        {pacotes.data?.length === 0 && !pacotes.isLoading && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum pacote cadastrado.</p>
        )}
      </div>
    </TooltipProvider>
  );
};

// ---------------- Backward-compat wrapper ----------------
export const CmsAdminTab = () => (
  <TooltipProvider>
    <Tabs defaultValue="tours" className="w-full">
      <TabsList className="grid grid-cols-5 w-full bg-night/60">
        <TabsTrigger value="tours">Passeios</TabsTrigger>
        <TabsTrigger value="pacotes">Pacotes</TabsTrigger>
        <TabsTrigger value="modais">Modais</TabsTrigger>
        <TabsTrigger value="config">Config</TabsTrigger>
        <TabsTrigger value="deps">Depoimentos</TabsTrigger>
      </TabsList>
      <TabsContent value="tours" className="mt-3"><ToursSection /></TabsContent>
      <TabsContent value="pacotes" className="mt-3"><PacotesSection /></TabsContent>
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


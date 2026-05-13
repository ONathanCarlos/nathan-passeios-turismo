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
import { Upload, Trash2, Save, Plus, Loader2 } from "lucide-react";
import {
  useTours, useModais, useConfig, useDepoimentos,
  useUpsertTour, useDeleteTour, useUpsertModal,
  useUpsertConfig, useUpsertDepoimento, useDeleteDepoimento,
  uploadMedia, type CmsTour, type CmsModal, type CmsDepoimento,
} from "@/lib/cms";

// ---------------- Sub: Tour Editor ----------------
const TourRow = ({ t }: { t: CmsTour }) => {
  const upsert = useUpsertTour();
  const del = useDeleteTour();
  const [draft, setDraft] = useState<CmsTour>(t);
  const [uploading, setUploading] = useState(false);

  const save = async () => {
    await upsert.mutateAsync(draft);
    toast.success(`${draft.nome_pt} salvo`);
  };
  const onUpload = async (file: File, kind: "imagem_url" | "video_url") => {
    try {
      setUploading(true);
      const url = await uploadMedia(file, kind === "video_url" ? "videos" : "tours");
      const next = { ...draft, [kind]: url };
      setDraft(next);
      await upsert.mutateAsync(next);
      toast.success("Mídia enviada");
    } catch (e: any) { toast.error(e?.message || "Erro no upload"); }
    finally { setUploading(false); }
  };

  return (
    <div className="glass-card rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-16 h-12 rounded-md overflow-hidden border border-turquoise/30 bg-night/50 shrink-0">
          {draft.imagem_url && <img src={draft.imagem_url} alt="" className="w-full h-full object-cover" />}
        </div>
        <Input
          className="flex-1 bg-night/70 border-turquoise/40"
          value={draft.nome_pt}
          onChange={(e) => setDraft({ ...draft, nome_pt: e.target.value })}
          placeholder="Nome (PT)"
        />
        <Input
          type="number" min={0} className="w-24 bg-night/70 border-turquoise/40"
          value={draft.preco}
          onChange={(e) => setDraft({ ...draft, preco: parseFloat(e.target.value) || 0 })}
          placeholder="Preço"
        />
        <Input
          type="number" className="w-16 bg-night/70 border-turquoise/40"
          value={draft.ordem}
          onChange={(e) => setDraft({ ...draft, ordem: parseInt(e.target.value) || 0 })}
          placeholder="Ordem"
        />
        <Switch checked={draft.ativo} onCheckedChange={(v) => setDraft({ ...draft, ativo: v })} />
      </div>
      <Textarea
        rows={2}
        placeholder="Descrição PT"
        value={draft.descricao_pt ?? ""}
        onChange={(e) => setDraft({ ...draft, descricao_pt: e.target.value })}
        className="bg-night/70 border-turquoise/30"
      />
      <div className="flex flex-wrap gap-2">
        <label className="cursor-pointer inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-turquoise/15 border border-turquoise/40 hover:bg-turquoise/25">
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          Imagem
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, "imagem_url"); }} />
        </label>
        <label className="cursor-pointer inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-turquoise/15 border border-turquoise/40 hover:bg-turquoise/25">
          <Upload className="h-3 w-3" /> Vídeo
          <input type="file" accept="video/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, "video_url"); }} />
        </label>
        <Button size="sm" onClick={save} disabled={upsert.isPending}
          className="bg-turquoise text-night hover:bg-turquoise/80">
          <Save className="h-3 w-3 mr-1" /> Salvar
        </Button>
        <Button size="sm" variant="ghost" className="text-rose-300"
          onClick={() => { if (confirm(`Excluir ${draft.nome_pt}?`)) del.mutate(draft.id); }}>
          <Trash2 className="h-3 w-3" />
        </Button>
        <span className="text-[10px] text-muted-foreground self-center ml-auto">
          key: <code>{draft.key}</code>
        </span>
      </div>
    </div>
  );
};

// ---------------- Sub: Modal Editor ----------------
const ModalRow = ({ m }: { m: CmsModal }) => {
  const upsert = useUpsertModal();
  const [d, setD] = useState<CmsModal>(m);
  return (
    <div className="glass-card rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-turquoise-glow uppercase w-20">{d.key}</span>
        <Input className="flex-1 bg-night/70 border-turquoise/40" placeholder="Título PT"
          value={d.titulo_pt ?? ""} onChange={(e) => setD({ ...d, titulo_pt: e.target.value })} />
        <Input type="number" className="w-20 bg-night/70 border-turquoise/40" placeholder="%"
          value={d.percentual} onChange={(e) => setD({ ...d, percentual: parseInt(e.target.value) || 0 })} />
        <Input className="w-28 bg-night/70 border-turquoise/40" placeholder="código"
          value={d.codigo ?? ""} onChange={(e) => setD({ ...d, codigo: e.target.value })} />
        <Switch checked={d.ativo} onCheckedChange={(v) => setD({ ...d, ativo: v })} />
      </div>
      <Textarea rows={2} placeholder="Mensagem PT" className="bg-night/70 border-turquoise/30"
        value={d.mensagem_pt ?? ""} onChange={(e) => setD({ ...d, mensagem_pt: e.target.value })} />
      <Button size="sm" className="bg-turquoise text-night hover:bg-turquoise/80"
        onClick={async () => { await upsert.mutateAsync(d); toast.success("Modal salvo"); }}>
        <Save className="h-3 w-3 mr-1" /> Salvar
      </Button>
    </div>
  );
};

// ---------------- Sub: Depoimento Editor ----------------
const DepRow = ({ d }: { d: CmsDepoimento }) => {
  const upsert = useUpsertDepoimento();
  const del = useDeleteDepoimento();
  const [s, setS] = useState<CmsDepoimento>(d);
  return (
    <div className="glass-card rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Input className="flex-1 bg-night/70 border-turquoise/40" placeholder="Nome"
          value={s.nome} onChange={(e) => setS({ ...s, nome: e.target.value })} />
        <Input type="number" min={1} max={5} className="w-16 bg-night/70 border-turquoise/40"
          value={s.nota} onChange={(e) => setS({ ...s, nota: parseInt(e.target.value) || 5 })} />
        <Switch checked={s.ativo} onCheckedChange={(v) => setS({ ...s, ativo: v })} />
      </div>
      <Textarea rows={2} placeholder="Texto PT" className="bg-night/70 border-turquoise/30"
        value={s.texto_pt ?? ""} onChange={(e) => setS({ ...s, texto_pt: e.target.value })} />
      <div className="flex gap-2">
        <Button size="sm" className="bg-turquoise text-night hover:bg-turquoise/80"
          onClick={async () => { await upsert.mutateAsync(s); toast.success("Salvo"); }}>
          <Save className="h-3 w-3 mr-1" /> Salvar
        </Button>
        {s.id && (
          <Button size="sm" variant="ghost" className="text-rose-300"
            onClick={() => { if (confirm("Excluir depoimento?")) del.mutate(s.id); }}>
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

// ---------------- MAIN ----------------
export const CmsAdminTab = () => {
  const tours = useTours(false);
  const modais = useModais();
  const cfg = useConfig();
  const deps = useDepoimentos(false);
  const upsertCfg = useUpsertConfig();
  const upsertDep = useUpsertDepoimento();

  const [newDep, setNewDep] = useState({ nome: "", texto_pt: "", nota: 5 });

  return (
    <Tabs defaultValue="tours" className="w-full">
      <TabsList className="grid grid-cols-4 w-full bg-night/60">
        <TabsTrigger value="tours">Passeios</TabsTrigger>
        <TabsTrigger value="modais">Modais</TabsTrigger>
        <TabsTrigger value="config">Config</TabsTrigger>
        <TabsTrigger value="deps">Depoimentos</TabsTrigger>
      </TabsList>

      {/* ---- Passeios ---- */}
      <TabsContent value="tours" className="mt-3 space-y-2">
        <div className="text-[11px] text-muted-foreground">
          Edite preço, nome, descrição, imagem, vídeo, ordem e ativo. Tudo persiste no backend e reflete para todos os visitantes.
        </div>
        {tours.isLoading && <Loader2 className="h-4 w-4 animate-spin text-turquoise" />}
        {tours.data?.map((t) => <TourRow key={t.id} t={t} />)}
      </TabsContent>

      {/* ---- Modais ---- */}
      <TabsContent value="modais" className="mt-3 space-y-2">
        {modais.data?.map((m) => <ModalRow key={m.id} m={m} />)}
      </TabsContent>

      {/* ---- Config Global ---- */}
      <TabsContent value="config" className="mt-3 space-y-3">
        {[
          { k: "whatsapp",         label: "WhatsApp (somente dígitos com DDI)", placeholder: "5522998216796" },
          { k: "desconto_padrao",  label: "Desconto padrão (%)",                placeholder: "10" },
          { k: "texto_promo_topo", label: "Texto promocional do topo",          placeholder: "Ganhe 10% OFF..." },
          { k: "instagram_url",    label: "Instagram URL",                       placeholder: "https://instagram.com/..." },
          { k: "footer_region",    label: "Texto do rodapé",                     placeholder: "Búzios — RJ" },
        ].map(({ k, label, placeholder }) => (
          <ConfigRow key={k} chave={k} label={label} placeholder={placeholder}
            current={cfg.data?.[k] ?? ""}
            onSave={async (v) => { await upsertCfg.mutateAsync({ chave: k, valor: v }); toast.success("Salvo"); }} />
        ))}
      </TabsContent>

      {/* ---- Depoimentos ---- */}
      <TabsContent value="deps" className="mt-3 space-y-2">
        <div className="glass-card rounded-xl p-3 space-y-2 border-turquoise/40">
          <div className="text-xs font-bold text-turquoise-glow">Adicionar depoimento</div>
          <Input className="bg-night/70 border-turquoise/40" placeholder="Nome do cliente"
            value={newDep.nome} onChange={(e) => setNewDep({ ...newDep, nome: e.target.value })} />
          <Textarea rows={2} className="bg-night/70 border-turquoise/30" placeholder="Texto PT"
            value={newDep.texto_pt} onChange={(e) => setNewDep({ ...newDep, texto_pt: e.target.value })} />
          <Button size="sm" className="bg-turquoise text-night hover:bg-turquoise/80"
            disabled={!newDep.nome.trim()}
            onClick={async () => {
              await upsertDep.mutateAsync({ nome: newDep.nome, texto_pt: newDep.texto_pt, nota: newDep.nota, ativo: true, ordem: 0 });
              setNewDep({ nome: "", texto_pt: "", nota: 5 });
              toast.success("Depoimento adicionado");
            }}>
            <Plus className="h-3 w-3 mr-1" /> Adicionar
          </Button>
        </div>
        {deps.data?.map((d) => <DepRow key={d.id} d={d} />)}
        {deps.data?.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum depoimento ainda.</p>
        )}
      </TabsContent>
    </Tabs>
  );
};

const ConfigRow = ({ chave, label, placeholder, current, onSave }: {
  chave: string; label: string; placeholder?: string; current: string;
  onSave: (v: string) => Promise<void>;
}) => {
  const [v, setV] = useState(current);
  // Sync when query loads
  if (current && !v) setV(current);
  return (
    <div className="glass-card rounded-xl p-3 space-y-2">
      <Label className="text-xs text-foreground">{label}</Label>
      <div className="flex gap-2">
        <Input className="flex-1 bg-night/70 border-turquoise/40" placeholder={placeholder}
          value={v} onChange={(e) => setV(e.target.value)} />
        <Button size="sm" className="bg-turquoise text-night hover:bg-turquoise/80"
          onClick={() => onSave(v)}>
          <Save className="h-3 w-3 mr-1" /> Salvar
        </Button>
      </div>
    </div>
  );
};

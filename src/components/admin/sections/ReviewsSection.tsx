import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Link2, MessageSquareQuote, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  fetchReviews,
  fetchLeads,
  createManualReviewLink,
  updateReviewStatus,
  type AdminReview,
  type ReviewPublicationStatus,
} from "@/lib/db";
import { buildReviewWhatsAppMessage, buildShortReviewUrl } from "@/lib/reviewInvite";
import { useTours } from "@/lib/cms";
import { useIsAdmin } from "@/lib/adminAuth";

type Filter = "pendente" | "todas";

const statusLabel: Record<ReviewPublicationStatus, string> = {
  pendente: "Pendente",
  publicada: "Aprovada",
  oculta: "Rejeitada",
};

export const ReviewsSection = () => {
  const isAdmin = useIsAdmin();
  const [rows, setRows] = useState<AdminReview[]>([]);
  const [leads, setLeads] = useState<{ id: string; nome: string; telefone: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [manualLeadId, setManualLeadId] = useState<string | null>(null);
  const [manualTour, setManualTour] = useState<Record<string, string>>({});
  const [manualLink, setManualLink] = useState<{ leadId: string; url: string } | null>(null);
  const tours = useTours(false);
  const [filter, setFilter] = useState<Filter>("pendente");

  const load = async () => {
    setLoading(true);
    try {
      const [reviews, leadRows] = await Promise.all([fetchReviews(300), fetchLeads(300)]);
      setRows(reviews);
      setLeads(leadRows.map((lead) => ({ id: lead.id, nome: lead.nome, telefone: lead.telefone })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    load();
  }, [isAdmin]);

  const visibleRows = useMemo(
    () => filter === "todas" ? rows : rows.filter((review) => review.status_publicacao === "pendente"),
    [filter, rows],
  );

  const moderate = async (review: AdminReview, status: Exclude<ReviewPublicationStatus, "pendente">) => {
    setPendingId(review.id);
    const ok = await updateReviewStatus(review.id, status);
    setPendingId(null);
    if (!ok) {
      toast.error("Não foi possível atualizar a avaliação.");
      return;
    }
    setRows((current) => current.map((item) => item.id === review.id
      ? { ...item, status_publicacao: status, status_admin: "visualizada" }
      : item));
    toast.success(status === "publicada" ? "Avaliação aprovada e publicada." : "Avaliação rejeitada e mantida oculta.");
  };

  const generateManual = async (lead: { id: string; nome: string }) => {
    const passeioKey = manualTour[lead.id];
    const selectedTour = (tours.data || []).find((tour) => tour.key === passeioKey);
    if (!selectedTour) {
      toast.error("Selecione o passeio antes de gerar o link.");
      return;
    }
    setManualLeadId(lead.id);
    const result = await createManualReviewLink(lead.id, selectedTour.nome_pt, selectedTour.key);
    setManualLeadId(null);
    if ("error" in result) {
      const messages: Record<string, string> = {
        no_reviewable_tours: "Esse passeio não foi encontrado no cadastro do CMS.",
        lead_not_found: "Esse lead não foi encontrado no banco.",
        already_submitted: "Esse cliente já avaliou este passeio.",
        reservation_create_failed: "Falha ao criar a reserva manual.",
        invite_create_failed: "Falha ao criar o convite de avaliação.",
        short_link_create_failed: "Falha ao criar o código do link.",
      };
      const baseError = result.error.split(":")[0];
      toast.error(`${messages[baseError] || "Não foi possível gerar o link."} (${result.error})`);
      return;
    }
    const url = buildShortReviewUrl(result.shortCode);
    setManualLink({ leadId: lead.id, url });
    try { await navigator.clipboard.writeText(url); } catch { /* cópia manual continua disponível */ }
    toast.success("Novo link gerado e copiado. Cada clique cria outro link individual.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Avaliações</h3>
          <p className="text-[11px] text-muted-foreground">Toda reserva registrada pelo site aparece abaixo para solicitar avaliação; novas avaliações permanecem ocultas até aprovação.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-turquoise/30 p-0.5">
            <Button type="button" size="sm" variant={filter === "pendente" ? "default" : "ghost"} className="h-7 text-[11px]" onClick={() => setFilter("pendente")}>Pendentes</Button>
            <Button type="button" size="sm" variant={filter === "todas" ? "default" : "ghost"} className="h-7 text-[11px]" onClick={() => setFilter("todas")}>Todas</Button>
          </div>
          <Button type="button" variant="outline" size="sm" className="border-turquoise/40" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
        </div>
      </div>

      <section className="space-y-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-turquoise-glow">Gerar link manual</h4>
          <p className="text-[11px] text-muted-foreground">Escolha um cliente e o passeio. Cada clique cria um link novo, individual e de uso único para você copiar e enviar manualmente.</p>
        </div>
        {leads.length === 0 ? (
          <div className="glass-card rounded-lg px-4 py-5 text-center text-xs text-muted-foreground">Nenhum lead disponível.</div>
        ) : (
          <div className="space-y-2">
            {leads.map((lead) => (
              <div key={lead.id} className="glass-card rounded-lg p-3 flex flex-wrap items-center gap-2">
                <div className="min-w-32 flex-1"><p className="text-sm font-bold text-foreground">{lead.nome}</p><p className="text-[11px] text-muted-foreground">{lead.telefone}</p></div>
                <Select value={manualTour[lead.id] || ""} onValueChange={(value) => setManualTour((current) => ({ ...current, [lead.id]: value }))}>
                  <SelectTrigger className="h-8 w-40 text-[11px]"><SelectValue placeholder="Escolha o passeio" /></SelectTrigger>
                  <SelectContent>{(tours.data || []).filter((tour) => tour.ativo !== false).map((tour) => <SelectItem key={tour.key} value={tour.key}>{tour.nome_pt}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="button" size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => generateManual(lead)} disabled={manualLeadId === lead.id}>
                  {manualLeadId === lead.id ? <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Link2 className="mr-1 h-3.5 w-3.5" />} Gerar novo link
                </Button>
                {manualLink?.leadId === lead.id && <Button type="button" size="sm" variant="ghost" className="h-8 text-[11px]" onClick={() => navigator.clipboard.writeText(manualLink.url)}><Copy className="mr-1 h-3.5 w-3.5" /> Copiar</Button>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wide text-turquoise-glow">Avaliações recebidas</h4>
        {visibleRows.length === 0 ? (
          <div className="glass-card rounded-lg px-4 py-8 text-center text-xs text-muted-foreground">
            <MessageSquareQuote className="mx-auto mb-2 h-5 w-5" />
            {filter === "pendente" ? "Nenhuma avaliação aguardando aprovação." : "Nenhuma avaliação recebida."}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleRows.map((review) => (
              <article key={review.id} className="glass-card rounded-lg p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{review.cliente_nome}</h4>
                    <p className="text-xs text-turquoise-glow">{review.passeio_nome} · {Number(review.media_final).toLocaleString("pt-BR")} / 5</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{new Date(review.avaliado_em).toLocaleString("pt-BR")}</p>
                  </div>
                  <span className="rounded border border-border px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">{statusLabel[review.status_publicacao]}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">“{review.avaliacao_passeio}”</p>
                {review.melhoria && <p className="mt-3 text-xs text-muted-foreground"><strong>Melhoria:</strong> {review.melhoria}</p>}
                {review.observacoes && <p className="mt-2 text-xs text-muted-foreground"><strong>Observações:</strong> {review.observacoes}</p>}
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Button type="button" size="sm" variant="outline" disabled={pendingId === review.id || review.status_publicacao === "oculta"} className="border-destructive/40 text-destructive" onClick={() => moderate(review, "oculta")}>
                    <X className="mr-1 h-3.5 w-3.5" /> Rejeitar
                  </Button>
                  <Button type="button" size="sm" disabled={pendingId === review.id || review.status_publicacao === "publicada"} onClick={() => moderate(review, "publicada")}>
                    <Check className="mr-1 h-3.5 w-3.5" /> Aprovar
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

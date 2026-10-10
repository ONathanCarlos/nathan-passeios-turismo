import { useEffect, useMemo, useState } from "react";
import { Check, MessageCircle, MessageSquareQuote, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  fetchReservas,
  fetchReviews,
  getReservaReviewLink,
  updateReviewStatus,
  type AdminReview,
  type Reserva,
  type ReviewPublicationStatus,
} from "@/lib/db";
import { buildReviewWhatsAppMessage, buildShortReviewUrl } from "@/lib/reviewInvite";
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
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [reviewPendingId, setReviewPendingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("pendente");

  const load = async () => {
    setLoading(true);
    try {
      const [reviews, reservations] = await Promise.all([fetchReviews(300), fetchReservas(300)]);
      setRows(reviews);
      setReservas(reservations);
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

  const pendingReservations = useMemo(() => {
    const reviewed = new Set(rows.map((review) => review.reserva_id));
    return reservas.filter((reservation) => reservation.status === "concluida" && !reviewed.has(reservation.id));
  }, [reservas, rows]);

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

  const requestReview = async (reservation: Reserva) => {
    setReviewPendingId(reservation.id);
    const result = await getReservaReviewLink(reservation.id);
    setReviewPendingId(null);
    if ("error" in result) {
      const messages: Record<string, string> = {
        already_submitted: "Este cliente já enviou a avaliação.",
        reservation_not_completed: "A reserva ainda não está concluída.",
        no_reviewable_tours: "Não foi encontrado um passeio válido nesta reserva.",
        short_link_create_failed: "Não foi possível gerar o link curto. Tente novamente.",
      };
      toast.error(messages[result.error] || "Não foi possível gerar o link de avaliação.");
      return;
    }
    const reviewUrl = buildShortReviewUrl(result.shortCode);
    const message = buildReviewWhatsAppMessage(reviewUrl, reservation.nome, reservation.idioma_reserva || "pt");
    const phone = (reservation.telefone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Avaliações</h3>
          <p className="text-[11px] text-muted-foreground">Reservas concluídas aparecem abaixo para solicitar avaliação; novas avaliações permanecem ocultas até aprovação.</p>
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

      <section className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-turquoise-glow">Clientes aguardando avaliação ({pendingReservations.length})</h4>
        {pendingReservations.length === 0 ? (
          <div className="glass-card rounded-lg px-4 py-5 text-center text-xs text-muted-foreground">Nenhuma reserva concluída aguardando avaliação.</div>
        ) : (
          <div className="space-y-2">
            {pendingReservations.map((reservation) => (
              <div key={reservation.id} className="glass-card rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{reservation.nome}</p>
                  <p className="text-[11px] text-turquoise-glow">{reservation.destino}</p>
                </div>
                <Button type="button" size="sm" variant="outline" className="border-turquoise/40 text-[11px] text-turquoise hover:bg-turquoise/10" onClick={() => requestReview(reservation)} disabled={reviewPendingId === reservation.id}>
                  {reviewPendingId === reservation.id ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="mr-1.5 h-3.5 w-3.5" />}
                  Pedir avaliação
                </Button>
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

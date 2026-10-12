import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, CalendarCheck2, CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { fetchReservas, getReservaReviewLink, updateReservaStatus } from "@/lib/db";
import { buildReviewWhatsAppMessage, buildShortReviewUrl } from "@/lib/reviewInvite";
import { getFirstName } from "@/lib/firstName";
import { toast } from "sonner";

type StatusRow = "pendente" | "concluida";

type Reserva = {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  destino: string;
  data_viagem: string | null;
  passageiros: number | null;
  cupom_aplicado: string | null;
  valor_original: number | null;
  valor_com_desconto: number | null;
  idioma_reserva: string | null;
  status: string;
  created_at: string;
  whatsapp_solicitado_em?: string | null;
};

const normalizeStatus = (status: string): StatusRow =>
  ["concluida", "concluído"].includes((status || "").toLowerCase()) ? "concluida" : "pendente";

const reviewErrorMessages: Record<string, string> = {
  already_submitted: "Este cliente já enviou a avaliação.",
  reservation_not_sent_to_whatsapp: "O cliente ainda não clicou em enviar a reserva pelo WhatsApp.",
  no_reviewable_tours: "Não foi encontrado um passeio válido nesta reserva ou pacote.",
  short_link_create_failed: "Não foi possível validar o link após três tentativas. Clique novamente para tentar de novo.",
  review_schema_not_ready: "A atualização do banco de avaliações ainda não foi aplicada no Supabase/Lovable.",
  tour_lookup_failed: "Não foi possível validar os passeios deste pacote. Tente novamente.",
  invite_create_failed: "Não foi possível criar o convite. Clique novamente para tentar de novo.",
  invite_lookup_failed: "Não foi possível consultar o convite. Atualize e tente novamente.",
  invite_update_failed: "Não foi possível corrigir o vínculo dos passeios. Tente novamente.",
  link_verification_failed: "O link não passou na validação. Gere-o novamente.",
  unauthorized: "Sua sessão administrativa expirou. Entre novamente.",
};

export const ReservasSection = () => {
  const [rows, setRows] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [reviewPendingId, setReviewPendingId] = useState<string | null>(null);
  const schemaNotReady = rows.length > 0 && !Object.prototype.hasOwnProperty.call(rows[0], "whatsapp_solicitado_em");

  const load = async () => {
    setLoading(true);
    try {
      setRows(await fetchReservas(200));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleStatus = async (reservation: Reserva) => {
    const next: StatusRow = normalizeStatus(reservation.status) === "concluida" ? "pendente" : "concluida";
    setPendingId(reservation.id);
    setRows((current) => current.map((row) => row.id === reservation.id ? { ...row, status: next } : row));
    const ok = await updateReservaStatus(reservation.id, next);
    setPendingId(null);
    if (!ok) {
      toast.error("Não foi possível atualizar o status.");
      void load();
    } else {
      toast.success(next === "concluida" ? "Reserva marcada como concluída." : "Reserva marcada como pendente.");
    }
  };

  const requestReview = async (reservation: Reserva) => {
    // Abrir dentro do gesto do clique evita que o navegador bloqueie o WhatsApp
    // depois da resposta da Edge Function.
    const whatsappWindow = window.open("about:blank", "_blank");
    if (whatsappWindow) whatsappWindow.opener = null;
    setReviewPendingId(reservation.id);
    const result = await getReservaReviewLink(reservation.id);
    setReviewPendingId(null);

    if ("error" in result) {
      whatsappWindow?.close();
      toast.error(reviewErrorMessages[result.error] || "Não foi possível gerar o link de avaliação.");
      return;
    }

    const reviewUrl = buildShortReviewUrl(result.shortCode);
    const message = buildReviewWhatsAppMessage(reviewUrl, reservation.nome, reservation.idioma_reserva || "pt");
    const phone = (reservation.telefone || "").replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    if (whatsappWindow) {
      whatsappWindow.location.href = whatsappUrl;
      toast.success("Link individual validado e mensagem pronta no WhatsApp.");
      return;
    }

    try {
      await navigator.clipboard.writeText(message);
      toast.success("Link validado; a mensagem foi copiada porque o navegador bloqueou a nova janela.");
    } catch {
      toast.error(`Link validado: ${reviewUrl}`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Reservas</h3>
          <p className="text-[11px] text-muted-foreground">
            O status é independente da avaliação. O convite fica disponível somente após o cliente clicar em enviar pelo WhatsApp.
          </p>
          {schemaNotReady && (
            <p className="mt-1 text-[11px] font-semibold text-amber-200">
              O banco ainda não recebeu a migration do novo fluxo de avaliações; aplique-a no Supabase/Lovable.
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" className="border-turquoise/40" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </div>
      <div className="glass-card overflow-x-auto rounded-xl p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Pax</TableHead>
              <TableHead>Cupom</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Avaliação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="py-6 text-center text-muted-foreground">
                <CalendarCheck2 className="mr-2 inline h-4 w-4" /> Nenhuma reserva ainda
              </TableCell></TableRow>
            ) : rows.map((reservation) => {
              const isDone = normalizeStatus(reservation.status) === "concluida";
              const canRequestReview = Boolean(reservation.whatsapp_solicitado_em);
              return (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{getFirstName(reservation.nome)}</TableCell>
                  <TableCell className="font-mono text-xs">{reservation.telefone}</TableCell>
                  <TableCell className="text-xs">{reservation.destino}</TableCell>
                  <TableCell className="text-xs">{reservation.data_viagem || "—"}</TableCell>
                  <TableCell className="text-xs">{reservation.passageiros ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{reservation.cupom_aplicado || "—"}</TableCell>
                  <TableCell className="text-xs">
                    {reservation.valor_com_desconto != null ? `R$ ${reservation.valor_com_desconto}` : (reservation.valor_original != null ? `R$ ${reservation.valor_original}` : "—")}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => void toggleStatus(reservation)}
                      disabled={pendingId === reservation.id}
                      title="Clique para alternar status"
                      className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
                        isDone
                          ? "border-emerald-500/40 bg-emerald-700/30 text-emerald-200 hover:bg-emerald-700/40"
                          : "border-amber-400/40 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {isDone ? "Concluída" : "Pendente"}
                    </button>
                  </TableCell>
                  <TableCell>
                    {canRequestReview ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void requestReview(reservation)}
                        disabled={reviewPendingId === reservation.id}
                        className="h-8 whitespace-nowrap border-turquoise/40 text-[11px] text-turquoise hover:bg-turquoise/10"
                      >
                        {reviewPendingId === reservation.id
                          ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          : <MessageCircle className="mr-1.5 h-3.5 w-3.5" />}
                        Pedir avaliação
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Aguardando clique no WhatsApp</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

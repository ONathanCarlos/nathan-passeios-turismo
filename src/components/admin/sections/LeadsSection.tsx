// ============================================================
// Leads — listagem dos leads capturados pelo site
// ============================================================
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MessageCircle, RefreshCw, Users } from "lucide-react";
import { createReviewReservationFromLead, fetchLeads } from "@/lib/db";
import { toast } from "sonner";

type Lead = { id: string; nome: string; telefone: string; email: string | null; origem: string | null; created_at: string };

export const LeadsSection = () => {
  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const load = async () => {
    setLoading(true);
    setRows(await fetchLeads(300));
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const canPrepareReview = (name: string) => {
    const firstName = name.trim().split(/\s+/)[0].toLocaleLowerCase("pt-BR");
    return firstName === "ketelem" || firstName === "deiviti";
  };

  const prepareReview = async (lead: Lead) => {
    setPromotingId(lead.id);
    const result = await createReviewReservationFromLead(lead.id, "escuna");
    setPromotingId(null);
    if (!result.ok) {
      toast.error("Não foi possível preparar a avaliação.");
      return;
    }
    toast.success(result.existing
      ? `${lead.nome} já tinha uma reserva de Escuna; avaliação liberada.`
      : `${lead.nome} foi adicionado às reservas concluídas de Escuna.`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Leads</h3>
          <p className="text-[11px] text-muted-foreground">Contatos capturados via formulários e cupons do site.</p>
        </div>
        <Button variant="outline" size="sm" className="border-turquoise/40" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </div>
      <div className="glass-card rounded-xl p-2 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Avaliação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                <Users className="h-4 w-4 inline mr-2" /> Nenhum lead ainda
              </TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.nome}</TableCell>
                <TableCell className="font-mono text-xs">{r.telefone}</TableCell>
                <TableCell className="text-xs">{r.email || "—"}</TableCell>
                <TableCell className="text-xs">{r.origem || "—"}</TableCell>
                <TableCell className="text-xs">{new Date(r.created_at).toLocaleString("pt-BR")}</TableCell>
                <TableCell>
                  {canPrepareReview(r.nome) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 whitespace-nowrap border-turquoise/40 text-[11px] text-turquoise hover:bg-turquoise/10"
                      onClick={() => prepareReview(r)}
                      disabled={promotingId === r.id}
                    >
                      {promotingId === r.id ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="mr-1.5 h-3.5 w-3.5" />}
                      Preparar Escuna
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

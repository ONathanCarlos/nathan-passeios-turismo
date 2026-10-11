// ============================================================
// Leads — listagem dos leads capturados pelo site
// ============================================================
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MessageCircle, RefreshCw, Users } from "lucide-react";
import { fetchLeads } from "@/lib/db";
import { recoverLeadForReview } from "@/lib/db";
import { useTours } from "@/lib/cms";
import { buildReviewWhatsAppMessage, buildShortReviewUrl } from "@/lib/reviewInvite";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Lead = { id: string; nome: string; telefone: string; email: string | null; origem: string | null; created_at: string };

export const LeadsSection = () => {
  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Record<string, string>>({});
  const [recovering, setRecovering] = useState<string | null>(null);
  const tours = useTours(false);
  const load = async () => {
    setLoading(true);
    setRows(await fetchLeads(300));
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const recover = async (lead: Lead) => {
    const destino = selectedTour[lead.id];
    if (!destino) {
      toast.error("Selecione o passeio realizado antes de pedir a avaliação.");
      return;
    }
    setRecovering(lead.id);
    const result = await recoverLeadForReview(lead.id, destino);
    setRecovering(null);
    if ("error" in result) {
      toast.error(result.error === "already_submitted" ? "Este cliente já enviou a avaliação." : "Não foi possível recuperar a reserva.");
      return;
    }
    const url = buildShortReviewUrl(result.shortCode);
    const message = buildReviewWhatsAppMessage(url, lead.nome, "pt");
    window.open(`https://wa.me/${lead.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    toast.success("Reserva recuperada e convite de avaliação preparado.");
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
              <TableHead>Ação</TableHead>
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
                  {/^marko$|^milena$/i.test(r.nome.trim()) ? (
                    <div className="flex min-w-[250px] items-center gap-2">
                      <Select value={selectedTour[r.id] || ""} onValueChange={(value) => setSelectedTour((current) => ({ ...current, [r.id]: value }))}>
                        <SelectTrigger className="h-8 w-36 text-[11px]"><SelectValue placeholder="Passeio" /></SelectTrigger>
                        <SelectContent>{(tours.data || []).filter((tour) => tour.ativo !== false).map((tour) => <SelectItem key={tour.nome_pt} value={tour.nome_pt}>{tour.nome_pt}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button type="button" size="sm" className="h-8 text-[11px]" onClick={() => recover(r)} disabled={recovering === r.id}>
                        <MessageCircle className="mr-1 h-3.5 w-3.5" /> {recovering === r.id ? "Preparando…" : "Pedir avaliação"}
                      </Button>
                    </div>
                  ) : <span className="text-[11px] text-muted-foreground">—</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

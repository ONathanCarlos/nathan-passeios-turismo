// ============================================================
// Reservas — listagem + alternância de status (Pendente/Concluída)
// ============================================================
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, CalendarCheck2, CheckCircle2, Clock } from "lucide-react";
import { subscribeAdminRealtime, updateReservaStatus } from "@/lib/db";
import { toast } from "sonner";

type StatusRow = "pendente" | "concluida";

type Reserva = {
  id: string; nome: string; telefone: string; email: string | null;
  destino: string; data_viagem: string | null; passageiros: number | null;
  cupom_aplicado: string | null; valor_original: number | null;
  valor_com_desconto: number | null; status: string; created_at: string;
};

const normalizeStatus = (s: string): StatusRow =>
  (s || "").toLowerCase() === "concluida" || (s || "").toLowerCase() === "concluído" || (s || "").toLowerCase() === "concluida"
    ? "concluida"
    : "pendente";

export const ReservasSection = () => {
  const [rows, setRows] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("reservas").select("*").order("created_at", { ascending: false }).limit(200);
    setRows((data || []) as Reserva[]);
    setLoading(false);
  };
  useEffect(() => {
    load();
    return subscribeAdminRealtime(load);
  }, []);

  const toggleStatus = async (r: Reserva) => {
    const next: StatusRow = normalizeStatus(r.status) === "concluida" ? "pendente" : "concluida";
    setPendingId(r.id);
    // Atualização otimista
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
    const ok = await updateReservaStatus(r.id, next);
    setPendingId(null);
    if (!ok) {
      toast.error("Não foi possível atualizar o status");
      load();
    } else {
      toast.success(next === "concluida" ? "Reserva marcada como concluída" : "Reserva marcada como pendente");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Reservas</h3>
          <p className="text-[11px] text-muted-foreground">
            Clique no status para alternar entre <strong>Pendente</strong> e <strong>Concluída</strong>.
          </p>
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
              <TableHead>Destino</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Pax</TableHead>
              <TableHead>Cupom</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                <CalendarCheck2 className="h-4 w-4 inline mr-2" /> Nenhuma reserva ainda
              </TableCell></TableRow>
            ) : rows.map((r) => {
              const st = normalizeStatus(r.status);
              const isDone = st === "concluida";
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.nome}</TableCell>
                  <TableCell className="font-mono text-xs">{r.telefone}</TableCell>
                  <TableCell className="text-xs">{r.destino}</TableCell>
                  <TableCell className="text-xs">{r.data_viagem || "—"}</TableCell>
                  <TableCell className="text-xs">{r.passageiros ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{r.cupom_aplicado || "—"}</TableCell>
                  <TableCell className="text-xs">
                    {r.valor_com_desconto != null ? `R$ ${r.valor_com_desconto}` : (r.valor_original != null ? `R$ ${r.valor_original}` : "—")}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => toggleStatus(r)}
                      disabled={pendingId === r.id}
                      title="Clique para alternar status"
                      className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded transition-colors disabled:opacity-50 ${
                        isDone
                          ? "bg-emerald-700/30 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-700/40"
                          : "bg-amber-500/20 text-amber-200 border border-amber-400/40 hover:bg-amber-500/30"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {isDone ? "Concluída" : "Pendente"}
                    </button>
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

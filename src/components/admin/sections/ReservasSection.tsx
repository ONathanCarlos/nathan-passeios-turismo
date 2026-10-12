import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, CalendarCheck2, CheckCircle2, Clock } from "lucide-react";
import { fetchReservas, updateReservaStatus, type Reserva } from "@/lib/db";
import { getFirstName } from "@/lib/firstName";
import { toast } from "sonner";

type StatusRow = "pendente" | "concluida";

const normalizeStatus = (status: string): StatusRow =>
  ["concluida", "concluído"].includes((status || "").toLowerCase()) ? "concluida" : "pendente";

export const ReservasSection = () => {
  const [rows, setRows] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Reservas</h3>
          <p className="text-[11px] text-muted-foreground">Reservas recebidas pelo site e status do atendimento.</p>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                  <CalendarCheck2 className="mr-2 inline h-4 w-4" /> Nenhuma reserva ainda
                </TableCell>
              </TableRow>
            ) : rows.map((reservation) => {
              const isDone = normalizeStatus(reservation.status) === "concluida";
              return (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{getFirstName(reservation.nome)}</TableCell>
                  <TableCell className="font-mono text-xs">{reservation.telefone}</TableCell>
                  <TableCell className="text-xs">{reservation.destino}</TableCell>
                  <TableCell className="text-xs">{reservation.data_viagem || "—"}</TableCell>
                  <TableCell className="text-xs">{reservation.passageiros ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{reservation.cupom_aplicado || "—"}</TableCell>
                  <TableCell className="text-xs">
                    {reservation.valor_com_desconto != null
                      ? `R$ ${reservation.valor_com_desconto}`
                      : reservation.valor_original != null ? `R$ ${reservation.valor_original}` : "—"}
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// ============================================================
// Reservas — listagem read-only das reservas no Supabase
// ============================================================
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, CalendarCheck2 } from "lucide-react";

type Reserva = {
  id: string; nome: string; telefone: string; email: string | null;
  destino: string; data_viagem: string | null; passageiros: number | null;
  cupom_aplicado: string | null; valor_original: number | null;
  valor_com_desconto: number | null; status: string; created_at: string;
};

export const ReservasSection = () => {
  const [rows, setRows] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("reservas").select("*").order("created_at", { ascending: false }).limit(200);
    setRows((data || []) as Reserva[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Reservas</h3>
          <p className="text-[11px] text-muted-foreground">Solicitações de reserva recebidas pelo site.</p>
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
            ) : rows.map((r) => (
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
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    r.status === "confirmado" ? "bg-emerald-500/20 text-emerald-300" :
                    r.status === "cancelado" ? "bg-rose-500/20 text-rose-300" :
                    "bg-amber-500/20 text-amber-300"
                  }`}>{r.status}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

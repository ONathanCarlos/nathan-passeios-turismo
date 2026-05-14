import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { fetchAdminStats, fetchAdminTable, AdminRow, subscribeAdminRealtime } from "@/lib/db";
import { RefreshCw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DbAdminTab = () => {
  const [stats, setStats] = useState({
    totalLeads: 0, cuponsAtivos: 0, reservasPendentes: 0, totalReservas: 0, conversao: 0,
  });
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([fetchAdminStats(), fetchAdminTable(100)]);
      setStats(s);
      setRows(r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return subscribeAdminRealtime(load);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card label="Leads totais" value={stats.totalLeads} />
        <Card label="Cupons ativos" value={stats.cuponsAtivos} />
        <Card label="Reservas pendentes" value={stats.reservasPendentes} />
        <Card label="Conversão" value={`${stats.conversao}%`} />
      </div>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="border-turquoise/40"
          onClick={load} disabled={loading}>
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
              <TableHead>Cupom</TableHead>
              <TableHead>Reserva</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  <Database className="h-4 w-4 inline mr-2" /> Nenhum registro ainda
                </TableCell>
              </TableRow>
            ) : rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{r.nome}</TableCell>
                <TableCell className="font-mono text-xs">{r.telefone}</TableCell>
                <TableCell className="text-xs">{r.email || "—"}</TableCell>
                <TableCell className="font-mono text-xs">{r.cupom || "—"}</TableCell>
                <TableCell className="text-xs">{r.reserva || "—"}</TableCell>
                <TableCell>
                  {r.status ? (
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      r.status === "confirmado" ? "bg-emerald-500/20 text-emerald-300" :
                      r.status === "cancelado" ? "bg-rose-500/20 text-rose-300" :
                      "bg-amber-500/20 text-amber-300"
                    }`}>{r.status}</span>
                  ) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const Card = ({ label, value }: { label: string; value: number | string }) => (
  <div className="glass-card rounded-xl p-3">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="text-2xl font-extrabold bg-gradient-to-r from-turquoise to-turquoise-glow bg-clip-text text-transparent">
      {value}
    </div>
  </div>
);

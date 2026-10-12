import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users } from "lucide-react";
import { fetchLeads } from "@/lib/db";

type Lead = { id: string; nome: string; telefone: string; email: string | null; origem: string | null; created_at: string };

export const LeadsSection = () => {
  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setRows(await fetchLeads(300));
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Leads</h3>
          <p className="text-[11px] text-muted-foreground">Contatos capturados via formulários e cupons do site.</p>
        </div>
        <Button variant="outline" size="sm" className="border-turquoise/40" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Atualizar
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                <Users className="mr-2 inline h-4 w-4" /> Nenhum lead ainda
              </TableCell></TableRow>
            ) : rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.nome}</TableCell>
                <TableCell className="font-mono text-xs">{row.telefone}</TableCell>
                <TableCell className="text-xs">{row.email || "—"}</TableCell>
                <TableCell className="text-xs">{row.origem || "—"}</TableCell>
                <TableCell className="text-xs">{new Date(row.created_at).toLocaleString("pt-BR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

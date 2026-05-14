// ============================================================
// Leads — listagem dos leads capturados pelo site
// ============================================================
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users } from "lucide-react";
import { subscribeAdminRealtime } from "@/lib/db";

type Lead = { id: string; nome: string; telefone: string; email: string | null; origem: string | null; created_at: string };

export const LeadsSection = () => {
  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(300);
    setRows((data || []) as Lead[]);
    setLoading(false);
  };
  useEffect(() => {
    load();
    return subscribeAdminRealtime(load);
  }, []);

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                <Users className="h-4 w-4 inline mr-2" /> Nenhum lead ainda
              </TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.nome}</TableCell>
                <TableCell className="font-mono text-xs">{r.telefone}</TableCell>
                <TableCell className="text-xs">{r.email || "—"}</TableCell>
                <TableCell className="text-xs">{r.origem || "—"}</TableCell>
                <TableCell className="text-xs">{new Date(r.created_at).toLocaleString("pt-BR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

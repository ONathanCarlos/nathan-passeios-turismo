// ============================================================
// CMS Health — diagnóstico de persistência (Lovable Cloud)
// Mostra: status de conexão, última sincronização do cmsCache,
// e contagem por tabela administrável. Fonte única: Supabase.
// ============================================================
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subscribeCmsCache, forceRefreshCms } from "@/lib/cmsCache";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RefreshCw, Database, Wifi } from "lucide-react";

type Status = "checking" | "ok" | "error";

const TABLES = ["tours", "modais", "config_global", "home_content", "depoimentos"] as const;

export const CmsHealth = () => {
  const [conn, setConn] = useState<Status>("checking");
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);

  const ping = async () => {
    setBusy(true);
    setConn("checking");
    try {
      const results = await Promise.all(
        TABLES.map((t) => supabase.from(t as any).select("*", { count: "exact", head: true }))
      );
      const next: Record<string, number | null> = {};
      let anyError = false;
      results.forEach((r, i) => {
        if (r.error) { anyError = true; next[TABLES[i]] = null; }
        else next[TABLES[i]] = r.count ?? 0;
      });
      setCounts(next);
      setConn(anyError ? "error" : "ok");
      setLastSync(new Date());
    } catch {
      setConn("error");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    ping();
    const unsub = subscribeCmsCache(() => setLastSync(new Date()));
    return () => unsub();
  }, []);

  const refreshAll = async () => {
    setBusy(true);
    try {
      await Promise.all([forceRefreshCms.tours(), forceRefreshCms.config(), forceRefreshCms.modais()]);
      await ping();
    } finally { setBusy(false); }
  };

  const StatusIcon = conn === "ok" ? CheckCircle2 : conn === "error" ? XCircle : RefreshCw;
  const statusColor = conn === "ok" ? "text-emerald-400" : conn === "error" ? "text-red-400" : "text-muted-foreground";
  const statusLabel = conn === "ok" ? "Conectado" : conn === "error" ? "Falha de conexão" : "Verificando…";

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-turquoise-glow/70" />
          <h3 className="text-sm font-bold text-foreground">Diagnóstico de persistência</h3>
        </div>
        <Button variant="outline" size="sm" className="border-turquoise/40" onClick={refreshAll} disabled={busy}>
          <RefreshCw className={`h-3 w-3 mr-1 ${busy ? "animate-spin" : ""}`} /> Sincronizar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 rounded-lg bg-background/40 px-3 py-2">
          <Wifi className={`h-3.5 w-3.5 ${statusColor}`} />
          <span className="text-muted-foreground">Backend:</span>
          <span className={`font-semibold ${statusColor} flex items-center gap-1`}>
            <StatusIcon className={`h-3 w-3 ${conn === "checking" ? "animate-spin" : ""}`} />
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-background/40 px-3 py-2">
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Última sincronização:</span>
          <span className="font-semibold text-foreground">
            {lastSync ? lastSync.toLocaleTimeString("pt-BR") : "—"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {TABLES.map((t) => {
          const c = counts[t];
          const ok = c !== null && c !== undefined;
          return (
            <div key={t} className="rounded-lg bg-background/40 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t}</div>
              <div className={`text-sm font-bold ${ok ? "text-foreground" : "text-red-400"}`}>
                {ok ? `${c} ${c === 1 ? "registro" : "registros"}` : "erro"}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Fonte única de verdade: <b>Lovable Cloud</b>. Toda alteração feita no CMS é persistida diretamente no banco e propagada em tempo real ao site público — sem dependência de localStorage para conteúdo administrativo.
      </p>
    </div>
  );
};

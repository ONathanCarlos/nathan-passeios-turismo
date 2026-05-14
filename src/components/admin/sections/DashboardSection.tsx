// ============================================================
// Dashboard — visão geral consolidada (leads, cupons, reservas)
// ============================================================
import { useEffect, useState } from "react";
import { fetchAdminStats, subscribeAdminRealtime } from "@/lib/db";
import { RefreshCw, Users, Ticket, CalendarCheck2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CmsHealth } from "../CmsHealth";

const Card = ({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) => (
  <div className="glass-card rounded-xl p-4">
    <div className="flex items-center justify-between">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <Icon className="h-4 w-4 text-turquoise-glow/70" />
    </div>
    <div className="text-2xl font-extrabold bg-gradient-to-r from-turquoise to-turquoise-glow bg-clip-text text-transparent mt-1">
      {value}
    </div>
  </div>
);

export const DashboardSection = () => {
  const [stats, setStats] = useState({ totalLeads: 0, cuponsAtivos: 0, reservasPendentes: 0, totalReservas: 0, conversao: 0 });
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); try { setStats(await fetchAdminStats()); } finally { setLoading(false); } };
  useEffect(() => {
    load();
    return subscribeAdminRealtime(load);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Visão geral</h3>
          <p className="text-[11px] text-muted-foreground">Resumo dos dados do site em tempo real.</p>
        </div>
        <Button variant="outline" size="sm" className="border-turquoise/40" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card label="Leads totais" value={stats.totalLeads} icon={Users} />
        <Card label="Cupons ativos" value={stats.cuponsAtivos} icon={Ticket} />
        <Card label="Reservas pendentes" value={stats.reservasPendentes} icon={CalendarCheck2} />
        <Card label="Conversão" value={`${stats.conversao}%`} icon={TrendingUp} />
      </div>
      <CmsHealth />
      <div className="glass-card rounded-xl p-4 text-xs text-muted-foreground">
        Use as abas <b>Reservas</b> e <b>Leads</b> para detalhes individuais. Todas as edições de conteúdo do site acontecem nas demais abas deste painel.
      </div>
    </div>
  );
};

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SuperadminLayout } from "@/components/superadmin/SuperadminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Shield, Activity, TrendingUp, AlertCircle, Package, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--muted))", "hsl(var(--accent))"];

const statusLabels: Record<string, string> = {
  active: "Ativo",
  suspended: "Suspenso",
  cancelled: "Cancelado",
  trial: "Trial",
};

const planLabels: Record<string, string> = {
  trial: "Trial",
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
};

export default function SuperadminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["superadmin-stats"],
    queryFn: async () => {
      const [tenantsRes, profilesRes, rolesRes, ticketsRes, ordersRes] = await Promise.all([
        supabase.from("tenants").select("status, plan"),
        supabase.from("profiles").select("is_active", { count: "exact" }),
        supabase.from("user_roles").select("role", { count: "exact" }),
        supabase.from("support_tickets").select("status", { count: "exact" }),
        supabase.from("orders").select("total, created_at"),
      ]);

      const tenantsByStatus: Record<string, number> = {};
      const tenantsByPlan: Record<string, number> = {};
      
      tenantsRes.data?.forEach((t) => {
        tenantsByStatus[t.status] = (tenantsByStatus[t.status] || 0) + 1;
        tenantsByPlan[t.plan] = (tenantsByPlan[t.plan] || 0) + 1;
      });

      const activeUsers = profilesRes.data?.filter((p) => p.is_active).length || 0;
      const openTickets = ticketsRes.data?.filter((t) => t.status === "open" || t.status === "in_progress").length || 0;
      
      const totalRevenue = ordersRes.data?.reduce((acc, o) => acc + Number(o.total || 0), 0) || 0;

      return {
        tenants: tenantsRes.data?.length || 0,
        users: profilesRes.count || 0,
        activeUsers,
        roles: rolesRes.count || 0,
        openTickets,
        totalTickets: ticketsRes.count || 0,
        totalRevenue,
        totalOrders: ordersRes.data?.length || 0,
        tenantsByStatus,
        tenantsByPlan,
      };
    },
  });

  const { data: revenueChart } = useQuery({
    queryKey: ["superadmin-revenue-chart"],
    queryFn: async () => {
      const days = 14;
      const startDate = subDays(new Date(), days - 1);

      const { data } = await supabase
        .from("orders")
        .select("total, created_at")
        .gte("created_at", startOfDay(startDate).toISOString());

      const dailyData: Record<string, number> = {};
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
        dailyData[date] = 0;
      }

      data?.forEach((order) => {
        const date = format(new Date(order.created_at), "yyyy-MM-dd");
        if (dailyData[date] !== undefined) {
          dailyData[date] += Number(order.total || 0);
        }
      });

      return Object.entries(dailyData).map(([date, total]) => ({
        date: format(new Date(date), "dd/MM", { locale: ptBR }),
        total,
      }));
    },
  });

  const { data: recentTenants } = useQuery({
    queryKey: ["recent-tenants"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tenants")
        .select("id, name, slug, status, plan, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data;
    },
  });

  const { data: recentTickets } = useQuery({
    queryKey: ["recent-tickets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("support_tickets")
        .select(`
          id, subject, status, priority, created_at,
          tenants(name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);
      return data;
    },
  });

  const planChartData = stats?.tenantsByPlan
    ? Object.entries(stats.tenantsByPlan).map(([name, value]) => ({
        name: planLabels[name] || name,
        value,
      }))
    : [];

  const statCards = [
    {
      title: "Total Tenants",
      value: stats?.tenants ?? 0,
      icon: Building2,
      description: `${stats?.tenantsByStatus?.["active"] || 0} ativos`,
    },
    {
      title: "Total Usuários",
      value: stats?.users ?? 0,
      icon: Users,
      description: `${stats?.activeUsers || 0} ativos`,
    },
    {
      title: "Receita Total",
      value: `R$ ${(stats?.totalRevenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: `${stats?.totalOrders || 0} pedidos`,
      accent: true,
    },
    {
      title: "Tickets Abertos",
      value: stats?.openTickets ?? 0,
      icon: AlertCircle,
      description: `${stats?.totalTickets || 0} total`,
      alert: (stats?.openTickets || 0) > 0,
    },
  ];

  const ticketStatusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
    open: { variant: "destructive" },
    in_progress: { variant: "default" },
    resolved: { variant: "secondary" },
    closed: { variant: "outline" },
  };

  const priorityConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
    urgent: { variant: "destructive" },
    high: { variant: "default" },
    medium: { variant: "secondary" },
    low: { variant: "outline" },
  };

  return (
    <SuperadminLayout title="Dashboard" description="Visão geral do sistema">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className={`border-border ${stat.accent ? "bg-primary/5 border-primary/20" : ""} ${stat.alert ? "border-destructive/50" : ""}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.accent ? "text-primary" : stat.alert ? "text-destructive" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className={`text-2xl font-bold ${stat.accent ? "text-primary" : stat.alert ? "text-destructive" : "text-foreground"}`}>
                    {stat.value}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-border">
            <CardHeader>
              <CardTitle>Receita dos Últimos 14 Dias</CardTitle>
              <CardDescription>Receita total do sistema</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {revenueChart && revenueChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChart}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" tickFormatter={(v) => `R$${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Receita"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3 border-border">
            <CardHeader>
              <CardTitle>Tenants por Plano</CardTitle>
              <CardDescription>Distribuição de planos</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {planChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {planChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Items */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Tenants Recentes</CardTitle>
              <CardDescription>Últimas empresas cadastradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTenants?.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">{tenant.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{planLabels[tenant.plan] || tenant.plan}</Badge>
                      <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
                        {statusLabels[tenant.status] || tenant.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!recentTenants || recentTenants.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum tenant encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Tickets Recentes</CardTitle>
              <CardDescription>Últimos tickets de suporte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTickets?.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">{(ticket.tenants as any)?.name || "-"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={priorityConfig[ticket.priority]?.variant || "outline"}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant={ticketStatusConfig[ticket.status]?.variant || "outline"}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!recentTickets || recentTickets.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum ticket encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SuperadminLayout>
  );
}

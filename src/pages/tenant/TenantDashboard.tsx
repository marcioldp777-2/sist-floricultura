import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, Users, DollarSign, Clock, CheckCircle, TrendingUp, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  in_production: { label: "Em Produção", variant: "default" },
  ready: { label: "Pronto", variant: "default" },
  out_for_delivery: { label: "Em Entrega", variant: "default" },
  delivered: { label: "Entregue", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

export default function TenantDashboard() {
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["tenant-stats", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();

      const [ordersRes, productsRes, customersRes, teamRes, todayOrdersRes, pendingOrdersRes, locationsRes] = await Promise.all([
        supabase.from("orders").select("total, status", { count: "exact" }).eq("tenant_id", tenantId),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("is_active", true),
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase
          .from("orders")
          .select("total", { count: "exact" })
          .eq("tenant_id", tenantId)
          .gte("created_at", todayStart)
          .lte("created_at", todayEnd),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .in("status", ["pending", "confirmed", "in_production"]),
        supabase.from("locations").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("is_active", true),
      ]);

      const totalRevenue = ordersRes.data?.reduce((acc, o) => acc + Number(o.total || 0), 0) || 0;
      const todayRevenue = todayOrdersRes.data?.reduce((acc, o) => acc + Number(o.total || 0), 0) || 0;
      const deliveredOrders = ordersRes.data?.filter((o) => o.status === "delivered").length || 0;

      return {
        totalOrders: ordersRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalCustomers: customersRes.count || 0,
        teamMembers: teamRes.count || 0,
        todayOrders: todayOrdersRes.count || 0,
        pendingOrders: pendingOrdersRes.count || 0,
        totalRevenue,
        todayRevenue,
        deliveredOrders,
        totalLocations: locationsRes.count || 0,
      };
    },
    enabled: !!tenantId,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["recent-orders", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, order_number, total, status, created_at, delivery_type,
          customers:customer_id (name)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const { data: chartData } = useQuery({
    queryKey: ["sales-chart", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const days = 7;
      const startDate = subDays(new Date(), days - 1);

      const { data, error } = await supabase
        .from("orders")
        .select("total, created_at")
        .eq("tenant_id", tenantId)
        .gte("created_at", startOfDay(startDate).toISOString());

      if (error) throw error;

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
        date: format(new Date(date), "EEE", { locale: ptBR }),
        total,
      }));
    },
    enabled: !!tenantId,
  });

  const { data: recentCustomers } = useQuery({
    queryKey: ["recent-customers", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("customers")
        .select("id, name, phone, created_at")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const statCards = [
    {
      title: "Receita Hoje",
      value: `R$ ${(stats?.todayRevenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: `${stats?.todayOrders ?? 0} pedidos hoje`,
      accent: true,
    },
    {
      title: "Pedidos Pendentes",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      description: "Aguardando processamento",
    },
    {
      title: "Clientes",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      description: "Cadastrados no sistema",
    },
    {
      title: "Produtos Ativos",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      description: "No catálogo",
    },
    {
      title: "Locais",
      value: stats?.totalLocations ?? 0,
      icon: MapPin,
      description: "Lojas e pontos",
    },
    {
      title: "Receita Total",
      value: `R$ ${(stats?.totalRevenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      description: `${stats?.totalOrders ?? 0} pedidos`,
    },
  ];

  if (!tenantId) {
    return (
      <TenantLayout title="Dashboard" description="Visão geral da sua loja">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Você não está associado a nenhum tenant. Contate o administrador.
          </p>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout title="Dashboard" description="Visão geral da sua loja">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className={`border-border ${stat.accent ? "bg-primary/5 border-primary/20" : ""}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.accent ? "text-primary" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className={`text-2xl font-bold ${stat.accent ? "text-primary" : "text-foreground"}`}>{stat.value}</div>
                )}
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Recent Data */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Sales Chart */}
          <Card className="col-span-4 border-border">
            <CardHeader>
              <CardTitle>Vendas dos Últimos 7 Dias</CardTitle>
              <CardDescription>Receita diária em R$</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#colorTotal)"
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

          {/* Recent Orders */}
          <Card className="col-span-3 border-border">
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
              <CardDescription>Últimos 5 pedidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders?.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{order.order_number}</span>
                        <Badge variant={statusLabels[order.status]?.variant || "secondary"}>
                          {statusLabels[order.status]?.label || order.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {(order.customers as any)?.name || "Cliente não informado"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        R$ {Number(order.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), "dd/MM HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
                {(!recentOrders || recentOrders.length === 0) && (
                  <div className="text-center text-muted-foreground py-4">
                    Nenhum pedido encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Customers */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Clientes Recentes</CardTitle>
              <CardDescription>Últimos 5 clientes cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCustomers?.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.phone || "Sem telefone"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(customer.created_at), "dd/MM/yyyy")}
                    </p>
                  </div>
                ))}
                {(!recentCustomers || recentCustomers.length === 0) && (
                  <div className="text-center text-muted-foreground py-4">
                    Nenhum cliente encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>Métricas gerais do negócio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ticket Médio</span>
                  <span className="font-medium">
                    R$ {stats?.totalOrders ? ((stats.totalRevenue || 0) / stats.totalOrders).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "0,00"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pedidos Entregues</span>
                  <span className="font-medium">{stats?.deliveredOrders ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Taxa de Conclusão</span>
                  <span className="font-medium">
                    {stats?.totalOrders ? Math.round(((stats.deliveredOrders || 0) / stats.totalOrders) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Membros da Equipe</span>
                  <span className="font-medium">{stats?.teamMembers ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TenantLayout>
  );
}

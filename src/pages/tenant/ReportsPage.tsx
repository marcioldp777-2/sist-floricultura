import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Truck,
  Store,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, eachDayOfInterval, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  in_production: "Em Produção",
  ready: "Pronto",
  out_for_delivery: "Em Entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

type PeriodType = "7d" | "30d" | "90d" | "12m";

export default function ReportsPage() {
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;
  const [period, setPeriod] = useState<PeriodType>("30d");

  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case "7d":
        return { start: subDays(now, 7), end: now };
      case "30d":
        return { start: subDays(now, 30), end: now };
      case "90d":
        return { start: subDays(now, 90), end: now };
      case "12m":
        return { start: subMonths(now, 12), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const { start, end } = getDateRange();

  // Main metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["reports-metrics", tenantId, period],
    queryFn: async () => {
      if (!tenantId) return null;

      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, total, subtotal, delivery_fee, discount, status, delivery_type, created_at")
        .eq("tenant_id", tenantId)
        .gte("created_at", startOfDay(start).toISOString())
        .lte("created_at", endOfDay(end).toISOString());

      if (error) throw error;

      const totalRevenue = orders?.reduce((acc, o) => acc + Number(o.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const deliveredOrders = orders?.filter((o) => o.status === "delivered").length || 0;
      const cancelledOrders = orders?.filter((o) => o.status === "cancelled").length || 0;
      const deliveryOrders = orders?.filter((o) => o.delivery_type === "delivery").length || 0;
      const pickupOrders = orders?.filter((o) => o.delivery_type === "pickup").length || 0;
      const deliveryFees = orders?.reduce((acc, o) => acc + Number(o.delivery_fee || 0), 0) || 0;
      const discounts = orders?.reduce((acc, o) => acc + Number(o.discount || 0), 0) || 0;

      // Previous period for comparison
      const prevStart = period === "12m" ? subMonths(start, 12) : subDays(start, period === "7d" ? 7 : period === "30d" ? 30 : 90);
      const prevEnd = subDays(start, 1);

      const { data: prevOrders } = await supabase
        .from("orders")
        .select("total")
        .eq("tenant_id", tenantId)
        .gte("created_at", startOfDay(prevStart).toISOString())
        .lte("created_at", endOfDay(prevEnd).toISOString());

      const prevRevenue = prevOrders?.reduce((acc, o) => acc + Number(o.total || 0), 0) || 0;
      const prevOrderCount = prevOrders?.length || 0;

      const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
      const orderGrowth = prevOrderCount > 0 ? ((totalOrders - prevOrderCount) / prevOrderCount) * 100 : 0;

      return {
        totalRevenue,
        totalOrders,
        avgTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        deliveredOrders,
        cancelledOrders,
        deliveryOrders,
        pickupOrders,
        deliveryFees,
        discounts,
        revenueGrowth,
        orderGrowth,
        conversionRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0,
        cancelRate: totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0,
      };
    },
    enabled: !!tenantId,
  });

  // Sales over time
  const { data: salesChart } = useQuery({
    queryKey: ["reports-sales-chart", tenantId, period],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("orders")
        .select("total, created_at")
        .eq("tenant_id", tenantId)
        .gte("created_at", startOfDay(start).toISOString())
        .lte("created_at", endOfDay(end).toISOString());

      if (error) throw error;

      if (period === "12m") {
        const months = eachMonthOfInterval({ start, end });
        const monthlyData: Record<string, number> = {};
        months.forEach((m) => {
          monthlyData[format(m, "yyyy-MM")] = 0;
        });

        data?.forEach((order) => {
          const key = format(new Date(order.created_at), "yyyy-MM");
          if (monthlyData[key] !== undefined) {
            monthlyData[key] += Number(order.total || 0);
          }
        });

        return Object.entries(monthlyData).map(([date, total]) => ({
          date: format(new Date(date + "-01"), "MMM/yy", { locale: ptBR }),
          total,
        }));
      } else {
        const days = eachDayOfInterval({ start, end });
        const dailyData: Record<string, number> = {};
        days.forEach((d) => {
          dailyData[format(d, "yyyy-MM-dd")] = 0;
        });

        data?.forEach((order) => {
          const key = format(new Date(order.created_at), "yyyy-MM-dd");
          if (dailyData[key] !== undefined) {
            dailyData[key] += Number(order.total || 0);
          }
        });

        return Object.entries(dailyData).map(([date, total]) => ({
          date: format(new Date(date), period === "7d" ? "EEE" : "dd/MM", { locale: ptBR }),
          total,
        }));
      }
    },
    enabled: !!tenantId,
  });

  // Orders by status
  const { data: statusChart } = useQuery({
    queryKey: ["reports-status-chart", tenantId, period],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("tenant_id", tenantId)
        .gte("created_at", startOfDay(start).toISOString())
        .lte("created_at", endOfDay(end).toISOString());

      if (error) throw error;

      const statusCount: Record<string, number> = {};
      data?.forEach((order) => {
        statusCount[order.status] = (statusCount[order.status] || 0) + 1;
      });

      return Object.entries(statusCount).map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count,
      }));
    },
    enabled: !!tenantId,
  });

  // Top products
  const { data: topProducts } = useQuery({
    queryKey: ["reports-top-products", tenantId, period],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .eq("tenant_id", tenantId)
        .gte("created_at", startOfDay(start).toISOString())
        .lte("created_at", endOfDay(end).toISOString());

      if (ordersError) throw ordersError;

      const orderIds = orders?.map((o) => o.id) || [];
      if (orderIds.length === 0) return [];

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("product_name, quantity, total_price")
        .in("order_id", orderIds);

      if (itemsError) throw itemsError;

      const productStats: Record<string, { quantity: number; revenue: number }> = {};
      items?.forEach((item) => {
        if (!productStats[item.product_name]) {
          productStats[item.product_name] = { quantity: 0, revenue: 0 };
        }
        productStats[item.product_name].quantity += item.quantity;
        productStats[item.product_name].revenue += Number(item.total_price || 0);
      });

      return Object.entries(productStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    },
    enabled: !!tenantId,
  });

  // Orders by hour
  const { data: hourlyData } = useQuery({
    queryKey: ["reports-hourly", tenantId, period],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("orders")
        .select("created_at")
        .eq("tenant_id", tenantId)
        .gte("created_at", startOfDay(start).toISOString())
        .lte("created_at", endOfDay(end).toISOString());

      if (error) throw error;

      const hourCount: Record<number, number> = {};
      for (let i = 0; i < 24; i++) {
        hourCount[i] = 0;
      }

      data?.forEach((order) => {
        const hour = new Date(order.created_at).getHours();
        hourCount[hour]++;
      });

      return Object.entries(hourCount).map(([hour, count]) => ({
        hour: `${hour}h`,
        orders: count,
      }));
    },
    enabled: !!tenantId,
  });

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    trendValue,
  }: {
    title: string;
    value: string | number;
    description?: string;
    icon: typeof DollarSign;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
  }) => (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {metricsLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="flex items-center gap-2 mt-1">
              {trend && trendValue && (
                <div className={`flex items-center text-xs ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"}`}>
                  {trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : trend === "down" ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                  {trendValue}
                </div>
              )}
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  if (!tenantId) {
    return (
      <TenantLayout title="Relatórios" description="Métricas e análises">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Você não está associado a nenhum tenant.</p>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout
      title="Relatórios"
      description="Métricas de vendas, pedidos e performance"
      actions={
        <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="12m">Últimos 12 meses</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="operations">Operações</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Main KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Receita Total"
              value={`R$ ${(metrics?.totalRevenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
              trend={metrics?.revenueGrowth ? (metrics.revenueGrowth > 0 ? "up" : metrics.revenueGrowth < 0 ? "down" : "neutral") : "neutral"}
              trendValue={metrics?.revenueGrowth ? `${metrics.revenueGrowth > 0 ? "+" : ""}${metrics.revenueGrowth.toFixed(1)}%` : undefined}
              description="vs período anterior"
            />
            <StatCard
              title="Total de Pedidos"
              value={metrics?.totalOrders ?? 0}
              icon={ShoppingCart}
              trend={metrics?.orderGrowth ? (metrics.orderGrowth > 0 ? "up" : metrics.orderGrowth < 0 ? "down" : "neutral") : "neutral"}
              trendValue={metrics?.orderGrowth ? `${metrics.orderGrowth > 0 ? "+" : ""}${metrics.orderGrowth.toFixed(1)}%` : undefined}
              description="vs período anterior"
            />
            <StatCard
              title="Ticket Médio"
              value={`R$ ${(metrics?.avgTicket ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={TrendingUp}
              description="Por pedido"
            />
            <StatCard
              title="Taxa de Conclusão"
              value={`${(metrics?.conversionRate ?? 0).toFixed(1)}%`}
              icon={CheckCircle}
              description={`${metrics?.deliveredOrders ?? 0} entregues`}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-4 border-border">
              <CardHeader>
                <CardTitle>Evolução de Vendas</CardTitle>
                <CardDescription>Receita ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {salesChart && salesChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesChart}>
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
                      <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">Nenhum dado disponível</div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3 border-border">
              <CardHeader>
                <CardTitle>Status dos Pedidos</CardTitle>
                <CardDescription>Distribuição por status</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {statusChart && statusChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusChart} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {statusChart.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">Nenhum dado disponível</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Entregas" value={metrics?.deliveryOrders ?? 0} icon={Truck} description={`R$ ${(metrics?.deliveryFees ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em taxas`} />
            <StatCard title="Retiradas" value={metrics?.pickupOrders ?? 0} icon={Store} description="Pedidos para retirada" />
            <StatCard title="Descontos" value={`R$ ${(metrics?.discounts ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={TrendingDown} description="Total concedido" />
            <StatCard title="Cancelamentos" value={`${(metrics?.cancelRate ?? 0).toFixed(1)}%`} icon={XCircle} description={`${metrics?.cancelledOrders ?? 0} pedidos`} />
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Receita Detalhada</CardTitle>
                <CardDescription>Composição da receita</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal de Produtos</span>
                    <span className="font-medium">R$ {((metrics?.totalRevenue ?? 0) + (metrics?.discounts ?? 0) - (metrics?.deliveryFees ?? 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Taxas de Entrega</span>
                    <span className="font-medium text-green-600">+ R$ {(metrics?.deliveryFees ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Descontos</span>
                    <span className="font-medium text-red-600">- R$ {(metrics?.discounts ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-medium">Receita Total</span>
                    <span className="font-bold text-lg">R$ {(metrics?.totalRevenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Métricas de Vendas</CardTitle>
                <CardDescription>Indicadores de performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Ticket Médio</span>
                    <span className="font-medium">R$ {(metrics?.avgTicket ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Pedidos/Dia (média)</span>
                    <span className="font-medium">{((metrics?.totalOrders ?? 0) / (period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365)).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Receita/Dia (média)</span>
                    <span className="font-medium">R$ {((metrics?.totalRevenue ?? 0) / (period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">% Entrega vs Retirada</span>
                    <span className="font-medium">
                      {metrics?.totalOrders ? Math.round((metrics.deliveryOrders / metrics.totalOrders) * 100) : 0}% / {metrics?.totalOrders ? Math.round((metrics.pickupOrders / metrics.totalOrders) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Top 10 Produtos</CardTitle>
              <CardDescription>Produtos mais vendidos por receita</CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts && topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.quantity} unidades vendidas</p>
                        </div>
                      </div>
                      <span className="font-semibold">R$ {product.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">Nenhum produto vendido no período</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Receita por Produto</CardTitle>
              <CardDescription>Comparativo dos top produtos</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {topProducts && topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs fill-muted-foreground" tickFormatter={(v) => `R$${v}`} />
                    <YAxis type="category" dataKey="name" className="text-xs fill-muted-foreground" width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Receita"]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Nenhum dado disponível</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Horários de Pico</CardTitle>
                <CardDescription>Pedidos por hora do dia</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {hourlyData && hourlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs fill-muted-foreground" />
                      <YAxis className="text-xs fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [value, "Pedidos"]}
                      />
                      <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">Nenhum dado disponível</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Performance Operacional</CardTitle>
                <CardDescription>Indicadores de eficiência</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Taxa de Conclusão</span>
                      <span className="font-medium">{(metrics?.conversionRate ?? 0).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${metrics?.conversionRate ?? 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Taxa de Cancelamento</span>
                      <span className="font-medium">{(metrics?.cancelRate ?? 0).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${metrics?.cancelRate ?? 0}%` }} />
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Resumo do Período</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Entregues</p>
                        <p className="font-medium text-green-600">{metrics?.deliveredOrders ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cancelados</p>
                        <p className="font-medium text-red-600">{metrics?.cancelledOrders ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Por Entrega</p>
                        <p className="font-medium">{metrics?.deliveryOrders ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Por Retirada</p>
                        <p className="font-medium">{metrics?.pickupOrders ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </TenantLayout>
  );
}

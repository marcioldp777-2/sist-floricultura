import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, Users, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

export default function TenantDashboard() {
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["tenant-stats", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      const [ordersRes, productsRes, teamRes, todayOrdersRes, pendingOrdersRes] = await Promise.all([
        supabase.from("orders").select("total", { count: "exact" }).eq("tenant_id", tenantId),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .gte("created_at", new Date().toISOString().split("T")[0]),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .in("status", ["pending", "confirmed", "in_production"]),
      ]);

      const totalRevenue = ordersRes.data?.reduce((acc, o) => acc + Number(o.total || 0), 0) || 0;

      return {
        totalOrders: ordersRes.count || 0,
        totalProducts: productsRes.count || 0,
        teamMembers: teamRes.count || 0,
        todayOrders: todayOrdersRes.count || 0,
        pendingOrders: pendingOrdersRes.count || 0,
        totalRevenue,
      };
    },
    enabled: !!tenantId,
  });

  const statCards = [
    {
      title: "Pedidos Hoje",
      value: stats?.todayOrders ?? 0,
      icon: Clock,
      description: "Pedidos recebidos hoje",
    },
    {
      title: "Pedidos Pendentes",
      value: stats?.pendingOrders ?? 0,
      icon: ShoppingCart,
      description: "Aguardando processamento",
    },
    {
      title: "Produtos Ativos",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      description: "No catálogo",
    },
    {
      title: "Equipe",
      value: stats?.teamMembers ?? 0,
      icon: Users,
      description: "Membros ativos",
    },
    {
      title: "Receita Total",
      value: `R$ ${(stats?.totalRevenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Todos os pedidos",
    },
    {
      title: "Pedidos Totais",
      value: stats?.totalOrders ?? 0,
      icon: CheckCircle,
      description: "Desde o início",
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </TenantLayout>
  );
}

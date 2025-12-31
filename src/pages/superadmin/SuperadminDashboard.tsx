import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SuperadminLayout } from "@/components/superadmin/SuperadminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Shield, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuperadminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["superadmin-stats"],
    queryFn: async () => {
      const [tenantsRes, profilesRes, rolesRes] = await Promise.all([
        supabase.from("tenants").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("*", { count: "exact", head: true }),
      ]);

      return {
        tenants: tenantsRes.count || 0,
        users: profilesRes.count || 0,
        roles: rolesRes.count || 0,
      };
    },
  });

  const statCards = [
    {
      title: "Total Tenants",
      value: stats?.tenants ?? 0,
      icon: Building2,
      description: "Empresas cadastradas",
    },
    {
      title: "Total Usuários",
      value: stats?.users ?? 0,
      icon: Users,
      description: "Usuários registrados",
    },
    {
      title: "Roles Atribuídos",
      value: stats?.roles ?? 0,
      icon: Shield,
      description: "Permissões ativas",
    },
    {
      title: "Status",
      value: "Online",
      icon: Activity,
      description: "Sistema operacional",
    },
  ];

  return (
    <SuperadminLayout title="Dashboard" description="Visão geral do sistema">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    </SuperadminLayout>
  );
}

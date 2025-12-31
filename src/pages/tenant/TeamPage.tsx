import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const roleLabels: Record<string, string> = {
  superadmin: "Superadmin",
  tenant_owner: "Proprietário",
  manager: "Gerente",
  florist: "Florista",
  seller: "Vendedor",
  driver: "Motorista",
  accountant: "Contador",
};

export default function TeamPage() {
  const [search, setSearch] = useState("");
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;

  const { data: team, isLoading } = useQuery({
    queryKey: ["team", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("full_name");

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const { data: userRoles } = useQuery({
    queryKey: ["team-roles", tenantId],
    queryFn: async () => {
      if (!team) return [];

      const userIds = team.map((m) => m.id);
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      if (error) throw error;
      return data;
    },
    enabled: !!team && team.length > 0,
  });

  const getRolesForUser = (userId: string) => {
    return userRoles?.filter((r) => r.user_id === userId).map((r) => r.role) || [];
  };

  const filteredTeam = team?.filter((member) =>
    member.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TenantLayout title="Equipe" description="Membros da sua equipe">
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar membros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Funções</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredTeam?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8" />
                      <p>Nenhum membro encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeam?.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.full_name || "Sem nome"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.phone || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getRolesForUser(member.id).length === 0 ? (
                          <span className="text-muted-foreground text-sm">-</span>
                        ) : (
                          getRolesForUser(member.id).map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {roleLabels[role] || role}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.is_active ? "default" : "secondary"}>
                        {member.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </TenantLayout>
  );
}

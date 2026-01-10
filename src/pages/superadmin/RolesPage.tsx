import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SuperadminLayout } from "@/components/superadmin/SuperadminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Shield, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  granted_at: string;
}

const roleLabels: Record<AppRole, string> = {
  superadmin: "Superadmin",
  tenant_owner: "Proprietário",
  manager: "Gerente",
  florist: "Florista",
  seller: "Vendedor",
  driver: "Motorista",
  accountant: "Contador",
  cashier: "Caixa",
};

export default function RolesPage() {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["user-roles-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("granted_at", { ascending: false });

      if (error) throw error;
      return data as UserRole[];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles-for-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });

  const getProfileName = (userId: string) => {
    return profiles?.find((p) => p.id === userId)?.full_name || "Sem nome";
  };

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { data, error } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: role,
          granted_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles-list"] });
      setIsAssignOpen(false);
      setSelectedUserId("");
      setSelectedRole("");
      toast({
        title: "Role atribuído",
        description: "O role foi atribuído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atribuir role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles-list"] });
      toast({
        title: "Role removido",
        description: "O role foi removido com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAssignRole = () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um usuário e um role.",
        variant: "destructive",
      });
      return;
    }

    assignRoleMutation.mutate({ userId: selectedUserId, role: selectedRole as AppRole });
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "superadmin":
        return "destructive";
      case "tenant_owner":
        return "default";
      case "manager":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <SuperadminLayout title="Roles" description="Gerencie as permissões dos usuários">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Atribuir Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atribuir Role</DialogTitle>
                <DialogDescription>
                  Selecione um usuário e o role a ser atribuído.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Usuário</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.full_name || "Sem nome"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Constants.public.Enums.app_role.map((role) => (
                        <SelectItem key={role} value={role}>
                          {roleLabels[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleAssignRole}
                  disabled={assignRoleMutation.isPending}
                >
                  {assignRoleMutation.isPending ? "Atribuindo..." : "Atribuir"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Atribuído em</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
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
              ) : userRoles?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Shield className="h-8 w-8" />
                      <p>Nenhum role atribuído</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                userRoles?.map((userRole) => (
                  <TableRow key={userRole.id}>
                    <TableCell className="font-medium">
                      {getProfileName(userRole.user_id)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(userRole.role)}>
                        {roleLabels[userRole.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(userRole.granted_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRoleMutation.mutate(userRole.id)}
                        disabled={removeRoleMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </SuperadminLayout>
  );
}

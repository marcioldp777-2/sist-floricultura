import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Users, Plus, Pencil, Key, Power } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleLabels: Record<string, string> = {
  superadmin: "Superadmin",
  tenant_owner: "Proprietário",
  manager: "Gerente",
  florist: "Florista",
  seller: "Vendedor",
  driver: "Motorista",
  accountant: "Contador",
};

const tenantRoles: { value: AppRole; label: string }[] = [
  { value: "manager", label: "Gerente" },
  { value: "florist", label: "Florista" },
  { value: "seller", label: "Vendedor" },
  { value: "driver", label: "Motorista" },
  { value: "accountant", label: "Contador" },
];

export default function TeamPage() {
  const [search, setSearch] = useState("");
  const { profile, isTenantOwner, isManager } = useAuth();
  const tenantId = profile?.tenant_id;
  const queryClient = useQueryClient();

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    full_name: string | null;
    phone: string | null;
    role?: string;
  } | null>(null);

  // Form states
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formFullName, setFormFullName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<AppRole>("seller");

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

  const createUserMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      fullName: string;
      phone: string;
      role: AppRole;
    }) => {
      const { data: result, error } = await supabase.functions.invoke(
        "tenant-manage-user",
        {
          body: {
            action: "create_user",
            email: data.email,
            password: data.password,
            userData: {
              fullName: data.fullName,
              phone: data.phone,
              role: data.role,
            },
          },
        }
      );
      if (error) throw error;
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      queryClient.invalidateQueries({ queryKey: ["team-roles"] });
      toast.success("Usuário criado com sucesso!");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar usuário");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      fullName: string;
      phone: string;
      role: AppRole;
    }) => {
      const { data: result, error } = await supabase.functions.invoke(
        "tenant-manage-user",
        {
          body: {
            action: "update_user",
            userId: data.userId,
            userData: {
              fullName: data.fullName,
              phone: data.phone,
              role: data.role,
            },
          },
        }
      );
      if (error) throw error;
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      queryClient.invalidateQueries({ queryKey: ["team-roles"] });
      toast.success("Usuário atualizado com sucesso!");
      setIsEditOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar usuário");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { userId: string; password: string }) => {
      const { data: result, error } = await supabase.functions.invoke(
        "tenant-manage-user",
        {
          body: {
            action: "update_password",
            userId: data.userId,
            password: data.password,
          },
        }
      );
      if (error) throw error;
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast.success("Senha atualizada com sucesso!");
      setIsPasswordOpen(false);
      setSelectedUser(null);
      setFormPassword("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar senha");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: result, error } = await supabase.functions.invoke(
        "tenant-manage-user",
        {
          body: {
            action: "toggle_active",
            userId,
          },
        }
      );
      if (error) throw error;
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success("Status atualizado!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao alterar status");
    },
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

  const resetForm = () => {
    setFormEmail("");
    setFormPassword("");
    setFormFullName("");
    setFormPhone("");
    setFormRole("seller");
  };

  const openEditDialog = (member: typeof team extends (infer T)[] ? T : never) => {
    const roles = getRolesForUser(member.id);
    const mainRole = roles.find((r) => r !== "superadmin" && r !== "tenant_owner") as AppRole | undefined;
    
    setSelectedUser({
      id: member.id,
      full_name: member.full_name,
      phone: member.phone,
      role: mainRole,
    });
    setFormFullName(member.full_name || "");
    setFormPhone(member.phone || "");
    setFormRole(mainRole || "seller");
    setIsEditOpen(true);
  };

  const openPasswordDialog = (member: { id: string; full_name: string | null }) => {
    setSelectedUser({ id: member.id, full_name: member.full_name, phone: null });
    setFormPassword("");
    setIsPasswordOpen(true);
  };

  const handleCreateUser = () => {
    if (!formEmail || !formPassword || !formFullName) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    createUserMutation.mutate({
      email: formEmail,
      password: formPassword,
      fullName: formFullName,
      phone: formPhone,
      role: formRole,
    });
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate({
      userId: selectedUser.id,
      fullName: formFullName,
      phone: formPhone,
      role: formRole,
    });
  };

  const handleUpdatePassword = () => {
    if (!selectedUser || !formPassword) {
      toast.error("Digite a nova senha");
      return;
    }
    updatePasswordMutation.mutate({
      userId: selectedUser.id,
      password: formPassword,
    });
  };

  const canManageUsers = isTenantOwner || isManager;
  const availableRoles = isTenantOwner 
    ? tenantRoles 
    : tenantRoles.filter((r) => r.value !== "manager");

  return (
    <TenantLayout
      title="Equipe"
      description="Membros da sua equipe"
      actions={
        canManageUsers && (
          <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Membro
          </Button>
        )
      }
    >
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
                {canManageUsers && <TableHead className="w-[140px]">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: canManageUsers ? 5 : 4 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredTeam?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManageUsers ? 5 : 4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8" />
                      <p>Nenhum membro encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeam?.map((member) => {
                  const isCurrentUser = member.id === profile?.id;
                  const roles = getRolesForUser(member.id);
                  const isOwner = roles.includes("tenant_owner");
                  
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{member.full_name || "Sem nome"}</span>
                            {isCurrentUser && (
                              <span className="text-xs text-muted-foreground">(você)</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.phone || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {roles.length === 0 ? (
                            <span className="text-muted-foreground text-sm">-</span>
                          ) : (
                            roles.map((role) => (
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
                      {canManageUsers && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(member)}
                              title="Editar"
                              disabled={isOwner && !isTenantOwner}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openPasswordDialog(member)}
                              title="Alterar senha"
                              disabled={isOwner && !isTenantOwner}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleActiveMutation.mutate(member.id)}
                              title={member.is_active ? "Desativar" : "Ativar"}
                              disabled={isCurrentUser || (isOwner && !isTenantOwner)}
                            >
                              <Power className={`h-4 w-4 ${member.is_active ? "text-green-600" : "text-muted-foreground"}`} />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Membro</DialogTitle>
            <DialogDescription>
              Adicione um novo membro à sua equipe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nome completo *</Label>
              <Input
                id="create-name"
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder="Nome do membro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">E-mail *</Label>
              <Input
                id="create-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Senha *</Label>
              <Input
                id="create-password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-phone">Telefone</Label>
              <Input
                id="create-phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Função</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Membro</DialogTitle>
            <DialogDescription>
              Atualize as informações do membro
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome completo</Label>
              <Input
                id="edit-name"
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder="Nome do membro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Função</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Nova senha para {selectedUser?.full_name || "usuário"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePassword} disabled={updatePasswordMutation.isPending}>
              {updatePasswordMutation.isPending ? "Salvando..." : "Alterar Senha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TenantLayout>
  );
}

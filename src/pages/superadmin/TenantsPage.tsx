import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SuperadminLayout } from "@/components/superadmin/SuperadminLayout";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Building2, MessageSquare, Send, ExternalLink, Pencil, AlertTriangle, Key, Users, UserPlus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
type TenantUser = Profile & { email?: string; roles: UserRole[] };

type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
type TenantInsert = Database["public"]["Tables"]["tenants"]["Insert"];

export default function TenantsPage() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSubject, setSupportSubject] = useState("");
  const [editTenant, setEditTenant] = useState<Partial<Tenant>>({});
  const [pendingStatus, setPendingStatus] = useState<Tenant["status"] | null>(null);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isUsersListOpen, setIsUsersListOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserConfirmOpen, setIsDeleteUserConfirmOpen] = useState(false);
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [editUserData, setEditUserData] = useState({ fullName: "", email: "", role: "" as Database["public"]["Enums"]["app_role"] });
  const [tenantAdmins, setTenantAdmins] = useState<TenantUser[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "seller" as Database["public"]["Enums"]["app_role"],
  });
  const [newTenant, setNewTenant] = useState<Partial<TenantInsert>>({
    name: "",
    slug: "",
    plan: "trial",
    status: "trial",
  });
  const { toast } = useToast();
  const { user, setImpersonatedTenant } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: tenants, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Tenant[];
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: async (tenant: TenantInsert) => {
      const { data, error } = await supabase
        .from("tenants")
        .insert(tenant)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setIsCreateOpen(false);
      setNewTenant({ name: "", slug: "", plan: "trial", status: "trial" });
      toast({
        title: "Tenant criado",
        description: "O tenant foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar tenant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for creating support ticket
  const createSupportTicketMutation = useMutation({
    mutationFn: async ({ tenantId, subject, message }: { tenantId: string; subject: string; message: string }) => {
      // Create the ticket
      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          tenant_id: tenantId,
          subject,
          description: message,
          category: "general",
          priority: "medium",
          created_by: user?.id,
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Add the first message
      const { error: messageError } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: ticket.id,
          message,
          user_id: user?.id,
          is_internal: false,
        });

      if (messageError) throw messageError;

      return ticket;
    },
    onSuccess: () => {
      setIsSupportOpen(false);
      setSupportMessage("");
      setSupportSubject("");
      setSelectedTenant(null);
      toast({
        title: "Mensagem enviada",
        description: "A mensagem de suporte foi enviada ao tenant.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateTenant = () => {
    if (!newTenant.name || !newTenant.slug) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e slug são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    createTenantMutation.mutate(newTenant as TenantInsert);
  };

  const handleSendSupport = () => {
    if (!selectedTenant || !supportSubject.trim() || !supportMessage.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Assunto e mensagem são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    createSupportTicketMutation.mutate({
      tenantId: selectedTenant.id,
      subject: supportSubject,
      message: supportMessage,
    });
  };

  const openSupportDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setSupportSubject("");
    setSupportMessage("");
    setIsSupportOpen(true);
  };

  const openEditDialog = (tenant: Tenant) => {
    setEditTenant({ ...tenant });
    setIsEditOpen(true);
  };

  const openPasswordDialog = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setTenantAdmins([]);
    setSelectedAdminId(null);
    setNewPassword("");
    setIsPasswordOpen(true);
    setIsLoadingAdmins(true);

    try {
      // Get profiles for this tenant
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("tenant_id", tenant.id);

      if (profilesError) throw profilesError;

      if (profiles && profiles.length > 0) {
        // Get roles for these users
        const userIds = profiles.map(p => p.id);
        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("*")
          .in("user_id", userIds);

        if (rolesError) throw rolesError;

        // Get emails from edge function
        const { data: usersData, error: usersError } = await supabase.functions.invoke("admin-update-user", {
          body: { action: "list_users" }
        });

        if (usersError) throw usersError;

        const emailMap = new Map<string, string>();
        if (usersData?.data?.users) {
          usersData.data.users.forEach((u: { id: string; email: string }) => {
            emailMap.set(u.id, u.email);
          });
        }

        const adminsWithRoles = profiles.map(profile => ({
          ...profile,
          email: emailMap.get(profile.id),
          roles: (roles || []).filter(r => r.user_id === profile.id)
        }));

        setTenantAdmins(adminsWithRoles);
      }
    } catch (error) {
      console.error("Error loading admins:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  // Mutation for updating password
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-update-user", {
        body: { action: "update_password", userId, password }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      setIsPasswordOpen(false);
      setNewPassword("");
      setSelectedAdminId(null);
      toast({
        title: "Senha atualizada",
        description: "A senha do usuário foi alterada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdatePassword = () => {
    if (!selectedAdminId || !newPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um usuário e informe a nova senha.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    updatePasswordMutation.mutate({ userId: selectedAdminId, password: newPassword });
  };

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      superadmin: "Super Admin",
      tenant_owner: "Proprietário",
      manager: "Gerente",
      florist: "Florista",
      seller: "Vendedor",
      driver: "Entregador",
      accountant: "Contador",
    };
    return roleNames[role] || role;
  };

  const openCreateUserDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setNewUser({
      email: "",
      password: "",
      fullName: "",
      role: "seller",
    });
    setIsCreateUserOpen(true);
  };

  // Mutation for creating user
  const createUserMutation = useMutation({
    mutationFn: async ({ email, password, fullName, tenantId, role }: {
      email: string;
      password: string;
      fullName: string;
      tenantId: string;
      role: Database["public"]["Enums"]["app_role"];
    }) => {
      const { data, error } = await supabase.functions.invoke("admin-update-user", {
        body: { 
          action: "create_user", 
          email,
          password,
          userData: { fullName, tenantId, role }
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      setIsCreateUserOpen(false);
      setNewUser({ email: "", password: "", fullName: "", role: "seller" });
      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = () => {
    if (!selectedTenant || !newUser.email || !newUser.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Email e senha são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (newUser.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate({
      email: newUser.email,
      password: newUser.password,
      fullName: newUser.fullName,
      tenantId: selectedTenant.id,
      role: newUser.role,
    });
  };

  // Open users list dialog
  const openUsersListDialog = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setTenantUsers([]);
    setIsUsersListOpen(true);
    setIsLoadingUsers(true);

    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("tenant_id", tenant.id);

      if (profilesError) throw profilesError;

      if (profiles && profiles.length > 0) {
        const userIds = profiles.map(p => p.id);
        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("*")
          .in("user_id", userIds);

        if (rolesError) throw rolesError;

        const { data: usersData, error: usersError } = await supabase.functions.invoke("admin-update-user", {
          body: { action: "list_users" }
        });

        if (usersError) throw usersError;

        const emailMap = new Map<string, string>();
        if (usersData?.data?.users) {
          usersData.data.users.forEach((u: { id: string; email: string }) => {
            emailMap.set(u.id, u.email);
          });
        }

        const usersWithDetails = profiles.map(profile => ({
          ...profile,
          email: emailMap.get(profile.id),
          roles: (roles || []).filter(r => r.user_id === profile.id)
        }));

        setTenantUsers(usersWithDetails);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const openEditUserDialog = (user: TenantUser) => {
    setSelectedUser(user);
    setEditUserData({
      fullName: user.full_name || "",
      email: user.email || "",
      role: user.roles[0]?.role || "seller",
    });
    setIsEditUserOpen(true);
  };

  const openDeleteUserConfirm = (user: TenantUser) => {
    setSelectedUser(user);
    setIsDeleteUserConfirmOpen(true);
  };

  // Mutation for updating user profile
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, fullName, role }: { userId: string; fullName: string; role: Database["public"]["Enums"]["app_role"] }) => {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Update role - delete existing and insert new
      await supabase.from("user_roles").delete().eq("user_id", userId);
      
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role, granted_by: user?.id });

      if (roleError) throw roleError;

      return { success: true };
    },
    onSuccess: () => {
      setIsEditUserOpen(false);
      // Refresh users list
      if (selectedTenant) {
        openUsersListDialog(selectedTenant);
      }
      toast({
        title: "Usuário atualizado",
        description: "Os dados do usuário foram atualizados.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke("admin-update-user", {
        body: { action: "delete_user", userId }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      setIsDeleteUserConfirmOpen(false);
      setSelectedUser(null);
      // Refresh users list
      if (selectedTenant) {
        openUsersListDialog(selectedTenant);
      }
      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate({
      userId: selectedUser.id,
      fullName: editUserData.fullName,
      role: editUserData.role,
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.id);
  };

  // Mutation for updating tenant
  const updateTenantMutation = useMutation({
    mutationFn: async (tenant: Partial<Tenant> & { id: string }) => {
      const { data, error } = await supabase
        .from("tenants")
        .update({
          name: tenant.name,
          slug: tenant.slug,
          email: tenant.email,
          phone: tenant.phone,
          document: tenant.document,
          plan: tenant.plan,
          status: tenant.status,
          max_locations: tenant.max_locations,
          primary_color: tenant.primary_color,
        })
        .eq("id", tenant.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setIsEditOpen(false);
      setEditTenant({});
      toast({
        title: "Tenant atualizado",
        description: "Os dados do tenant foram atualizados com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar tenant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateTenant = () => {
    if (!editTenant.id || !editTenant.name || !editTenant.slug) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e slug são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    updateTenantMutation.mutate(editTenant as Partial<Tenant> & { id: string });
  };

  const filteredTenants = tenants?.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(search.toLowerCase())
  );

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "default";
      case "professional":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "suspended":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <SuperadminLayout title="Tenants" description="Gerencie as empresas cadastradas">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tenants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Tenant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Tenant</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar uma nova empresa.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Empresa</Label>
                  <Input
                    id="name"
                    value={newTenant.name || ""}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, name: e.target.value })
                    }
                    placeholder="Floricultura ABC"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={newTenant.slug || ""}
                    onChange={(e) =>
                      setNewTenant({
                        ...newTenant,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      })
                    }
                    placeholder="floricultura-abc"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTenant.email || ""}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, email: e.target.value })
                    }
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newTenant.phone || ""}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, phone: e.target.value })
                    }
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="plan">Plano</Label>
                    <Select
                      value={newTenant.plan || "trial"}
                      onValueChange={(value) =>
                        setNewTenant({ ...newTenant, plan: value as TenantInsert["plan"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newTenant.status || "trial"}
                      onValueChange={(value) =>
                        setNewTenant({ ...newTenant, status: value as TenantInsert["status"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="suspended">Suspenso</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="max_locations">Máximo de Locais</Label>
                  <Input
                    id="max_locations"
                    type="number"
                    value={newTenant.max_locations || 1}
                    onChange={(e) =>
                      setNewTenant({
                        ...newTenant,
                        max_locations: parseInt(e.target.value) || 1,
                      })
                    }
                    min={1}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateTenant}
                  disabled={createTenantMutation.isPending}
                >
                  {createTenantMutation.isPending ? "Criando..." : "Criar Tenant"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Support Dialog */}
        <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Suporte Rápido
              </DialogTitle>
              <DialogDescription>
                Enviar mensagem de suporte para {selectedTenant?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="support-subject">Assunto</Label>
                <Input
                  id="support-subject"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="Assunto da mensagem"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="support-message">Mensagem</Label>
                <Textarea
                  id="support-message"
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  rows={5}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSupportOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSendSupport}
                disabled={createSupportTicketMutation.isPending}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {createSupportTicketMutation.isPending ? "Enviando..." : "Enviar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Tenant Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                Editar Tenant
              </DialogTitle>
              <DialogDescription>
                Edite os dados do tenant {editTenant.name}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nome da Empresa</Label>
                  <Input
                    id="edit-name"
                    value={editTenant.name || ""}
                    onChange={(e) =>
                      setEditTenant({ ...editTenant, name: e.target.value })
                    }
                    placeholder="Floricultura ABC"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-slug">Slug (URL)</Label>
                  <Input
                    id="edit-slug"
                    value={editTenant.slug || ""}
                    onChange={(e) =>
                      setEditTenant({
                        ...editTenant,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      })
                    }
                    placeholder="floricultura-abc"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editTenant.email || ""}
                    onChange={(e) =>
                      setEditTenant({ ...editTenant, email: e.target.value })
                    }
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={editTenant.phone || ""}
                    onChange={(e) =>
                      setEditTenant({ ...editTenant, phone: e.target.value })
                    }
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-document">CNPJ/CPF</Label>
                <Input
                  id="edit-document"
                  value={editTenant.document || ""}
                  onChange={(e) =>
                    setEditTenant({ ...editTenant, document: e.target.value })
                  }
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="edit-plan">Plano</Label>
                  <Select
                    value={editTenant.plan || "trial"}
                    onValueChange={(value) =>
                      setEditTenant({ ...editTenant, plan: value as Tenant["plan"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editTenant.status || "trial"}
                    onValueChange={(value) => {
                      const newStatus = value as Tenant["status"];
                      if (newStatus === "suspended" || newStatus === "cancelled") {
                        setPendingStatus(newStatus);
                        setIsStatusConfirmOpen(true);
                      } else {
                        setEditTenant({ ...editTenant, status: newStatus });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="suspended">Suspenso</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-max-locations">Máx. Locais</Label>
                  <Input
                    id="edit-max-locations"
                    type="number"
                    value={editTenant.max_locations || 1}
                    onChange={(e) =>
                      setEditTenant({
                        ...editTenant,
                        max_locations: parseInt(e.target.value) || 1,
                      })
                    }
                    min={1}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-primary-color">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-primary-color"
                    type="color"
                    value={editTenant.primary_color || "#10b981"}
                    onChange={(e) =>
                      setEditTenant({ ...editTenant, primary_color: e.target.value })
                    }
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={editTenant.primary_color || "#10b981"}
                    onChange={(e) =>
                      setEditTenant({ ...editTenant, primary_color: e.target.value })
                    }
                    placeholder="#10b981"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateTenant}
                disabled={updateTenantMutation.isPending}
              >
                {updateTenantMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Confirmation Dialog */}
        <AlertDialog open={isStatusConfirmOpen} onOpenChange={setIsStatusConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Confirmar Alteração de Status
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingStatus === "suspended" ? (
                  <>
                    Você está prestes a <strong>suspender</strong> o tenant <strong>{editTenant.name}</strong>. 
                    Os usuários não poderão acessar o sistema enquanto o tenant estiver suspenso.
                  </>
                ) : (
                  <>
                    Você está prestes a <strong>cancelar</strong> o tenant <strong>{editTenant.name}</strong>. 
                    Esta ação pode impactar permanentemente o acesso dos usuários.
                  </>
                )}
                <br /><br />
                Deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingStatus(null)}>
                Não, voltar
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (pendingStatus) {
                    setEditTenant({ ...editTenant, status: pendingStatus });
                  }
                  setPendingStatus(null);
                  setIsStatusConfirmOpen(false);
                }}
              >
                Sim, {pendingStatus === "suspended" ? "suspender" : "cancelar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Password Change Dialog */}
        <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Alterar Senha de Usuário
              </DialogTitle>
              <DialogDescription>
                Selecione um usuário do tenant {selectedTenant?.name} para alterar a senha.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {isLoadingAdmins ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : tenantAdmins.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
                  <Users className="h-8 w-8" />
                  <p>Nenhum usuário encontrado neste tenant</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label>Selecione o usuário</Label>
                    <Select
                      value={selectedAdminId || ""}
                      onValueChange={setSelectedAdminId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tenantAdmins.map((admin) => (
                          <SelectItem key={admin.id} value={admin.id}>
                            <div className="flex items-center gap-2">
                              <span>{admin.full_name || "Sem nome"}</span>
                              <span className="text-muted-foreground text-xs">
                                ({admin.email || "sem email"})
                              </span>
                              {admin.roles.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {getRoleName(admin.roles[0].role)}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAdminId && (
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPasswordOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpdatePassword}
                disabled={updatePasswordMutation.isPending || !selectedAdminId || !newPassword}
              >
                {updatePasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Criar Novo Usuário
              </DialogTitle>
              <DialogDescription>
                Criar um novo usuário para o tenant {selectedTenant?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="user-fullname">Nome Completo</Label>
                <Input
                  id="user-fullname"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="João Silva"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="user-email">Email *</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="usuario@email.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="user-password">Senha *</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="user-role">Função</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value as Database["public"]["Enums"]["app_role"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant_owner">Proprietário</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="florist">Florista</SelectItem>
                    <SelectItem value="seller">Vendedor</SelectItem>
                    <SelectItem value="driver">Entregador</SelectItem>
                    <SelectItem value="accountant">Contador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={createUserMutation.isPending || !newUser.email || !newUser.password}
              >
                {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Users List Dialog */}
        <Dialog open={isUsersListOpen} onOpenChange={setIsUsersListOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários do Tenant
              </DialogTitle>
              <DialogDescription>
                Listagem de usuários de {selectedTenant?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-auto">
              {isLoadingUsers ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : tenantUsers.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <Users className="h-8 w-8" />
                  <p>Nenhum usuário encontrado neste tenant</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenantUsers.map((tenantUser) => (
                      <TableRow key={tenantUser.id}>
                        <TableCell className="font-medium">
                          {tenantUser.full_name || "Sem nome"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tenantUser.email || "Sem email"}
                        </TableCell>
                        <TableCell>
                          {tenantUser.roles.length > 0 ? (
                            <Badge variant="secondary">
                              {getRoleName(tenantUser.roles[0].role)}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Sem função</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tenantUser.is_active ? "default" : "destructive"}>
                            {tenantUser.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditUserDialog(tenantUser)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedAdminId(tenantUser.id);
                                setNewPassword("");
                                setIsPasswordOpen(true);
                              }}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Alterar Senha"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteUserConfirm(tenantUser)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUsersListOpen(false)}>
                Fechar
              </Button>
              <Button onClick={() => selectedTenant && openCreateUserDialog(selectedTenant)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                Editar Usuário
              </DialogTitle>
              <DialogDescription>
                Editar dados de {selectedUser?.full_name || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-user-name">Nome Completo</Label>
                <Input
                  id="edit-user-name"
                  value={editUserData.fullName}
                  onChange={(e) => setEditUserData({ ...editUserData, fullName: e.target.value })}
                  placeholder="Nome do usuário"
                />
              </div>

              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  value={editUserData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado diretamente.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-user-role">Função</Label>
                <Select
                  value={editUserData.role}
                  onValueChange={(value) => setEditUserData({ ...editUserData, role: value as Database["public"]["Enums"]["app_role"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant_owner">Proprietário</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="florist">Florista</SelectItem>
                    <SelectItem value="seller">Vendedor</SelectItem>
                    <SelectItem value="driver">Entregador</SelectItem>
                    <SelectItem value="accountant">Contador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation */}
        <AlertDialog open={isDeleteUserConfirmOpen} onOpenChange={setIsDeleteUserConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Você está prestes a excluir o usuário <strong>{selectedUser?.full_name || selectedUser?.email}</strong>. 
                Esta ação não pode ser desfeita e o usuário perderá acesso ao sistema.
                <br /><br />
                Deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedUser(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDeleteUser}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? "Excluindo..." : "Sim, excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Locais</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredTenants?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Building2 className="h-8 w-8" />
                      <p>Nenhum tenant encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants?.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {tenant.slug}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPlanBadgeVariant(tenant.plan)}>
                        {tenant.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(tenant.status)}>
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{tenant.max_locations}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(tenant.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(tenant)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openUsersListDialog(tenant)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Ver Usuários"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openSupportDialog(tenant)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Suporte"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setImpersonatedTenant({
                              id: tenant.id,
                              name: tenant.name,
                              slug: tenant.slug,
                            });
                            navigate("/tenant");
                          }}
                          className="gap-2 ml-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Acessar
                        </Button>
                      </div>
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

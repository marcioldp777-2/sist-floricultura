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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Building2, MessageSquare, Send, ExternalLink, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

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
                    onValueChange={(value) =>
                      setEditTenant({ ...editTenant, status: value as Tenant["status"] })
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

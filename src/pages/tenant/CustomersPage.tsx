import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TenantLayout } from "@/components/tenant/TenantLayout";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Users2, Pencil, Trash2, Phone, Mail, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCepLookup } from "@/hooks/useCepLookup";
import { usePhoneMask } from "@/hooks/usePhoneMask";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zipcode: string | null;
  notes: string | null;
  created_at: string;
}

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zipcode: string;
  notes: string;
}

const emptyForm: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  address_street: "",
  address_number: "",
  address_complement: "",
  address_neighborhood: "",
  address_city: "",
  address_state: "",
  address_zipcode: "",
  notes: "",
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerForm>(emptyForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;
  const { lookupCep, isLoading: isCepLoading, formatCep } = useCepLookup();
  const { formatPhone } = usePhoneMask();

  const handleCepChange = async (value: string) => {
    const formattedCep = formatCep(value);
    setFormData({ ...formData, address_zipcode: formattedCep });
    
    if (formattedCep.replace(/\D/g, "").length === 8) {
      const address = await lookupCep(formattedCep);
      if (address) {
        setFormData(prev => ({
          ...prev,
          address_zipcode: formattedCep,
          address_street: address.street,
          address_neighborhood: address.neighborhood,
          address_city: address.city,
          address_state: address.state,
        }));
      }
    }
  };

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("name");

      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CustomerForm) => {
      if (!tenantId) throw new Error("Tenant não encontrado");

      const { error } = await supabase.from("customers").insert({
        tenant_id: tenantId,
        name: data.name.trim(),
        email: data.email.trim() || null,
        phone: data.phone.trim() || null,
        address_street: data.address_street.trim() || null,
        address_number: data.address_number.trim() || null,
        address_complement: data.address_complement.trim() || null,
        address_neighborhood: data.address_neighborhood.trim() || null,
        address_city: data.address_city.trim() || null,
        address_state: data.address_state.trim() || null,
        address_zipcode: data.address_zipcode.trim() || null,
        notes: data.notes.trim() || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      closeDialog();
      toast({ title: "Cliente criado", description: "Cliente adicionado com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar cliente", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomerForm }) => {
      const { error } = await supabase
        .from("customers")
        .update({
          name: data.name.trim(),
          email: data.email.trim() || null,
          phone: data.phone.trim() || null,
          address_street: data.address_street.trim() || null,
          address_number: data.address_number.trim() || null,
          address_complement: data.address_complement.trim() || null,
          address_neighborhood: data.address_neighborhood.trim() || null,
          address_city: data.address_city.trim() || null,
          address_state: data.address_state.trim() || null,
          address_zipcode: data.address_zipcode.trim() || null,
          notes: data.notes.trim() || null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      closeDialog();
      toast({ title: "Cliente atualizado", description: "Dados atualizados com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Cliente excluído", description: "Cliente removido com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
    setFormData(emptyForm);
  };

  const openCreateDialog = () => {
    setEditingCustomer(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address_street: customer.address_street || "",
      address_number: customer.address_number || "",
      address_complement: customer.address_complement || "",
      address_neighborhood: customer.address_neighborhood || "",
      address_city: customer.address_city || "",
      address_state: customer.address_state || "",
      address_zipcode: customer.address_zipcode || "",
      notes: customer.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: "Campo obrigatório", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }

    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredCustomers = customers?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  const formatAddress = (customer: Customer) => {
    const parts = [
      customer.address_street,
      customer.address_number,
      customer.address_neighborhood,
      customer.address_city,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <TenantLayout
      title="Clientes"
      description="Gerencie sua base de clientes"
      actions={
        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredCustomers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users2 className="h-8 w-8" />
                      <p>Nenhum cliente encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers?.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <p className="font-medium">{customer.name}</p>
                      {customer.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{customer.notes}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        )}
                        {!customer.phone && !customer.email && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {formatAddress(customer)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(customer.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(customer)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(customer.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription>
              {editingCustomer ? "Atualize os dados do cliente." : "Preencha os dados do novo cliente."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do cliente"
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  maxLength={255}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  placeholder="(11) 99999-9999"
                  maxLength={16}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Endereço</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative col-span-1">
                  <Input
                    placeholder="CEP"
                    value={formData.address_zipcode}
                    onChange={(e) => handleCepChange(e.target.value)}
                    maxLength={9}
                  />
                  {isCepLoading && (
                    <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <Input
                  placeholder="Rua"
                  value={formData.address_street}
                  onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                  className="col-span-2"
                  maxLength={200}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Número"
                  value={formData.address_number}
                  onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                  maxLength={10}
                />
                <Input
                  placeholder="Complemento"
                  value={formData.address_complement}
                  onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                  className="col-span-2"
                  maxLength={100}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Bairro"
                  value={formData.address_neighborhood}
                  onChange={(e) => setFormData({ ...formData, address_neighborhood: e.target.value })}
                  maxLength={100}
                />
                <Input
                  placeholder="Cidade"
                  value={formData.address_city}
                  onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                  maxLength={100}
                />
                <Input
                  placeholder="UF"
                  value={formData.address_state}
                  onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas sobre o cliente..."
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Salvando..." : editingCustomer ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TenantLayout>
  );
}

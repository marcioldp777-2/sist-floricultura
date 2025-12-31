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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, MapPin, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Location {
  id: string;
  name: string;
  code: string;
  type: string;
  phone: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zipcode: string | null;
  is_active: boolean;
  created_at: string;
}

const locationTypes = [
  { value: "store", label: "Loja" },
  { value: "warehouse", label: "Depósito" },
  { value: "pickup_point", label: "Ponto de Retirada" },
];

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function LocationsPage() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "store",
    phone: "",
    address_street: "",
    address_number: "",
    address_complement: "",
    address_neighborhood: "",
    address_city: "",
    address_state: "",
    address_zipcode: "",
    is_active: true,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "store",
      phone: "",
      address_street: "",
      address_number: "",
      address_complement: "",
      address_neighborhood: "",
      address_city: "",
      address_state: "",
      address_zipcode: "",
      is_active: true,
    });
  };

  const openEditDialog = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      code: location.code,
      type: location.type,
      phone: location.phone || "",
      address_street: location.address_street || "",
      address_number: location.address_number || "",
      address_complement: location.address_complement || "",
      address_neighborhood: location.address_neighborhood || "",
      address_city: location.address_city || "",
      address_state: location.address_state || "",
      address_zipcode: location.address_zipcode || "",
      is_active: location.is_active,
    });
    setIsEditOpen(true);
  };

  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Location[];
    },
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!tenantId) throw new Error("Tenant não encontrado");

      const { data: result, error } = await supabase
        .from("locations")
        .insert({
          tenant_id: tenantId,
          name: data.name.trim(),
          code: data.code.trim().toUpperCase(),
          type: data.type,
          phone: data.phone.trim() || null,
          address_street: data.address_street.trim() || null,
          address_number: data.address_number.trim() || null,
          address_complement: data.address_complement.trim() || null,
          address_neighborhood: data.address_neighborhood.trim() || null,
          address_city: data.address_city.trim() || null,
          address_state: data.address_state || null,
          address_zipcode: data.address_zipcode.trim() || null,
          is_active: data.is_active,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Local criado",
        description: "O local foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar local",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { data: result, error } = await supabase
        .from("locations")
        .update({
          name: data.name.trim(),
          code: data.code.trim().toUpperCase(),
          type: data.type,
          phone: data.phone.trim() || null,
          address_street: data.address_street.trim() || null,
          address_number: data.address_number.trim() || null,
          address_complement: data.address_complement.trim() || null,
          address_neighborhood: data.address_neighborhood.trim() || null,
          address_city: data.address_city.trim() || null,
          address_state: data.address_state || null,
          address_zipcode: data.address_zipcode.trim() || null,
          is_active: data.is_active,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setIsEditOpen(false);
      setEditingLocation(null);
      resetForm();
      toast({
        title: "Local atualizado",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar local",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({
        title: "Local excluído",
        description: "O local foi removido.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir local",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e código são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingLocation) return;
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e código são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({ id: editingLocation.id, data: formData });
  };

  const getTypeLabel = (type: string) => {
    return locationTypes.find((t) => t.value === type)?.label || type;
  };

  const formatAddress = (location: Location) => {
    const parts = [
      location.address_street,
      location.address_number,
      location.address_neighborhood,
      location.address_city,
      location.address_state,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  const filteredLocations = locations?.filter((location) =>
    location.name.toLowerCase().includes(search.toLowerCase()) ||
    location.code.toLowerCase().includes(search.toLowerCase())
  );

  const LocationForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${isEdit ? "edit" : "create"}-name`}>Nome *</Label>
          <Input
            id={`${isEdit ? "edit" : "create"}-name`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Loja Centro"
            maxLength={100}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${isEdit ? "edit" : "create"}-code`}>Código *</Label>
          <Input
            id={`${isEdit ? "edit" : "create"}-code`}
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="LC01"
            maxLength={20}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${isEdit ? "edit" : "create"}-type`}>Tipo</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${isEdit ? "edit" : "create"}-phone`}>Telefone</Label>
          <Input
            id={`${isEdit ? "edit" : "create"}-phone`}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-3">Endereço</h4>
        
        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 grid gap-2">
              <Label htmlFor={`${isEdit ? "edit" : "create"}-street`}>Rua</Label>
              <Input
                id={`${isEdit ? "edit" : "create"}-street`}
                value={formData.address_street}
                onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                placeholder="Rua das Flores"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${isEdit ? "edit" : "create"}-number`}>Número</Label>
              <Input
                id={`${isEdit ? "edit" : "create"}-number`}
                value={formData.address_number}
                onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                placeholder="123"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`${isEdit ? "edit" : "create"}-complement`}>Complemento</Label>
              <Input
                id={`${isEdit ? "edit" : "create"}-complement`}
                value={formData.address_complement}
                onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                placeholder="Sala 101"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${isEdit ? "edit" : "create"}-neighborhood`}>Bairro</Label>
              <Input
                id={`${isEdit ? "edit" : "create"}-neighborhood`}
                value={formData.address_neighborhood}
                onChange={(e) => setFormData({ ...formData, address_neighborhood: e.target.value })}
                placeholder="Centro"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`${isEdit ? "edit" : "create"}-city`}>Cidade</Label>
              <Input
                id={`${isEdit ? "edit" : "create"}-city`}
                value={formData.address_city}
                onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                placeholder="São Paulo"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${isEdit ? "edit" : "create"}-state`}>Estado</Label>
              <Select
                value={formData.address_state}
                onValueChange={(value) => setFormData({ ...formData, address_state: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {brazilianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${isEdit ? "edit" : "create"}-zipcode`}>CEP</Label>
              <Input
                id={`${isEdit ? "edit" : "create"}-zipcode`}
                value={formData.address_zipcode}
                onChange={(e) => setFormData({ ...formData, address_zipcode: e.target.value })}
                placeholder="01234-567"
              />
            </div>
          </div>
        </div>
      </div>

      {isEdit && (
        <div className="flex items-center justify-between border-t pt-4">
          <Label htmlFor="edit-active">Local Ativo</Label>
          <Switch
            id="edit-active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingLocation(null); resetForm(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Local</DialogTitle>
            <DialogDescription>Altere os dados do local.</DialogDescription>
          </DialogHeader>
          <LocationForm isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingLocation(null); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TenantLayout
        title="Locais"
        description="Gerencie lojas, depósitos e pontos de retirada"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Local
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Local</DialogTitle>
                <DialogDescription>Preencha os dados do novo local.</DialogDescription>
              </DialogHeader>
              <LocationForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Local"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar locais..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Local</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredLocations?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <MapPin className="h-8 w-8" />
                        <p>Nenhum local encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLocations?.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{location.code}</Badge>
                      </TableCell>
                      <TableCell>{getTypeLabel(location.type)}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {formatAddress(location)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {location.phone || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={location.is_active ? "default" : "secondary"}>
                          {location.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(location)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(location.id)}
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
      </TenantLayout>
    </>
  );
}

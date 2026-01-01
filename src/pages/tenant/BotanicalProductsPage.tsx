import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Leaf,
  Sun,
  Droplets,
  AlertTriangle,
  QrCode,
} from "lucide-react";
import { BotanicalProductForm } from "@/components/tenant/BotanicalProductForm";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type BotanicalProduct = Tables<"botanical_products">;
type BotanicalProductInsert = TablesInsert<"botanical_products">;
type BotanicalProductUpdate = TablesUpdate<"botanical_products">;

const productTypeLabels: Record<string, string> = {
  cut_flower: "Flor de Corte",
  potted_plant: "Vaso",
  arrangement: "Arranjo",
  bunch: "Maço",
  seedling: "Muda",
  seed: "Semente",
  supply: "Insumo",
  accessory: "Acessório",
};

const lightLevelLabels: Record<string, string> = {
  full_sun: "Pleno Sol",
  partial_shade: "Meia-sombra",
  shade: "Sombra",
  indirect_light: "Luz Indireta",
};

const wateringFrequencyLabels: Record<string, string> = {
  daily: "Diária",
  every_2_days: "A cada 2 dias",
  twice_weekly: "2x por semana",
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
  rarely: "Raramente",
};

export default function BotanicalProductsPage() {
  const { effectiveTenantId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tenantId = effectiveTenantId;

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<BotanicalProduct | null>(null);

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["botanical-products", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("botanical_products")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BotanicalProduct[];
    },
    enabled: !!tenantId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (product: BotanicalProductInsert) => {
      const { data, error } = await supabase
        .from("botanical_products")
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["botanical-products"] });
      setIsCreateOpen(false);
      toast({
        title: "Produto criado",
        description: "O produto botânico foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...product }: BotanicalProductUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("botanical_products")
        .update(product)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["botanical-products"] });
      setIsEditOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Produto atualizado",
        description: "O produto botânico foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("botanical_products")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["botanical-products"] });
      toast({
        title: "Produto excluído",
        description: "O produto botânico foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter products
  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      (product.genus?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (product.species?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesType = typeFilter === "all" || product.product_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleCreate = (data: Partial<BotanicalProduct>) => {
    if (!tenantId) return;
    createMutation.mutate({
      ...data,
      tenant_id: tenantId,
      sku: data.sku!,
      name: data.name!,
      slug: data.slug!,
    } as BotanicalProductInsert);
  };

  const handleUpdate = (data: Partial<BotanicalProduct>) => {
    if (!selectedProduct) return;
    updateMutation.mutate({
      ...data,
      id: selectedProduct.id,
    } as BotanicalProductUpdate & { id: string });
  };

  const openEditDialog = (product: BotanicalProduct) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  return (
    <TenantLayout title="Produtos Botânicos" description="Gerencie seu catálogo de plantas e flores">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, SKU, gênero ou espécie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Tipo de produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.entries(productTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Botânica</TableHead>
                <TableHead>Cuidados</TableHead>
                <TableHead>Alertas</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredProducts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.primary_image_url ? (
                          <img
                            src={product.primary_image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Leaf className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {productTypeLabels[product.product_type] || product.product_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.genus || product.species ? (
                        <div className="text-sm">
                          {product.genus && <span className="italic">{product.genus}</span>}
                          {product.species && (
                            <span className="italic text-muted-foreground">
                              {" "}
                              {product.species}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.light_level && (
                          <div className="flex items-center gap-1" title={lightLevelLabels[product.light_level]}>
                            <Sun className="h-4 w-4 text-warning" />
                          </div>
                        )}
                        {product.watering_frequency && (
                          <div className="flex items-center gap-1" title={wateringFrequencyLabels[product.watering_frequency]}>
                            <Droplets className="h-4 w-4 text-info" />
                          </div>
                        )}
                        {!product.light_level && !product.watering_frequency && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {product.toxic_to_pets && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Pets
                          </Badge>
                        )}
                        {product.toxic_to_children && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Crianças
                          </Badge>
                        )}
                        {!product.toxic_to_pets && !product.toxic_to_children && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(product.base_price)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(product)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir este produto?")) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                          title="Excluir"
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

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Novo Produto Botânico
            </DialogTitle>
          </DialogHeader>
          <BotanicalProductForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Editar Produto Botânico
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <BotanicalProductForm
              initialData={selectedProduct}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedProduct(null);
              }}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </TenantLayout>
  );
}

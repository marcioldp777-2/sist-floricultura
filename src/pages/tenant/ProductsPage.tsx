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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Package, Pencil, Trash2, ImageIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ProductImageUpload } from "@/components/tenant/ProductImageUpload";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  sku: string | null;
  is_active: boolean;
  stock_quantity: number;
  category_id: string | null;
  image_url: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    sku: "",
    stock_quantity: "0",
    category_id: "",
    image_url: "",
    is_active: true,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      cost: "",
      sku: "",
      stock_quantity: "0",
      category_id: "",
      image_url: "",
      is_active: true,
    });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      cost: product.cost?.toString() || "",
      sku: product.sku || "",
      stock_quantity: product.stock_quantity.toString(),
      category_id: product.category_id || "",
      image_url: product.image_url || "",
      is_active: product.is_active,
    });
    setIsEditOpen(true);
  };

  const { data: categories } = useQuery({
    queryKey: ["categories", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!tenantId,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!tenantId,
  });

  const createProductMutation = useMutation({
    mutationFn: async (product: typeof formData) => {
      if (!tenantId) throw new Error("Tenant não encontrado");

      const { data, error } = await supabase
        .from("products")
        .insert({
          tenant_id: tenantId,
          name: product.name.trim(),
          description: product.description.trim() || null,
          price: parseFloat(product.price) || 0,
          cost: parseFloat(product.cost) || null,
          sku: product.sku.trim() || null,
          stock_quantity: parseInt(product.stock_quantity) || 0,
          category_id: product.category_id || null,
          image_url: product.image_url || null,
          is_active: product.is_active,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["category-product-counts"] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Produto criado",
        description: "O produto foi adicionado ao catálogo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, product }: { id: string; product: typeof formData }) => {
      const { data, error } = await supabase
        .from("products")
        .update({
          name: product.name.trim(),
          description: product.description.trim() || null,
          price: parseFloat(product.price) || 0,
          cost: parseFloat(product.cost) || null,
          sku: product.sku.trim() || null,
          stock_quantity: parseInt(product.stock_quantity) || 0,
          category_id: product.category_id || null,
          image_url: product.image_url || null,
          is_active: product.is_active,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["category-product-counts"] });
      setIsEditOpen(false);
      setEditingProduct(null);
      resetForm();
      toast({
        title: "Produto atualizado",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["category-product-counts"] });
      toast({
        title: "Produto excluído",
        description: "O produto foi removido do catálogo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateProduct = () => {
    if (!formData.name.trim() || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e preço são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    createProductMutation.mutate(formData);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    if (!formData.name.trim() || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e preço são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    updateProductMutation.mutate({ id: editingProduct.id, product: formData });
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories?.find((c) => c.id === categoryId)?.name;
  };

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingProduct(null); resetForm(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>Altere os dados do produto.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Imagem do Produto</Label>
              {tenantId && (
                <ProductImageUpload
                  tenantId={tenantId}
                  currentImageUrl={formData.image_url || null}
                  onUpload={(url) => setFormData({ ...formData, image_url: url })}
                  onRemove={() => setFormData({ ...formData, image_url: "" })}
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome do Produto *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bouquet de Rosas"
                maxLength={100}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do produto..."
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Preço (R$) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="99.90"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-cost">Custo (R$)</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="50.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="PROD-001"
                  maxLength={50}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-stock">Estoque</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active">Produto Ativo</Label>
              <Switch
                id="edit-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingProduct(null); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateProduct} disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TenantLayout
        title="Produtos"
        description="Gerencie o catálogo de produtos"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Produto</DialogTitle>
                <DialogDescription>Preencha os dados do novo produto.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Imagem do Produto</Label>
                  {tenantId && (
                    <ProductImageUpload
                      tenantId={tenantId}
                      currentImageUrl={formData.image_url || null}
                      onUpload={(url) => setFormData({ ...formData, image_url: url })}
                      onRemove={() => setFormData({ ...formData, image_url: "" })}
                    />
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="create-name">Nome do Produto *</Label>
                  <Input
                    id="create-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Bouquet de Rosas"
                    maxLength={100}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="create-category">Categoria</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="create-description">Descrição</Label>
                  <Textarea
                    id="create-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do produto..."
                    maxLength={500}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="create-price">Preço (R$) *</Label>
                    <Input
                      id="create-price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="99.90"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="create-cost">Custo (R$)</Label>
                    <Input
                      id="create-cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="50.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="create-sku">SKU</Label>
                    <Input
                      id="create-sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="PROD-001"
                      maxLength={50}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="create-stock">Estoque</Label>
                    <Input
                      id="create-stock"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateProduct} disabled={createProductMutation.isPending}>
                  {createProductMutation.isPending ? "Criando..." : "Criar Produto"}
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
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Imagem</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
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
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredProducts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Package className="h-8 w-8" />
                        <p>Nenhum produto encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {product.description || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCategoryName(product.category_id) ? (
                          <Badge variant="outline">{getCategoryName(product.category_id)}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku || "-"}</TableCell>
                      <TableCell className="font-medium">
                        R$ {Number(product.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{product.stock_quantity}</TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteProductMutation.mutate(product.id)}
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

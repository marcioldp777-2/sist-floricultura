import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  QrCode,
  Download,
  Eye,
  Pause,
  Play,
  Trash2,
  BarChart3,
  ScanLine,
  TrendingUp,
  Calendar,
  ExternalLink,
  Copy,
  Printer,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { QRLabelGenerator } from "@/components/tenant/QRLabelGenerator";
import type { Tables } from "@/integrations/supabase/types";

type QRCode = Tables<"qr_codes">;
type BotanicalProduct = Tables<"botanical_products">;

const statusLabels: Record<string, string> = {
  active: "Ativo",
  paused: "Pausado",
  expired: "Expirado",
  revoked: "Revogado",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  paused: "secondary",
  expired: "destructive",
  revoked: "destructive",
};

export default function QRCodesPage() {
  const { effectiveTenantId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tenantId = effectiveTenantId;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedQRCodes, setSelectedQRCodes] = useState<string[]>([]);
  const [previewQR, setPreviewQR] = useState<QRCode | null>(null);

  // Form state for creating QR codes
  const [createForm, setCreateForm] = useState({
    product_id: "",
    context: "",
    campaign_name: "",
  });

  // Bulk create state
  const [bulkProductId, setBulkProductId] = useState("");

  // Fetch QR codes with products
  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ["qr-codes", tenantId, statusFilter, productFilter],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from("qr_codes")
        .select(`
          *,
          product:botanical_products(id, name, sku, primary_image_url),
          location:locations(id, name)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as "active" | "paused" | "expired" | "revoked");
      }

      if (productFilter !== "all") {
        query = query.eq("product_id", productFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  // Fetch products for dropdown
  const { data: products } = useQuery({
    queryKey: ["botanical-products-simple", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("botanical_products")
        .select("id, name, sku")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  // Fetch analytics summary
  const { data: analytics } = useQuery({
    queryKey: ["qr-analytics-summary", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      
      const { data: qrData } = await supabase
        .from("qr_codes")
        .select("total_scans, status")
        .eq("tenant_id", tenantId);

      const { data: eventsData } = await supabase
        .from("analytics_events")
        .select("event_type")
        .eq("tenant_id", tenantId)
        .in("event_type", ["QR_Landing_View", "Add_To_Cart_From_QR"]);

      const totalQRs = qrData?.length || 0;
      const activeQRs = qrData?.filter(q => q.status === "active").length || 0;
      const totalScans = qrData?.reduce((sum, q) => sum + (q.total_scans || 0), 0) || 0;
      const landingViews = eventsData?.filter(e => e.event_type === "QR_Landing_View").length || 0;
      const addToCarts = eventsData?.filter(e => e.event_type === "Add_To_Cart_From_QR").length || 0;
      const conversionRate = landingViews > 0 ? ((addToCarts / landingViews) * 100).toFixed(1) : "0";

      return { totalQRs, activeQRs, totalScans, landingViews, addToCarts, conversionRate };
    },
    enabled: !!tenantId,
  });

  // Create QR code mutation
  const createMutation = useMutation({
    mutationFn: async (data: { product_id: string; context?: string; campaign_name?: string }) => {
      const { data: result, error } = await supabase.rpc("create_qr_code", {
        p_tenant_id: tenantId!,
        p_product_id: data.product_id,
        p_context: data.context || null,
        p_campaign_name: data.campaign_name || null,
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
      queryClient.invalidateQueries({ queryKey: ["qr-analytics-summary"] });
      setIsCreateOpen(false);
      setCreateForm({ product_id: "", context: "", campaign_name: "" });
      toast({
        title: "QR Code criado",
        description: "O QR code foi gerado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar QR Code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk create mutation
  const bulkCreateMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      const results = [];
      for (const productId of productIds) {
        const { data, error } = await supabase.rpc("create_qr_code", {
          p_tenant_id: tenantId!,
          p_product_id: productId,
        });
        if (error) throw error;
        results.push(data);
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
      queryClient.invalidateQueries({ queryKey: ["qr-analytics-summary"] });
      setIsBulkCreateOpen(false);
      toast({
        title: "QR Codes criados",
        description: `${results.length} QR codes foram gerados com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar QR Codes",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "paused" | "expired" | "revoked" }) => {
      const { error } = await supabase
        .from("qr_codes")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
      toast({
        title: "Status atualizado",
        description: "O status do QR code foi atualizado.",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("qr_codes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
      queryClient.invalidateQueries({ queryKey: ["qr-analytics-summary"] });
      toast({
        title: "QR Code excluído",
        description: "O QR code foi excluído com sucesso.",
      });
    },
  });

  // Filter QR codes
  const filteredQRCodes = qrCodes?.filter((qr) => {
    const matchesSearch =
      qr.short_code.toLowerCase().includes(search.toLowerCase()) ||
      (qr as any).product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      qr.campaign_name?.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  // Handle select all
  const handleSelectAll = () => {
    if (selectedQRCodes.length === filteredQRCodes?.length) {
      setSelectedQRCodes([]);
    } else {
      setSelectedQRCodes(filteredQRCodes?.map((qr) => qr.id) || []);
    }
  };

  // Handle individual select
  const handleSelect = (id: string) => {
    if (selectedQRCodes.includes(id)) {
      setSelectedQRCodes(selectedQRCodes.filter((qrId) => qrId !== id));
    } else {
      setSelectedQRCodes([...selectedQRCodes, id]);
    }
  };

  // Copy URL to clipboard
  const copyURL = (shortCode: string) => {
    const url = `${window.location.origin}/q/${shortCode}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada",
      description: "O link do QR code foi copiado para a área de transferência.",
    });
  };

  // Get QR codes for printing
  const getSelectedQRCodesForPrint = () => {
    return filteredQRCodes?.filter((qr) => selectedQRCodes.includes(qr.id)) || [];
  };

  // Handle bulk create for all products without QR
  const handleBulkCreateAll = async () => {
    const productsWithQR = new Set(qrCodes?.map((qr) => qr.product_id));
    const productsWithoutQR = products?.filter((p) => !productsWithQR.has(p.id)) || [];
    
    if (productsWithoutQR.length === 0) {
      toast({
        title: "Nenhum produto sem QR",
        description: "Todos os produtos já possuem QR codes.",
      });
      return;
    }

    bulkCreateMutation.mutate(productsWithoutQR.map((p) => p.id));
  };

  return (
    <TenantLayout title="QR Codes" description="Gerencie seus QR codes e etiquetas de produtos">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalQRs || 0}</p>
                  <p className="text-sm text-muted-foreground">Total de QRs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <ScanLine className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalScans || 0}</p>
                  <p className="text-sm text-muted-foreground">Total de Scans</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-info/10">
                  <Eye className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.landingViews || 0}</p>
                  <p className="text-sm text-muted-foreground">Visualizações</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <TrendingUp className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.conversionRate || 0}%</p>
                  <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, produto ou campanha..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="paused">Pausados</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            {selectedQRCodes.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setIsPrintOpen(true)}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimir ({selectedQRCodes.length})
              </Button>
            )}
            <Button variant="outline" onClick={handleBulkCreateAll} className="gap-2">
              <Plus className="h-4 w-4" />
              Gerar em Massa
            </Button>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo QR Code
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedQRCodes.length === filteredQRCodes?.length && filteredQRCodes?.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead className="text-center">Scans</TableHead>
                <TableHead>Último Scan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[150px]">Ações</TableHead>
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
              ) : filteredQRCodes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Nenhum QR code encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredQRCodes?.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedQRCodes.includes(qr.id)}
                        onCheckedChange={() => handleSelect(qr.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-1 rounded border">
                          <QRCodeSVG
                            value={`${window.location.origin}/q/${qr.short_code}`}
                            size={40}
                          />
                        </div>
                        <div>
                          <p className="font-mono font-medium">{qr.short_code}</p>
                          <button
                            onClick={() => copyURL(qr.short_code)}
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            Copiar link
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(qr as any).product ? (
                        <div className="flex items-center gap-2">
                          {(qr as any).product.primary_image_url && (
                            <img
                              src={(qr as any).product.primary_image_url}
                              alt=""
                              className="h-8 w-8 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm">{(qr as any).product.name}</p>
                            <p className="text-xs text-muted-foreground">{(qr as any).product.sku}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {qr.campaign_name ? (
                        <Badge variant="outline">{qr.campaign_name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{qr.total_scans}</span>
                    </TableCell>
                    <TableCell>
                      {qr.last_scanned_at ? (
                        <span className="text-sm text-muted-foreground">
                          {new Date(qr.last_scanned_at).toLocaleDateString("pt-BR")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[qr.status]}>
                        {statusLabels[qr.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewQR(qr)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/q/${qr.short_code}`, "_blank")}
                          title="Abrir landing"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {qr.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatusMutation.mutate({ id: qr.id, status: "paused" })}
                            title="Pausar"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : qr.status === "paused" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatusMutation.mutate({ id: qr.id, status: "active" })}
                            title="Ativar"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir este QR code?")) {
                              deleteMutation.mutate(qr.id);
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Novo QR Code
            </DialogTitle>
            <DialogDescription>
              Crie um novo QR code para um produto específico.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produto *</Label>
              <Select
                value={createForm.product_id}
                onValueChange={(value) => setCreateForm({ ...createForm, product_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contexto (opcional)</Label>
              <Input
                placeholder="Ex: prateleira-a1, indoor, outdoor"
                value={createForm.context}
                onChange={(e) => setCreateForm({ ...createForm, context: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Campanha (opcional)</Label>
              <Input
                placeholder="Ex: dia-das-maes, black-friday"
                value={createForm.campaign_name}
                onChange={(e) => setCreateForm({ ...createForm, campaign_name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createMutation.mutate(createForm)}
              disabled={!createForm.product_id || createMutation.isPending}
            >
              {createMutation.isPending ? "Criando..." : "Criar QR Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewQR} onOpenChange={() => setPreviewQR(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code: {previewQR?.short_code}</DialogTitle>
          </DialogHeader>
          {previewQR && (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg shadow-inner">
                <QRCodeSVG
                  value={`${window.location.origin}/q/${previewQR.short_code}`}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {window.location.origin}/q/{previewQR.short_code}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => copyURL(previewQR.short_code)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button
                  onClick={() => window.open(`/q/${previewQR.short_code}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" />
              Imprimir Etiquetas
            </DialogTitle>
            <DialogDescription>
              {selectedQRCodes.length} QR codes selecionados para impressão.
            </DialogDescription>
          </DialogHeader>
          <QRLabelGenerator
            qrCodes={getSelectedQRCodesForPrint()}
            onClose={() => setIsPrintOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </TenantLayout>
  );
}

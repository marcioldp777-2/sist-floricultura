import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { 
  Loader2, 
  Building2, 
  Palette, 
  Upload, 
  Trash2, 
  Settings2, 
  CreditCard,
  Bell,
  Shield,
  Image as ImageIcon
} from "lucide-react";

export default function SettingsPage() {
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    primary_color: "#10b981",
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    orderAlerts: true,
    weeklyReports: false,
  });

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant-settings", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        document: tenant.document || "",
        primary_color: tenant.primary_color || "#10b981",
      });
      setLogoUrl(tenant.logo_url || null);
    }
  }, [tenant]);

  const updateTenantMutation = useMutation({
    mutationFn: async (data: typeof formData & { logo_url?: string | null }) => {
      if (!tenantId) throw new Error("Tenant não encontrado");

      const { error } = await supabase
        .from("tenants")
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone,
          document: data.document,
          primary_color: data.primary_color,
          logo_url: data.logo_url,
        })
        .eq("id", tenantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-settings"] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar configurações");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantMutation.mutate({ ...formData, logo_url: logoUrl });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenantId) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setIsUploadingLogo(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${tenantId}/logo.${fileExt}`;

      // Delete old logo if exists
      if (logoUrl) {
        const oldPath = logoUrl.split("/tenant-logos/")[1];
        if (oldPath) {
          await supabase.storage.from("tenant-logos").remove([oldPath]);
        }
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from("tenant-logos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("tenant-logos")
        .getPublicUrl(fileName);

      const newLogoUrl = urlData.publicUrl;
      setLogoUrl(newLogoUrl);

      // Update tenant with new logo URL
      await supabase
        .from("tenants")
        .update({ logo_url: newLogoUrl })
        .eq("id", tenantId);

      queryClient.invalidateQueries({ queryKey: ["tenant-settings"] });
      toast.success("Logo atualizado com sucesso!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao fazer upload do logo");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!tenantId || !logoUrl) return;

    try {
      const path = logoUrl.split("/tenant-logos/")[1];
      if (path) {
        await supabase.storage.from("tenant-logos").remove([path]);
      }

      await supabase
        .from("tenants")
        .update({ logo_url: null })
        .eq("id", tenantId);

      setLogoUrl(null);
      queryClient.invalidateQueries({ queryKey: ["tenant-settings"] });
      toast.success("Logo removido com sucesso!");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Erro ao remover logo");
    }
  };

  const planLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    trial: { label: "Trial", variant: "secondary" },
    basic: { label: "Básico", variant: "outline" },
    pro: { label: "Pro", variant: "default" },
    enterprise: { label: "Enterprise", variant: "default" },
  };

  if (!tenantId) {
    return (
      <TenantLayout title="Configurações" description="Configure sua floricultura">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Você não está associado a nenhum tenant.</p>
        </div>
      </TenantLayout>
    );
  }

  if (isLoading) {
    return (
      <TenantLayout title="Configurações" description="Configure sua floricultura">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout title="Minha Floricultura" description="Configure sua loja e preferências">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="brand" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Marca</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Plano</span>
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Dados básicos da sua floricultura exibidos para os clientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Floricultura ABC"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contato@floricultura.com"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="document">CNPJ / CPF</Label>
                  <Input
                    id="document"
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={updateTenantMutation.isPending}>
                    {updateTenantMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Tab */}
        <TabsContent value="brand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Logo da Empresa
              </CardTitle>
              <CardDescription>
                Faça upload do logo da sua floricultura. Recomendamos imagens quadradas com pelo menos 200x200px.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border bg-muted/50 flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  {isUploadingLogo && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Fazer Upload
                  </Button>
                  {logoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleRemoveLogo}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover Logo
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Formatos aceitos: JPG, PNG, WEBP. Tamanho máximo: 2MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Cores da Marca
              </CardTitle>
              <CardDescription>
                Personalize as cores da sua loja para combinar com sua identidade visual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="primary_color">Cor Principal</Label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border border-border cursor-pointer overflow-hidden"
                        onClick={() => document.getElementById("color-picker")?.click()}
                      >
                        <input
                          id="color-picker"
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          className="w-full h-full cursor-pointer border-0"
                        />
                      </div>
                      <Input
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        placeholder="#10b981"
                        className="flex-1 max-w-[150px]"
                      />
                      <p className="text-sm text-muted-foreground">
                        Esta cor será usada em botões, links e elementos de destaque.
                      </p>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="p-4 rounded-lg border border-border bg-muted/30">
                    <p className="text-sm font-medium mb-3">Prévia:</p>
                    <div className="flex items-center gap-3">
                      <Button style={{ backgroundColor: formData.primary_color }} className="text-white">
                        Botão Primário
                      </Button>
                      <span style={{ color: formData.primary_color }} className="font-medium">
                        Texto em destaque
                      </span>
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: formData.primary_color }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={updateTenantMutation.isPending}>
                    {updateTenantMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Cores"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações importantes por email
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, emailNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Novos Pedidos</Label>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado quando um novo pedido for recebido
                  </p>
                </div>
                <Switch
                  checked={preferences.orderAlerts}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, orderAlerts: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relatórios Semanais</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um resumo semanal de vendas e performance
                  </p>
                </div>
                <Switch
                  checked={preferences.weeklyReports}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, weeklyReports: checked })
                  }
                />
              </div>

              <div className="pt-4">
                <Button variant="outline" onClick={() => toast.success("Preferências salvas!")}>
                  Salvar Preferências
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Tab */}
        <TabsContent value="plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plano Atual
              </CardTitle>
              <CardDescription>
                Detalhes do seu plano de assinatura e limites.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        Plano {planLabels[tenant?.plan || "trial"]?.label}
                      </h3>
                      <Badge variant={planLabels[tenant?.plan || "trial"]?.variant}>
                        {tenant?.status === "active" ? "Ativo" : tenant?.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tenant?.trial_ends_at
                        ? `Trial termina em ${new Date(tenant.trial_ends_at).toLocaleDateString("pt-BR")}`
                        : "Assinatura ativa"}
                    </p>
                  </div>
                </div>
                <Button variant="outline">Alterar Plano</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Locais Permitidos</span>
                  </div>
                  <p className="text-2xl font-bold">{tenant?.max_locations || 1}</p>
                  <p className="text-sm text-muted-foreground">lojas/pontos de venda</p>
                </div>

                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Status</span>
                  </div>
                  <p className="text-2xl font-bold capitalize">{tenant?.status}</p>
                  <p className="text-sm text-muted-foreground">da assinatura</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Recursos do Plano</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Gerenciamento de pedidos ilimitados
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Catálogo de produtos ilimitado
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Relatórios e métricas detalhadas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Suporte por email e chat
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </TenantLayout>
  );
}

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    primary_color: "#10b981",
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
    }
  }, [tenant]);

  const updateTenantMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!tenantId) throw new Error("Tenant não encontrado");

      const { error } = await supabase
        .from("tenants")
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone,
          document: data.document,
          primary_color: data.primary_color,
        })
        .eq("id", tenantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-settings"] });
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantMutation.mutate(formData);
  };

  if (!tenantId) {
    return (
      <TenantLayout title="Configurações" description="Configure sua loja">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Você não está associado a nenhum tenant.
          </p>
        </div>
      </TenantLayout>
    );
  }

  if (isLoading) {
    return (
      <TenantLayout title="Configurações" description="Configure sua loja">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout title="Configurações" description="Configure sua loja">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>
              Dados básicos da sua empresa exibidos para os clientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Empresa</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Floricultura ABC"
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
                    placeholder="contato@empresa.com"
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

              <Separator className="my-4" />

              <div className="grid gap-2">
                <Label htmlFor="primary_color">Cor Principal</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    placeholder="#10b981"
                    className="flex-1"
                  />
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
                    "Salvar Configurações"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plano Atual</CardTitle>
            <CardDescription>Detalhes do seu plano de assinatura.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium capitalize">{tenant?.plan}</p>
                <p className="text-sm text-muted-foreground">
                  Máximo de {tenant?.max_locations} {tenant?.max_locations === 1 ? "local" : "locais"}
                </p>
              </div>
              <Button variant="outline">Alterar Plano</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TenantLayout>
  );
}

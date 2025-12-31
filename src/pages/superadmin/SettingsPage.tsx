import { useState, useEffect } from "react";
import { SuperadminLayout } from "@/components/superadmin/SuperadminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bell, Shield, Database, Globe, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Json } from "@/integrations/supabase/types";

interface GeneralSettings {
  systemName: string;
  systemDescription: string;
  supportEmail: string;
  maintenanceMode: boolean;
}

interface TenantDefaultsSettings {
  defaultPlan: string;
  trialDays: number;
  maxLocationsBasic: number;
  maxLocationsPro: number;
  maxLocationsEnterprise: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  newTenantNotification: boolean;
  supportTicketNotification: boolean;
  systemAlertNotification: boolean;
}

interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireTwoFactor: boolean;
}

interface SystemSetting {
  id: string;
  key: string;
  value: Json;
  description: string | null;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*");
      
      if (error) throw error;
      return data as SystemSetting[];
    },
  });

  // Get specific setting by key
  const getSetting = <T,>(key: string, defaultValue: T): T => {
    const setting = settings?.find(s => s.key === key);
    return setting ? (setting.value as T) : defaultValue;
  };

  // General settings
  const generalDefaults: GeneralSettings = {
    systemName: "FloraFlow",
    systemDescription: "Sistema de gestão para floriculturas",
    supportEmail: "suporte@floraflow.com",
    maintenanceMode: false,
  };
  const [general, setGeneral] = useState<GeneralSettings>(generalDefaults);

  // Tenant defaults
  const tenantDefaults: TenantDefaultsSettings = {
    defaultPlan: "trial",
    trialDays: 14,
    maxLocationsBasic: 1,
    maxLocationsPro: 5,
    maxLocationsEnterprise: "unlimited",
  };
  const [tenantSettings, setTenantSettings] = useState<TenantDefaultsSettings>(tenantDefaults);

  // Notification settings
  const notificationDefaults: NotificationSettings = {
    emailNotifications: true,
    newTenantNotification: true,
    supportTicketNotification: true,
    systemAlertNotification: true,
  };
  const [notifications, setNotifications] = useState<NotificationSettings>(notificationDefaults);

  // Security settings
  const securityDefaults: SecuritySettings = {
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireTwoFactor: false,
  };
  const [security, setSecurity] = useState<SecuritySettings>(securityDefaults);

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setGeneral(getSetting("general", generalDefaults));
      setTenantSettings(getSetting("tenant_defaults", tenantDefaults));
      setNotifications(getSetting("notifications", notificationDefaults));
      setSecurity(getSetting("security", securityDefaults));
    }
  }, [settings]);

  // Mutation to save settings
  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const { error } = await supabase
        .from("system_settings")
        .update({ value: value as Json })
        .eq("key", key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
      });
      console.error("Error saving settings:", error);
    },
  });

  const handleSaveGeneral = () => saveMutation.mutate({ key: "general", value: general });
  const handleSaveTenantDefaults = () => saveMutation.mutate({ key: "tenant_defaults", value: tenantSettings });
  const handleSaveNotifications = () => saveMutation.mutate({ key: "notifications", value: notifications });
  const handleSaveSecurity = () => saveMutation.mutate({ key: "security", value: security });

  if (isLoading) {
    return (
      <SuperadminLayout title="Configurações" description="Carregando configurações...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SuperadminLayout>
    );
  }

  return (
    <SuperadminLayout
      title="Configurações"
      description="Gerencie as configurações do sistema e preferências globais"
    >
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="tenants" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Tenants</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configure as informações básicas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="systemName">Nome do Sistema</Label>
                  <Input
                    id="systemName"
                    value={general.systemName}
                    onChange={(e) => setGeneral({ ...general, systemName: e.target.value })}
                    placeholder="Nome do sistema"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">E-mail de Suporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={general.supportEmail}
                    onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                    placeholder="suporte@exemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemDescription">Descrição do Sistema</Label>
                <Textarea
                  id="systemDescription"
                  value={general.systemDescription}
                  onChange={(e) => setGeneral({ ...general, systemDescription: e.target.value })}
                  placeholder="Descrição breve do sistema"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Modo de Manutenção</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar para bloquear acesso de usuários durante manutenção
                  </p>
                </div>
                <Switch
                  checked={general.maintenanceMode}
                  onCheckedChange={(checked) => setGeneral({ ...general, maintenanceMode: checked })}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tenant Defaults */}
        <TabsContent value="tenants">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configurações Padrão de Tenants
              </CardTitle>
              <CardDescription>
                Configure os valores padrão para novos tenants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultPlan">Plano Padrão</Label>
                  <Select 
                    value={tenantSettings.defaultPlan} 
                    onValueChange={(value) => setTenantSettings({ ...tenantSettings, defaultPlan: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trialDays">Dias de Trial</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    value={tenantSettings.trialDays}
                    onChange={(e) => setTenantSettings({ ...tenantSettings, trialDays: parseInt(e.target.value) || 0 })}
                    min="1"
                    max="90"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Limite de Locais por Plano</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="maxLocationsBasic">Basic</Label>
                    <Input
                      id="maxLocationsBasic"
                      type="number"
                      value={tenantSettings.maxLocationsBasic}
                      onChange={(e) => setTenantSettings({ ...tenantSettings, maxLocationsBasic: parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLocationsPro">Pro</Label>
                    <Input
                      id="maxLocationsPro"
                      type="number"
                      value={tenantSettings.maxLocationsPro}
                      onChange={(e) => setTenantSettings({ ...tenantSettings, maxLocationsPro: parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLocationsEnterprise">Enterprise</Label>
                    <Input
                      id="maxLocationsEnterprise"
                      value={tenantSettings.maxLocationsEnterprise}
                      onChange={(e) => setTenantSettings({ ...tenantSettings, maxLocationsEnterprise: e.target.value })}
                      placeholder="unlimited"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveTenantDefaults} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>
                Configure as notificações do sistema para superadmins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Notificações por E-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações por e-mail
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Tipos de Notificação</h4>
                
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Novo Tenant</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando um novo tenant for criado
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newTenantNotification}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newTenantNotification: checked })}
                    disabled={!notifications.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Ticket de Suporte</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando um novo ticket for aberto
                    </p>
                  </div>
                  <Switch
                    checked={notifications.supportTicketNotification}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, supportTicketNotification: checked })}
                    disabled={!notifications.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Alertas do Sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar sobre erros e alertas críticos
                    </p>
                  </div>
                  <Switch
                    checked={notifications.systemAlertNotification}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, systemAlertNotification: checked })}
                    disabled={!notifications.emailNotifications}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Configure as políticas de segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) || 0 })}
                    min="5"
                    max="1440"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Máx. Tentativas de Login</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={security.maxLoginAttempts}
                    onChange={(e) => setSecurity({ ...security, maxLoginAttempts: parseInt(e.target.value) || 0 })}
                    min="3"
                    max="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Tamanho Mínimo de Senha</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={security.passwordMinLength}
                  onChange={(e) => setSecurity({ ...security, passwordMinLength: parseInt(e.target.value) || 0 })}
                  min="6"
                  max="32"
                  className="w-full md:w-1/2"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">
                    Exigir 2FA para todos os usuários do sistema
                  </p>
                </div>
                <Switch
                  checked={security.requireTwoFactor}
                  onCheckedChange={(checked) => setSecurity({ ...security, requireTwoFactor: checked })}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSecurity} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SuperadminLayout>
  );
}

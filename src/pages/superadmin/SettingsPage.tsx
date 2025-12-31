import { useState } from "react";
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
import { Settings, Mail, Bell, Shield, Database, Globe } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // General settings state
  const [systemName, setSystemName] = useState("FloraFlow");
  const [systemDescription, setSystemDescription] = useState("Sistema de gestão para floriculturas");
  const [supportEmail, setSupportEmail] = useState("suporte@floraflow.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Tenant defaults state
  const [defaultPlan, setDefaultPlan] = useState("trial");
  const [trialDays, setTrialDays] = useState("14");
  const [maxLocationsBasic, setMaxLocationsBasic] = useState("1");
  const [maxLocationsPro, setMaxLocationsPro] = useState("5");
  const [maxLocationsEnterprise, setMaxLocationsEnterprise] = useState("unlimited");

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newTenantNotification, setNewTenantNotification] = useState(true);
  const [supportTicketNotification, setSupportTicketNotification] = useState(true);
  const [systemAlertNotification, setSystemAlertNotification] = useState(true);

  // Security settings state
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [passwordMinLength, setPasswordMinLength] = useState("8");
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);

  const handleSaveGeneral = async () => {
    setSaving(true);
    // Simulating save - in production, this would save to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast({
      title: "Configurações salvas",
      description: "As configurações gerais foram atualizadas com sucesso.",
    });
  };

  const handleSaveTenantDefaults = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast({
      title: "Configurações salvas",
      description: "As configurações de tenants foram atualizadas com sucesso.",
    });
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast({
      title: "Configurações salvas",
      description: "As configurações de notificações foram atualizadas com sucesso.",
    });
  };

  const handleSaveSecurity = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast({
      title: "Configurações salvas",
      description: "As configurações de segurança foram atualizadas com sucesso.",
    });
  };

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
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    placeholder="Nome do sistema"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">E-mail de Suporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="suporte@exemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemDescription">Descrição do Sistema</Label>
                <Textarea
                  id="systemDescription"
                  value={systemDescription}
                  onChange={(e) => setSystemDescription(e.target.value)}
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
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar Configurações"}
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
                  <Select value={defaultPlan} onValueChange={setDefaultPlan}>
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
                    value={trialDays}
                    onChange={(e) => setTrialDays(e.target.value)}
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
                      value={maxLocationsBasic}
                      onChange={(e) => setMaxLocationsBasic(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLocationsPro">Pro</Label>
                    <Input
                      id="maxLocationsPro"
                      type="number"
                      value={maxLocationsPro}
                      onChange={(e) => setMaxLocationsPro(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLocationsEnterprise">Enterprise</Label>
                    <Input
                      id="maxLocationsEnterprise"
                      value={maxLocationsEnterprise}
                      onChange={(e) => setMaxLocationsEnterprise(e.target.value)}
                      placeholder="unlimited"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveTenantDefaults} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar Configurações"}
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
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
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
                    checked={newTenantNotification}
                    onCheckedChange={setNewTenantNotification}
                    disabled={!emailNotifications}
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
                    checked={supportTicketNotification}
                    onCheckedChange={setSupportTicketNotification}
                    disabled={!emailNotifications}
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
                    checked={systemAlertNotification}
                    onCheckedChange={setSystemAlertNotification}
                    disabled={!emailNotifications}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar Configurações"}
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
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    min="5"
                    max="1440"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Máx. Tentativas de Login</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={maxLoginAttempts}
                    onChange={(e) => setMaxLoginAttempts(e.target.value)}
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
                  value={passwordMinLength}
                  onChange={(e) => setPasswordMinLength(e.target.value)}
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
                  checked={requireTwoFactor}
                  onCheckedChange={setRequireTwoFactor}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSecurity} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SuperadminLayout>
  );
}

-- Create system_settings table for global configuration
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only superadmins can view settings
CREATE POLICY "Superadmins can view all settings"
ON public.system_settings
FOR SELECT
USING (is_superadmin(auth.uid()));

-- Only superadmins can update settings
CREATE POLICY "Superadmins can update settings"
ON public.system_settings
FOR UPDATE
USING (is_superadmin(auth.uid()));

-- Only superadmins can insert settings
CREATE POLICY "Superadmins can insert settings"
ON public.system_settings
FOR INSERT
WITH CHECK (is_superadmin(auth.uid()));

-- Only superadmins can delete settings
CREATE POLICY "Superadmins can delete settings"
ON public.system_settings
FOR DELETE
USING (is_superadmin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.system_settings (key, value, description) VALUES
('general', '{"systemName": "FloraFlow", "systemDescription": "Sistema de gestão para floriculturas", "supportEmail": "suporte@floraflow.com", "maintenanceMode": false}'::jsonb, 'Configurações gerais do sistema'),
('tenant_defaults', '{"defaultPlan": "trial", "trialDays": 14, "maxLocationsBasic": 1, "maxLocationsPro": 5, "maxLocationsEnterprise": "unlimited"}'::jsonb, 'Configurações padrão para novos tenants'),
('notifications', '{"emailNotifications": true, "newTenantNotification": true, "supportTicketNotification": true, "systemAlertNotification": true}'::jsonb, 'Configurações de notificações'),
('security', '{"sessionTimeout": 60, "maxLoginAttempts": 5, "passwordMinLength": 8, "requireTwoFactor": false}'::jsonb, 'Configurações de segurança');
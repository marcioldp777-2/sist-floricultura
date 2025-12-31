-- Create support tickets table for tenant support requests
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'billing', 'technical', 'feature_request', 'bug')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create support ticket messages table for conversation
CREATE TABLE public.support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Superadmin policies for support_tickets
CREATE POLICY "Superadmins can view all tickets"
ON public.support_tickets
FOR SELECT
USING (is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can manage all tickets"
ON public.support_tickets
FOR ALL
USING (is_superadmin(auth.uid()));

-- Tenant users can view their own tickets
CREATE POLICY "Tenant users can view their tickets"
ON public.support_tickets
FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()));

-- Tenant users can create tickets for their tenant
CREATE POLICY "Tenant users can create tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- Superadmin policies for messages
CREATE POLICY "Superadmins can view all messages"
ON public.support_ticket_messages
FOR SELECT
USING (is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can manage all messages"
ON public.support_ticket_messages
FOR ALL
USING (is_superadmin(auth.uid()));

-- Tenant users can view non-internal messages of their tickets
CREATE POLICY "Tenant users can view ticket messages"
ON public.support_ticket_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = support_ticket_messages.ticket_id
    AND t.tenant_id = get_user_tenant_id(auth.uid())
  )
  AND is_internal = false
);

-- Tenant users can create messages on their tickets
CREATE POLICY "Tenant users can create messages"
ON public.support_ticket_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = support_ticket_messages.ticket_id
    AND t.tenant_id = get_user_tenant_id(auth.uid())
  )
  AND is_internal = false
);

-- Create trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
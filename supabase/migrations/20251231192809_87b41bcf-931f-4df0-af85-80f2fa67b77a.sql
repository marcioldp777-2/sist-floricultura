-- =============================================
-- FASE 1: FUNDAÇÃO MULTI-TENANT PARA FLORICULTURAS
-- =============================================

-- 1. ENUM para roles do sistema
CREATE TYPE public.app_role AS ENUM (
  'superadmin',      -- Administrador da plataforma SaaS
  'tenant_owner',    -- Dono da floricultura
  'manager',         -- Gerente de loja
  'florist',         -- Florista (monta arranjos)
  'seller',          -- Vendedor
  'driver',          -- Entregador
  'accountant'       -- Contador/financeiro
);

-- 2. ENUM para status do tenant
CREATE TYPE public.tenant_status AS ENUM (
  'active',
  'suspended',
  'cancelled',
  'trial'
);

-- 3. ENUM para planos (inclui trial)
CREATE TYPE public.tenant_plan AS ENUM (
  'trial',      -- Período de teste
  'basic',      -- 1 loja, funcionalidades básicas
  'pro',        -- Até 5 lojas, relatórios avançados
  'enterprise'  -- Ilimitado, suporte prioritário
);

-- =============================================
-- TABELAS PRINCIPAIS
-- =============================================

-- 4. Tabela de Tenants (floriculturas)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- URL amigável: floricultura-rosa
  plan tenant_plan NOT NULL DEFAULT 'trial',
  status tenant_status NOT NULL DEFAULT 'trial',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#10b981', -- cor tema
  phone TEXT,
  email TEXT,
  document TEXT, -- CNPJ
  max_locations INTEGER NOT NULL DEFAULT 1,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabela de Locations (lojas físicas do tenant)
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- store-01, loja-centro
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'store', -- store, warehouse, truck
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zipcode TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- 6. Tabela de Profiles (dados do usuário vinculados ao auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Tabela de User Roles (SEPARADA para segurança - evita privilege escalation)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_locations_tenant ON public.locations(tenant_id);
CREATE INDEX idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_status ON public.tenants(status);

-- =============================================
-- FUNÇÕES DE SEGURANÇA (SECURITY DEFINER)
-- =============================================

-- Função para verificar se usuário tem uma role específica
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para obter o tenant_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Função para verificar se usuário é superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'superadmin')
$$;

-- Função para verificar se usuário pertence ao tenant
CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND tenant_id = _tenant_id
  )
$$;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: TENANTS
-- Superadmins podem ver todos os tenants
CREATE POLICY "Superadmins can view all tenants"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (public.is_superadmin(auth.uid()));

-- Usuários podem ver seu próprio tenant
CREATE POLICY "Users can view their own tenant"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (id = public.get_user_tenant_id(auth.uid()));

-- Apenas superadmins podem criar tenants
CREATE POLICY "Superadmins can create tenants"
  ON public.tenants FOR INSERT
  TO authenticated
  WITH CHECK (public.is_superadmin(auth.uid()));

-- Superadmins podem atualizar qualquer tenant
CREATE POLICY "Superadmins can update any tenant"
  ON public.tenants FOR UPDATE
  TO authenticated
  USING (public.is_superadmin(auth.uid()));

-- Tenant owners podem atualizar seu próprio tenant
CREATE POLICY "Tenant owners can update their tenant"
  ON public.tenants FOR UPDATE
  TO authenticated
  USING (
    id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'tenant_owner')
  );

-- POLÍTICAS: LOCATIONS
-- Superadmins podem ver todas as locations
CREATE POLICY "Superadmins can view all locations"
  ON public.locations FOR SELECT
  TO authenticated
  USING (public.is_superadmin(auth.uid()));

-- Usuários podem ver locations do seu tenant
CREATE POLICY "Users can view their tenant locations"
  ON public.locations FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Tenant owners e managers podem criar locations
CREATE POLICY "Tenant admins can create locations"
  ON public.locations FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'tenant_owner')
      OR public.has_role(auth.uid(), 'manager')
    )
  );

-- Tenant owners e managers podem atualizar locations
CREATE POLICY "Tenant admins can update locations"
  ON public.locations FOR UPDATE
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'tenant_owner')
      OR public.has_role(auth.uid(), 'manager')
    )
  );

-- Tenant owners podem deletar locations
CREATE POLICY "Tenant owners can delete locations"
  ON public.locations FOR DELETE
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'tenant_owner')
  );

-- POLÍTICAS: PROFILES
-- Superadmins podem ver todos os profiles
CREATE POLICY "Superadmins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_superadmin(auth.uid()));

-- Usuários podem ver profiles do seu tenant
CREATE POLICY "Users can view profiles in their tenant"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Usuários podem ver seu próprio profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Permitir criação de profile durante signup
CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Usuários podem atualizar seu próprio profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Superadmins podem atualizar qualquer profile
CREATE POLICY "Superadmins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_superadmin(auth.uid()));

-- POLÍTICAS: USER_ROLES
-- Superadmins podem ver todas as roles
CREATE POLICY "Superadmins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_superadmin(auth.uid()));

-- Tenant owners podem ver roles do seu tenant
CREATE POLICY "Tenant owners can view tenant roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'tenant_owner')
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_roles.user_id
        AND p.tenant_id = public.get_user_tenant_id(auth.uid())
    )
  );

-- Usuários podem ver suas próprias roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Superadmins podem atribuir qualquer role
CREATE POLICY "Superadmins can assign any role"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_superadmin(auth.uid()));

-- Tenant owners podem atribuir roles (exceto superadmin)
CREATE POLICY "Tenant owners can assign tenant roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'tenant_owner')
    AND role != 'superadmin'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_roles.user_id
        AND p.tenant_id = public.get_user_tenant_id(auth.uid())
    )
  );

-- Superadmins podem remover qualquer role
CREATE POLICY "Superadmins can delete any role"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_superadmin(auth.uid()));

-- Tenant owners podem remover roles do seu tenant (exceto superadmin)
CREATE POLICY "Tenant owners can delete tenant roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'tenant_owner')
    AND role != 'superadmin'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_roles.user_id
        AND p.tenant_id = public.get_user_tenant_id(auth.uid())
    )
  );

-- =============================================
-- TRIGGER: Auto-criar profile no signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar profile automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TRIGGER: Atualizar updated_at automaticamente
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
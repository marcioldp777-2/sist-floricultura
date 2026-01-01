-- =============================================
-- SCHEMA PARA SISTEMA DE QR CODE DE FLORICULTURA
-- =============================================

-- =============================================
-- 1. ENUMS
-- =============================================

-- Tipo de produto
CREATE TYPE public.product_type AS ENUM (
  'cut_flower',      -- flor de corte
  'potted_plant',    -- vaso
  'arrangement',     -- arranjo
  'bunch',           -- maço
  'seedling',        -- muda
  'seed',            -- semente
  'supply',          -- insumo (vaso, substrato, adubo)
  'accessory'        -- acessório
);

-- Nível de luz
CREATE TYPE public.light_level AS ENUM (
  'full_sun',        -- pleno sol
  'partial_shade',   -- meia-sombra
  'shade',           -- sombra
  'indirect_light'   -- luz indireta
);

-- Frequência de rega
CREATE TYPE public.watering_frequency AS ENUM (
  'daily',           -- diária
  'every_2_days',    -- a cada 2 dias
  'twice_weekly',    -- 2x por semana
  'weekly',          -- semanal
  'biweekly',        -- quinzenal
  'monthly',         -- mensal
  'rarely'           -- raramente
);

-- Status do QR Code
CREATE TYPE public.qr_status AS ENUM (
  'active',
  'paused',
  'expired',
  'revoked'
);

-- Tipo de unidade de venda
CREATE TYPE public.selling_unit AS ENUM (
  'stem',            -- haste
  'bunch',           -- maço
  'pot',             -- vaso
  'arrangement',     -- arranjo
  'unit',            -- unidade
  'kit'              -- kit
);

-- Status do lote de estoque
CREATE TYPE public.stock_lot_status AS ENUM (
  'available',
  'reserved',
  'sold',
  'expired',
  'damaged',
  'returned'
);

-- Canal de notificação
CREATE TYPE public.notification_channel AS ENUM (
  'email',
  'whatsapp',
  'push',
  'sms'
);

-- =============================================
-- 2. TABELA DE PRODUTOS ESTENDIDA (BOTÂNICOS)
-- =============================================

-- Tabela principal de produtos botânicos
CREATE TABLE public.botanical_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Informações básicas
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  product_type product_type NOT NULL DEFAULT 'cut_flower',
  
  -- Dados botânicos
  genus TEXT,                        -- gênero botânico
  species TEXT,                      -- espécie
  cultivar TEXT,                     -- cultivar
  common_names TEXT[],               -- nomes populares
  seasonality TEXT[],                -- meses de sazonalidade
  flowering_season TEXT[],           -- época de floração
  
  -- Cuidados
  light_level light_level,
  light_lux_min INTEGER,             -- lux mínimo
  light_lux_max INTEGER,             -- lux máximo
  watering_frequency watering_frequency,
  humidity_min INTEGER,              -- % umidade mínima
  humidity_max INTEGER,              -- % umidade máxima
  temperature_min NUMERIC,           -- °C mínima
  temperature_max NUMERIC,           -- °C máxima
  ventilation_notes TEXT,
  pruning_notes TEXT,
  substrate_type TEXT,
  fertilization_notes TEXT,
  repotting_frequency TEXT,
  
  -- Vida útil e sensibilidade
  vase_life_days INTEGER,            -- vida em vaso (dias)
  cut_life_days INTEGER,             -- vida de corte (dias)
  ethylene_sensitive BOOLEAN DEFAULT false,
  post_harvest_notes TEXT,
  
  -- Alertas de segurança
  is_allergenic BOOLEAN DEFAULT false,
  allergen_notes TEXT,
  toxic_to_pets BOOLEAN DEFAULT false,
  toxic_to_children BOOLEAN DEFAULT false,
  toxicity_notes TEXT,
  
  -- Origem e certificações
  origin_country TEXT,
  origin_region TEXT,
  origin_farm TEXT,
  certifications TEXT[],              -- Fairtrade, Rainforest, etc.
  
  -- Apresentação
  height_cm_min NUMERIC,
  height_cm_max NUMERIC,
  pot_diameter_cm NUMERIC,
  stems_per_bunch INTEGER,
  available_colors TEXT[],
  
  -- Preços base
  base_price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  
  -- Status e SEO
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  
  -- Mídia
  primary_image_url TEXT,
  gallery_images TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_tenant_sku UNIQUE (tenant_id, sku),
  CONSTRAINT unique_tenant_slug UNIQUE (tenant_id, slug)
);

-- Trigger para updated_at
CREATE TRIGGER update_botanical_products_updated_at
  BEFORE UPDATE ON public.botanical_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS para botanical_products
ALTER TABLE public.botanical_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can view all botanical products"
  ON public.botanical_products FOR SELECT
  USING (is_superadmin(auth.uid()));

CREATE POLICY "Tenant users can view their botanical products"
  ON public.botanical_products FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Tenant admins can manage botanical products"
  ON public.botanical_products FOR ALL
  USING (
    tenant_id = get_user_tenant_id(auth.uid()) 
    AND (has_role(auth.uid(), 'tenant_owner') OR has_role(auth.uid(), 'manager'))
  );

-- =============================================
-- 3. VARIAÇÕES DE PRODUTOS
-- =============================================

CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.botanical_products(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  sku TEXT NOT NULL,
  name TEXT NOT NULL,                -- Ex: "Rosa Vermelha - Maço 12 hastes"
  
  -- Atributos da variação
  color TEXT,
  size TEXT,                         -- P, M, G ou medidas
  selling_unit selling_unit NOT NULL DEFAULT 'unit',
  unit_quantity INTEGER DEFAULT 1,   -- quantidade por unidade (ex: 12 hastes por maço)
  
  -- Preços
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC,          -- preço anterior (para promoção)
  cost_price NUMERIC DEFAULT 0,
  
  -- Dimensões
  height_cm NUMERIC,
  pot_diameter_cm NUMERIC,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Mídia
  image_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_variant_sku UNIQUE (tenant_id, sku)
);

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view their product variants"
  ON public.product_variants FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Tenant admins can manage product variants"
  ON public.product_variants FOR ALL
  USING (
    tenant_id = get_user_tenant_id(auth.uid()) 
    AND (has_role(auth.uid(), 'tenant_owner') OR has_role(auth.uid(), 'manager'))
  );

CREATE POLICY "Superadmins can view all product variants"
  ON public.product_variants FOR SELECT
  USING (is_superadmin(auth.uid()));

-- =============================================
-- 4. CONTEÚDO EDUCACIONAL (VERSIONADO)
-- =============================================

CREATE TABLE public.product_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.botanical_products(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  version INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT true,
  
  -- Blocos de conteúdo (JSON estruturado)
  care_instructions JSONB,           -- como cuidar (checklist)
  curiosities TEXT,                  -- curiosidades e história
  cultural_meanings TEXT,            -- significados culturais
  best_locations JSONB,              -- melhores locais em casa
  pro_tips TEXT[],                   -- dicas profissionais
  arrangement_tips TEXT,             -- dicas para arranjos
  
  -- Alertas customizados
  custom_alerts TEXT[],
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published, archived
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,
  
  -- Audit
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_product_content_updated_at
  BEFORE UPDATE ON public.product_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.product_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published product content"
  ON public.product_content FOR SELECT
  USING (status = 'published' AND is_current = true);

CREATE POLICY "Tenant users can view their product content"
  ON public.product_content FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Tenant admins can manage product content"
  ON public.product_content FOR ALL
  USING (
    tenant_id = get_user_tenant_id(auth.uid()) 
    AND (has_role(auth.uid(), 'tenant_owner') OR has_role(auth.uid(), 'manager'))
  );

-- =============================================
-- 5. QR CODES E SHORT LINKS
-- =============================================

CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Short code único (alta entropia, não sequencial)
  short_code TEXT NOT NULL UNIQUE,
  
  -- Destino
  product_id UUID REFERENCES public.botanical_products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  
  -- Contexto e campanha
  context TEXT,                      -- prateleira, campanha, indoor, outdoor
  campaign_name TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  
  -- Status e validade
  status qr_status NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  
  -- Contadores (desnormalizados para performance)
  total_scans INTEGER NOT NULL DEFAULT 0,
  unique_scans INTEGER NOT NULL DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  
  -- Metadados
  label_printed_at TIMESTAMPTZ,
  label_format TEXT,                 -- 50x90mm, 62x100mm, A7, A6
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

CREATE INDEX idx_qr_codes_short_code ON public.qr_codes(short_code);
CREATE INDEX idx_qr_codes_product ON public.qr_codes(product_id);
CREATE INDEX idx_qr_codes_tenant_status ON public.qr_codes(tenant_id, status);

CREATE TRIGGER update_qr_codes_updated_at
  BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- QR codes podem ser resolvidos publicamente (para o scan funcionar)
CREATE POLICY "Anyone can resolve active QR codes"
  ON public.qr_codes FOR SELECT
  USING (status = 'active');

CREATE POLICY "Tenant users can view their QR codes"
  ON public.qr_codes FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Tenant admins can manage QR codes"
  ON public.qr_codes FOR ALL
  USING (
    tenant_id = get_user_tenant_id(auth.uid()) 
    AND (has_role(auth.uid(), 'tenant_owner') OR has_role(auth.uid(), 'manager'))
  );

CREATE POLICY "Superadmins can view all QR codes"
  ON public.qr_codes FOR SELECT
  USING (is_superadmin(auth.uid()));

-- =============================================
-- 6. ANALYTICS DE QR SCANS
-- =============================================

CREATE TABLE public.qr_scan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  
  -- Dados do scan
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash TEXT,                      -- hash do IP (privacidade)
  user_agent TEXT,
  device_type TEXT,                  -- mobile, tablet, desktop
  referrer TEXT,
  
  -- Localização aproximada (cidade/região, não GPS exato)
  country TEXT,
  region TEXT,
  city TEXT,
  
  -- Session tracking
  session_id TEXT,
  is_unique BOOLEAN DEFAULT true,
  
  -- UTM capturados
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT
);

CREATE INDEX idx_qr_scan_events_qr_code ON public.qr_scan_events(qr_code_id);
CREATE INDEX idx_qr_scan_events_tenant_date ON public.qr_scan_events(tenant_id, scanned_at);

ALTER TABLE public.qr_scan_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant admins can view their scan events"
  ON public.qr_scan_events FOR SELECT
  USING (
    tenant_id = get_user_tenant_id(auth.uid()) 
    AND (has_role(auth.uid(), 'tenant_owner') OR has_role(auth.uid(), 'manager'))
  );

CREATE POLICY "Anyone can insert scan events"
  ON public.qr_scan_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Superadmins can view all scan events"
  ON public.qr_scan_events FOR SELECT
  USING (is_superadmin(auth.uid()));

-- =============================================
-- 7. ESTOQUE PERECÍVEL (LOTES)
-- =============================================

CREATE TABLE public.stock_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  
  -- Identificação do lote
  lot_number TEXT NOT NULL,
  
  -- Quantidades
  initial_quantity INTEGER NOT NULL,
  available_quantity INTEGER NOT NULL,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  damaged_quantity INTEGER NOT NULL DEFAULT 0,
  
  -- Datas importantes
  arrival_date DATE NOT NULL,
  expiry_date DATE,                  -- data de validade
  best_before_date DATE,             -- melhor consumir até
  
  -- Armazenagem
  storage_temperature NUMERIC,       -- °C de armazenamento
  storage_notes TEXT,
  
  -- Fornecedor
  supplier_name TEXT,
  supplier_lot_reference TEXT,
  purchase_price NUMERIC,
  
  -- Status
  status stock_lot_status NOT NULL DEFAULT 'available',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_lots_variant ON public.stock_lots(variant_id);
CREATE INDEX idx_stock_lots_location ON public.stock_lots(location_id);
CREATE INDEX idx_stock_lots_expiry ON public.stock_lots(expiry_date);
CREATE INDEX idx_stock_lots_fefo ON public.stock_lots(expiry_date, arrival_date); -- FEFO ordering

CREATE TRIGGER update_stock_lots_updated_at
  BEFORE UPDATE ON public.stock_lots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.stock_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view their stock lots"
  ON public.stock_lots FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Tenant admins can manage stock lots"
  ON public.stock_lots FOR ALL
  USING (
    tenant_id = get_user_tenant_id(auth.uid()) 
    AND (has_role(auth.uid(), 'tenant_owner') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'florist'))
  );

CREATE POLICY "Superadmins can view all stock lots"
  ON public.stock_lots FOR SELECT
  USING (is_superadmin(auth.uid()));

-- =============================================
-- 8. RESERVAS DE ESTOQUE (CARRINHO)
-- =============================================

CREATE TABLE public.stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  lot_id UUID NOT NULL REFERENCES public.stock_lots(id) ON DELETE CASCADE,
  
  -- Sessão/Carrinho
  session_id TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  
  -- Reserva
  quantity INTEGER NOT NULL,
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,   -- timeout configurável
  
  -- Status
  status TEXT NOT NULL DEFAULT 'reserved', -- reserved, converted, expired, cancelled
  converted_at TIMESTAMPTZ,
  order_id UUID
);

CREATE INDEX idx_stock_reservations_lot ON public.stock_reservations(lot_id);
CREATE INDEX idx_stock_reservations_session ON public.stock_reservations(session_id);
CREATE INDEX idx_stock_reservations_expires ON public.stock_reservations(expires_at) WHERE status = 'reserved';

ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create reservations"
  ON public.stock_reservations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sessions can view their reservations"
  ON public.stock_reservations FOR SELECT
  USING (true);

CREATE POLICY "Tenant admins can manage reservations"
  ON public.stock_reservations FOR ALL
  USING (tenant_id = get_user_tenant_id(auth.uid()));

-- =============================================
-- 9. LEMBRETES DE CUIDADO
-- =============================================

CREATE TABLE public.care_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.botanical_products(id) ON DELETE CASCADE,
  
  -- Contato
  customer_id UUID REFERENCES public.customers(id),
  email TEXT,
  phone TEXT,
  
  -- Configuração
  channel notification_channel NOT NULL DEFAULT 'email',
  frequency_days INTEGER NOT NULL DEFAULT 7,   -- a cada X dias
  reminder_type TEXT NOT NULL DEFAULT 'watering', -- watering, fertilizing, general
  custom_message TEXT,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ,
  total_sent INTEGER NOT NULL DEFAULT 0,
  
  -- Opt-in/out
  opted_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opted_out_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_care_reminders_next_send ON public.care_reminders(next_send_at) WHERE is_active = true;

ALTER TABLE public.care_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create care reminders"
  ON public.care_reminders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Tenant admins can view care reminders"
  ON public.care_reminders FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

-- =============================================
-- 10. PRODUTOS RELACIONADOS (UPSELL/CROSS-SELL)
-- =============================================

CREATE TABLE public.product_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.botanical_products(id) ON DELETE CASCADE,
  related_product_id UUID NOT NULL REFERENCES public.botanical_products(id) ON DELETE CASCADE,
  
  relation_type TEXT NOT NULL DEFAULT 'related', -- related, upsell, cross_sell, substitute, accessory
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT no_self_relation CHECK (product_id != related_product_id),
  CONSTRAINT unique_relation UNIQUE (product_id, related_product_id, relation_type)
);

ALTER TABLE public.product_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active product relations"
  ON public.product_relations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Tenant admins can manage product relations"
  ON public.product_relations FOR ALL
  USING (
    tenant_id = get_user_tenant_id(auth.uid()) 
    AND (has_role(auth.uid(), 'tenant_owner') OR has_role(auth.uid(), 'manager'))
  );

-- =============================================
-- 11. EVENTOS DE ANALYTICS (GENÉRICO)
-- =============================================

CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Tipo de evento
  event_type TEXT NOT NULL,          -- QR_Scan, Landing_View, Add_To_Cart, Conversion, etc.
  
  -- Contexto
  product_id UUID REFERENCES public.botanical_products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  qr_code_id UUID REFERENCES public.qr_codes(id),
  order_id UUID,
  location_id UUID REFERENCES public.locations(id),
  
  -- Propriedades do evento (flexível)
  properties JSONB,
  
  -- Sessão
  session_id TEXT,
  customer_id UUID REFERENCES public.customers(id),
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_tenant_type ON public.analytics_events(tenant_id, event_type);
CREATE INDEX idx_analytics_events_date ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_product ON public.analytics_events(product_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Tenant admins can view their analytics"
  ON public.analytics_events FOR SELECT
  USING (
    tenant_id = get_user_tenant_id(auth.uid()) 
    AND (has_role(auth.uid(), 'tenant_owner') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'accountant'))
  );

CREATE POLICY "Superadmins can view all analytics"
  ON public.analytics_events FOR SELECT
  USING (is_superadmin(auth.uid()));

-- =============================================
-- 12. FUNÇÃO PARA GERAR SHORT CODE ÚNICO
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_short_code(length INTEGER DEFAULT 6)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- sem I, O, 0, 1 para evitar confusão
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- =============================================
-- 13. FUNÇÃO PARA CRIAR QR CODE COM SHORT CODE ÚNICO
-- =============================================

CREATE OR REPLACE FUNCTION public.create_qr_code(
  p_tenant_id UUID,
  p_product_id UUID,
  p_variant_id UUID DEFAULT NULL,
  p_location_id UUID DEFAULT NULL,
  p_context TEXT DEFAULT NULL,
  p_campaign_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_short_code TEXT;
  v_qr_id UUID;
  v_attempts INTEGER := 0;
BEGIN
  -- Tentar gerar um short code único (máximo 10 tentativas)
  LOOP
    v_short_code := generate_short_code(6);
    
    -- Verificar se já existe
    IF NOT EXISTS (SELECT 1 FROM qr_codes WHERE short_code = v_short_code) THEN
      EXIT;
    END IF;
    
    v_attempts := v_attempts + 1;
    IF v_attempts >= 10 THEN
      RAISE EXCEPTION 'Não foi possível gerar um short code único após 10 tentativas';
    END IF;
  END LOOP;
  
  -- Inserir o QR code
  INSERT INTO qr_codes (
    tenant_id,
    short_code,
    product_id,
    variant_id,
    location_id,
    context,
    campaign_name,
    created_by
  ) VALUES (
    p_tenant_id,
    v_short_code,
    p_product_id,
    p_variant_id,
    p_location_id,
    p_context,
    p_campaign_name,
    auth.uid()
  ) RETURNING id INTO v_qr_id;
  
  RETURN v_qr_id;
END;
$$;

-- =============================================
-- 14. FUNÇÃO PARA RESOLVER QR CODE (PÚBLICO)
-- =============================================

CREATE OR REPLACE FUNCTION public.resolve_qr_code(p_short_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_qr RECORD;
  v_product RECORD;
  v_variant RECORD;
  v_content RECORD;
  v_result JSONB;
BEGIN
  -- Buscar QR code
  SELECT * INTO v_qr FROM qr_codes 
  WHERE short_code = p_short_code 
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now());
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'QR code não encontrado ou expirado');
  END IF;
  
  -- Atualizar contadores
  UPDATE qr_codes 
  SET total_scans = total_scans + 1,
      last_scanned_at = now()
  WHERE id = v_qr.id;
  
  -- Buscar produto
  IF v_qr.product_id IS NOT NULL THEN
    SELECT * INTO v_product FROM botanical_products WHERE id = v_qr.product_id;
    
    -- Buscar conteúdo publicado
    SELECT * INTO v_content FROM product_content 
    WHERE product_id = v_qr.product_id 
      AND is_current = true 
      AND status = 'published';
  END IF;
  
  -- Buscar variação
  IF v_qr.variant_id IS NOT NULL THEN
    SELECT * INTO v_variant FROM product_variants WHERE id = v_qr.variant_id;
  END IF;
  
  -- Montar resultado
  v_result := jsonb_build_object(
    'qr_code_id', v_qr.id,
    'tenant_id', v_qr.tenant_id,
    'short_code', v_qr.short_code,
    'campaign', v_qr.campaign_name,
    'product', CASE WHEN v_product IS NOT NULL THEN to_jsonb(v_product) ELSE NULL END,
    'variant', CASE WHEN v_variant IS NOT NULL THEN to_jsonb(v_variant) ELSE NULL END,
    'content', CASE WHEN v_content IS NOT NULL THEN to_jsonb(v_content) ELSE NULL END
  );
  
  RETURN v_result;
END;
$$;
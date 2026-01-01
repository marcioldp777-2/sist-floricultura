-- Add unique constraints for safe upsert operations

-- Locations: tenant_id + code
ALTER TABLE public.locations 
ADD CONSTRAINT locations_tenant_id_code_unique UNIQUE (tenant_id, code);

-- Botanical Products: tenant_id + sku
ALTER TABLE public.botanical_products 
ADD CONSTRAINT botanical_products_tenant_id_sku_unique UNIQUE (tenant_id, sku);

-- Product Variants: tenant_id + sku
ALTER TABLE public.product_variants 
ADD CONSTRAINT product_variants_tenant_id_sku_unique UNIQUE (tenant_id, sku);

-- Stock Lots: tenant_id + lot_number
ALTER TABLE public.stock_lots 
ADD CONSTRAINT stock_lots_tenant_id_lot_number_unique UNIQUE (tenant_id, lot_number);

-- QR Codes: short_code (already globally unique, but let's ensure it)
-- First check if constraint exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'qr_codes_short_code_unique'
  ) THEN
    ALTER TABLE public.qr_codes 
    ADD CONSTRAINT qr_codes_short_code_unique UNIQUE (short_code);
  END IF;
END $$;
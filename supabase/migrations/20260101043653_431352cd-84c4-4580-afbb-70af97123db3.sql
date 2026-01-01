-- Drop old function to allow return type change
DROP FUNCTION IF EXISTS public.resolve_qr_code(text);

-- Recreate with SECURITY DEFINER to allow UPDATE from anon users
CREATE OR REPLACE FUNCTION public.resolve_qr_code(p_short_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := upper(trim(p_short_code));
  v_qr public.qr_codes%ROWTYPE;
  v_product public.botanical_products%ROWTYPE;
  v_variant public.product_variants%ROWTYPE;
  v_content public.product_content%ROWTYPE;
  v_has_variant boolean := false;
  v_has_content boolean := false;
BEGIN
  IF v_code IS NULL OR v_code = '' THEN
    RETURN json_build_object('error', 'Código QR inválido');
  END IF;

  SELECT *
    INTO v_qr
  FROM public.qr_codes
  WHERE short_code = v_code
    AND status = 'active'::public.qr_status
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Produto não encontrado');
  END IF;

  -- Increment counters (runs as definer, bypasses RLS)
  UPDATE public.qr_codes
    SET total_scans = COALESCE(total_scans, 0) + 1,
        last_scanned_at = now(),
        updated_at = now()
  WHERE id = v_qr.id;

  -- Load product (must exist)
  IF v_qr.product_id IS NULL THEN
    RETURN json_build_object('error', 'Produto não encontrado');
  END IF;

  SELECT *
    INTO v_product
  FROM public.botanical_products
  WHERE id = v_qr.product_id
    AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Produto não encontrado');
  END IF;

  -- Optional variant
  IF v_qr.variant_id IS NOT NULL THEN
    SELECT *
      INTO v_variant
    FROM public.product_variants
    WHERE id = v_qr.variant_id
      AND is_active = true
    LIMIT 1;

    IF FOUND THEN
      v_has_variant := true;
    END IF;
  END IF;

  -- Public content: only published + current
  SELECT *
    INTO v_content
  FROM public.product_content
  WHERE product_id = v_product.id
    AND is_current = true
    AND status = 'published'
  ORDER BY version DESC
  LIMIT 1;

  IF FOUND THEN
    v_has_content := true;
  END IF;

  RETURN json_build_object(
    'qr_code_id', v_qr.id,
    'tenant_id', v_qr.tenant_id,
    'short_code', v_qr.short_code,
    'campaign', v_qr.campaign_name,
    'product', to_jsonb(v_product),
    'variant', CASE WHEN v_has_variant THEN to_jsonb(v_variant) ELSE NULL END,
    'content', CASE WHEN v_has_content THEN to_jsonb(v_content) ELSE NULL END
  );
END;
$$;

-- Allow anon/authenticated to call the function
GRANT EXECUTE ON FUNCTION public.resolve_qr_code(text) TO anon, authenticated;
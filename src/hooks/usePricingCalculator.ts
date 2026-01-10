import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface StockLot {
  id: string;
  lot_number: string;
  purchase_price: number;
  available_quantity: number;
  expiry_date: string | null;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost_price: number | null;
}

export interface BotanicalProduct {
  id: string;
  name: string;
  sku: string;
  base_price: number;
  cost_price: number | null;
  product_variants?: ProductVariant[];
}

export interface SeasonalEvent {
  id: string;
  name: string;
  event_date: string;
  impact_multiplier: number;
  affected_categories: string[] | null;
}

export interface PricingResult {
  cmvPonderado: number;
  precoBase: number;
  precoSazonal: number;
  margemPercentual: number;
  margemAbsoluta: number;
  fatorSazonal: number;
  descontoValidade: number;
  eventoAtivo: SeasonalEvent | null;
}

export function usePricingCalculator() {
  const { effectiveTenantId } = useAuth();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [markupPercentual, setMarkupPercentual] = useState<number>(100);

  // Fetch products with variants
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["pricing-products", effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return [];
      const { data, error } = await supabase
        .from("botanical_products")
        .select(`id, name, sku, base_price, cost_price, product_variants(id, name, sku, price, cost_price)`)
        .eq("tenant_id", effectiveTenantId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return (data || []) as BotanicalProduct[];
    },
    enabled: !!effectiveTenantId,
  });

  // Fetch stock lots for selected variant
  const { data: stockLots, isLoading: lotsLoading } = useQuery({
    queryKey: ["pricing-lots", selectedVariantId],
    queryFn: async () => {
      if (!selectedVariantId) return [];
      const { data, error } = await supabase
        .from("stock_lots")
        .select("*")
        .eq("variant_id", selectedVariantId)
        .gt("available_quantity", 0)
        .order("expiry_date", { ascending: true });

      if (error) throw error;
      return data as StockLot[];
    },
    enabled: !!selectedVariantId,
  });

  // Fetch seasonal events for selected date
  const { data: seasonalEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["pricing-events", selectedDate.toISOString().split("T")[0]],
    queryFn: async () => {
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 7);

      const { data, error } = await supabase
        .from("seasonal_events")
        .select("*")
        .eq("is_active", true)
        .gte("event_date", startDate.toISOString().split("T")[0])
        .lte("event_date", endDate.toISOString().split("T")[0])
        .order("impact_multiplier", { ascending: false });

      if (error) throw error;
      return data as SeasonalEvent[];
    },
  });

  const selectedProduct = useMemo(
    () => products?.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const selectedVariant = useMemo(
    () => selectedProduct?.product_variants?.find((v) => v.id === selectedVariantId) || null,
    [selectedProduct, selectedVariantId]
  );

  // Calculate weighted CMV from stock lots
  const calculateWeightedCMV = (lots: StockLot[]): number => {
    if (!lots || lots.length === 0) {
      // Fallback to variant or product cost_price
      if (selectedVariant?.cost_price) return selectedVariant.cost_price;
      if (selectedProduct?.cost_price) return selectedProduct.cost_price;
      return 0;
    }

    const totalQty = lots.reduce((sum, lot) => sum + lot.available_quantity, 0);
    if (totalQty === 0) return 0;

    const weightedCost = lots.reduce(
      (sum, lot) => sum + lot.purchase_price * lot.available_quantity,
      0
    );
    return weightedCost / totalQty;
  };

  // Get expiry discount based on days until expiry
  const getExpiryDiscount = (daysUntilExpiry: number): number => {
    if (daysUntilExpiry <= 1) return 0.5; // 50% off
    if (daysUntilExpiry <= 3) return 0.3; // 30% off
    if (daysUntilExpiry <= 5) return 0.15; // 15% off
    if (daysUntilExpiry <= 7) return 0.1; // 10% off
    return 0;
  };

  // Get minimum days until expiry from lots
  const getMinDaysUntilExpiry = (lots: StockLot[]): number | null => {
    if (!lots || lots.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let minDays: number | null = null;

    for (const lot of lots) {
      if (lot.expiry_date) {
        const expiryDate = new Date(lot.expiry_date);
        expiryDate.setHours(0, 0, 0, 0);
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (minDays === null || diffDays < minDays) {
          minDays = diffDays;
        }
      }
    }

    return minDays;
  };

  // Find active seasonal event for current product category
  const getActiveSeasonalEvent = (): SeasonalEvent | null => {
    if (!seasonalEvents || seasonalEvents.length === 0) return null;

    // Find any active event (simplified - no category filtering since category_id not in botanical_products)
    for (const event of seasonalEvents) {
      if (!event.affected_categories || event.affected_categories.length === 0) {
        return event; // Affects all
      }
    }

    // Return first event if no category match
    return seasonalEvents[0] || null;

    // Return first event if no category match
    return seasonalEvents[0] || null;
  };

  // Calculate final pricing
  const pricingResult = useMemo((): PricingResult | null => {
    if (!selectedProduct) return null;

    const cmvPonderado = calculateWeightedCMV(stockLots || []);
    if (cmvPonderado === 0) return null;

    const minDays = getMinDaysUntilExpiry(stockLots || []);
    const descontoValidade = minDays !== null ? getExpiryDiscount(minDays) : 0;

    const eventoAtivo = getActiveSeasonalEvent();
    const fatorSazonal = eventoAtivo?.impact_multiplier || 1;

    // Base price with markup
    const precoBase = cmvPonderado * (1 + markupPercentual / 100);

    // Apply seasonal factor
    const precoSazonal = precoBase * fatorSazonal * (1 - descontoValidade);

    // Calculate margin
    const margemAbsoluta = precoSazonal - cmvPonderado;
    const margemPercentual = ((precoSazonal - cmvPonderado) / cmvPonderado) * 100;

    return {
      cmvPonderado,
      precoBase,
      precoSazonal,
      margemPercentual,
      margemAbsoluta,
      fatorSazonal,
      descontoValidade,
      eventoAtivo,
    };
  }, [selectedProduct, stockLots, seasonalEvents, markupPercentual]);

  const getLotStatus = (lot: StockLot): { status: string; color: string; discount: number } => {
    if (!lot.expiry_date) {
      return { status: "Normal", color: "text-green-600", discount: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(lot.expiry_date);
    expiryDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return { status: "Crítico -50%", color: "text-red-600", discount: 50 };
    if (diffDays <= 3) return { status: "Urgente -30%", color: "text-orange-600", discount: 30 };
    if (diffDays <= 5) return { status: "Atenção -15%", color: "text-yellow-600", discount: 15 };
    if (diffDays <= 7) return { status: "Breve -10%", color: "text-amber-600", discount: 10 };
    return { status: "Normal", color: "text-green-600", discount: 0 };
  };

  return {
    products: products || [],
    stockLots: stockLots || [],
    seasonalEvents: seasonalEvents || [],
    selectedProduct,
    selectedVariant,
    selectedProductId,
    selectedVariantId,
    selectedDate,
    markupPercentual,
    pricingResult,
    isLoading: productsLoading || lotsLoading || eventsLoading,
    setSelectedProductId,
    setSelectedVariantId,
    setSelectedDate,
    setMarkupPercentual,
    getLotStatus,
    getActiveSeasonalEvent,
  };
}

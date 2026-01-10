import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calculator, CalendarIcon } from "lucide-react";
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { usePricingCalculator } from "@/hooks/usePricingCalculator";
import { CostAnalysisCard } from "@/components/tenant/pricing/CostAnalysisCard";
import { SeasonalFactorCard } from "@/components/tenant/pricing/SeasonalFactorCard";
import { PricingResultCard } from "@/components/tenant/pricing/PricingResultCard";
import { toast } from "sonner";

export default function PricingCalculatorPage() {
  const {
    products,
    stockLots,
    selectedProduct,
    selectedVariant,
    selectedProductId,
    selectedVariantId,
    selectedDate,
    markupPercentual,
    pricingResult,
    isLoading,
    setSelectedProductId,
    setSelectedVariantId,
    setSelectedDate,
    setMarkupPercentual,
    getLotStatus,
  } = usePricingCalculator();

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    setSelectedVariantId(null);
  };

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
  };

  const handleReset = () => {
    setSelectedProductId(null);
    setSelectedVariantId(null);
    setMarkupPercentual(100);
    setSelectedDate(new Date());
  };

  const handleApplyPrice = () => {
    if (!pricingResult || !selectedVariant) return;
    toast.success(
      `Preço ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(pricingResult.precoSazonal)} seria aplicado à variante ${selectedVariant.name}`,
      {
        description: "Funcionalidade de aplicação em desenvolvimento",
      }
    );
  };

  return (
    <TenantLayout title="Calculadora de Precificação" description="Simule preços considerando CMV, sazonalidade e validade">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Selecione o Produto</CardTitle>
            <CardDescription>Escolha o produto, variante e data para simular</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Product Select */}
              <div className="space-y-2">
                <Label htmlFor="product">Produto</Label>
                <Select value={selectedProductId || ""} onValueChange={handleProductChange}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Variant Select */}
              <div className="space-y-2">
                <Label htmlFor="variant">Variante</Label>
                <Select
                  value={selectedVariantId || ""}
                  onValueChange={handleVariantChange}
                  disabled={!selectedProduct || !selectedProduct.product_variants?.length}
                >
                  <SelectTrigger id="variant">
                    <SelectValue
                      placeholder={
                        !selectedProduct
                          ? "Selecione um produto primeiro"
                          : selectedProduct.product_variants?.length === 0
                          ? "Sem variantes"
                          : "Selecione uma variante"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct?.product_variants?.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.name} ({variant.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Picker */}
              <div className="space-y-2">
                <Label>Data de Venda</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, "PPP", { locale: ptBR })
                        : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <CostAnalysisCard
              lots={stockLots}
              cmvPonderado={pricingResult?.cmvPonderado || 0}
              getLotStatus={getLotStatus}
              isLoading={isLoading && !!selectedVariantId}
            />

            <SeasonalFactorCard
              eventoAtivo={pricingResult?.eventoAtivo || null}
              descontoValidade={pricingResult?.descontoValidade || 0}
              markupPercentual={markupPercentual}
              onMarkupChange={setMarkupPercentual}
            />
          </div>

          {/* Right Column */}
          <div>
            <PricingResultCard
              result={pricingResult}
              onApplyPrice={selectedVariant ? handleApplyPrice : undefined}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>
    </TenantLayout>
  );
}

import { Calculator, TrendingUp, Percent, DollarSign, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingResult } from "@/hooks/usePricingCalculator";

interface PricingResultCardProps {
  result: PricingResult | null;
  onApplyPrice?: () => void;
  onReset?: () => void;
}

export function PricingResultCard({ result, onApplyPrice, onReset }: PricingResultCardProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  if (!result) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calculator className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-center text-muted-foreground">
            Selecione um produto e variante para calcular o preço
          </p>
        </CardContent>
      </Card>
    );
  }

  const isHighMargin = result.margemPercentual >= 100;
  const isLowMargin = result.margemPercentual < 30;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Resultado</CardTitle>
        </div>
        <CardDescription>Preço calculado com todos os fatores aplicados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Result Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-background p-4 text-center shadow-sm">
            <DollarSign className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Preço Base</p>
            <p className="text-xl font-bold">{formatCurrency(result.precoBase)}</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-4 text-center shadow-sm">
            <TrendingUp className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-xs text-muted-foreground">C/ Sazonal</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(result.precoSazonal)}</p>
          </div>
          <div className="rounded-lg bg-background p-4 text-center shadow-sm">
            <Percent className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Margem</p>
            <p
              className={`text-xl font-bold ${
                isHighMargin
                  ? "text-green-600"
                  : isLowMargin
                  ? "text-red-600"
                  : "text-foreground"
              }`}
            >
              {result.margemPercentual.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">CMV Ponderado</span>
            <span className="font-medium">{formatCurrency(result.cmvPonderado)}</span>
          </div>
          {result.fatorSazonal > 1 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fator Sazonal</span>
              <span className="font-medium text-pink-600">×{result.fatorSazonal}</span>
            </div>
          )}
          {result.descontoValidade > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Desconto Validade</span>
              <span className="font-medium text-red-600">
                -{Math.round(result.descontoValidade * 100)}%
              </span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground">Margem Absoluta</span>
            <span className="font-medium text-green-600">
              +{formatCurrency(result.margemAbsoluta)}
            </span>
          </div>
        </div>

        {/* Tips */}
        {result.eventoAtivo && (
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">
              <strong>Dica:</strong> Em datas comemorativas como {result.eventoAtivo.name},
              considere preços até {result.eventoAtivo.impact_multiplier}x acima do normal para
              maximizar a margem.
            </p>
          </div>
        )}

        {isLowMargin && (
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-950/30 dark:text-red-200">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">
              <strong>Atenção:</strong> Margem abaixo de 30% pode não cobrir custos operacionais.
              Considere aumentar o markup ou revisar o custo do fornecedor.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={onApplyPrice} className="flex-1" disabled={!onApplyPrice}>
            Aplicar Preço ao Produto
          </Button>
          <Button variant="outline" onClick={onReset}>
            Nova Simulação
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Flower2, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeasonalEvent } from "@/hooks/usePricingCalculator";

interface SeasonalFactorCardProps {
  eventoAtivo: SeasonalEvent | null;
  descontoValidade: number;
  markupPercentual: number;
  onMarkupChange: (value: number) => void;
}

export function SeasonalFactorCard({
  eventoAtivo,
  descontoValidade,
  markupPercentual,
  onMarkupChange,
}: SeasonalFactorCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Fatores de Ajuste</CardTitle>
        </div>
        <CardDescription>Sazonalidade, validade e markup desejado</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seasonal Event */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flower2 className="h-4 w-4 text-pink-500" />
            <span className="font-medium">Evento Sazonal</span>
          </div>
          {eventoAtivo ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{eventoAtivo.name}</span>
                <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100">
                  {eventoAtivo.impact_multiplier}x
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(eventoAtivo.event_date), "dd 'de' MMMM", { locale: ptBR })}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum evento sazonal ativo</p>
          )}
        </div>

        {/* Expiry Discount */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="font-medium">Markdown por Validade</span>
          </div>
          {descontoValidade > 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Desconto aplicado ao lote mais antigo</span>
              <Badge variant="destructive">-{Math.round(descontoValidade * 100)}%</Badge>
            </div>
          ) : (
            <p className="text-muted-foreground">Sem desconto por validade</p>
          )}
        </div>

        {/* Markup Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="markup">Markup Desejado</Label>
            <div className="flex items-center gap-2">
              <Input
                id="markup"
                type="number"
                value={markupPercentual}
                onChange={(e) => onMarkupChange(Number(e.target.value))}
                className="w-20 text-right"
                min={0}
                max={500}
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>
          <Slider
            value={[markupPercentual]}
            onValueChange={(value) => onMarkupChange(value[0])}
            max={500}
            min={0}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
            <span>200%</span>
            <span>300%</span>
            <span>400%</span>
            <span>500%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StockLot } from "@/hooks/usePricingCalculator";

interface CostAnalysisCardProps {
  lots: StockLot[];
  cmvPonderado: number;
  getLotStatus: (lot: StockLot) => { status: string; color: string; discount: number };
  isLoading?: boolean;
}

export function CostAnalysisCard({
  lots,
  cmvPonderado,
  getLotStatus,
  isLoading,
}: CostAnalysisCardProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const totalQuantity = lots.reduce((sum, lot) => sum + lot.available_quantity, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Análise de Custos (CMV)</CardTitle>
        </div>
        <CardDescription>
          Custo de Mercadoria Vendida calculado pelos lotes em estoque
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Carregando lotes...
          </div>
        ) : lots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertTriangle className="mb-2 h-8 w-8" />
            <p>Nenhum lote em estoque para esta variante</p>
            <p className="text-sm">Usando custo base do produto/variante</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lote</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lots.map((lot) => {
                    const status = getLotStatus(lot);
                    return (
                      <TableRow key={lot.id}>
                        <TableCell className="font-mono text-sm">
                          {lot.lot_number || "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(lot.purchase_price)}
                        </TableCell>
                        <TableCell className="text-right">{lot.available_quantity}</TableCell>
                        <TableCell>
                          {lot.expiry_date
                            ? format(new Date(lot.expiry_date), "dd/MM/yyyy", { locale: ptBR })
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={status.discount > 0 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {status.discount > 0 ? (
                              <AlertTriangle className="mr-1 h-3 w-3" />
                            ) : (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            )}
                            {status.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="text-sm text-muted-foreground">CMV Médio Ponderado</p>
                <p className="text-xs text-muted-foreground">
                  Total em estoque: {totalQuantity} unidades
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(cmvPonderado)}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

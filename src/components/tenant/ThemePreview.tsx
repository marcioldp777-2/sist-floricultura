import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Check, 
  Bell, 
  ArrowRight,
  Package,
  Flower2
} from "lucide-react";

interface ThemePreviewProps {
  primaryColor: string;
  logoUrl?: string | null;
  companyName?: string;
}

// Helper to convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 142, s: 71, l: 45 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function ThemePreview({ primaryColor, logoUrl, companyName = "Minha Floricultura" }: ThemePreviewProps) {
  const hsl = useMemo(() => hexToHsl(primaryColor), [primaryColor]);
  
  // Generate color variations
  const colors = useMemo(() => ({
    primary: primaryColor,
    primaryLight: `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 35, 95)}%)`,
    primaryDark: `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 15, 15)}%)`,
    primaryMuted: `hsl(${hsl.h}, ${Math.max(hsl.s - 30, 20)}%, ${Math.min(hsl.l + 40, 92)}%)`,
  }), [primaryColor, hsl]);

  return (
    <div className="space-y-4">
      {/* Color Palette */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="text-sm text-muted-foreground mr-2">Paleta:</div>
        <div className="flex items-center gap-1">
          <div
            className="w-8 h-8 rounded-md border border-border"
            style={{ backgroundColor: colors.primaryLight }}
            title="Claro"
          />
          <div
            className="w-8 h-8 rounded-md border border-border"
            style={{ backgroundColor: colors.primary }}
            title="Principal"
          />
          <div
            className="w-8 h-8 rounded-md border border-border"
            style={{ backgroundColor: colors.primaryDark }}
            title="Escuro"
          />
          <div
            className="w-8 h-8 rounded-md border border-border"
            style={{ backgroundColor: colors.primaryMuted }}
            title="Suave"
          />
        </div>
      </div>

      {/* Mini Dashboard Preview */}
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        {/* Header */}
        <div 
          className="px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: colors.primaryMuted }}
        >
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-md object-contain" />
            ) : (
              <div 
                className="w-8 h-8 rounded-md flex items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Flower2 className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="font-semibold text-sm" style={{ color: colors.primaryDark }}>
              {companyName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Bell className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div 
              className="p-3 rounded-lg text-center"
              style={{ backgroundColor: colors.primaryMuted }}
            >
              <div className="text-lg font-bold" style={{ color: colors.primary }}>24</div>
              <div className="text-xs text-muted-foreground">Pedidos</div>
            </div>
            <div className="p-3 rounded-lg text-center bg-muted/50">
              <div className="text-lg font-bold text-foreground">R$ 4.5k</div>
              <div className="text-xs text-muted-foreground">Vendas</div>
            </div>
            <div className="p-3 rounded-lg text-center bg-muted/50">
              <div className="text-lg font-bold text-foreground">156</div>
              <div className="text-xs text-muted-foreground">Clientes</div>
            </div>
          </div>

          {/* Product Card Preview */}
          <div className="flex gap-3">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
              <span className="text-2xl">🌹</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Buquê Romântico</span>
                <Badge 
                  className="text-xs text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  Novo
                </Badge>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star 
                    key={i} 
                    className="h-3 w-3" 
                    style={{ color: colors.primary, fill: i <= 4 ? colors.primary : 'transparent' }} 
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">(28)</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold" style={{ color: colors.primary }}>R$ 149,90</span>
                <Button 
                  size="sm" 
                  className="h-7 text-xs text-white gap-1"
                  style={{ backgroundColor: colors.primary }}
                >
                  <ShoppingCart className="h-3 w-3" />
                  Comprar
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 text-xs text-white"
              style={{ backgroundColor: colors.primary }}
            >
              Botão Primário
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 text-xs"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              Secundário
            </Button>
          </div>

          {/* Links & Badges */}
          <div className="flex items-center justify-between">
            <a 
              href="#" 
              className="text-sm flex items-center gap-1"
              style={{ color: colors.primary }}
              onClick={(e) => e.preventDefault()}
            >
              Ver todos os produtos
              <ArrowRight className="h-3 w-3" />
            </a>
            <div className="flex items-center gap-1">
              <Badge variant="outline" style={{ borderColor: colors.primary, color: colors.primary }}>
                <Check className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            </div>
          </div>

          {/* Progress/Status */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progresso do pedido</span>
              <span style={{ color: colors.primary }}>75%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ backgroundColor: colors.primary, width: '75%' }}
              />
            </div>
          </div>

          {/* Toggle/Chip Examples */}
          <div className="flex items-center gap-2 flex-wrap">
            <div 
              className="px-3 py-1 rounded-full text-xs text-white"
              style={{ backgroundColor: colors.primary }}
            >
              Selecionado
            </div>
            <div 
              className="px-3 py-1 rounded-full text-xs border"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              Opção 2
            </div>
            <div className="px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground">
              Opção 3
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center">
        Esta é uma prévia de como a cor principal será aplicada na sua loja
      </p>
    </div>
  );
}

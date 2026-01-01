import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sun,
  Droplets,
  Thermometer,
  Wind,
  Clock,
  AlertTriangle,
  MapPin,
  Leaf,
  ShoppingCart,
  Heart,
  Share2,
  Bell,
  ChevronLeft,
  ChevronRight,
  Home,
  Award,
  Scissors,
  Flower2,
  PawPrint,
  Baby,
  Info,
  Sparkles,
} from "lucide-react";
import type { Tables, Json } from "@/integrations/supabase/types";

type BotanicalProduct = Tables<"botanical_products">;

interface ProductContent {
  care_instructions?: {
    watering?: string;
    light?: string;
    temperature?: string;
    humidity?: string;
    fertilizing?: string;
  };
  curiosities?: string;
  cultural_meanings?: string;
  best_locations?: {
    room: string;
    description: string;
  }[];
  pro_tips?: string[];
}

interface QRCodeData {
  qr_code_id: string;
  tenant_id: string;
  short_code: string;
  campaign: string | null;
  product: BotanicalProduct | null;
  variant: any | null;
  content: {
    care_instructions: Json;
    curiosities: string | null;
    cultural_meanings: string | null;
    best_locations: Json;
    pro_tips: string[] | null;
    arrangement_tips: string | null;
  } | null;
  error?: string;
}

const lightLevelInfo: Record<string, { label: string; description: string; icon: string }> = {
  full_sun: { label: "Pleno Sol", description: "6+ horas de sol direto por dia", icon: "☀️" },
  partial_shade: { label: "Meia-sombra", description: "3-6 horas de sol filtrado", icon: "⛅" },
  shade: { label: "Sombra", description: "Luz indireta, sem sol direto", icon: "🌥️" },
  indirect_light: { label: "Luz Indireta", description: "Luz filtrada por cortinas", icon: "💡" },
};

const wateringInfo: Record<string, { label: string; description: string }> = {
  daily: { label: "Diária", description: "Regar todos os dias" },
  every_2_days: { label: "A cada 2 dias", description: "Regar dia sim, dia não" },
  twice_weekly: { label: "2x por semana", description: "Regar duas vezes na semana" },
  weekly: { label: "Semanal", description: "Regar uma vez por semana" },
  biweekly: { label: "Quinzenal", description: "Regar a cada 15 dias" },
  monthly: { label: "Mensal", description: "Regar uma vez por mês" },
  rarely: { label: "Raramente", description: "Quase não precisa de água" },
};

export default function ProductLanding() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<QRCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    async function resolveQRCode() {
      if (!shortCode) {
        setError("Código QR inválido");
        setIsLoading(false);
        return;
      }

      try {
        // Call the resolve_qr_code function
        const { data: result, error: rpcError } = await supabase.rpc("resolve_qr_code", {
          p_short_code: shortCode.toUpperCase(),
        });

        if (rpcError) throw rpcError;

        const qrData = result as unknown as QRCodeData;
        
        if (qrData.error) {
          setError(qrData.error);
        } else {
          setData(qrData);
          
          // Track analytics event
          await supabase.from("analytics_events").insert({
            tenant_id: qrData.tenant_id,
            event_type: "QR_Landing_View",
            qr_code_id: qrData.qr_code_id,
            product_id: qrData.product?.id,
            properties: {
              short_code: shortCode,
              campaign: qrData.campaign,
              utm_source: searchParams.get("utm_source"),
              utm_medium: searchParams.get("utm_medium"),
              utm_campaign: searchParams.get("utm_campaign"),
            },
          });
        }
      } catch (err: any) {
        console.error("Error resolving QR code:", err);
        setError("Não foi possível carregar o produto");
      } finally {
        setIsLoading(false);
      }
    }

    resolveQRCode();
  }, [shortCode, searchParams]);

  const product = data?.product;
  const content = data?.content;

  const allImages = product
    ? [product.primary_image_url, ...(product.gallery_images || [])].filter(Boolean) as string[]
    : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.short_description || `Conheça ${product?.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  const handleAddToCart = async () => {
    if (!data) return;
    
    // Track add to cart event
    await supabase.from("analytics_events").insert({
      tenant_id: data.tenant_id,
      event_type: "Add_To_Cart_From_QR",
      qr_code_id: data.qr_code_id,
      product_id: product?.id,
      properties: {
        short_code: shortCode,
        price: product?.base_price,
      },
    });
    
    // Here you would integrate with the actual cart system
    alert("Produto adicionado ao carrinho! (Em breve: checkout completo)");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto p-4 space-y-4">
          <Skeleton className="w-full aspect-square rounded-xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Leaf className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Produto não encontrado</h1>
            <p className="text-muted-foreground">
              {error || "O QR code pode estar expirado ou o produto não está mais disponível."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Image Carousel */}
      <div className="relative w-full aspect-square bg-muted">
        {allImages.length > 0 ? (
          <>
            <img
              src={allImages[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-lg"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImageIndex ? "bg-primary" : "bg-background/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="h-24 w-24 text-muted-foreground/50" />
          </div>
        )}

        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-lg transition-colors ${
              isFavorited ? "text-destructive" : ""
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-lg"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-6 relative z-10">
        {/* Main Card */}
        <Card className="shadow-lg">
          <CardContent className="pt-6 space-y-4">
            {/* Product Type Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="gap-1">
                <Flower2 className="h-3 w-3" />
                {product.product_type === "cut_flower" && "Flor de Corte"}
                {product.product_type === "potted_plant" && "Vaso"}
                {product.product_type === "arrangement" && "Arranjo"}
                {product.product_type === "bunch" && "Maço"}
                {product.product_type === "seedling" && "Muda"}
                {product.product_type === "seed" && "Semente"}
                {product.product_type === "supply" && "Insumo"}
                {product.product_type === "accessory" && "Acessório"}
              </Badge>
              {product.is_featured && (
                <Badge className="gap-1 bg-primary">
                  <Sparkles className="h-3 w-3" />
                  Destaque
                </Badge>
              )}
            </div>

            {/* Name and Scientific Name */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
              {(product.genus || product.species) && (
                <p className="text-muted-foreground italic">
                  {product.genus} {product.species}
                  {product.cultivar && ` '${product.cultivar}'`}
                </p>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-muted-foreground">{product.short_description}</p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(product.base_price)}
              </span>
            </div>

            {/* Safety Alerts */}
            {(product.toxic_to_pets || product.toxic_to_children || product.is_allergenic) && (
              <div className="flex flex-wrap gap-2">
                {product.toxic_to_pets && (
                  <Badge variant="destructive" className="gap-1">
                    <PawPrint className="h-3 w-3" />
                    Tóxico para pets
                  </Badge>
                )}
                {product.toxic_to_children && (
                  <Badge variant="destructive" className="gap-1">
                    <Baby className="h-3 w-3" />
                    Tóxico para crianças
                  </Badge>
                )}
                {product.is_allergenic && (
                  <Badge variant="outline" className="gap-1 border-warning text-warning">
                    <AlertTriangle className="h-3 w-3" />
                    Alergênico
                  </Badge>
                )}
              </div>
            )}

            {/* Origin */}
            {product.origin_country && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  Origem: {product.origin_region && `${product.origin_region}, `}
                  {product.origin_country}
                </span>
              </div>
            )}

            {/* Certifications */}
            {product.certifications && product.certifications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="gap-1">
                    <Award className="h-3 w-3" />
                    {cert}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Care Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {product.light_level && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Sun className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Luz</p>
                  <p className="font-medium text-sm">
                    {lightLevelInfo[product.light_level]?.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {product.watering_frequency && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rega</p>
                  <p className="font-medium text-sm">
                    {wateringInfo[product.watering_frequency]?.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {(product.temperature_min || product.temperature_max) && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Thermometer className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Temperatura</p>
                  <p className="font-medium text-sm">
                    {product.temperature_min}°C - {product.temperature_max}°C
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {(product.vase_life_days || product.cut_life_days) && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Durabilidade</p>
                  <p className="font-medium text-sm">
                    {product.vase_life_days || product.cut_life_days} dias
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="care" className="mt-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="care" className="text-xs sm:text-sm">
              <Droplets className="h-4 w-4 mr-1 sm:mr-2" />
              Cuidados
            </TabsTrigger>
            <TabsTrigger value="about" className="text-xs sm:text-sm">
              <Info className="h-4 w-4 mr-1 sm:mr-2" />
              Sobre
            </TabsTrigger>
            <TabsTrigger value="tips" className="text-xs sm:text-sm">
              <Sparkles className="h-4 w-4 mr-1 sm:mr-2" />
              Dicas
            </TabsTrigger>
          </TabsList>

          {/* Care Tab */}
          <TabsContent value="care" className="space-y-4 mt-4">
            {product.light_level && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sun className="h-4 w-4 text-warning" />
                    Luminosidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{lightLevelInfo[product.light_level]?.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {lightLevelInfo[product.light_level]?.description}
                  </p>
                  {product.light_lux_min && product.light_lux_max && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Ideal: {product.light_lux_min} - {product.light_lux_max} lux
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {product.watering_frequency && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-info" />
                    Rega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {wateringInfo[product.watering_frequency]?.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {wateringInfo[product.watering_frequency]?.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {(product.humidity_min || product.humidity_max) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    Umidade do Ar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Mantenha a umidade entre{" "}
                    <span className="font-medium">{product.humidity_min}%</span> e{" "}
                    <span className="font-medium">{product.humidity_max}%</span>
                  </p>
                </CardContent>
              </Card>
            )}

            {product.substrate_type && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-success" />
                    Substrato
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{product.substrate_type}</p>
                </CardContent>
              </Card>
            )}

            {product.fertilization_notes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Fertilização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{product.fertilization_notes}</p>
                </CardContent>
              </Card>
            )}

            {product.pruning_notes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                    Poda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{product.pruning_notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4 mt-4">
            {product.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sobre esta planta</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {content?.curiosities && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Curiosidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {content.curiosities}
                  </p>
                </CardContent>
              </Card>
            )}

            {content?.cultural_meanings && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4 text-destructive" />
                    Significado Cultural
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {content.cultural_meanings}
                  </p>
                </CardContent>
              </Card>
            )}

            {product.common_names && product.common_names.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Também conhecida como</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.common_names.map((name) => (
                      <Badge key={name} variant="secondary">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {product.seasonality && product.seasonality.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sazonalidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.seasonality.map((month) => (
                      <Badge key={month} variant="outline">
                        {month}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-4 mt-4">
            {content?.pro_tips && content.pro_tips.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Dicas Profissionais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {content.pro_tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-bold">•</span>
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {content?.best_locations && Array.isArray(content.best_locations) && content.best_locations.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    Melhores Locais em Casa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(content.best_locations as { room: string; description: string }[]).map((location, idx) => (
                      <li key={idx} className="text-sm">
                        <p className="font-medium">{location.room}</p>
                        <p className="text-muted-foreground">{location.description}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {product.post_harvest_notes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-success" />
                    Prolongar a Vida
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {product.post_harvest_notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {content?.arrangement_tips && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flower2 className="h-4 w-4 text-primary" />
                    Dicas para Arranjos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {content.arrangement_tips}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Safety Notes */}
            {(product.toxicity_notes || product.allergen_notes) && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Avisos Importantes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {product.toxicity_notes && (
                    <p className="text-sm text-muted-foreground">{product.toxicity_notes}</p>
                  )}
                  {product.allergen_notes && (
                    <p className="text-sm text-muted-foreground">{product.allergen_notes}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4 z-50">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 gap-2"
            onClick={() => {
              // Subscribe to care reminders - to be implemented
              alert("Em breve: receba lembretes de cuidados!");
            }}
          >
            <Bell className="h-4 w-4" />
            Lembretes
          </Button>
          <Button size="lg" className="flex-[2] gap-2" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
            Comprar Agora
          </Button>
        </div>
      </div>
    </div>
  );
}

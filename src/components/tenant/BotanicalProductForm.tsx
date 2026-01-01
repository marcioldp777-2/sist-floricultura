import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  Sun,
  Droplets,
  Thermometer,
  AlertTriangle,
  Globe,
  Ruler,
  DollarSign,
  Image,
  X,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type BotanicalProduct = Tables<"botanical_products">;

interface BotanicalProductFormProps {
  initialData?: Partial<BotanicalProduct>;
  onSubmit: (data: Partial<BotanicalProduct>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const productTypes = [
  { value: "cut_flower", label: "Flor de Corte" },
  { value: "potted_plant", label: "Vaso" },
  { value: "arrangement", label: "Arranjo" },
  { value: "bunch", label: "Maço" },
  { value: "seedling", label: "Muda" },
  { value: "seed", label: "Semente" },
  { value: "supply", label: "Insumo" },
  { value: "accessory", label: "Acessório" },
];

const lightLevels = [
  { value: "full_sun", label: "Pleno Sol", description: "6+ horas de sol direto" },
  { value: "partial_shade", label: "Meia-sombra", description: "3-6 horas de sol" },
  { value: "shade", label: "Sombra", description: "Luz indireta apenas" },
  { value: "indirect_light", label: "Luz Indireta", description: "Luz filtrada" },
];

const wateringFrequencies = [
  { value: "daily", label: "Diária" },
  { value: "every_2_days", label: "A cada 2 dias" },
  { value: "twice_weekly", label: "2x por semana" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
  { value: "rarely", label: "Raramente" },
];

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const commonCertifications = [
  "Fairtrade",
  "Rainforest Alliance",
  "Orgânico",
  "Veriflora",
  "MPS",
  "GlobalG.A.P.",
];

export function BotanicalProductForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: BotanicalProductFormProps) {
  const [formData, setFormData] = useState<Partial<BotanicalProduct>>({
    name: "",
    sku: "",
    slug: "",
    description: "",
    short_description: "",
    product_type: "cut_flower",
    genus: "",
    species: "",
    cultivar: "",
    common_names: [],
    seasonality: [],
    flowering_season: [],
    light_level: null,
    light_lux_min: null,
    light_lux_max: null,
    watering_frequency: null,
    humidity_min: null,
    humidity_max: null,
    temperature_min: null,
    temperature_max: null,
    ventilation_notes: "",
    pruning_notes: "",
    substrate_type: "",
    fertilization_notes: "",
    repotting_frequency: "",
    vase_life_days: null,
    cut_life_days: null,
    ethylene_sensitive: false,
    post_harvest_notes: "",
    is_allergenic: false,
    allergen_notes: "",
    toxic_to_pets: false,
    toxic_to_children: false,
    toxicity_notes: "",
    origin_country: "",
    origin_region: "",
    origin_farm: "",
    certifications: [],
    height_cm_min: null,
    height_cm_max: null,
    pot_diameter_cm: null,
    stems_per_bunch: null,
    available_colors: [],
    base_price: 0,
    cost_price: 0,
    is_active: true,
    is_featured: false,
    meta_title: "",
    meta_description: "",
    primary_image_url: "",
    gallery_images: [],
    ...initialData,
  });

  const [newCommonName, setNewCommonName] = useState("");
  const [newColor, setNewColor] = useState("");

  const handleChange = (field: keyof BotanicalProduct, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field: keyof BotanicalProduct, value: string) => {
    if (!value.trim()) return;
    const currentArray = (formData[field] as string[]) || [];
    if (!currentArray.includes(value.trim())) {
      handleChange(field, [...currentArray, value.trim()]);
    }
  };

  const handleArrayRemove = (field: keyof BotanicalProduct, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    handleChange(field, currentArray.filter((item) => item !== value));
  };

  const toggleArrayItem = (field: keyof BotanicalProduct, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    if (currentArray.includes(value)) {
      handleChange(field, currentArray.filter((item) => item !== value));
    } else {
      handleChange(field, [...currentArray, value]);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    handleChange("name", name);
    if (!initialData?.slug) {
      handleChange("slug", generateSlug(name));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
          <TabsTrigger value="basic" className="text-xs sm:text-sm">
            <Leaf className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Básico</span>
          </TabsTrigger>
          <TabsTrigger value="botanical" className="text-xs sm:text-sm">
            <Leaf className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Botânica</span>
          </TabsTrigger>
          <TabsTrigger value="care" className="text-xs sm:text-sm">
            <Droplets className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Cuidados</span>
          </TabsTrigger>
          <TabsTrigger value="safety" className="text-xs sm:text-sm">
            <AlertTriangle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="origin" className="text-xs sm:text-sm">
            <Globe className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Origem</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="text-xs sm:text-sm">
            <DollarSign className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Preços</span>
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Rosa Colombiana Vermelha"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku || ""}
                onChange={(e) => handleChange("sku", e.target.value.toUpperCase())}
                placeholder="Ex: ROSA-COL-VRM-001"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="rosa-colombiana-vermelha"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product_type">Tipo de Produto</Label>
              <Select
                value={formData.product_type || "cut_flower"}
                onValueChange={(value) => handleChange("product_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Descrição Curta</Label>
            <Input
              id="short_description"
              value={formData.short_description || ""}
              onChange={(e) => handleChange("short_description", e.target.value)}
              placeholder="Uma frase que resume o produto"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {(formData.short_description?.length || 0)}/160 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Completa</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descrição detalhada do produto..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_image_url">URL da Imagem Principal</Label>
            <Input
              id="primary_image_url"
              type="url"
              value={formData.primary_image_url || ""}
              onChange={(e) => handleChange("primary_image_url", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active ?? true}
                onCheckedChange={(checked) => handleChange("is_active", checked)}
              />
              <Label htmlFor="is_active">Produto Ativo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured ?? false}
                onCheckedChange={(checked) => handleChange("is_featured", checked)}
              />
              <Label htmlFor="is_featured">Produto em Destaque</Label>
            </div>
          </div>
        </TabsContent>

        {/* Botanical Info Tab */}
        <TabsContent value="botanical" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="genus">Gênero</Label>
              <Input
                id="genus"
                value={formData.genus || ""}
                onChange={(e) => handleChange("genus", e.target.value)}
                placeholder="Ex: Rosa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="species">Espécie</Label>
              <Input
                id="species"
                value={formData.species || ""}
                onChange={(e) => handleChange("species", e.target.value)}
                placeholder="Ex: gallica"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cultivar">Cultivar</Label>
              <Input
                id="cultivar"
                value={formData.cultivar || ""}
                onChange={(e) => handleChange("cultivar", e.target.value)}
                placeholder="Ex: 'Freedom'"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nomes Populares</Label>
            <div className="flex gap-2">
              <Input
                value={newCommonName}
                onChange={(e) => setNewCommonName(e.target.value)}
                placeholder="Adicionar nome popular"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleArrayAdd("common_names", newCommonName);
                    setNewCommonName("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleArrayAdd("common_names", newCommonName);
                  setNewCommonName("");
                }}
              >
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(formData.common_names || []).map((name) => (
                <Badge key={name} variant="secondary" className="gap-1">
                  {name}
                  <button
                    type="button"
                    onClick={() => handleArrayRemove("common_names", name)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sazonalidade (meses disponíveis)</Label>
            <div className="flex flex-wrap gap-2">
              {months.map((month) => (
                <Badge
                  key={month}
                  variant={(formData.seasonality || []).includes(month) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem("seasonality", month)}
                >
                  {month}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Época de Floração</Label>
            <div className="flex flex-wrap gap-2">
              {months.map((month) => (
                <Badge
                  key={month}
                  variant={(formData.flowering_season || []).includes(month) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem("flowering_season", month)}
                >
                  {month}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cores Disponíveis</Label>
            <div className="flex gap-2">
              <Input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="Adicionar cor"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleArrayAdd("available_colors", newColor);
                    setNewColor("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleArrayAdd("available_colors", newColor);
                  setNewColor("");
                }}
              >
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(formData.available_colors || []).map((color) => (
                <Badge key={color} variant="secondary" className="gap-1">
                  {color}
                  <button
                    type="button"
                    onClick={() => handleArrayRemove("available_colors", color)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="height_cm_min">Altura Mín. (cm)</Label>
              <Input
                id="height_cm_min"
                type="number"
                value={formData.height_cm_min || ""}
                onChange={(e) => handleChange("height_cm_min", e.target.value ? Number(e.target.value) : null)}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height_cm_max">Altura Máx. (cm)</Label>
              <Input
                id="height_cm_max"
                type="number"
                value={formData.height_cm_max || ""}
                onChange={(e) => handleChange("height_cm_max", e.target.value ? Number(e.target.value) : null)}
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pot_diameter_cm">Diâmetro do Vaso (cm)</Label>
              <Input
                id="pot_diameter_cm"
                type="number"
                value={formData.pot_diameter_cm || ""}
                onChange={(e) => handleChange("pot_diameter_cm", e.target.value ? Number(e.target.value) : null)}
                placeholder="15"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stems_per_bunch">Hastes por Maço</Label>
            <Input
              id="stems_per_bunch"
              type="number"
              value={formData.stems_per_bunch || ""}
              onChange={(e) => handleChange("stems_per_bunch", e.target.value ? Number(e.target.value) : null)}
              placeholder="12"
              className="max-w-[200px]"
            />
          </div>
        </TabsContent>

        {/* Care Instructions Tab */}
        <TabsContent value="care" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-warning" />
                Nível de Luz
              </Label>
              <Select
                value={formData.light_level || ""}
                onValueChange={(value) => handleChange("light_level", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {lightLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <span>{level.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({level.description})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-info" />
                Frequência de Rega
              </Label>
              <Select
                value={formData.watering_frequency || ""}
                onValueChange={(value) => handleChange("watering_frequency", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {wateringFrequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Luminosidade (Lux)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={formData.light_lux_min || ""}
                  onChange={(e) => handleChange("light_lux_min", e.target.value ? Number(e.target.value) : null)}
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  value={formData.light_lux_max || ""}
                  onChange={(e) => handleChange("light_lux_max", e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Umidade (%)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={formData.humidity_min || ""}
                  onChange={(e) => handleChange("humidity_min", e.target.value ? Number(e.target.value) : null)}
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  value={formData.humidity_max || ""}
                  onChange={(e) => handleChange("humidity_max", e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-destructive" />
                Temperatura (°C)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={formData.temperature_min || ""}
                  onChange={(e) => handleChange("temperature_min", e.target.value ? Number(e.target.value) : null)}
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  value={formData.temperature_max || ""}
                  onChange={(e) => handleChange("temperature_max", e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vida Útil (dias)</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Em vaso"
                    value={formData.vase_life_days || ""}
                    onChange={(e) => handleChange("vase_life_days", e.target.value ? Number(e.target.value) : null)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Em vaso</p>
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="De corte"
                    value={formData.cut_life_days || ""}
                    onChange={(e) => handleChange("cut_life_days", e.target.value ? Number(e.target.value) : null)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">De corte</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="substrate_type">Tipo de Substrato</Label>
            <Input
              id="substrate_type"
              value={formData.substrate_type || ""}
              onChange={(e) => handleChange("substrate_type", e.target.value)}
              placeholder="Ex: Terra vegetal com boa drenagem"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fertilization_notes">Fertilização</Label>
              <Textarea
                id="fertilization_notes"
                value={formData.fertilization_notes || ""}
                onChange={(e) => handleChange("fertilization_notes", e.target.value)}
                placeholder="Instruções de fertilização..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pruning_notes">Poda</Label>
              <Textarea
                id="pruning_notes"
                value={formData.pruning_notes || ""}
                onChange={(e) => handleChange("pruning_notes", e.target.value)}
                placeholder="Instruções de poda..."
                rows={3}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ventilation_notes">Ventilação</Label>
              <Textarea
                id="ventilation_notes"
                value={formData.ventilation_notes || ""}
                onChange={(e) => handleChange("ventilation_notes", e.target.value)}
                placeholder="Notas sobre ventilação..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repotting_frequency">Frequência de Replantio</Label>
              <Input
                id="repotting_frequency"
                value={formData.repotting_frequency || ""}
                onChange={(e) => handleChange("repotting_frequency", e.target.value)}
                placeholder="Ex: A cada 2 anos"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch
                id="ethylene_sensitive"
                checked={formData.ethylene_sensitive ?? false}
                onCheckedChange={(checked) => handleChange("ethylene_sensitive", checked)}
              />
              <Label htmlFor="ethylene_sensitive">Sensível ao Etileno</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="post_harvest_notes">Cuidados Pós-Colheita</Label>
            <Textarea
              id="post_harvest_notes"
              value={formData.post_harvest_notes || ""}
              onChange={(e) => handleChange("post_harvest_notes", e.target.value)}
              placeholder="Cuidados após colheita..."
              rows={3}
            />
          </div>
        </TabsContent>

        {/* Safety Alerts Tab */}
        <TabsContent value="safety" className="space-y-4 mt-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-4">
            <h3 className="font-medium flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Toxicidade
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-background">
                <Switch
                  id="toxic_to_pets"
                  checked={formData.toxic_to_pets ?? false}
                  onCheckedChange={(checked) => handleChange("toxic_to_pets", checked)}
                />
                <div>
                  <Label htmlFor="toxic_to_pets" className="font-medium">
                    Tóxico para Pets
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Marque se a planta é tóxica para cães, gatos ou outros animais
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-background">
                <Switch
                  id="toxic_to_children"
                  checked={formData.toxic_to_children ?? false}
                  onCheckedChange={(checked) => handleChange("toxic_to_children", checked)}
                />
                <div>
                  <Label htmlFor="toxic_to_children" className="font-medium">
                    Tóxico para Crianças
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Marque se a planta pode ser perigosa se ingerida
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toxicity_notes">Notas sobre Toxicidade</Label>
              <Textarea
                id="toxicity_notes"
                value={formData.toxicity_notes || ""}
                onChange={(e) => handleChange("toxicity_notes", e.target.value)}
                placeholder="Descreva os sintomas e riscos específicos..."
                rows={3}
              />
            </div>
          </div>

          <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 space-y-4">
            <h3 className="font-medium flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Alergia
            </h3>

            <div className="flex items-center gap-4 p-3 rounded-lg bg-background">
              <Switch
                id="is_allergenic"
                checked={formData.is_allergenic ?? false}
                onCheckedChange={(checked) => handleChange("is_allergenic", checked)}
              />
              <div>
                <Label htmlFor="is_allergenic" className="font-medium">
                  Planta Alergênica
                </Label>
                <p className="text-sm text-muted-foreground">
                  Marque se a planta pode causar reações alérgicas
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergen_notes">Notas sobre Alergias</Label>
              <Textarea
                id="allergen_notes"
                value={formData.allergen_notes || ""}
                onChange={(e) => handleChange("allergen_notes", e.target.value)}
                placeholder="Descreva os alérgenos e sintomas comuns..."
                rows={3}
              />
            </div>
          </div>
        </TabsContent>

        {/* Origin Tab */}
        <TabsContent value="origin" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="origin_country">País de Origem</Label>
              <Input
                id="origin_country"
                value={formData.origin_country || ""}
                onChange={(e) => handleChange("origin_country", e.target.value)}
                placeholder="Ex: Colômbia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin_region">Região</Label>
              <Input
                id="origin_region"
                value={formData.origin_region || ""}
                onChange={(e) => handleChange("origin_region", e.target.value)}
                placeholder="Ex: Bogotá"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin_farm">Fazenda/Produtor</Label>
              <Input
                id="origin_farm"
                value={formData.origin_farm || ""}
                onChange={(e) => handleChange("origin_farm", e.target.value)}
                placeholder="Ex: Fazenda Flores do Vale"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Certificações</Label>
            <div className="flex flex-wrap gap-2">
              {commonCertifications.map((cert) => (
                <Badge
                  key={cert}
                  variant={(formData.certifications || []).includes(cert) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem("certifications", cert)}
                >
                  {cert}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>SEO</Label>
            <div className="grid gap-4 md:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title || ""}
                  onChange={(e) => handleChange("meta_title", e.target.value)}
                  placeholder="Título para SEO"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {(formData.meta_title?.length || 0)}/60 caracteres
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description || ""}
                  onChange={(e) => handleChange("meta_description", e.target.value)}
                  placeholder="Descrição para SEO"
                  maxLength={160}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {(formData.meta_description?.length || 0)}/160 caracteres
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="base_price">Preço Base (R$) *</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.base_price || ""}
                onChange={(e) => handleChange("base_price", Number(e.target.value))}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_price">Preço de Custo (R$)</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_price || ""}
                onChange={(e) => handleChange("cost_price", Number(e.target.value))}
                placeholder="0,00"
              />
            </div>
          </div>

          {formData.base_price && formData.cost_price && formData.cost_price > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Margem de Lucro:</span>
                <span className="font-medium text-success">
                  {(((formData.base_price - formData.cost_price) / formData.cost_price) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">Lucro por Unidade:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(formData.base_price - formData.cost_price)}
                </span>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : initialData ? "Atualizar Produto" : "Criar Produto"}
        </Button>
      </div>
    </form>
  );
}

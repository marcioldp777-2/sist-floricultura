import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Minus, Trash2, Search, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useCepLookup } from "@/hooks/useCepLookup";
import { usePhoneMask } from "@/hooks/usePhoneMask";

interface OrderItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  notes?: string;
}

interface OrderFormData {
  customer_id: string;
  delivery_type: "pickup" | "delivery";
  delivery_date: Date | null;
  delivery_time: string;
  delivery_address: string;
  delivery_cep: string;
  delivery_number: string;
  delivery_complement: string;
  location_id: string;
  notes: string;
  items: OrderItem[];
  discount: number;
  delivery_fee: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address_street: string | null;
  address_number: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
}

interface Location {
  id: string;
  name: string;
  code: string;
}

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  onSubmit: (data: OrderFormData) => void;
  isSubmitting: boolean;
  initialData?: Partial<OrderFormData>;
  mode?: "create" | "edit";
}

export function OrderForm({
  open,
  onOpenChange,
  tenantId,
  onSubmit,
  isSubmitting,
  initialData,
  mode = "create",
}: OrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    customer_id: "",
    delivery_type: "delivery",
    delivery_date: null,
    delivery_time: "",
    delivery_address: "",
    delivery_cep: "",
    delivery_number: "",
    delivery_complement: "",
    location_id: "",
    notes: "",
    items: [],
    discount: 0,
    delivery_fee: 0,
  });
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const { lookupCep, isLoading: isCepLoading, formatCep } = useCepLookup();

  const handleCepChange = async (value: string) => {
    const formattedCep = formatCep(value);
    setFormData({ ...formData, delivery_cep: formattedCep });
    
    if (formattedCep.replace(/\D/g, "").length === 8) {
      const address = await lookupCep(formattedCep);
      if (address) {
        const fullAddress = [address.street, address.neighborhood, address.city, address.state].filter(Boolean).join(", ");
        setFormData(prev => ({
          ...prev,
          delivery_cep: formattedCep,
          delivery_address: fullAddress,
        }));
      }
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => {
    if (!open) {
      setFormData({
        customer_id: "",
        delivery_type: "delivery",
        delivery_date: null,
        delivery_time: "",
        delivery_address: "",
        delivery_cep: "",
        delivery_number: "",
        delivery_complement: "",
        location_id: "",
        notes: "",
        items: [],
        discount: 0,
        delivery_fee: 0,
      });
      setProductSearch("");
      setCustomerSearch("");
    }
  }, [open]);

  const { data: customers } = useQuery({
    queryKey: ["customers", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, phone, address_street, address_number, address_neighborhood, address_city, address_state")
        .eq("tenant_id", tenantId)
        .order("name");
      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!tenantId && open,
  });

  const { data: products } = useQuery({
    queryKey: ["products", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url, is_active")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!tenantId && open,
  });

  const { data: locations } = useQuery({
    queryKey: ["locations", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, code")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Location[];
    },
    enabled: !!tenantId && open,
  });

  const filteredCustomers = customers?.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone?.includes(customerSearch)
  );

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedCustomer = customers?.find((c) => c.id === formData.customer_id);

  const addProduct = (product: Product) => {
    const existing = formData.items.find((i) => i.product_id === product.id);
    if (existing) {
      setFormData({
        ...formData,
        items: formData.items.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * i.unit_price }
            : i
        ),
      });
    } else {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            product_id: product.id,
            product_name: product.name,
            unit_price: product.price,
            quantity: 1,
            total_price: product.price,
          },
        ],
      });
    }
    setProductSearch("");
  };

  const updateQuantity = (productId: string, delta: number) => {
    setFormData({
      ...formData,
      items: formData.items
        .map((i) =>
          i.product_id === productId
            ? {
                ...i,
                quantity: Math.max(1, i.quantity + delta),
                total_price: Math.max(1, i.quantity + delta) * i.unit_price,
              }
            : i
        ),
    });
  };

  const removeItem = (productId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((i) => i.product_id !== productId),
    });
  };

  const subtotal = formData.items.reduce((sum, i) => sum + i.total_price, 0);
  const total = subtotal - formData.discount + (formData.delivery_type === "delivery" ? formData.delivery_fee : 0);

  const formatCustomerAddress = (customer: Customer) => {
    const parts = [
      customer.address_street,
      customer.address_number,
      customer.address_neighborhood,
      customer.address_city,
      customer.address_state,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleSelectCustomer = (customerId: string) => {
    const customer = customers?.find((c) => c.id === customerId);
    setFormData({
      ...formData,
      customer_id: customerId,
      delivery_address: customer ? formatCustomerAddress(customer) : "",
    });
    setCustomerSearch("");
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const deliveryTimeOptions = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo Pedido" : "Editar Pedido"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Crie um novo pedido selecionando cliente e produtos." : "Edite os dados do pedido."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid gap-6 py-4">
            {/* Customer Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Cliente</Label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.phone || "Sem telefone"}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, customer_id: "", delivery_address: "" })}>
                    Alterar
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cliente por nome ou telefone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {customerSearch && filteredCustomers && filteredCustomers.length > 0 && (
                    <div className="border rounded-lg max-h-40 overflow-y-auto">
                      {filteredCustomers.slice(0, 5).map((customer) => (
                        <div
                          key={customer.id}
                          className="p-2 hover:bg-muted cursor-pointer"
                          onClick={() => handleSelectCustomer(customer.id)}
                        >
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Delivery Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Entrega</Label>
                <Select
                  value={formData.delivery_type}
                  onValueChange={(value: "pickup" | "delivery") =>
                    setFormData({ ...formData, delivery_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Entrega</SelectItem>
                    <SelectItem value="pickup">Retirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.delivery_type === "pickup" && (
                <div className="space-y-2">
                  <Label>Local de Retirada</Label>
                  <Select
                    value={formData.location_id}
                    onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} ({location.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Delivery Address */}
            {formData.delivery_type === "delivery" && (
              <div className="space-y-3">
                <Label>Endereço de Entrega</Label>
                <div className="grid grid-cols-4 gap-2">
                  <div className="relative">
                    <Input
                      placeholder="CEP"
                      value={formData.delivery_cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      maxLength={9}
                    />
                    {isCepLoading && (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    placeholder="Número"
                    value={formData.delivery_number}
                    onChange={(e) => setFormData({ ...formData, delivery_number: e.target.value })}
                    maxLength={10}
                  />
                  <Input
                    placeholder="Complemento"
                    value={formData.delivery_complement}
                    onChange={(e) => setFormData({ ...formData, delivery_complement: e.target.value })}
                    className="col-span-2"
                    maxLength={50}
                  />
                </div>
                <Textarea
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  placeholder="Endereço completo para entrega (preenchido automaticamente pelo CEP)"
                  rows={2}
                />
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Entrega</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.delivery_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.delivery_date
                        ? format(formData.delivery_date, "PPP", { locale: ptBR })
                        : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.delivery_date || undefined}
                      onSelect={(date) => setFormData({ ...formData, delivery_date: date || null })}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Horário</Label>
                <Select
                  value={formData.delivery_time}
                  onValueChange={(value) => setFormData({ ...formData, delivery_time: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryTimeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Produtos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar e adicionar produtos..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {productSearch && filteredProducts && filteredProducts.length > 0 && (
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {filteredProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                      onClick={() => addProduct(product)}
                    >
                      <div className="flex items-center gap-2">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted" />
                        )}
                        <span>{product.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        R$ {Number(product.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Items */}
              {formData.items.length > 0 && (
                <div className="space-y-2 border rounded-lg p-3">
                  {formData.items.map((item) => (
                    <div key={item.product_id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {Number(item.unit_price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} un.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product_id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product_id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="w-20 text-right font-medium">
                          R$ {Number(item.total_price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeItem(item.product_id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Desconto (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              {formData.delivery_type === "delivery" && (
                <div className="space-y-2">
                  <Label>Taxa de Entrega (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.delivery_fee}
                    onChange={(e) => setFormData({ ...formData, delivery_fee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
              {formData.discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Desconto:</span>
                  <span>- R$ {formData.discount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {formData.delivery_type === "delivery" && formData.delivery_fee > 0 && (
                <div className="flex justify-between">
                  <span>Taxa de Entrega:</span>
                  <span>R$ {formData.delivery_fee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações sobre o pedido..."
                rows={2}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || formData.items.length === 0}
          >
            {isSubmitting ? "Salvando..." : mode === "create" ? "Criar Pedido" : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, ShoppingCart, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { OrderForm } from "@/components/tenant/orders/OrderForm";
import { OrderDetails } from "@/components/tenant/orders/OrderDetails";
import { format } from "date-fns";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  in_production: "Em Produção",
  ready: "Pronto",
  out_for_delivery: "Em Entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  in_production: "secondary",
  ready: "default",
  out_for_delivery: "default",
  delivered: "default",
  cancelled: "destructive",
};

interface OrderFormData {
  customer_id: string;
  delivery_type: "pickup" | "delivery";
  delivery_date: Date | null;
  delivery_time: string;
  delivery_address: string;
  location_id: string;
  notes: string;
  items: {
    product_id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    notes?: string;
  }[];
  discount: number;
  delivery_fee: number;
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tenantId = profile?.tenant_id;

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", tenantId, statusFilter],
    queryFn: async () => {
      if (!tenantId) return [];

      let query = supabase
        .from("orders")
        .select(`
          *,
          customers(name, phone)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (formData: OrderFormData) => {
      if (!tenantId || !user) throw new Error("Tenant ou usuário não encontrado");

      const subtotal = formData.items.reduce((sum, i) => sum + i.total_price, 0);
      const total = subtotal - formData.discount + (formData.delivery_type === "delivery" ? formData.delivery_fee : 0);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          tenant_id: tenantId,
          customer_id: formData.customer_id || null,
          delivery_type: formData.delivery_type,
          delivery_date: formData.delivery_date ? format(formData.delivery_date, "yyyy-MM-dd") : null,
          delivery_time: formData.delivery_time || null,
          delivery_address: formData.delivery_address || null,
          location_id: formData.location_id || null,
          notes: formData.notes || null,
          subtotal,
          discount: formData.discount,
          delivery_fee: formData.delivery_type === "delivery" ? formData.delivery_fee : 0,
          total,
          status: "pending",
          created_by: user.id,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = formData.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.total_price,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setIsCreateOpen(false);
      toast({
        title: "Pedido criado",
        description: `Pedido #${order.order_number} foi criado com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar pedido",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDetailsOpen(true);
  };

  const filteredOrders = orders?.filter(
    (order) =>
      order.order_number?.toString().includes(search) ||
      order.customers?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <OrderForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        tenantId={tenantId || ""}
        onSubmit={(data) => createOrderMutation.mutate(data)}
        isSubmitting={createOrderMutation.isPending}
      />

      <OrderDetails
        orderId={selectedOrderId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <TenantLayout
        title="Pedidos"
        description="Gerencie os pedidos da sua loja"
        actions={
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Pedido
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por número ou cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="in_production">Em Produção</SelectItem>
                <SelectItem value="ready">Pronto</SelectItem>
                <SelectItem value="out_for_delivery">Em Entrega</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredOrders?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ShoppingCart className="h-8 w-8" />
                        <p>Nenhum pedido encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders?.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openOrderDetails(order.id)}
                    >
                      <TableCell className="font-medium">#{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customers?.name || "Cliente não informado"}</p>
                          <p className="text-xs text-muted-foreground">{order.customers?.phone || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {order.delivery_type === "delivery" ? "Entrega" : "Retirada"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString("pt-BR") : "-"}</p>
                          <p className="text-xs text-muted-foreground">{order.delivery_time || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {Number(order.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDetails(order.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </TenantLayout>
    </>
  );
}

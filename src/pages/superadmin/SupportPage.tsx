import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SuperadminLayout } from "@/components/superadmin/SuperadminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageSquare, Clock, CheckCircle, AlertCircle, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SupportTicket {
  id: string;
  tenant_id: string;
  created_by: string | null;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  tenants?: { name: string };
  profiles?: { full_name: string | null };
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string | null;
  message: string;
  is_internal: boolean;
  created_at: string;
  profiles?: { full_name: string | null };
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  open: { label: "Aberto", variant: "destructive", icon: AlertCircle },
  in_progress: { label: "Em Andamento", variant: "default", icon: Clock },
  resolved: { label: "Resolvido", variant: "secondary", icon: CheckCircle },
  closed: { label: "Fechado", variant: "outline", icon: CheckCircle },
};

const priorityConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  low: { label: "Baixa", variant: "outline" },
  medium: { label: "Média", variant: "secondary" },
  high: { label: "Alta", variant: "default" },
  urgent: { label: "Urgente", variant: "destructive" },
};

const categoryLabels: Record<string, string> = {
  general: "Geral",
  billing: "Faturamento",
  technical: "Técnico",
  feature_request: "Solicitação",
  bug: "Bug",
};

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select(`
          *,
          tenants(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as SupportTicket[];
    },
  });

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ["ticket-messages", selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket) return [];
      const { data, error } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", selectedTicket.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as unknown as TicketMessage[];
    },
    enabled: !!selectedTicket,
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SupportTicket> }) => {
      const { error } = await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast({ title: "Ticket atualizado" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ ticketId, message, isInternal }: { ticketId: string; message: string; isInternal: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: ticketId,
          user_id: user?.id,
          message,
          is_internal: isInternal,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      refetchMessages();
      setNewMessage("");
      toast({ title: "Mensagem enviada" });
    },
    onError: (error) => {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    },
  });

  const filteredTickets = tickets?.filter((ticket) => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.tenants?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  const handleSendMessage = () => {
    if (!selectedTicket || !newMessage.trim()) return;
    sendMessageMutation.mutate({
      ticketId: selectedTicket.id,
      message: newMessage.trim(),
      isInternal,
    });
  };

  const handleStatusChange = (status: string) => {
    if (!selectedTicket) return;
    const updates: Partial<SupportTicket> = { status };
    if (status === "resolved") {
      updates.resolved_at = new Date().toISOString();
    }
    updateTicketMutation.mutate({ id: selectedTicket.id, updates });
    setSelectedTicket({ ...selectedTicket, ...updates });
  };

  const openCount = tickets?.filter((t) => t.status === "open").length || 0;
  const inProgressCount = tickets?.filter((t) => t.status === "in_progress").length || 0;

  return (
    <SuperadminLayout 
      title="Suporte" 
      description={`${openCount} tickets abertos, ${inProgressCount} em andamento`}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tickets..."
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
              <SelectItem value="open">Abertos</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="resolved">Resolvidos</SelectItem>
              <SelectItem value="closed">Fechados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assunto</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredTickets?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-8 w-8" />
                      <p>Nenhum ticket encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets?.map((ticket) => (
                  <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenTicket(ticket)}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{ticket.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ticket.tenants?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{categoryLabels[ticket.category] || ticket.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityConfig[ticket.priority]?.variant || "outline"}>
                        {priorityConfig[ticket.priority]?.label || ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[ticket.status]?.variant || "outline"}>
                        {statusConfig[ticket.status]?.label || ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenTicket(ticket); }}>
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              Ticket de {selectedTicket?.tenants?.name} - Criado em {selectedTicket && format(new Date(selectedTicket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Ticket Info */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select 
                  value={selectedTicket?.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Prioridade</Label>
                <Select 
                  value={selectedTicket?.priority}
                  onValueChange={(value) => {
                    if (selectedTicket) {
                      updateTicketMutation.mutate({ id: selectedTicket.id, updates: { priority: value } });
                      setSelectedTicket({ ...selectedTicket, priority: value });
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <p className="mt-1 text-sm">{categoryLabels[selectedTicket?.category || ""] || selectedTicket?.category}</p>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-muted/30">
              <Label className="text-xs text-muted-foreground">Descrição</Label>
              <p className="mt-1 text-sm whitespace-pre-wrap">{selectedTicket?.description}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden flex flex-col border rounded-lg">
              <div className="p-3 border-b bg-muted/30">
                <h4 className="font-medium text-sm">Mensagens</h4>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {messages?.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`p-3 rounded-lg ${msg.is_internal ? 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' : 'bg-muted/50'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {msg.profiles?.full_name || "Usuário"}
                          {msg.is_internal && <Badge variant="outline" className="ml-2 text-xs">Interno</Badge>}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.created_at), "dd/MM HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                  {(!messages || messages.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma mensagem ainda</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* New Message */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="internal"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="internal" className="text-sm">Nota interna (não visível para o tenant)</Label>
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Digite sua resposta..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  rows={2}
                />
                <Button onClick={handleSendMessage} disabled={sendMessageMutation.isPending || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SuperadminLayout>
  );
}

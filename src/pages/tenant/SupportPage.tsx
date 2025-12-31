import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageSquare, Clock, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Aberto", variant: "default" },
  in_progress: { label: "Em Andamento", variant: "secondary" },
  resolved: { label: "Resolvido", variant: "outline" },
  closed: { label: "Fechado", variant: "destructive" },
};

const priorityLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  low: { label: "Baixa", variant: "outline" },
  medium: { label: "Média", variant: "secondary" },
  high: { label: "Alta", variant: "default" },
  urgent: { label: "Urgente", variant: "destructive" },
};

const categoryLabels: Record<string, string> = {
  general: "Geral",
  technical: "Técnico",
  billing: "Financeiro",
  feature_request: "Sugestão",
};

export default function TenantSupportPage() {
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    category: "general",
    priority: "medium",
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["tenant-support-tickets", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["ticket-messages", selectedTicket],
    queryFn: async () => {
      if (!selectedTicket) return [];
      const { data, error } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", selectedTicket)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTicket,
  });

  const createTicketMutation = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("Tenant não encontrado");
      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          tenant_id: tenantId,
          subject: newTicket.subject,
          description: newTicket.description,
          category: newTicket.category,
          priority: newTicket.priority,
          created_by: profile?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-support-tickets"] });
      setIsNewTicketOpen(false);
      setNewTicket({ subject: "", description: "", category: "general", priority: "medium" });
      toast({ title: "Ticket criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar ticket", variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTicket) throw new Error("Ticket não selecionado");
      const { error } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: selectedTicket,
          message: newMessage,
          user_id: profile?.id,
          is_internal: false,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", selectedTicket] });
      setNewMessage("");
      toast({ title: "Mensagem enviada!" });
    },
    onError: () => {
      toast({ title: "Erro ao enviar mensagem", variant: "destructive" });
    },
  });

  const selectedTicketData = tickets?.find((t) => t.id === selectedTicket);

  const newTicketButton = (
    <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Ticket
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Ticket de Suporte</DialogTitle>
          <DialogDescription>Descreva seu problema ou solicitação</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Assunto</Label>
            <Input
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              placeholder="Resumo do problema"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={newTicket.category}
                onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Geral</SelectItem>
                  <SelectItem value="technical">Técnico</SelectItem>
                  <SelectItem value="billing">Financeiro</SelectItem>
                  <SelectItem value="feature_request">Sugestão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={newTicket.priority}
                onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
              >
                <SelectTrigger>
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
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              placeholder="Descreva detalhadamente seu problema ou solicitação..."
              rows={5}
            />
          </div>
          <Button
            onClick={() => createTicketMutation.mutate()}
            disabled={!newTicket.subject || !newTicket.description || createTicketMutation.isPending}
            className="w-full"
          >
            {createTicketMutation.isPending ? "Criando..." : "Criar Ticket"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (!tenantId) {
    return (
      <TenantLayout title="Suporte">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Você não está associado a nenhum tenant.</p>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout title="Suporte" description="Abra tickets e acompanhe suas solicitações" actions={newTicketButton}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tickets List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Meus Tickets</CardTitle>
            <CardDescription>{tickets?.length || 0} tickets</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {ticketsLoading ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : tickets?.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhum ticket encontrado
                </div>
              ) : (
                <div className="divide-y">
                  {tickets?.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket.id)}
                      className={`w-full p-4 text-left transition-colors hover:bg-muted/50 ${
                        selectedTicket === ticket.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <Badge variant={statusLabels[ticket.status]?.variant || "default"}>
                          {statusLabels[ticket.status]?.label || ticket.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[ticket.category] || ticket.category}
                        </Badge>
                        <Badge variant={priorityLabels[ticket.priority]?.variant || "outline"} className="text-xs">
                          {priorityLabels[ticket.priority]?.label || ticket.priority}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Ticket Details */}
        <Card className="lg:col-span-2">
          {selectedTicket && selectedTicketData ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedTicketData.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      Criado em {format(new Date(selectedTicketData.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={statusLabels[selectedTicketData.status]?.variant || "default"}>
                      {statusLabels[selectedTicketData.status]?.label || selectedTicketData.status}
                    </Badge>
                    <Badge variant={priorityLabels[selectedTicketData.priority]?.variant || "outline"}>
                      {priorityLabels[selectedTicketData.priority]?.label || selectedTicketData.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[350px] p-4">
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Descrição Original:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedTicketData.description}
                    </p>
                  </div>

                  {messagesLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : messages?.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma mensagem ainda</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages?.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg ${
                            msg.user_id === profile?.id
                              ? "bg-primary/10 ml-8"
                              : "bg-muted mr-8"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">
                              {msg.user_id === profile?.id ? "Você" : "Suporte"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(msg.created_at), "dd/MM HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {selectedTicketData.status !== "closed" && selectedTicketData.status !== "resolved" && (
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => sendMessageMutation.mutate()}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        size="icon"
                        className="h-auto"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
              <Clock className="h-12 w-12 mb-4 opacity-50" />
              <p>Selecione um ticket para ver os detalhes</p>
            </div>
          )}
        </Card>
      </div>
    </TenantLayout>
  );
}

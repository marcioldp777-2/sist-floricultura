import { useNavigate } from "react-router-dom";
import { Flower2, ArrowRight, Store, Package, Truck, BarChart3, Users, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const navigate = useNavigate();
  const { user, profile, roles, loading, signOut, isSuperAdmin, isTenantOwner } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in, show dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Flower2 className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">FloraHub</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {profile?.full_name || user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {roles.map(r => r.role).join(", ") || "Usuário"}
                </p>
              </div>
              <Button variant="outline" onClick={signOut}>
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Olá, {profile?.full_name?.split(" ")[0] || "Usuário"}! 👋
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo ao FloraHub. Escolha uma opção para começar.
            </p>
          </div>

          {/* Quick actions based on role */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isSuperAdmin && (
              <Card className="group hover:shadow-soft transition-all duration-300 cursor-pointer animate-fade-in border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Superadmin</CardTitle>
                      <CardDescription>Gerenciar plataforma</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gerencie tenants, usuários, planos e configurações globais da plataforma.
                  </p>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Acessar painel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {(isTenantOwner || isSuperAdmin) && (
              <Card className="group hover:shadow-soft transition-all duration-300 cursor-pointer animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent rounded-xl group-hover:bg-accent/80 transition-colors">
                      <Store className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Minha Floricultura</CardTitle>
                      <CardDescription>Configurações do tenant</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure sua floricultura, gerencie lojas, equipe e preferências.
                  </p>
                  <Button variant="outline" className="w-full">
                    Configurar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="group hover:shadow-soft transition-all duration-300 cursor-pointer animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-info/10 rounded-xl group-hover:bg-info/20 transition-colors">
                    <Package className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Catálogo</CardTitle>
                    <CardDescription>Produtos e estoque</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Gerencie flores, arranjos, insumos e controle seu estoque.
                </p>
                <Button variant="outline" className="w-full">
                  Ver catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-soft transition-all duration-300 cursor-pointer animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-success/10 rounded-xl group-hover:bg-success/20 transition-colors">
                    <Truck className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Pedidos</CardTitle>
                    <CardDescription>Vendas e entregas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Acompanhe pedidos, gerencie entregas e produções.
                </p>
                <Button variant="outline" className="w-full">
                  Ver pedidos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-soft transition-all duration-300 cursor-pointer animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-warning/10 rounded-xl group-hover:bg-warning/20 transition-colors">
                    <BarChart3 className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Relatórios</CardTitle>
                    <CardDescription>Analytics e insights</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Visualize métricas, vendas, perdas e performance.
                </p>
                <Button variant="outline" className="w-full">
                  Ver relatórios
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-soft transition-all duration-300 cursor-pointer animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary rounded-xl group-hover:bg-secondary/80 transition-colors">
                    <Users className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Equipe</CardTitle>
                    <CardDescription>Gerenciar usuários</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Gerencie colaboradores, permissões e acessos.
                </p>
                <Button variant="outline" className="w-full">
                  Ver equipe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Status message for new users */}
          {!profile?.tenant_id && !isSuperAdmin && (
            <Card className="mt-8 border-warning/50 bg-warning/5 animate-fade-in">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-warning/20 rounded-lg">
                    <Store className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Você ainda não está vinculado a uma floricultura
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Aguarde um administrador vincular você a um tenant, ou entre em contato com o suporte.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Flower2 className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">FloraHub</span>
          </div>
          <Button onClick={() => navigate("/auth")}>
            Entrar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Flower2 className="h-4 w-4" />
            Plataforma SaaS para Floriculturas
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Gestão completa para sua{" "}
            <span className="text-primary">floricultura</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Controle estoque com FEFO, gerencie pedidos multicanal, 
            organize entregas e impulsione suas vendas em uma única plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Começar agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Conhecer recursos
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Store,
              title: "Multi-lojas",
              description: "Gerencie várias unidades em uma única conta com controle centralizado.",
            },
            {
              icon: Package,
              title: "Estoque FEFO",
              description: "Controle de lotes com validade, garantindo frescor e reduzindo perdas.",
            },
            {
              icon: Truck,
              title: "Entregas",
              description: "Janelas de entrega, roteirização e acompanhamento em tempo real.",
            },
            {
              icon: BarChart3,
              title: "Analytics",
              description: "Relatórios detalhados de vendas, perdas e performance por loja.",
            },
            {
              icon: Users,
              title: "Equipe",
              description: "Controle de acesso por função: florista, vendedor, gerente e mais.",
            },
            {
              icon: Shield,
              title: "Segurança",
              description: "Dados isolados por tenant com criptografia e backup automático.",
            },
          ].map((feature, index) => (
            <Card key={feature.title} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-2">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 FloraHub. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

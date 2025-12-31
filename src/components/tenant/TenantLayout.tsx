import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TenantSidebar } from "./TenantSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TenantLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function TenantLayout({ children, title, description, actions }: TenantLayoutProps) {
  const { isImpersonating, impersonatedTenant, setImpersonatedTenant } = useAuth();
  const navigate = useNavigate();

  const handleExitImpersonation = () => {
    setImpersonatedTenant(null);
    navigate("/superadmin/tenants");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <TenantSidebar />
        <main className="flex-1 flex flex-col">
          {/* Impersonation Banner */}
          {isImpersonating && (
            <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Modo Suporte: Acessando <strong>{impersonatedTenant?.name}</strong>
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExitImpersonation}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Superadmin
              </Button>
            </div>
          )}
          
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2" />
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </header>
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Array<"superadmin" | "tenant_owner" | "manager" | "florist" | "seller" | "driver" | "accountant">;
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, roles, loading, isSuperAdmin, isImpersonating } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has required role (if specified)
  if (requiredRoles && requiredRoles.length > 0) {
    // Superadmins can access tenant routes when impersonating
    const isTenantRoute = requiredRoles.some(r => 
      ["tenant_owner", "manager", "florist", "seller", "driver", "accountant"].includes(r)
    );
    
    if (isSuperAdmin && isTenantRoute && isImpersonating) {
      // Allow superadmin to access tenant routes when impersonating
      return <>{children}</>;
    }

    const hasRequiredRole = roles.some((r) => requiredRoles.includes(r.role));
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

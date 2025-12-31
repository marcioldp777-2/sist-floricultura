import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SuperadminDashboard from "./pages/superadmin/SuperadminDashboard";
import TenantsPage from "./pages/superadmin/TenantsPage";
import UsersPage from "./pages/superadmin/UsersPage";
import RolesPage from "./pages/superadmin/RolesPage";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import OrdersPage from "./pages/tenant/OrdersPage";
import ProductsPage from "./pages/tenant/ProductsPage";
import CategoriesPage from "./pages/tenant/CategoriesPage";
import CustomersPage from "./pages/tenant/CustomersPage";
import TeamPage from "./pages/tenant/TeamPage";
import SettingsPage from "./pages/tenant/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Superadmin Routes */}
            <Route
              path="/superadmin"
              element={
                <ProtectedRoute requiredRoles={["superadmin"]}>
                  <SuperadminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/tenants"
              element={
                <ProtectedRoute requiredRoles={["superadmin"]}>
                  <TenantsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/users"
              element={
                <ProtectedRoute requiredRoles={["superadmin"]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/roles"
              element={
                <ProtectedRoute requiredRoles={["superadmin"]}>
                  <RolesPage />
                </ProtectedRoute>
              }
            />
            
            {/* Tenant Backoffice Routes */}
            <Route
              path="/tenant"
              element={
                <ProtectedRoute requiredRoles={["tenant_owner", "manager", "florist", "seller", "driver", "accountant"]}>
                  <TenantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/orders"
              element={
                <ProtectedRoute requiredRoles={["tenant_owner", "manager", "florist", "seller", "driver", "accountant"]}>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/products"
              element={
                <ProtectedRoute requiredRoles={["tenant_owner", "manager"]}>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/categories"
              element={
                <ProtectedRoute requiredRoles={["tenant_owner", "manager"]}>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/customers"
              element={
                <ProtectedRoute requiredRoles={["tenant_owner", "manager", "seller"]}>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/team"
              element={
                <ProtectedRoute requiredRoles={["tenant_owner", "manager"]}>
                  <TeamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/settings"
              element={
                <ProtectedRoute requiredRoles={["tenant_owner"]}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

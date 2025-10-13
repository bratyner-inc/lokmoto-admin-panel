import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./presentation/pages/Dashboard"; // Router component que decide qual dashboard mostrar
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import TermosDeUso from "./presentation/pages/TermosDeUso";
import Suspended from "./presentation/pages/Suspended";
import Onboarding from "./presentation/pages/store-admin/Onboarding";
import LandingPage from "./landing";
import { globalAdminRoutes } from "./routes/globalAdminRoutes";
import { storeAdminRoutes } from "./routes/storeAdminRoutes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />
          
          {/* Semi-Public Routes (requires auth but no layout) */}
          <Route path="/suspended" element={<Suspended />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />

          {/* Protected Routes with Layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Global Admin Routes */}
          {globalAdminRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={
                <AdminLayout>
                  <Suspense fallback={<div>Carregando...</div>}>
                    {route.element}
                  </Suspense>
                </AdminLayout>
              } 
            />
          ))}

          {/* Store Admin Routes */}
          {storeAdminRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={
                <AdminLayout>
                  <Suspense fallback={<div>Carregando...</div>}>
                    {route.element}
                  </Suspense>
                </AdminLayout>
              } 
            />
          ))}

          {/* Error Routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

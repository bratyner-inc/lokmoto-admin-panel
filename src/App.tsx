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
import ForgotPassword from "./pages/ForgotPassword";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
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
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/sign-up" element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
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
          <Route path="/" element={
            <ProtectedRoute redirectTo="/login">
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

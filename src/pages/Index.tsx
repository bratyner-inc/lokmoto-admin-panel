import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthV2 } from "@/hooks/useAuthV2";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthV2();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Lokmoto Admin</h1>
        <p className="text-muted-foreground text-xl">Sistema de Gestão de Locação de Motocicletas</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/login")} size="lg">
            Fazer Login
          </Button>
          <Button variant="outline" onClick={() => navigate("/sign-up")} size="lg">
            Cadastrar Locadora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;

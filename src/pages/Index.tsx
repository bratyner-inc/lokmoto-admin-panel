import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Bem-vindo ao Lokmoto</h1>
        <p className="text-muted-foreground text-xl">Sistema de Locação de Motocicletas</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/auth")}>Entrar / Cadastrar</Button>
          <Button variant="outline" onClick={() => navigate("/login")}>Admin (Antigo)</Button>
        </div>
      </div>
    </div>
  );
};

export default Index;

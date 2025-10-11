import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Eye, Loader2 } from 'lucide-react';
import { useCustomers } from '@/presentation/hooks/useCustomers';
import { formatCurrency, formatCPF, formatPhone } from '@/shared/utils/formatters';
import { useToast } from '@/hooks/use-toast';

export default function ClientesLoja() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { customers, loading, error, searchCustomers, refetch } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      refetch();
      return;
    }
    
    setIsSearching(true);
    try {
      await searchCustomers(searchTerm);
    } catch (err) {
      toast({
        title: 'Erro ao buscar',
        description: 'Não foi possível buscar clientes.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      refetch();
    }
  };

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Erro ao carregar clientes: {error.message}</p>
              <Button onClick={() => refetch()} className="mt-4">
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Clientes da Loja
          </h1>
          <p className="text-muted-foreground">
            Gerencie os clientes da sua loja
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-dark"
          onClick={() => navigate('/clientes-loja/novo')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Buscar por nome, email ou CPF..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : customers.length}
              </div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : '0'}
              </div>
              <p className="text-sm text-muted-foreground">Contratos Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : formatCurrency(0)}
              </div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && customers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando clientes...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && customers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Tente buscar com outros termos.' 
                  : 'Cadastre seu primeiro cliente para começar.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/clientes-loja/novo')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Cliente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients Cards */}
      {!loading && customers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="shadow-card hover:shadow-elegant transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{customer.fullName}</CardTitle>
                  <Badge variant="default" className="bg-success text-white">
                    Ativo
                  </Badge>
                </div>
                <CardDescription>{customer.email}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="font-medium">{formatPhone(customer.phone)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CPF:</span>
                      <span className="font-mono text-sm">{formatCPF(customer.documentId)}</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">0</div>
                        <div className="text-xs text-muted-foreground">Contratos</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-success">{formatCurrency(0)}</div>
                        <div className="text-xs text-muted-foreground">Total Gasto</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground text-center">
                    Cadastrado em: {customer.createdAt.toLocaleDateString('pt-BR')}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/clientes-loja/${customer.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


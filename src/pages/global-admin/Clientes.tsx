import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRentalCompanies, useDeleteRentalCompany } from '@/hooks/useRentalCompanies';

export default function Clientes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: rentalCompanies = [], isLoading } = useRentalCompanies();
  const deleteMutation = useDeleteRentalCompany();

  const handleDelete = async (companyId: string, companyName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a locadora ${companyName}?`)) {
      try {
        await deleteMutation.mutateAsync(companyId);
        toast({
          title: "Locadora excluída",
          description: "A locadora foi removida com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a locadora.",
          variant: "destructive",
        });
      }
    }
  };

  const filteredCompanies = rentalCompanies.filter(company =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.tradingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj.includes(searchTerm) ||
    company.phone.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            Locadoras
          </h1>
          <p className="text-muted-foreground">
            Gerencie todas as locadoras do sistema
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-dark"
          onClick={() => navigate('/admin/clientes/novo')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Locadora
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Buscar por nome, e-mail, CNPJ ou telefone..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{rentalCompanies.length}</div>
              <p className="text-sm text-muted-foreground">Total de Locadoras</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{filteredCompanies.length}</div>
              <p className="text-sm text-muted-foreground">Resultados da Busca</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Locadoras</CardTitle>
          <CardDescription>
            Todas as locadoras cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                {searchTerm ? 'Nenhuma locadora encontrada' : 'Nenhuma locadora cadastrada'}
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/admin/clientes/novo')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Locadora
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome Fantasia</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Razão Social</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">E-mail</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">CNPJ</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-foreground">{company.companyName}</div>
                      </td>
                      <td className="py-4 px-4 text-foreground">{company.tradingName}</td>
                      <td className="py-4 px-4 text-foreground">{company.email}</td>
                      <td className="py-4 px-4 text-foreground font-mono">{company.cnpj}</td>
                      <td className="py-4 px-4">
                        <Badge variant={
                          company.subscriptionStatus === 'active' ? 'default' :
                          company.subscriptionStatus === 'pending' ? 'secondary' :
                          'destructive'
                        }>
                          {company.subscriptionStatus === 'active' ? 'Ativo' :
                           company.subscriptionStatus === 'pending' ? 'Pendente' :
                           company.subscriptionStatus === 'canceled' ? 'Cancelado' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/admin/clientes/${company.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/admin/clientes/${company.id}/editar`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(company.id, company.companyName)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

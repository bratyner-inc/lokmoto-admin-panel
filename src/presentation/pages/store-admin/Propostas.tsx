import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ClipboardList, 
  Search, 
  Calendar, 
  User, 
  Car, 
  CheckCircle, 
  X, 
  Eye,
  AlertCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useProposals } from '@/presentation/hooks/useProposals';
import { Proposal, ProposalStatus } from '@/domain/entities/Proposal';
import { formatCurrency, formatDate, formatDateTime } from '@/shared/utils/formatters';
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS } from '@/shared/constants/proposalConstants';

export default function Propostas() {
  const { proposals, loading, acceptProposal, rejectProposal } = useProposals();
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: ProposalStatus) => {
    const label = PROPOSAL_STATUS_LABELS[status];
    const colorClass = PROPOSAL_STATUS_COLORS[status];
    
    const colorMap: Record<string, string> = {
      'success': 'bg-green-500 text-white',
      'warning': 'bg-yellow-500 text-white',
      'destructive': 'bg-red-500 text-white',
      'info': 'bg-blue-500 text-white',
      'default': 'bg-gray-500 text-white',
    };

    return <Badge className={colorMap[colorClass] || colorMap.default}>{label}</Badge>;
  };

  const calculateDays = (startDate: Date, endDate: Date) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = (proposal: Proposal) => {
    const days = calculateDays(proposal.startDate, proposal.endDate);
    const rate = proposal.proposedDailyRate || 0;
    return days * rate;
  };

  const handleAccept = async (id: string) => {
    await acceptProposal(id);
  };

  const handleReject = async (id: string) => {
    await rejectProposal(id);
  };

  // Filter proposals based on search
  const filteredProposals = proposals.filter(proposal => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      proposal.id.toLowerCase().includes(query) ||
      proposal.customer?.fullName.toLowerCase().includes(query) ||
      proposal.customer?.email.toLowerCase().includes(query) ||
      proposal.motorcycle?.brand.toLowerCase().includes(query) ||
      proposal.motorcycle?.model.toLowerCase().includes(query)
    );
  });

  // Calculate statistics
  const stats = {
    pending: proposals.filter(p => p.status === 'open' || p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
    totalApproved: proposals
      .filter(p => p.status === 'accepted')
      .reduce((acc, p) => acc + calculateTotal(p), 0),
  };

  // Loading state
  if (loading && proposals.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="h-8 w-8 text-primary" />
              Propostas
            </h1>
            <p className="text-muted-foreground">Gerencie propostas de locação da loja</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            Propostas
          </h1>
          <p className="text-muted-foreground">
            Gerencie propostas de locação da loja
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {stats.pending}
              </div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {stats.accepted}
              </div>
              <p className="text-sm text-muted-foreground">Aceitas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {stats.rejected}
              </div>
              <p className="text-sm text-muted-foreground">Rejeitadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(stats.totalApproved)}
              </div>
              <p className="text-sm text-muted-foreground">Valor Aceito</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input 
              type="text"
              placeholder="Buscar por cliente, veículo ou ID da proposta..." 
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredProposals.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta recebida'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? 'Tente buscar com outros termos'
                : 'Quando clientes solicitarem locações, as propostas aparecerão aqui'
              }
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Limpar Busca
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Proposals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProposals.map((proposal) => {
          const days = calculateDays(proposal.startDate, proposal.endDate);
          const total = calculateTotal(proposal);
          const canRespond = proposal.status === 'open' || proposal.status === 'pending';

          return (
            <Card key={proposal.id} className="shadow-card hover:shadow-elegant transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-mono">{proposal.id.slice(0, 8)}</CardTitle>
                  {getStatusBadge(proposal.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Criada em {formatDateTime(proposal.createdAt)}
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Client Info */}
                  {proposal.customer && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{proposal.customer.fullName}</div>
                        <div className="text-sm text-muted-foreground">{proposal.customer.email}</div>
                      </div>
                    </div>
                  )}

                  {/* Vehicle Info */}
                  {proposal.motorcycle && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-foreground">
                          {proposal.motorcycle.brand} {proposal.motorcycle.model}
                        </div>
                        <div className="text-sm text-muted-foreground">Placa: {proposal.motorcycle.plate}</div>
                      </div>
                    </div>
                  )}

                  {/* Period */}
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">
                        {formatDate(proposal.startDate)} - {formatDate(proposal.endDate)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {days} {days === 1 ? 'dia' : 'dias'}
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        {proposal.proposedDailyRate ? formatCurrency(proposal.proposedDailyRate) : '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">Diária</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-500">
                        {formatCurrency(total)}
                      </div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                  </div>

                  {/* Notes */}
                  {proposal.notes && (
                    <div className="p-3 bg-accent/30 rounded-lg">
                      <div className="text-sm font-medium text-foreground mb-1">Observações:</div>
                      <div className="text-sm text-muted-foreground">{proposal.notes}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    {canRespond ? (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aceitar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Aceitar Proposta</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja aceitar esta proposta? O cliente será notificado e 
                                poderá prosseguir com a locação.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleAccept(proposal.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Aceitar Proposta
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Rejeitar Proposta</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja rejeitar esta proposta? O cliente será notificado 
                                da rejeição.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleReject(proposal.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Rejeitar Proposta
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        <Eye className="h-4 w-4 mr-1" />
                        {PROPOSAL_STATUS_LABELS[proposal.status]}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card for Empty Proposals */}
      {proposals.length === 0 && !loading && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Sobre as Propostas</h3>
                <p className="text-sm text-blue-700">
                  As propostas são criadas pelos clientes através do aplicativo móvel. 
                  Quando um cliente solicitar a locação de uma de suas motocicletas, 
                  a proposta aparecerá aqui para você aceitar ou rejeitar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


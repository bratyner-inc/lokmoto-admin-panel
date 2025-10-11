import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Ticket as TicketIcon, 
  Plus, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Loader2,
  Eye,
  AlertTriangle,
  FileText,
  Car
} from 'lucide-react';
import { useTickets } from '@/presentation/hooks/useTickets';
import { formatDate } from '@/shared/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Ticket, TicketType, TicketStatus, TicketPriority } from '@/domain/entities/Ticket';

export default function Tickets() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tickets, loading, error, refetch } = useTickets();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Aberto
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-500 text-white">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Em Andamento
          </Badge>
        );
      case 'closed':
        return (
          <Badge className="bg-success text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Fechado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Urgente
          </Badge>
        );
      case 'high':
        return (
          <Badge className="bg-orange-500 text-white">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Alta
          </Badge>
        );
      case 'medium':
        return <Badge className="bg-yellow-500 text-white">Média</Badge>;
      case 'low':
        return <Badge variant="outline">Baixa</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeBadge = (type: TicketType) => {
    switch (type) {
      case 'defect':
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Defeito
          </Badge>
        );
      case 'accident':
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            <Car className="h-3 w-3 mr-1" />
            Acidente
          </Badge>
        );
      case 'other':
        return (
          <Badge variant="outline">
            <FileText className="h-3 w-3 mr-1" />
            Outro
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    const matchesType = filterType === 'all' || ticket.ticketType === filterType;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  // Calculate statistics
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    urgent: tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length,
  };

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Erro ao carregar tickets: {error.message}</p>
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
            <TicketIcon className="h-8 w-8 text-primary" />
            Tickets de Suporte
          </h1>
          <p className="text-muted-foreground">
            Gerencie solicitações de suporte e manutenção
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-dark"
          onClick={() => navigate('/tickets/novo')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.total}
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.open}
              </div>
              <p className="text-sm text-muted-foreground">Abertos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.inProgress}
              </div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.closed}
              </div>
              <p className="text-sm text-muted-foreground">Fechados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.urgent}
              </div>
              <p className="text-sm text-muted-foreground">Urgentes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Buscar por título ou descrição..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="defect">Defeito</SelectItem>
                <SelectItem value="accident">Acidente</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && tickets.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando tickets...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && filteredTickets.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum ticket encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterType !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Crie seu primeiro ticket de suporte.'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button onClick={() => navigate('/tickets/novo')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Ticket
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets Grid */}
      {!loading && filteredTickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="shadow-card hover:shadow-elegant transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-2">{ticket.title}</CardTitle>
                  {getPriorityBadge(ticket.priority)}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(ticket.status)}
                  {getTypeBadge(ticket.ticketType)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {ticket.description}
                  </p>

                  <div className="text-xs text-muted-foreground">
                    Criado em: {formatDate(ticket.createdAt)}
                  </div>

                  {ticket.closedAt && (
                    <div className="text-xs text-success font-medium">
                      Fechado em: {formatDate(ticket.closedAt)}
                    </div>
                  )}

                  {/* Actions */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


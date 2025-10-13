import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  User,
  Car,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { useTicket, useTickets } from '@/presentation/hooks/useTickets';
import { formatDate } from '@/shared/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { TicketStatus, TicketType, TicketPriority } from '@/domain/entities/Ticket';

export default function TicketDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { ticket, loading, error } = useTicket(id || '');
  const { updateTicket, deleteTicket } = useTickets();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus | ''>('');
  const [resolutionDetails, setResolutionDetails] = useState('');

  const handleStatusChange = async () => {
    if (!ticket || !newStatus) return;

    setIsUpdatingStatus(true);
    try {
      await updateTicket(
        ticket.id,
        {
          status: newStatus,
          ...(newStatus === 'closed' && resolutionDetails ? { resolutionDetails } : {}),
        },
      );

      toast({
        title: 'Status atualizado!',
        description: 'O status do ticket foi atualizado com sucesso.',
        variant: 'default',
      });
      history.back();

      setNewStatus('');
      setResolutionDetails('');
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!ticket) return;

    setIsDeleting(true);
    try {
      await deleteTicket(ticket.id);
      toast({
        title: 'Ticket excluído!',
        description: 'O ticket foi excluído com sucesso.',
        variant: 'default',
      });
      navigate('/tickets');
    } catch (error) {
      toast({
        title: 'Erro ao excluir ticket',
        description: (error as Error).message,
        variant: 'destructive',
      });
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return (
          <Badge variant="secondary" className="text-base">
            <Clock className="h-4 w-4 mr-1" />
            Aberto
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-500 text-white text-base">
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Em Andamento
          </Badge>
        );
      case 'closed':
        return (
          <Badge className="bg-success text-white text-base">
            <CheckCircle className="h-4 w-4 mr-1" />
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
          <Badge variant="destructive" className="text-base">
            <AlertCircle className="h-4 w-4 mr-1" />
            Urgente
          </Badge>
        );
      case 'high':
        return (
          <Badge className="bg-orange-500 text-white text-base">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Alta
          </Badge>
        );
      case 'medium':
        return <Badge className="bg-yellow-500 text-white text-base">Média</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-base">Baixa</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeBadge = (type: TicketType) => {
    switch (type) {
      case 'defect':
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-500 text-base">
            <AlertCircle className="h-4 w-4 mr-1" />
            Defeito
          </Badge>
        );
      case 'accident':
        return (
          <Badge variant="outline" className="border-red-500 text-red-500 text-base">
            <Car className="h-4 w-4 mr-1" />
            Acidente
          </Badge>
        );
      case 'other':
        return (
          <Badge variant="outline" className="text-base">
            <FileText className="h-4 w-4 mr-1" />
            Outro
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Erro ao carregar ticket: {error?.message || 'Ticket não encontrado'}</p>
              <Button onClick={() => navigate('/tickets')} className="mt-4">
                Voltar para Tickets
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/tickets')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{ticket.title}</h1>
            <p className="text-muted-foreground">Ticket #{ticket.ticketNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/tickets/editar/${ticket.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalhes do Ticket</CardTitle>
                <div className="flex gap-2">
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                  {getTypeBadge(ticket.ticketType)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Descrição</Label>
                <p className="mt-1 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {ticket.resolutionDetails && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground">Detalhes da Resolução</Label>
                    <p className="mt-1 whitespace-pre-wrap">{ticket.resolutionDetails}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Anexos ({ticket.attachments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ticket.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {attachment.fileType.startsWith('image/') ? (
                        <div className="relative group">
                          <img
                            src={attachment.fileUrl}
                            alt="Attachment"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <FileText className="h-8 w-8 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              Documento anexado
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {attachment.fileType}
                            </p>
                          </div>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Atualizar Status</CardTitle>
              <CardDescription>
                Altere o status do ticket e adicione detalhes da resolução
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Novo Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as TicketStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newStatus === 'closed' && (
                <div>
                  <Label htmlFor="resolution">
                    Detalhes da Resolução <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="resolution"
                    placeholder="Descreva como o problema foi resolvido..."
                    rows={4}
                    value={resolutionDetails}
                    onChange={(e) => setResolutionDetails(e.target.value)}
                  />
                </div>
              )}

              <Button
                onClick={handleStatusChange}
                disabled={!newStatus || isUpdatingStatus || (newStatus === 'closed' && !resolutionDetails)}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Atualizar Status'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contract Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.contract && (
                <div>
                  <Label className="text-muted-foreground">Contrato</Label>
                  <p className="mt-1 font-medium">{ticket.contract.contractNumber}</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0"
                    onClick={() => navigate(`/contratos/${ticket.contractId}`)}
                  >
                    Ver contrato
                  </Button>
                </div>
              )}

              {ticket.customer && (
                <div>
                  <Label className="text-muted-foreground">Cliente</Label>
                  <div className="mt-1">
                    <p className="font-medium">{ticket.customer.fullName}</p>
                    <p className="text-sm text-muted-foreground">{ticket.customer.email}</p>
                  </div>
                </div>
              )}

              {ticket.motorcycle && (
                <div>
                  <Label className="text-muted-foreground">Veículo</Label>
                  <div className="mt-1">
                    <p className="font-medium">
                      {ticket.motorcycle.brand} {ticket.motorcycle.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Placa: {ticket.motorcycle.plate}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Criado</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(ticket.createdAt)}
                  </p>
                </div>
              </div>

              {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Última atualização</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(ticket.updatedAt)}
                    </p>
                  </div>
                </div>
              )}

              {ticket.closedAt && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Fechado</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(ticket.closedAt)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTicket, useTickets } from '@/presentation/hooks/useTickets';
import { useContracts } from '@/presentation/hooks/useContracts';
import { CreateTicketDTO, TicketType, TicketPriority } from '@/domain/entities/Ticket';

const MAX_PHOTOS = 3;
const MAX_DOCUMENT = 1;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  contractId: z.string().min(1, 'Contrato é obrigatório'),
  ticketType: z.enum(['defect', 'accident', 'other'] as const, {
    required_error: 'Tipo do ticket é obrigatório',
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const, {
    required_error: 'Prioridade é obrigatória',
  }),
  title: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  description: z.string().min(20, 'Descrição deve ter no mínimo 20 caracteres'),
});

type FormData = z.infer<typeof formSchema>;

export default function TicketForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const { ticket, loading: loadingTicket } = useTicket(id || '');
  const { createTicket, updateTicket } = useTickets();
  const { contracts: activeContracts, loading: loadingContracts } = useContracts({ status: 'active' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: 'medium',
      ticketType: 'defect',
    },
  });

  const selectedContractId = watch('contractId');
  const selectedContract = activeContracts.find(c => c.id === selectedContractId);

  useEffect(() => {
    if (ticket && isEditing) {
      setValue('contractId', ticket.contractId);
      setValue('ticketType', ticket.ticketType);
      setValue('priority', ticket.priority);
      setValue('title', ticket.title);
      setValue('description', ticket.description);
      
      if (ticket.attachments) {
        setExistingAttachments(ticket.attachments.map(a => a.id));
      }
    }
  }, [ticket, isEditing, setValue]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Arquivo inválido',
          description: `${file.name} não é uma imagem válida.`,
          variant: 'destructive',
        });
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'Arquivo muito grande',
          description: `${file.name} excede o tamanho máximo de 5MB.`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    const remainingSlots = MAX_PHOTOS - photoFiles.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);
    
    if (validFiles.length > remainingSlots) {
      toast({
        title: 'Limite excedido',
        description: `Você pode adicionar no máximo ${MAX_PHOTOS} fotos.`,
        variant: 'destructive',
      });
    }

    setPhotoFiles(prev => [...prev, ...filesToAdd]);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Arquivo muito grande',
        description: `${file.name} excede o tamanho máximo de 5MB.`,
        variant: 'destructive',
      });
      return;
    }

    setDocumentFile(file);
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = () => {
    setDocumentFile(null);
  };

  const removeExistingAttachment = (attachmentId: string) => {
    setExistingAttachments(prev => prev.filter(id => id !== attachmentId));
    setAttachmentsToDelete(prev => [...prev, attachmentId]);
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedContract) {
      toast({
        title: 'Erro',
        description: 'Selecione um contrato válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const allFiles = [...photoFiles];
      if (documentFile) allFiles.push(documentFile);

      const ticketData: CreateTicketDTO = {
        contractId: data.contractId,
        customerId: selectedContract.customerId,
        motorcycleId: selectedContract.motorcycleId,
        ticketType: data.ticketType,
        priority: data.priority,
        title: data.title,
        description: data.description,
        status: 'open',
      };

      if (isEditing && id) {
        await updateTicket(id, ticketData, allFiles, attachmentsToDelete);
        toast({
          title: 'Ticket atualizado!',
          description: 'O ticket foi atualizado com sucesso.',
          variant: 'default',
        });
      } else {
        await createTicket(ticketData, allFiles);
        toast({
          title: 'Ticket criado!',
          description: 'O ticket foi criado com sucesso.',
          variant: 'default',
        });
      }

      navigate('/tickets');
    } catch (error) {
      toast({
        title: 'Erro',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingTicket || (isEditing && !ticket)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Editar Ticket' : 'Novo Ticket'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações do ticket' : 'Crie um novo ticket de suporte'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Ticket</CardTitle>
            <CardDescription>
              Preencha os dados do ticket e anexe documentos se necessário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contract Selection */}
            <div>
              <Label htmlFor="contractId">
                Contrato <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('contractId')}
                onValueChange={(value) => setValue('contractId', value)}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um contrato" />
                </SelectTrigger>
                <SelectContent>
                  {loadingContracts ? (
                    <SelectItem value="loading" disabled>
                      Carregando contratos...
                    </SelectItem>
                  ) : activeContracts.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum contrato ativo encontrado
                    </SelectItem>
                  ) : (
                    activeContracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id}>
                        {contract.contractNumber} - {contract.motorcycle?.brand} {contract.motorcycle?.model}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.contractId && (
                <p className="text-sm text-destructive mt-1">{errors.contractId.message}</p>
              )}
              {selectedContract && (
                <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                  <p><strong>Cliente:</strong> {selectedContract.customer?.name}</p>
                  <p><strong>Veículo:</strong> {selectedContract.motorcycle?.brand} {selectedContract.motorcycle?.model} - {selectedContract.motorcycle?.plate}</p>
                </div>
              )}
            </div>

            {/* Ticket Type */}
            <div>
              <Label htmlFor="ticketType">
                Tipo do Ticket <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('ticketType')}
                onValueChange={(value) => setValue('ticketType', value as TicketType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defect">Defeito</SelectItem>
                  <SelectItem value="accident">Acidente</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              {errors.ticketType && (
                <p className="text-sm text-destructive mt-1">{errors.ticketType.message}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">
                Prioridade <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as TicketPriority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive mt-1">{errors.priority.message}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Problema no motor da moto"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">
                Descrição <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva o problema ou solicitação em detalhes..."
                rows={6}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>Anexos</CardTitle>
            <CardDescription>
              Adicione até 3 fotos e 1 documento (máximo 5MB cada)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photos */}
            <div>
              <Label>Fotos ({photoFiles.length}/{MAX_PHOTOS})</Label>
              <div className="mt-2 space-y-4">
                {photoFiles.length < MAX_PHOTOS && (
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="cursor-pointer"
                      id="photos"
                    />
                    <Label
                      htmlFor="photos"
                      className="mt-2 flex items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Clique para adicionar fotos
                        </p>
                      </div>
                    </Label>
                  </div>
                )}

                {photoFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photoFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Document */}
            <div>
              <Label>Documento ({documentFile ? '1' : '0'}/{MAX_DOCUMENT})</Label>
              {!documentFile && (
                <div className="mt-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleDocumentChange}
                    className="cursor-pointer"
                    id="document"
                  />
                  <Label
                    htmlFor="document"
                    className="mt-2 flex items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Clique para adicionar documento (PDF, DOC, DOCX)
                      </p>
                    </div>
                  </Label>
                </div>
              )}

              {documentFile && (
                <div className="mt-2 flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm">{documentFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeDocument}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Existing Attachments (when editing) */}
            {isEditing && ticket && ticket.attachments && ticket.attachments.length > 0 && (
              <div>
                <Label>Anexos Existentes</Label>
                <div className="mt-2 space-y-2">
                  {ticket.attachments
                    .filter(att => existingAttachments.includes(att.id))
                    .map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {attachment.fileType.startsWith('image/') ? (
                            <ImageIcon className="h-5 w-5 text-primary" />
                          ) : (
                            <FileText className="h-5 w-5 text-primary" />
                          )}
                          <a
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:underline"
                          >
                            Ver anexo
                          </a>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExistingAttachment(attachment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/tickets')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? 'Atualizando...' : 'Criando...'}
              </>
            ) : (
              <>{isEditing ? 'Atualizar Ticket' : 'Criar Ticket'}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}


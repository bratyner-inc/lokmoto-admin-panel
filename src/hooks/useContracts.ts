import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contract } from '@/domain/entities/Contract';
import { SupabaseContractRepository } from '@/data/repositories/SupabaseContractRepository';
import { useToast } from '@/hooks/use-toast';

const contractRepository = new SupabaseContractRepository();

// Upload contract file to storage
export const uploadContractFile = async (file: File, contractId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${contractId}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('contracts')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('contracts')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Delete contract file from storage
export const deleteContractFile = async (fileUrl: string): Promise<void> => {
  const fileName = fileUrl.split('/').pop();
  if (!fileName) return;

  const { error } = await supabase.storage
    .from('contracts')
    .remove([fileName]);

  if (error) throw error;
};

// Get all contracts
export const useContracts = (rentalCompanyId?: string) => {
  return useQuery({
    queryKey: ['contracts', rentalCompanyId],
    queryFn: () => contractRepository.getAll(rentalCompanyId),
  });
};

// Get single contract
export const useContract = (id: string) => {
  return useQuery({
    queryKey: ['contracts', id],
    queryFn: () => contractRepository.getById(id),
    enabled: !!id,
  });
};

// Create contract
export const useCreateContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (contract: Omit<Contract, 'createdAt' | 'updatedAt'>) =>
      contractRepository.create(contract),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: 'Contrato criado!',
        description: 'O contrato foi criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar contrato',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Update contract
export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, contract }: { id: string; contract: Partial<Contract> }) =>
      contractRepository.update(id, contract),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', variables.id] });
      toast({
        title: 'Contrato atualizado!',
        description: 'O contrato foi atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar contrato',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Delete contract
export const useDeleteContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get contract to check if has file
      const contract = await contractRepository.getById(id);
      if (contract?.contractFile) {
        await deleteContractFile(contract.contractFile);
      }
      await contractRepository.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: 'Contrato excluído!',
        description: 'O contrato foi excluído com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir contrato',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Update contract status
export const useUpdateContractStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Contract['status'] }) =>
      contractRepository.update(id, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', variables.id] });
      toast({
        title: 'Status atualizado!',
        description: 'O status do contrato foi atualizado.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

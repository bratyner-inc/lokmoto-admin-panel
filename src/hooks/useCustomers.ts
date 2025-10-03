import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseCustomerRepository } from '@/data/repositories/SupabaseCustomerRepository';
import { Customer, CustomerDriverLicense } from '@/domain/entities/Customer';
import { toast } from 'sonner';

const repository = new SupabaseCustomerRepository();

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => repository.getAll(),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => repository.getById(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (customer: Omit<Customer, 'createdAt' | 'updatedAt'>) =>
      repository.create(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar cliente: ${error.message}`);
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      repository.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', variables.id] });
      toast.success('Cliente atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar cliente: ${error.message}`);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover cliente: ${error.message}`);
    },
  });
};

export const useCustomerLicenses = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-licenses', customerId],
    queryFn: () => repository.getLicenses(customerId),
    enabled: !!customerId,
  });
};

export const useAddLicense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (license: Omit<CustomerDriverLicense, 'id' | 'createdAt' | 'updatedAt'>) =>
      repository.addLicense(license),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-licenses', variables.customerId] });
      toast.success('CNH adicionada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar CNH: ${error.message}`);
    },
  });
};

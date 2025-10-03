import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseCustomerRepository } from '@/data/repositories/SupabaseCustomerRepository';
import { Customer } from '@/domain/entities/Customer';

const repository = new SupabaseCustomerRepository();

export function useStoreCustomers() {
  const queryClient = useQueryClient();

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['store-customers'],
    queryFn: () => repository.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (customer: Omit<Customer, 'createdAt' | 'updatedAt'>) => 
      repository.create(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-customers'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) => 
      repository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-customers'] });
      queryClient.invalidateQueries({ queryKey: ['store-customer'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-customers'] });
    },
  });

  return {
    customers: customers || [],
    isLoading,
    error,
    createCustomer: createMutation.mutateAsync,
    updateCustomer: updateMutation.mutateAsync,
    deleteCustomer: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useStoreCustomer(id: string) {
  const queryClient = useQueryClient();

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['store-customer', id],
    queryFn: () => repository.getById(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Customer>) => repository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-customer', id] });
      queryClient.invalidateQueries({ queryKey: ['store-customers'] });
    },
  });

  return {
    customer,
    isLoading,
    error,
    updateCustomer: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

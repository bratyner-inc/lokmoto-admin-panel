import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseMotorcycleRepository } from '@/data/repositories/SupabaseMotorcycleRepository';
import { Motorcycle } from '@/domain/entities/Motorcycle';

const repository = new SupabaseMotorcycleRepository();

export function useMotorcycles() {
  const queryClient = useQueryClient();

  const { data: motorcycles, isLoading, error } = useQuery({
    queryKey: ['motorcycles'],
    queryFn: () => repository.getAll(),
  });

  const { data: categories } = useQuery({
    queryKey: ['vehicle-categories'],
    queryFn: () => repository.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motorcycles'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Motorcycle> }) => 
      repository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motorcycles'] });
      queryClient.invalidateQueries({ queryKey: ['motorcycle'] });
    },
  });

  return {
    motorcycles: motorcycles || [],
    categories: categories || [],
    isLoading,
    error,
    deleteMotorcycle: deleteMutation.mutateAsync,
    updateMotorcycle: updateMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

export function useMotorcycle(id: string) {
  const queryClient = useQueryClient();

  const { data: motorcycle, isLoading, error } = useQuery({
    queryKey: ['motorcycle', id],
    queryFn: () => repository.getById(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Motorcycle>) => repository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motorcycle', id] });
      queryClient.invalidateQueries({ queryKey: ['motorcycles'] });
    },
  });

  return {
    motorcycle,
    isLoading,
    error,
    updateMotorcycle: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

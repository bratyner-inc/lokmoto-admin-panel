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
    },
  });

  return {
    motorcycles: motorcycles || [],
    isLoading,
    error,
    deleteMotorcycle: deleteMutation.mutateAsync,
    updateMotorcycle: updateMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

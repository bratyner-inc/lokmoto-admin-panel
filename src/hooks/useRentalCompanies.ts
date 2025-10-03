import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RentalCompany } from '@/domain/entities/RentalCompany';
import { RentalCompanyMapper } from '@/data/mappers/RentalCompanyMapper';

export const useRentalCompanies = () => {
  return useQuery({
    queryKey: ['rental-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(RentalCompanyMapper.toDomain);
    },
  });
};

export const useRentalCompany = (id: string) => {
  return useQuery({
    queryKey: ['rental-company', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return RentalCompanyMapper.toDomain(data);
    },
    enabled: !!id,
  });
};

export const useCreateRentalCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rentalCompany: Partial<RentalCompany>) => {
      const dbData = RentalCompanyMapper.toDatabase(rentalCompany);
      const { data, error } = await supabase
        .from('rental_companies')
        .insert(dbData as any)
        .select()
        .single();

      if (error) throw error;
      return RentalCompanyMapper.toDomain(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental-companies'] });
    },
  });
};

export const useUpdateRentalCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RentalCompany> }) => {
      const dbData = RentalCompanyMapper.toDatabase(data);
      const { data: updated, error } = await supabase
        .from('rental_companies')
        .update(dbData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return RentalCompanyMapper.toDomain(updated);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rental-companies'] });
      queryClient.invalidateQueries({ queryKey: ['rental-company', variables.id] });
    },
  });
};

export const useDeleteRentalCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rental_companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental-companies'] });
    },
  });
};

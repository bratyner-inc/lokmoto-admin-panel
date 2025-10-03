import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Banner } from '@/domain/entities/Banner';
import { BannerMapper } from '@/data/mappers/BannerMapper';

export const useBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(BannerMapper.toDomain);
    },
  });
};

export const useBanner = (id: string) => {
  return useQuery({
    queryKey: ['banner', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return BannerMapper.toDomain(data);
    },
    enabled: !!id,
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (banner: Partial<Banner>) => {
      const dbData = BannerMapper.toDatabase(banner);
      const { data, error } = await supabase
        .from('banners')
        .insert(dbData as any)
        .select()
        .single();

      if (error) throw error;
      return BannerMapper.toDomain(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Banner> }) => {
      const dbData = BannerMapper.toDatabase(data);
      const { data: updated, error } = await supabase
        .from('banners')
        .update(dbData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return BannerMapper.toDomain(updated);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      queryClient.invalidateQueries({ queryKey: ['banner', variables.id] });
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

export const useToggleBannerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('banners')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return BannerMapper.toDomain(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

// Storage functions
export const uploadBannerImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('banners')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('banners')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const deleteBannerImage = async (imageUrl: string) => {
  // Extract file path from URL
  const urlParts = imageUrl.split('/banners/');
  if (urlParts.length < 2) return;
  
  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from('banners')
    .remove([filePath]);

  if (error) throw error;
};

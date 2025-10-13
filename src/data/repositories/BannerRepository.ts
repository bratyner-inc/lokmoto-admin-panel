import { supabase } from '@/infrastructure/config/supabase';
import { IBannerRepository } from '@/domain/repositories/IBannerRepository';
import { Banner, CreateBannerDTO, UpdateBannerDTO, BannerPosition } from '@/domain/entities/Banner';
import { BannerMapper, BannerDB } from '../mappers/BannerMapper';

export class BannerRepository implements IBannerRepository {
  private readonly tableName = 'banners';
  private readonly bucketName = 'banners';

  /**
   * Get all banners
   */
  async getAll(): Promise<Banner[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch banners: ${error.message}`);
    }

    return BannerMapper.toDomainArray(data as BannerDB[]);
  }

  /**
   * Get active banners only
   */
  async getActiveBanners(): Promise<Banner[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch active banners: ${error.message}`);
    }

    return BannerMapper.toDomainArray(data as BannerDB[]);
  }

  /**
   * Get banners by position
   */
  async getByPosition(position: BannerPosition): Promise<Banner[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('position', position)
      .order('created_at', { ascending: false});

    if (error) {
      throw new Error(`Failed to fetch banners by position: ${error.message}`);
    }

    return BannerMapper.toDomainArray(data as BannerDB[]);
  }

  /**
   * Get a single banner by ID
   */
  async getById(id: string): Promise<Banner | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch banner: ${error.message}`);
    }

    return BannerMapper.toDomain(data as BannerDB);
  }

  /**
   * Upload banner image to storage
   */
  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(this.bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Delete image from storage
   */
  private async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
        // Don't throw - image deletion is not critical
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  /**
   * Create a new banner
   */
  async create(data: CreateBannerDTO): Promise<Banner> {
    // Upload image first
    const imageUrl = await this.uploadImage(data.imageFile);

    try {
      const { data: created, error } = await supabase
        .from(this.tableName)
        .insert({
          title: data.title,
          description: data.description || null,
          image_url: imageUrl,
          position: data.position,
          is_active: data.isActive !== undefined ? data.isActive : true,
          start_date: data.startDate ? data.startDate.toISOString() : null,
          end_date: data.endDate ? data.endDate.toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        // Rollback: delete uploaded image
        await this.deleteImage(imageUrl);
        throw new Error(`Failed to create banner: ${error.message}`);
      }

      return BannerMapper.toDomain(created as BannerDB);
    } catch (error) {
      // Rollback: delete uploaded image
      await this.deleteImage(imageUrl);
      throw error;
    }
  }

  /**
   * Update an existing banner
   */
  async update(id: string, data: UpdateBannerDTO): Promise<Banner> {
    let imageUrl: string | undefined;

    // Upload new image if provided
    if (data.imageFile) {
      imageUrl = await this.uploadImage(data.imageFile);
    }

    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (imageUrl) updateData.image_url = imageUrl;
      if (data.position !== undefined) updateData.position = data.position;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      if (data.startDate !== undefined) {
        updateData.start_date = data.startDate ? data.startDate.toISOString() : null;
      }
      if (data.endDate !== undefined) {
        updateData.end_date = data.endDate ? data.endDate.toISOString() : null;
      }
      if (data.url !== undefined) updateData.url = data.url;

      const { data: updated, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Rollback: delete new image if uploaded
        if (imageUrl) {
          await this.deleteImage(imageUrl);
        }
        throw new Error(`Failed to update banner: ${error.message}`);
      }

      // If new image was uploaded, delete old image
      if (imageUrl && updated) {
        const oldImageUrl = (updated as BannerDB).image_url;
        if (oldImageUrl !== imageUrl) {
          await this.deleteImage(oldImageUrl);
        }
      }

      return BannerMapper.toDomain(updated as BannerDB);
    } catch (error) {
      // Rollback: delete new image if uploaded
      if (imageUrl) {
        await this.deleteImage(imageUrl);
      }
      throw error;
    }
  }

  /**
   * Delete a banner
   */
  async delete(id: string): Promise<void> {
    // Get banner to find image URL
    const banner = await this.getById(id);

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete banner: ${error.message}`);
    }

    // Delete image from storage
    if (banner) {
      await this.deleteImage(banner.imageUrl);
    }
  }

  /**
   * Toggle banner active status
   */
  async toggleActive(id: string): Promise<Banner> {
    const banner = await this.getById(id);
    if (!banner) {
      throw new Error('Banner not found');
    }

    const { data: updated, error } = await supabase
      .from(this.tableName)
      .update({ is_active: !banner.isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle banner status: ${error.message}`);
    }

    return BannerMapper.toDomain(updated as BannerDB);
  }
}



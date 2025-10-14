import { supabase } from '@/infrastructure/config/supabase';

export interface UploadImageResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

export interface DeleteImageResult {
  success: boolean;
  error?: string;
}

export class StorageService {
  private bucketName = 'motorcycles-images';

  /**
   * Uploads an image to Supabase Storage
   * @param file - The file to upload
   * @param userId - The rental company ID (used as folder name)
   * @param motorcycleId - The motorcycle ID (used as subfolder)
   * @returns UploadImageResult with public URL if successful
   */
  async uploadMotorcycleImage(
    file: File,
    userId: string,
    motorcycleId: string
  ): Promise<UploadImageResult> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.',
        };
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'Arquivo muito grande. Tamanho máximo: 5MB.',
        };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExt}`;
      const filePath = `${userId}/${motorcycleId}/${fileName}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: `Erro ao fazer upload: ${error.message}`,
        };
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return {
        success: true,
        publicUrl: publicUrlData.publicUrl,
      };
    } catch (err) {
      console.error('Unexpected upload error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido ao fazer upload',
      };
    }
  }

  /**
   * Deletes an image from Supabase Storage
   * @param imageUrl - The public URL of the image to delete
   * @returns DeleteImageResult
   */
  async deleteMotorcycleImage(imageUrl: string): Promise<DeleteImageResult> {
    try {
      // Extract path from URL
      const path = this.extractPathFromUrl(imageUrl);
      if (!path) {
        return {
          success: false,
          error: 'URL de imagem inválida',
        };
      }

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        console.error('Delete error:', error);
        return {
          success: false,
          error: `Erro ao deletar imagem: ${error.message}`,
        };
      }

      return { success: true };
    } catch (err) {
      console.error('Unexpected delete error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido ao deletar imagem',
      };
    }
  }

  /**
   * Deletes multiple images from Supabase Storage
   * @param imageUrls - Array of public URLs to delete
   * @returns DeleteImageResult
   */
  async deleteMultipleMotorcycleImages(imageUrls: string[]): Promise<DeleteImageResult> {
    try {
      const paths = imageUrls
        .map(url => this.extractPathFromUrl(url))
        .filter((path): path is string => path !== null);

      if (paths.length === 0) {
        return {
          success: false,
          error: 'Nenhuma URL válida encontrada',
        };
      }

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove(paths);

      if (error) {
        console.error('Delete multiple error:', error);
        return {
          success: false,
          error: `Erro ao deletar imagens: ${error.message}`,
        };
      }

      return { success: true };
    } catch (err) {
      console.error('Unexpected delete multiple error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido ao deletar imagens',
      };
    }
  }

  /**
   * Extracts the storage path from a public URL
   * @param url - The public URL
   * @returns The storage path or null if invalid
   */
  private extractPathFromUrl(url: string): string | null {
    try {
      // URL format: https://[project-ref].supabase.co/storage/v1/object/public/motorcycles-images/[path]
      const parts = url.split(`/storage/v1/object/public/${this.bucketName}/`);
      if (parts.length !== 2) return null;
      return parts[1];
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();


import { Banner, CreateBannerDTO, UpdateBannerDTO, BannerPosition } from '../entities/Banner';

export interface IBannerRepository {
  /**
   * Get all banners
   */
  getAll(): Promise<Banner[]>;

  /**
   * Get active banners only
   */
  getActiveBanners(): Promise<Banner[]>;

  /**
   * Get banners by position
   */
  getByPosition(position: BannerPosition): Promise<Banner[]>;

  /**
   * Get a single banner by ID
   */
  getById(id: string): Promise<Banner | null>;

  /**
   * Create a new banner (with image upload)
   */
  create(data: CreateBannerDTO): Promise<Banner>;

  /**
   * Update an existing banner (optionally upload new image)
   */
  update(id: string, data: UpdateBannerDTO): Promise<Banner>;

  /**
   * Delete a banner (and its image from storage)
   */
  delete(id: string): Promise<void>;

  /**
   * Toggle banner active status
   */
  toggleActive(id: string): Promise<Banner>;

  /**
   * Upload banner image to storage
   */
  uploadImage(file: File): Promise<string>; // Returns public URL
}



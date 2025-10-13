// Banner domain entity
export type BannerPosition = 'hero' | 'sidebar' | 'footer';

export interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  position: BannerPosition;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBannerDTO {
  title: string;
  description?: string;
  imageFile: File; // File to upload
  position: BannerPosition;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  url?: string;
}

export interface UpdateBannerDTO {
  title?: string;
  description?: string;
  imageFile?: File; // Optional new image
  position?: BannerPosition;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  url?: string;
}



export type BannerType = 'hero' | 'sidebar_horizontal' | 'sidebar_vertical';

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type: BannerType;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

import { Banner } from '@/domain/entities/Banner';

interface BannerDB {
  id: string;
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type: 'hero' | 'sidebar_horizontal' | 'sidebar_vertical';
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export class BannerMapper {
  static toDomain(raw: BannerDB): Banner {
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      image: raw.image || '',
      url: raw.url,
      type: raw.type,
      isActive: raw.is_active,
      startDate: raw.start_date ? new Date(raw.start_date) : new Date(),
      endDate: raw.end_date ? new Date(raw.end_date) : undefined,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  static toDatabase(domain: Partial<Banner>): Partial<BannerDB> {
    return {
      ...(domain.id && { id: domain.id }),
      ...(domain.title && { title: domain.title }),
      ...(domain.description !== undefined && { description: domain.description }),
      ...(domain.image !== undefined && { image: domain.image }),
      ...(domain.url !== undefined && { url: domain.url }),
      ...(domain.type && { type: domain.type }),
      ...(domain.isActive !== undefined && { is_active: domain.isActive }),
      ...(domain.startDate && { start_date: domain.startDate.toISOString() }),
      ...(domain.endDate && { end_date: domain.endDate.toISOString() }),
    };
  }
}

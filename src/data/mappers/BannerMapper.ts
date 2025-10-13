import { Banner, BannerPosition } from '@/domain/entities/Banner';

// Database representation
export interface BannerDB {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  position: BannerPosition;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

export class BannerMapper {
  /**
   * Map from database representation to domain entity
   */
  static toDomain(db: BannerDB): Banner {
    return {
      id: db.id,
      title: db.title,
      description: db.description || undefined,
      imageUrl: db.image_url,
      position: db.position,
      isActive: db.is_active,
      startDate: db.start_date ? new Date(db.start_date) : undefined,
      endDate: db.end_date ? new Date(db.end_date) : undefined,
      url: db.url || undefined,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }

  /**
   * Map an array of database records to domain entities
   */
  static toDomainArray(dbArray: BannerDB[]): Banner[] {
    return dbArray.map(db => this.toDomain(db));
  }
}



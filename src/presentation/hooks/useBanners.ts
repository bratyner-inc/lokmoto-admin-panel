import { useState, useEffect } from 'react';
import { Banner, CreateBannerDTO, UpdateBannerDTO, BannerPosition } from '@/domain/entities/Banner';
import { BannerRepository } from '@/data/repositories/BannerRepository';

const bannerRepository = new BannerRepository();

/**
 * Hook to fetch and manage banners
 */
export function useBanners(activeOnly: boolean = false) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = activeOnly
        ? await bannerRepository.getActiveBanners()
        : await bannerRepository.getAll();
      setBanners(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [activeOnly]);

  const createBanner = async (data: CreateBannerDTO) => {
    setError(null);
    try {
      const newBanner = await bannerRepository.create(data);
      setBanners(prev => [newBanner, ...prev]);
      return newBanner;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateBanner = async (id: string, data: UpdateBannerDTO) => {
    setError(null);
    try {
      const updated = await bannerRepository.update(id, data);
      setBanners(prev => prev.map(b => b.id === id ? updated : b));
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteBanner = async (id: string) => {
    setError(null);
    try {
      await bannerRepository.delete(id);
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const toggleActive = async (id: string) => {
    setError(null);
    try {
      const updated = await bannerRepository.toggleActive(id);
      setBanners(prev => prev.map(b => b.id === id ? updated : b));
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    banners,
    loading,
    error,
    refresh: fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleActive,
  };
}

/**
 * Hook to fetch a single banner
 */
export function useBanner(id: string) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await bannerRepository.getById(id);
        setBanner(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [id]);

  return { banner, loading, error };
}



import { useState, useEffect } from 'react';
import { VehicleCategory } from '@/domain/entities/VehicleCategory';
import { VehicleCategoryRepository } from '@/data/repositories/VehicleCategoryRepository';
import { toast } from 'sonner';

const categoryRepository = new VehicleCategoryRepository();

export function useVehicleCategories() {
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await categoryRepository.getAll();
      setCategories(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}


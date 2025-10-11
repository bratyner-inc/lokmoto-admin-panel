import { useState, useEffect } from 'react';
import { Motorcycle, CreateMotorcycleDTO, UpdateMotorcycleDTO } from '@/domain/entities/Motorcycle';
import { MotorcycleRepository } from '@/data/repositories/MotorcycleRepository';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const motorcycleRepository = new MotorcycleRepository();

export function useMotorcycles() {
  const { user } = useAuthStore();
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMotorcycles = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await motorcycleRepository.getAll(user.id);
      setMotorcycles(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch motorcycles';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotorcycles();
  }, [user?.id]);

  const createMotorcycle = async (dto: Omit<CreateMotorcycleDTO, 'rentalCompanyId'>) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const motorcycle = await motorcycleRepository.create({
        ...dto,
        rentalCompanyId: user.id,
      });
      setMotorcycles(prev => [motorcycle, ...prev]);
      toast.success('Motocicleta criada com sucesso!');
      return motorcycle;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create motorcycle';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMotorcycle = async (id: string, dto: UpdateMotorcycleDTO) => {
    setLoading(true);
    try {
      const updated = await motorcycleRepository.update(id, dto);
      setMotorcycles(prev => prev.map(m => m.id === id ? updated : m));
      toast.success('Motocicleta atualizada com sucesso!');
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update motorcycle';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMotorcycle = async (id: string) => {
    setLoading(true);
    try {
      await motorcycleRepository.delete(id);
      setMotorcycles(prev => prev.filter(m => m.id !== id));
      toast.success('Motocicleta removida com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete motorcycle';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchMotorcycles = async (query: string) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await motorcycleRepository.search(query, user.id);
      setMotorcycles(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search motorcycles';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    motorcycles,
    loading,
    error,
    fetchMotorcycles,
    createMotorcycle,
    updateMotorcycle,
    deleteMotorcycle,
    searchMotorcycles,
  };
}

export function useMotorcycle(id: string) {
  const [motorcycle, setMotorcycle] = useState<Motorcycle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMotorcycle = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await motorcycleRepository.getById(id);
      setMotorcycle(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch motorcycle';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotorcycle();
  }, [id]);

  return {
    motorcycle,
    loading,
    error,
    refetch: fetchMotorcycle,
  };
}


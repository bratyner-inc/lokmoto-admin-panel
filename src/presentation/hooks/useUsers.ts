import { useState, useEffect } from 'react';
import { User, CreateUserDTO, UpdateUserDTO } from '@/domain/entities/User';
import { UserRepository } from '@/data/repositories/UserRepository';

const userRepository = new UserRepository();

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userRepository.getAll();
      setUsers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (data: CreateUserDTO) => {
    setError(null);
    try {
      const newUser = await userRepository.create(data);
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateUser = async (id: string, data: UpdateUserDTO) => {
    setError(null);
    try {
      const updated = await userRepository.update(id, data);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    setError(null);
    try {
      await userRepository.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const toggleActive = async (id: string) => {
    setError(null);
    try {
      const updated = await userRepository.toggleActive(id);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    refresh: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleActive,
  };
}

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await userRepository.getById(id);
        setUser(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return { user, loading, error };
}



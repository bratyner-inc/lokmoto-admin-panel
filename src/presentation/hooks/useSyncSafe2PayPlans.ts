import { useState } from 'react';
import { supabase } from '@/infrastructure/config/supabase';

export interface SyncResult {
  inserted: number;
  updated: number;
  deprecated: number;
}

export function useSyncSafe2PayPlans() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const syncPlans = async (): Promise<SyncResult> => {
    setSyncing(true);
    setError(null);
    
    try {
      const { data, error: funcError } = await supabase.functions.invoke('sync-safe2pay-plans', {
        method: 'POST',
      });

      if (funcError) {
        throw new Error(funcError.message || 'Failed to invoke sync function');
      }

      if (!data.success) {
        throw new Error(data.error || 'Sync failed');
      }

      return data.data as SyncResult;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncPlans,
    syncing,
    error,
  };
}



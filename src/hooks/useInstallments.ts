import { useState, useEffect, useCallback } from 'react';
import trackingService from '@/lib/services/trackingService';
import { InstallmentTrackingItem } from '@/types';
import { useAuth } from '@/context/AuthContext';

export type InstallmentFilter = 'due-today' | 'overdue' | 'upcoming';

export function useInstallments(filter: InstallmentFilter) {
  const { user } = useAuth();
  const [installments, setInstallments] = useState<InstallmentTrackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstallments = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      let data: InstallmentTrackingItem[] = [];
      if (filter === 'due-today') {
        data = await trackingService.getDueTodayInstallments(user.uid);
      } else if (filter === 'overdue') {
        data = await trackingService.getOverdueInstallments(user.uid);
      } else if (filter === 'upcoming') {
        const range = trackingService.getNextDaysRange(7);
        data = await trackingService.getUpcomingInstallments(user.uid, range);
      }

      setInstallments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch installments');
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    fetchInstallments();
  }, [fetchInstallments]);

  return { installments, loading, error, refresh: fetchInstallments };
}

import { useState, useEffect, useCallback } from 'react';
import borrowerService from '@/lib/services/borrowerService';
import { BorrowerSummary } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function useBorrowers() {
  const { user } = useAuth();
  const [borrowers, setBorrowers] = useState<BorrowerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBorrowers = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await borrowerService.getBorrowersByUserWithSummary(user.uid);
      setBorrowers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch borrowers');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBorrowers();
  }, [fetchBorrowers]);

  return { borrowers, loading, error, refresh: fetchBorrowers };
}

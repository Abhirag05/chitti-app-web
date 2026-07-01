import { useState, useEffect, useCallback } from 'react';
import trackingService from '../lib/services/trackingService';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';

export function useDashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await trackingService.getDashboardStats(user.uid);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}

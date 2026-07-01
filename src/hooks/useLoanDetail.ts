import { useState, useEffect, useCallback } from 'react';
import loanService from '../lib/services/loanService';
import { LoanDetailView } from '../types';
import { useAuth } from '../context/AuthContext';

export function useLoanDetail(loanId: string) {
  const { user } = useAuth();
  const [detail, setDetail] = useState<LoanDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!user || !loanId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await loanService.getLoanDetail(user.uid, loanId);
      setDetail(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch loan details');
    } finally {
      setLoading(false);
    }
  }, [user, loanId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const markInstallmentPaid = async (installmentId: string) => {
    if (!user) return;
    try {
      const refreshed = await loanService.markInstallmentAsPaid(user.uid, loanId, installmentId);
      if (refreshed) {
        setDetail(refreshed);
      }
    } catch (err: any) {
      console.error('Failed to mark paid:', err);
      throw err;
    }
  };

  return { detail, loading, error, refresh: fetchDetail, markInstallmentPaid };
}

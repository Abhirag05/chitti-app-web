'use client';

import React, { useState, useEffect } from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import financialsService from '@/lib/services/financialsService';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const { stats, loading, error, refresh } = useDashboardStats();

  const [balanceInput, setBalanceInput] = useState('');
  const [accumulatedInput, setAccumulatedInput] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<'balance' | 'accumulated' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (stats) {
      setBalanceInput(stats.currentBalance.toString());
      setAccumulatedInput(stats.totalAccumulatedAmount.toString());
    }
  }, [stats]);

  const handleOverride = (target: 'balance' | 'accumulated') => {
    setConfirmTarget(target);
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!user || !confirmTarget) return;
    try {
      setIsUpdating(true);
      const value = confirmTarget === 'balance' ? Number(balanceInput) : Number(accumulatedInput);
      const field = confirmTarget === 'balance' ? 'currentBalance' : 'totalAccumulatedAmount';
      await financialsService.setManualValue(user.uid, field, value);
      await refresh();
      setIsConfirmOpen(false);
    } catch (err) {
      console.error('Failed to override', err);
      alert('Failed to update value');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-rose-400 p-6">Error: {error}</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">System Settings</h2>
        <p className="mt-1 text-sm text-gray-400">Advanced controls for your financial system.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium text-white">Manual Balance Overrides</h3>
        <p className="mt-1 text-sm text-gray-400 mb-6">
          Only use this if you are injecting new capital or correcting a discrepancy.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Current Balance (Available to lend)</label>
            <div className="mt-2 flex gap-4">
              <input
                type="number"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                className="block w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => handleOverride('balance')}
                disabled={Number(balanceInput) === stats?.currentBalance}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50 whitespace-nowrap"
              >
                Update
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Total Accumulated Amount (Capital + Profit)</label>
            <div className="mt-2 flex gap-4">
              <input
                type="number"
                value={accumulatedInput}
                onChange={(e) => setAccumulatedInput(e.target.value)}
                className="block w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => handleOverride('accumulated')}
                disabled={Number(accumulatedInput) === stats?.totalAccumulatedAmount}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50 whitespace-nowrap"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Manual Override"
        description="Are you sure you want to manually override this system balance? This will alter your dashboard metrics immediately."
        confirmText="Yes, override value"
        isDestructive={true}
        isLoading={isUpdating}
      />
    </div>
  );
}

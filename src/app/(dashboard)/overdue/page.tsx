'use client';

import React, { useState } from 'react';
import { useInstallments } from '@/hooks/useInstallments';
import { InstallmentItem } from '@/components/installments/InstallmentItem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import loanService from '@/lib/services/loanService';
import { useAuth } from '@/context/AuthContext';

export default function OverduePage() {
  const { user } = useAuth();
  const { installments, loading, error, refresh } = useInstallments('overdue');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleMarkPaid = async (installmentId: string, loanId: string) => {
    if (!user) return;
    try {
      setProcessingId(installmentId);
      await loanService.markInstallmentAsPaid(user.uid, loanId, installmentId);
      await refresh();
    } catch (err) {
      console.error('Failed to mark paid:', err);
      alert('Failed to mark installment as paid');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-rose-400 p-6">Error: {error}</div>;

  const totalAmount = installments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Overdue Installments</h2>
          <p className="mt-1 text-sm text-gray-400">Installments that missed their due date.</p>
        </div>
        {installments.length > 0 && (
          <div className="mt-4 sm:ml-16 sm:mt-0">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-right">
              <p className="text-xs font-medium text-rose-400/80 uppercase tracking-wider">Total Arrears</p>
              <p className="text-2xl font-bold text-rose-400">₹{totalAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}
      </div>

      {installments.length === 0 ? (
        <EmptyState title="No overdue installments!" description="Great job! Every borrower is paying on time." />
      ) : (
        <div className="flex flex-col gap-4">
          {installments.map((installment) => (
            <InstallmentItem
              key={installment.id}
              installment={installment}
              onMarkPaid={() => handleMarkPaid(installment.id, installment.loanId)}
              isProcessing={processingId === installment.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

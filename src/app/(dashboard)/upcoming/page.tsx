'use client';

import React from 'react';
import { useInstallments } from '../../hooks/useInstallments';
import { InstallmentItem } from '../../components/installments/InstallmentItem';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';

export default function UpcomingPage() {
  const { installments, loading, error } = useInstallments('upcoming');

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-rose-400 p-6">Error: {error}</div>;

  const totalAmount = installments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Upcoming Installments
          </h2>
          <p className="mt-1 text-sm text-gray-400">Installments due in the next 7 days.</p>
        </div>
        {installments.length > 0 && (
          <div className="mt-4 sm:ml-16 sm:mt-0">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right backdrop-blur-md">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Expected Next 7 Days</p>
              <p className="text-2xl font-bold text-white">₹{totalAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}
      </div>

      {installments.length === 0 ? (
        <EmptyState 
          title="Nothing upcoming" 
          description="There are no installments due in the next 7 days." 
        />
      ) : (
        <div className="flex flex-col gap-4">
          {installments.map((installment) => (
            <InstallmentItem 
              key={installment.id} 
              installment={installment} 
              // We do not provide onMarkPaid here since they are in the future
            />
          ))}
        </div>
      )}
    </div>
  );
}

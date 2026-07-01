import React from 'react';
import { InstallmentTrackingItem } from '../../types';
import { StatusBadge } from '../ui/Badge';
import Link from 'next/link';

interface InstallmentItemProps {
  installment: InstallmentTrackingItem;
  onMarkPaid?: (installmentId: string) => void;
  isProcessing?: boolean;
}

export function InstallmentItem({ installment, onMarkPaid, isProcessing }: InstallmentItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition hover:border-emerald-500/30 hover:bg-white/10 group gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="text-lg font-semibold text-white">{installment.borrowerName}</h4>
          <StatusBadge status={installment.effectiveStatus} />
          {installment.effectiveStatus === 'overdue' && (
            <span className="text-xs font-medium text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">
              {installment.daysOverdue} days overdue
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="font-mono">{installment.loanReference}</span>
          <span>•</span>
          <span>Week {installment.weekNumber}</span>
          <span>•</span>
          <span>Due: {new Date(installment.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3 border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0">
        <div className="text-right flex-1">
          <p className="text-xs text-gray-500 mb-0.5">Amount Due</p>
          <p className="text-xl font-bold text-emerald-400">₹{installment.amount.toLocaleString('en-IN')}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href={`/borrowers/${installment.borrowerId}`}
            className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm font-medium text-white transition hover:bg-white/5"
          >
            View
          </Link>
          {onMarkPaid && installment.effectiveStatus !== 'paid' && (
            <button
              onClick={() => onMarkPaid(installment.id)}
              disabled={isProcessing}
              className="flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50 min-w-[90px]"
            >
              {isProcessing ? 'Saving...' : 'Mark Paid'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

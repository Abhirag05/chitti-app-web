'use client';

import React from 'react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { StatCard } from '../../components/ui/StatCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-rose-400 p-6">Error: {error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Overview
        </h2>
        <p className="mt-1 text-sm text-gray-400">Your financial snapshot and active metrics.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Current Balance" 
          value={`₹${stats.currentBalance.toLocaleString('en-IN')}`} 
          subtitle="Available to lend"
        />
        <StatCard 
          title="Total Outstanding" 
          value={`₹${stats.totalOutstandingAmount.toLocaleString('en-IN')}`} 
          subtitle="To be collected"
        />
        <StatCard 
          title="Total Accumulated" 
          value={`₹${stats.totalAccumulatedAmount.toLocaleString('en-IN')}`} 
          subtitle="Capital + Profit"
        />
        <StatCard 
          title="Active Loans" 
          value={stats.totalActiveLoans} 
        />
        <StatCard 
          title="Due Today" 
          value={stats.dueTodayCount} 
          trend={stats.dueTodayCount > 0 ? { value: 'Requires attention', isPositive: false } : undefined}
        />
        <StatCard 
          title="Overdue Installments" 
          value={stats.overdueCount}
          trend={stats.overdueCount > 0 ? { value: 'Requires action', isPositive: false } : undefined}
        />
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-semibold leading-6 text-white mb-6">Recent Payments</h3>
        
        {stats.recentPayments.length === 0 ? (
          <EmptyState 
            title="No recent payments" 
            description="When borrowers pay their installments, they will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr className="bg-white/5">
                  <th scope="col" className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-gray-300 sm:pl-6">Borrower</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-300">Loan Ref</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-300">Date Paid</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {stats.recentPayments.map((payment) => (
                  <tr key={payment.id} className="transition-colors hover:bg-white/5">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                      {payment.borrowerName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-emerald-400 font-bold">
                      ₹{payment.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400 font-mono">
                      {payment.loanReference}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

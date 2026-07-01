'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import borrowerService from '@/lib/services/borrowerService';
import loanService from '@/lib/services/loanService';
import { Borrower, LoanWithProgress } from '@/types';

export default function BorrowerDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();

  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [loans, setLoans] = useState<LoanWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [bData, lData] = await Promise.all([
          borrowerService.getBorrowerById(user.uid, id),
          loanService.getLoansByBorrower(user.uid, id),
        ]);
        setBorrower(bData);
        setLoans(lData);
      } catch (err) {
        console.error('Error fetching borrower detail', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, user]);

  const handleDelete = async () => {
    if (!user || !borrower) return;
    try {
      setIsDeleting(true);
      await borrowerService.deleteBorrower(user.uid, borrower.id);
      router.push('/borrowers');
    } catch (err) {
      console.error('Failed to delete', err);
      alert('Failed to delete borrower');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!borrower) return <div className="text-gray-400 p-6">Borrower not found.</div>;

  const totalOutstanding = loans.reduce((acc, loan) => acc + loan.outstandingAmount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 text-sm text-emerald-500 hover:text-emerald-400 transition"
          >
            ← Back to Borrowers
          </button>
          <h2 className="text-3xl font-bold tracking-tight text-white">{borrower.fullName}</h2>
          <p className="text-gray-400 mt-1">{borrower.phoneNumber} • {borrower.address}</p>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-lg bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-500/20 self-start sm:self-auto"
        >
          Delete Borrower
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-medium text-gray-400">Total Outstanding Balance</p>
          <p className="mt-2 text-4xl font-bold text-emerald-400">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-medium text-gray-400">Active Loans</p>
          <p className="mt-2 text-4xl font-bold text-white">
            {loans.filter(l => l.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Loans */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Loans</h3>
          <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600">
            Create Loan
          </button>
        </div>

        {loans.length === 0 ? (
          <EmptyState
            title="No loans found"
            description="This borrower doesn't have any active or completed loans yet."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loans.map(loan => (
              <div key={loan.id} className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-500/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-gray-500">LN-{loan.id.slice(-6).toUpperCase()}</span>
                  <StatusBadge status={loan.status} />
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-400">Principal</p>
                  <p className="text-lg font-semibold text-white">₹{loan.principalAmount.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-sm font-medium text-amber-400">{loan.pendingWeeks} weeks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Outstanding</p>
                    <p className="text-sm font-medium text-emerald-400">₹{loan.outstandingAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Borrower"
        description="This will permanently delete all their loans and installment history. This action cannot be undone."
        confirmText="Delete permanently"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
}

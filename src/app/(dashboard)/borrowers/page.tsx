'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBorrowers } from '@/hooks/useBorrowers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { BorrowerForm } from '@/components/borrowers/BorrowerForm';
import borrowerService from '@/lib/services/borrowerService';
import { useAuth } from '@/context/AuthContext';
import { BorrowerCreateInput } from '@/types';

export default function BorrowersPage() {
  const { user } = useAuth();
  const { borrowers, loading, error, refresh } = useBorrowers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (data: BorrowerCreateInput) => {
    if (!user) return;
    try {
      setIsSubmitting(true);
      await borrowerService.createBorrower(user.uid, data);
      await refresh();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create borrower:', err);
      alert('Failed to create borrower');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-rose-400 p-6">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Borrowers</h2>
          <p className="mt-1 text-sm text-gray-400">Manage clients and view their active loans.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            + Add Borrower
          </button>
        </div>
      </div>

      {borrowers.length === 0 ? (
        <EmptyState
          title="No borrowers found"
          description="Get started by adding your first borrower to the system."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {borrowers.map((borrower) => (
            <Link
              key={borrower.id}
              href={`/borrowers/${borrower.id}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white truncate">{borrower.fullName}</h3>
                {borrower.totalActiveLoansCount > 0 && (
                  <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                    {borrower.totalActiveLoansCount} Active
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-400">{borrower.phoneNumber}</p>
              <div className="mt-6 flex flex-col gap-1 border-t border-white/10 pt-4">
                <span className="text-xs text-gray-500">Outstanding Balance</span>
                <span className="text-xl font-bold text-white">
                  ₹{borrower.totalOutstandingAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Add New Borrower"
      >
        <BorrowerForm
          onSubmit={handleCreate}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}

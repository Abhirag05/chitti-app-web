import React, { useState } from 'react';
import { BorrowerCreateInput } from '../../types';

interface BorrowerFormProps {
  initialData?: BorrowerCreateInput;
  onSubmit: (data: BorrowerCreateInput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function BorrowerForm({ initialData, onSubmit, onCancel, isLoading }: BorrowerFormProps) {
  const [formData, setFormData] = useState<BorrowerCreateInput>({
    fullName: initialData?.fullName || '',
    phoneNumber: initialData?.phoneNumber || '',
    address: initialData?.address || '',
    reference: initialData?.reference || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="mt-1 block w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          required
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          className="mt-1 block w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="9876543210"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-300">
          Address
        </label>
        <textarea
          id="address"
          required
          rows={3}
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="mt-1 block w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
          placeholder="123 Main St..."
        />
      </div>

      <div>
        <label htmlFor="reference" className="block text-sm font-medium text-gray-300">
          Reference (Optional)
        </label>
        <input
          type="text"
          id="reference"
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          className="mt-1 block w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Referred by..."
        />
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Borrower'}
        </button>
      </div>
    </form>
  );
}

import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      {icon ? (
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-gray-400">
          {icon}
        </div>
      ) : (
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-gray-400">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-400">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

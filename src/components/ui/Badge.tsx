import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  default: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md transition-colors ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Helper to map Installment or Loan status to Badge variant
export function StatusBadge({ status }: { status: string }) {
  let variant: BadgeVariant = 'default';
  
  switch (status.toLowerCase()) {
    case 'active':
    case 'paid':
    case 'completed':
      variant = 'success';
      break;
    case 'pending':
      variant = 'warning';
      break;
    case 'overdue':
      variant = 'error';
      break;
  }
  
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}

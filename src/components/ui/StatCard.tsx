import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</h3>
          
          {subtitle && !trend && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}

          {trend && (
            <p className="mt-2 flex items-center text-sm">
              <span className={`font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              {subtitle && <span className="ml-2 text-gray-500">{subtitle}</span>}
            </p>
          )}
        </div>
        
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-gray-300 backdrop-blur-md">
            {icon}
          </div>
        )}
      </div>
      
      {/* Decorative gradient blur */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
    </div>
  );
}

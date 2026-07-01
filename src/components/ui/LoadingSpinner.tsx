import React from 'react';

export function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
      <p className="mt-4 text-sm font-medium text-emerald-500/80 animate-pulse">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center py-12">
      {spinner}
    </div>
  );
}

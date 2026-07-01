'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, logOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/40 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-1" />
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <div className="flex items-center gap-x-4">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-semibold leading-6 text-gray-200">
              {user?.email || 'Admin'}
            </span>
            <span className="text-xs text-emerald-500">Authenticated</span>
          </div>
          
          <div className="h-6 w-px bg-white/10" aria-hidden="true" />
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-400 transition duration-300 hover:bg-rose-500/20"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

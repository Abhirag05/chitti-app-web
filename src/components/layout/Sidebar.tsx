'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Borrowers', href: '/borrowers' },
  { name: 'Due Today', href: '/due-today' },
  { name: 'Overdue', href: '/overdue' },
  { name: 'Upcoming', href: '/upcoming' },
  { name: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
          Chitti App
        </h1>
      </div>
      <div className="flex flex-1 flex-col gap-y-7 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            {navigation.map((item) => {
              // Exact match for dashboard, prefix match for others (e.g. /borrowers/123)
              const isActive = item.href === '/' 
                ? pathname === '/'
                : pathname?.startsWith(item.href);
                
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-300 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="p-4">
        <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/0 p-4 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
           <p className="text-xs text-gray-500 font-medium">System Secure & Encrypted</p>
           <p className="mt-1 text-xs text-gray-400">Production Ready</p>
        </div>
      </div>
    </div>
  );
}

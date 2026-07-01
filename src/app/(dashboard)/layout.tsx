import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

/**
 * Dashboard Layout Shell
 * Wraps all protected pages with the Sidebar + Navbar chrome.
 * Uses a simple flex row so the sidebar never overlaps the content.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#080c14] text-white">
      {/* Sidebar — fixed width, full height */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-white/10 bg-[#0d111c]">
        <Sidebar />
      </aside>

      {/* Right column: Navbar on top, scrollable content below */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          style={{
            background: 'radial-gradient(ellipse at 80% 0%, rgba(16,185,129,0.07) 0%, transparent 60%), #080c14',
          }}
        >
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

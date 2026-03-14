'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { AlumniProvider } from '@/lib/alumniStore';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return <main className="min-h-screen relative z-10 w-full">{children}</main>;
  }

  return (
    <AlumniProvider>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile header bar dengan hamburger button */}
      <div className="fixed top-0 left-0 right-0 z-30 flex lg:hidden items-center gap-3 px-4 py-3"
        style={{
          background: 'rgba(6, 10, 20, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(34, 211, 238, 0.08)',
        }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#22d3ee]/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="lp-h2 font-bold text-base tracking-tight text-white">
          Alumni<span className="text-[#22d3ee]">Track</span>
        </span>
      </div>

      {/* Main content: margin-left di desktop, padding-top di mobile untuk header */}
      <main className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-8 px-4 sm:px-6 lg:px-10 relative z-10">
        {children}
      </main>
    </AlumniProvider>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CheckSquare, Search, Settings, FileBarChart2, X, LogOut, School } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { signOut } from '@/lib/authState';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState({
    email: '',
    username: '',
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();

    async function loadProfile() {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;

      if (!user) {
        setProfile({ email: '', username: '' });
        return;
      }

      const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
      setProfile({
        email: user.email || '',
        username: metadataName || user.email || 'Pengguna',
      });
    }

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    await signOut();
    onClose();
    router.replace('/authentication');
  }

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Master Alumni', href: '/alumni', icon: Users },
    { name: 'Hasil Pelacakan', href: '/hasil', icon: Search },
    { name: 'Verifikasi Manual', href: '/verifikasi', icon: CheckSquare },
    { name: 'Laporan', href: '/laporan', icon: FileBarChart2 },
    { name: 'PDDIKTI', href: '/pddikti', icon:  School},
  ];

  return (
    <>
      {/* Backdrop overlay untuk mobile/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "w-64 h-screen fixed left-0 top-0 flex flex-col pt-6 pb-4 z-50 transition-transform duration-300 ease-out",
          // Mobile/tablet: hidden by default (-translate-x-full), open when isOpen is true
          !isOpen && "-translate-x-full lg:translate-x-0",
          isOpen && "translate-x-0"
        )}
        style={{
          background: 'rgba(6, 10, 20, 0.95)',
          borderRight: '1px solid rgba(34, 211, 238, 0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header: Logo + Close button (mobile only) */}
        <div className="px-6 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center pulse-glow"
              style={{ background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.8) 0%, rgba(6, 182, 212, 1) 100%)' }}
            >
              <Search className="w-4 h-4 text-[#060a14]" />
            </div>
            <span className="lp-h2 font-bold text-lg tracking-tight text-white">
              Alumni<span className="text-[#22d3ee]">Track</span>
            </span>
          </div>
          {/* Close button hanya muncul di mobile/tablet */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#475569] hover:text-white hover:bg-[#22d3ee]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 flex flex-col gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "text-white"
                    : "text-[#94a3b8] hover:text-white hover:bg-[#22d3ee]/5"
                )}
                style={isActive ? {
                  background: 'rgba(34, 211, 238, 0.05)',
                  border: '1px solid rgba(34, 211, 238, 0.12)',
                } : {}}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 rounded-r-full bg-[#22d3ee]" />
                )}
                <Icon className={cn(
                  "w-4 h-4 transition-all duration-200 group-hover:scale-110",
                  isActive ? "text-[#22d3ee]" : "text-[#475569] group-hover:text-[#22d3ee]/70"
                )} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-6 my-3 h-px" style={{ background: 'rgba(34, 211, 238, 0.08)' }} />

        {/* Settings */}
        <div className="px-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#475569] hover:text-white hover:bg-[#22d3ee]/5 transition-all duration-200">
            <Settings className="w-4 h-4" />
            Pengaturan
          </button>
          <div className="mt-2 rounded-xl border border-[rgba(34,211,238,0.12)] bg-[rgba(34,211,238,0.04)] p-3">
            <div className="lp-mono text-[10px] uppercase tracking-widest text-[#475569] mb-1">Profil</div>
            <div className="text-sm font-semibold text-white truncate">{profile.username || 'Pengguna'}</div>
            <div className="text-xs text-[#94a3b8] truncate">{profile.email || 'Tidak ada email sesi'}</div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 hover:text-red-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogOut className="w-3.5 h-3.5" />
              {isLoggingOut ? 'Keluar...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

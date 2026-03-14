'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAlumni } from '@/lib/alumniStore';
import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export default function Dashboard() {
  const { alumniList, jalankanPelacakan, isTracking, laporanList, errorMsg } = useAlumni();
  const [lastResult, setLastResult] = useState(null);
  const [localError, setLocalError] = useState(null);

  const total = alumniList.length;
  const sedangDilacak = alumniList.filter(a => a.status_lacak === 'Belum Dilacak').length;
  const perluVerifikasi = alumniList.filter(a => a.status_lacak === 'Perlu Verifikasi Manual').length;
  const selesai = alumniList.filter(a => a.status_lacak === 'Teridentifikasi dari sumber publik').length;
  const pctSelesai = total > 0 ? Math.round((selesai / total) * 100) : 0;

  async function handleCekSekarang() {
    setLocalError(null);
    try {
      const hasil = await jalankanPelacakan(null);
      setLastResult(hasil);
      const gagal = hasil.filter(r => r.error);
      if (gagal.length > 0) {
        setLocalError(`${gagal.length} alumni gagal dilacak. Cek halaman Laporan untuk detail.`);
      }
    } catch (err) {
      setLocalError('Terjadi kesalahan saat menjalankan pelacakan. Silakan coba lagi.');
      console.error('Error handleCekSekarang:', err);
    }
  }

  const displayError = localError || errorMsg;

  return (
    <div className="max-w-5xl mx-auto w-full pb-16">

      {/* Hero-style header */}
      <ScrollReveal>
        <div className="pt-2 pb-16">
          <div className="lp-mono text-[11px] text-[#475569] tracking-widest uppercase mb-6">Dashboard / Overview</div>
          <h1 className="lp-h1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.05] mb-6">
            <span className="text-[#22d3ee]">{total}</span> alumni terdaftar,{' '}
            <span className="text-[#34d399]">{selesai}</span> telah dilacak.
          </h1>
          <p className="lp-body text-lg max-w-xl">
            {sedangDilacak > 0
              ? `Masih ada ${sedangDilacak} alumni yang belum dilacak dan ${perluVerifikasi} menunggu verifikasi manual.`
              : 'Semua alumni sudah melewati tahap pelacakan awal.'}
          </p>
        </div>
      </ScrollReveal>

      {displayError && (
        <div className="mb-8 flex items-center gap-3 p-4 bg-red-500/8 border-l-2 border-red-500 text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p>{displayError}</p>
        </div>
      )}

      {/* Progress section - horizontal inline, bukan card */}
      <ScrollReveal delay={100}>
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="lp-mono text-[11px] text-[#22d3ee] tracking-widest uppercase">Progress pelacakan</div>
            <div className="flex-1 h-px bg-[rgba(34,211,238,0.08)]" />
            <div className="lp-mono text-sm text-white font-bold">{pctSelesai}%</div>
          </div>

          {/* Progress bar - full width */}
          <div className="w-full h-2 rounded-full bg-[rgba(34,211,238,0.04)] overflow-hidden mb-6">
            <div className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${pctSelesai}%`,
                background: 'linear-gradient(90deg, #22d3ee, #34d399)',
              }}
            />
          </div>

          {/* Inline stat flow */}
          <div className="flex flex-wrap gap-x-8 sm:gap-x-12 gap-y-4 lp-mono text-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#34d399]">{selesai}</span>
              <span className="text-[#475569] text-xs uppercase tracking-wider">teridentifikasi</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#fbbf24]">{perluVerifikasi}</span>
              <span className="text-[#475569] text-xs uppercase tracking-wider">perlu verifikasi</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#94a3b8]">{sedangDilacak}</span>
              <span className="text-[#475569] text-xs uppercase tracking-wider">belum dilacak</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Action strip - bukan card, tapi inline section */}
      {sedangDilacak > 0 && (
        <ScrollReveal delay={150}>
          <div className="mb-16 py-8 border-y border-dashed border-[rgba(34,211,238,0.12)] flex flex-col gap-6">
            <div>
              <h2 className="lp-h3 text-xl sm:text-2xl text-white mb-2">Jalankan pelacakan</h2>
              <p className="text-sm text-[#94a3b8]">
                Scan {sedangDilacak} alumni yang belum dilacak melalui LinkedIn, Google Scholar, dan sumber publik lainnya.
              </p>
            </div>
            <button
              onClick={handleCekSekarang}
              disabled={isTracking}
              className="shrink-0 w-full sm:w-auto py-3.5 px-8 rounded-xl lp-mono text-sm font-bold transition-all duration-300 disabled:opacity-30 flex items-center justify-center gap-2"
              style={{
                background: isTracking ? 'rgba(34, 211, 238, 0.08)' : '#22d3ee',
                color: isTracking ? '#22d3ee' : '#060a14',
                boxShadow: !isTracking ? '0 4px 24px rgba(34, 211, 238, 0.2)' : 'none',
              }}
            >
              {isTracking ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</>
              ) : <>Mulai Scan <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </ScrollReveal>
      )}

      {lastResult && !localError && (
        <div className="mb-10 lp-mono text-xs text-[#34d399] border-l-2 border-[#34d399] pl-4 py-1">
          Scan selesai — {lastResult.filter(r => r.sukses).length} dari {lastResult.length} alumni berhasil dilacak.
        </div>
      )}

      {/* Riwayat - table-like tanpa wrapper card */}
      <ScrollReveal delay={200}>
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="lp-mono text-[11px] text-[#22d3ee] tracking-widest uppercase">Riwayat pelacakan</div>
              <div className="flex-1 h-px bg-[rgba(34,211,238,0.08)] min-w-[40px]" />
            </div>
            {laporanList.length > 0 && (
              <Link href="/laporan" className="lp-mono text-[11px] text-[#475569] hover:text-[#22d3ee] transition-colors flex items-center gap-1">
                Lihat semua <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {laporanList.length === 0 ? (
            <div className="py-12 text-center">
              <div className="lp-mono text-7xl text-[rgba(34,211,238,0.06)] font-black mb-3 select-none">—</div>
              <p className="text-sm text-[#475569]">Belum ada riwayat. Jalankan pelacakan untuk memulai.</p>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(34,211,238,0.06)]">
              {laporanList.slice(0, 8).map((lap, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2 sm:gap-0 group hover:pl-2 transition-all duration-200">
                  <div className="flex items-center gap-5">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${lap.sukses ? 'bg-[#34d399]' : 'bg-[#475569]'}`} />
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-sm font-semibold text-white group-hover:text-[#22d3ee] transition-colors">{lap.alumni_nama}</span>
                      <span className="text-[#475569] mx-3 hidden sm:inline">—</span>
                      <span className="text-xs text-[#475569] lp-mono">{lap.sumber || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 sm:ml-0 ml-6">
                    <span className="lp-mono text-xs font-bold" style={{
                      color: lap.skor >= 80 ? '#34d399' : lap.skor >= 50 ? '#fbbf24' : '#475569'
                    }}>
                      {lap.skor}
                    </span>
                    <span className="lp-mono text-[10px] text-[#475569] min-w-[80px] text-right hidden sm:block">{lap.waktu}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Navigasi cepat - inline links, bukan cards */}
      <ScrollReveal delay={250}>
        <div className="flex items-center gap-3 mb-5">
          <div className="lp-mono text-[11px] text-[#22d3ee] tracking-widest uppercase">Navigasi</div>
          <div className="flex-1 h-px bg-[rgba(34,211,238,0.08)]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Master Alumni', href: '/alumni', desc: `${total} data` },
            { label: 'Hasil Pelacakan', href: '/hasil', desc: `${selesai} profil` },
            { label: 'Verifikasi Manual', href: '/verifikasi', desc: `${perluVerifikasi} pending` },
            { label: 'Laporan', href: '/laporan', desc: `${laporanList.length} record` },
          ].map((nav, i) => (
            <Link key={i} href={nav.href}
              className="py-3.5 px-6 rounded-xl border border-[rgba(34,211,238,0.08)] hover:border-[rgba(34,211,238,0.25)] hover:bg-[rgba(34,211,238,0.02)] transition-all duration-300 group flex items-center gap-4"
            >
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-[#22d3ee] transition-colors">{nav.label}</div>
                <div className="lp-mono text-[10px] text-[#475569]">{nav.desc}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#475569] group-hover:text-[#22d3ee] group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}

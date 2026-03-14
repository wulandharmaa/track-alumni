'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import { useAlumni } from '@/lib/alumniStore';
import ScrollReveal from '@/components/ScrollReveal';

export default function Laporan() {
  const { laporanList } = useAlumni();
  const [filter, setFilter] = useState('semua');

  const filtered = laporanList.filter(lap => {
    if (filter === 'berhasil') return lap.sukses;
    if (filter === 'gagal') return !lap.sukses;
    return true;
  });

  const totalBerhasil = laporanList.filter(l => l.sukses).length;
  const totalGagal = laporanList.filter(l => !l.sukses).length;
  const pctBerhasil = laporanList.length > 0 ? Math.round((totalBerhasil / laporanList.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto w-full pb-16">
      {/* Header */}
      <ScrollReveal>
        <div className="pt-2 pb-10">
          <div className="lp-mono text-[11px] text-[#475569] tracking-widest uppercase mb-6">Riwayat</div>
          <h1 className="lp-h1 text-3xl sm:text-4xl md:text-5xl text-white mb-3">
            <span className="text-[#22d3ee]">{laporanList.length}</span> proses tercatat
          </h1>
          <p className="lp-body max-w-lg">
            {laporanList.length > 0
              ? <>{totalBerhasil} berhasil <span className="text-[#34d399]">({pctBerhasil}%)</span>, {totalGagal} perlu tindak lanjut.</>
              : 'Belum ada laporan. Jalankan pelacakan dari Dashboard.'}
          </p>
        </div>
      </ScrollReveal>

      {/* Summary strip - inline, bukan card terpisah */}
      {laporanList.length > 0 && (
        <ScrollReveal delay={100}>
          <div className="flex flex-wrap gap-x-8 sm:gap-x-12 gap-y-3 lp-mono text-sm mb-10 pb-8 border-b border-dashed border-[rgba(34,211,238,0.1)]">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{laporanList.length}</span>
              <span className="text-[#475569] text-xs uppercase tracking-wider">total</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#34d399]">{totalBerhasil}</span>
              <span className="text-[#475569] text-xs uppercase tracking-wider">berhasil</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#fbbf24]">{totalGagal}</span>
              <span className="text-[#475569] text-xs uppercase tracking-wider">gagal</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
              <div className="w-24 h-1.5 rounded-full bg-[rgba(34,211,238,0.04)] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#22d3ee] to-[#34d399] transition-all"
                  style={{ width: `${pctBerhasil}%` }} />
              </div>
              <span className="text-xs text-[#94a3b8] font-bold">{pctBerhasil}%</span>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Filter tabs - minimal */}
      <ScrollReveal delay={150}>
        <div className="flex items-center gap-1 mb-8">
          {['semua', 'berhasil', 'gagal'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`lp-mono text-[11px] uppercase tracking-widest py-2 px-4 rounded-lg transition-all ${
                filter === f
                  ? 'text-[#22d3ee] bg-[rgba(34,211,238,0.06)]'
                  : 'text-[#475569] hover:text-[#94a3b8]'
              }`}
            >
              {f}
            </button>
          ))}
          <div className="flex-1" />
          <span className="lp-mono text-[10px] text-[#475569]">{filtered.length} item</span>
        </div>
      </ScrollReveal>

      {/* Data rows */}
      <ScrollReveal delay={200}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="lp-mono text-7xl text-[rgba(34,211,238,0.06)] font-black mb-3 select-none">—</div>
            <p className="text-sm text-[#475569]">
              {laporanList.length === 0 ? 'Belum ada laporan.' : 'Tidak ada data untuk filter ini.'}
            </p>
          </div>
        ) : (
          <>
            {/* Table header - hidden di mobile */}
            <div className="hidden md:flex items-center py-3 mb-1 lp-mono text-[10px] text-[#22d3ee] uppercase tracking-widest">
              <div className="w-8" />
              <div className="flex-1">Nama Alumni</div>
              <div className="w-36">Status</div>
              <div className="w-32">Sumber</div>
              <div className="w-32">Jabatan</div>
              <div className="w-16 text-right">Skor</div>
              <div className="w-24 text-right">Waktu</div>
            </div>

            <div className="divide-y divide-[rgba(34,211,238,0.05)]">
              {filtered.map((lap, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center py-4 gap-2 md:gap-0 group hover:pl-1 transition-all duration-200">
                  {/* Nama + status icon */}
                  <div className="flex items-center gap-3 md:contents">
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {lap.sukses
                        ? <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
                        : <XCircle className="w-4 h-4 text-[#475569]" />
                      }
                    </div>
                    <div className="flex-1 text-sm font-semibold text-white group-hover:text-[#22d3ee] transition-colors">
                      {lap.alumni_nama}
                    </div>
                    {/* Skor tampil inline di mobile */}
                    <div className="md:hidden lp-mono text-xs font-bold" style={{
                      color: lap.skor >= 80 ? '#34d399' : lap.skor >= 50 ? '#fbbf24' : '#475569'
                    }}>
                      {lap.skor}
                    </div>
                  </div>

                  {/* Detail info: stacked di mobile, inline di desktop */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-11 md:pl-0 md:contents text-xs">
                    <div className="md:w-36 flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${lap.sukses ? 'bg-[#34d399]' : 'bg-[#475569]'}`} />
                      <span style={{ color: lap.sukses ? '#34d399' : '#94a3b8' }}>
                        {lap.status_baru?.replace('dari sumber publik', '') || '-'}
                      </span>
                    </div>
                    <div className="md:w-32 text-[#94a3b8]">{lap.sumber || '-'}</div>
                    <div className="md:w-32 text-[#94a3b8]">{lap.jabatan || '-'}</div>
                    <div className="hidden md:block md:w-16 text-right lp-mono font-bold" style={{
                      color: lap.skor >= 80 ? '#34d399' : lap.skor >= 50 ? '#fbbf24' : '#475569'
                    }}>
                      {lap.skor}
                    </div>
                    <div className="md:w-24 md:text-right lp-mono text-[10px] text-[#475569]">{lap.waktu}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </ScrollReveal>
    </div>
  );
}

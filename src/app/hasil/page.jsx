'use client';

import { useState } from 'react';
import { Search, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAlumni } from '@/lib/alumniStore';
import ScrollReveal from '@/components/ScrollReveal';

export default function HasilPelacakan() {
  const { alumniList } = useAlumni();
  const [search, setSearch] = useState('');

  const teridentifikasi = alumniList.filter(a =>
    a.status_lacak === 'Teridentifikasi dari sumber publik' &&
    (a.nama?.toLowerCase().includes(search.toLowerCase()) || search === '')
  );

  return (
    <div className="max-w-5xl mx-auto w-full pb-16">
      {/* Header */}
      <ScrollReveal>
        <div className="pt-2 pb-10">
          <div className="lp-mono text-[11px] text-[#475569] tracking-widest uppercase mb-6">Pelacakan</div>
          <h1 className="lp-h1 text-3xl sm:text-4xl md:text-5xl text-white mb-3">
            <span className="text-[#34d399]">{teridentifikasi.length}</span> alumni teridentifikasi
          </h1>
          <p className="lp-body max-w-lg">Jejak digital yang berhasil ditemukan dan diverifikasi dari sumber publik.</p>
        </div>
      </ScrollReveal>

      {/* Search */}
      <ScrollReveal delay={100}>
        <div className="mb-10">
          <div className="relative max-w-sm">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
            <input
              type="text"
              placeholder="Cari alumni..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent border-b border-[rgba(34,211,238,0.1)] focus:border-[#22d3ee] text-white text-sm py-2.5 pl-7 pr-2 outline-none transition-colors placeholder:text-[#475569]"
            />
          </div>
        </div>
      </ScrollReveal>

      {/* Results */}
      <ScrollReveal delay={150}>
        {teridentifikasi.length === 0 ? (
          <div className="py-16 text-center">
            <div className="lp-mono text-7xl text-[rgba(34,211,238,0.06)] font-black mb-3 select-none">—</div>
            <p className="text-sm text-[#475569]">Belum ada alumni yang teridentifikasi. Jalankan pelacakan dari Dashboard.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {teridentifikasi.map((alumni, i) => (
              <ScrollReveal key={alumni.id} delay={i * 60} direction="up">
                <div className="py-8 border-b border-[rgba(34,211,238,0.06)] group">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <h3 className="lp-h3 text-xl text-white group-hover:text-[#22d3ee] transition-colors">
                        {alumni.nama || '-'}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-[#34d399]" />
                    </div>
                    <div className="lp-mono text-sm font-black" style={{
                      color: (alumni.confidence_score ?? 0) >= 80 ? '#34d399' : '#fbbf24'
                    }}>
                      {alumni.confidence_score ?? 0}
                    </div>
                  </div>

                  {/* Meta line */}
                  <div className="lp-mono text-[11px] text-[#475569] tracking-wide mb-5">
                    {alumni.prodi || '-'} / {alumni.tahun_lulus || '-'}
                    <span className="mx-2 text-[rgba(34,211,238,0.2)]">|</span>
                    Sumber: <span className="text-[#22d3ee]">{alumni.kandidat?.sinyal?.sumber || 'Publik'}</span>
                  </div>

                  {/* Detail - inline flow, bukan card */}
                  {alumni.kandidat?.sinyal ? (
                    <div className="pl-3 sm:pl-5 border-l-2 border-dashed border-[rgba(34,211,238,0.12)] space-y-1.5">
                      <div className="text-sm">
                        <span className="text-white font-medium">{alumni.kandidat.sinyal.jabatan_role || '-'}</span>
                        <span className="text-[#475569]"> di </span>
                        <span className="text-[#94a3b8]">{alumni.kandidat.sinyal.afiliasi || '-'}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#475569] lp-mono">
                        <span>{alumni.kandidat.sinyal.lokasi || '-'}</span>
                        <span>{alumni.tanggal_update || '-'}</span>
                      </div>
                      {alumni.kandidat.sinyal.url_profil && (
                        <a href={alumni.kandidat.sinyal.url_profil} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#22d3ee] text-xs lp-mono font-semibold mt-2 hover:text-white transition-colors">
                          <ExternalLink className="w-3 h-3" /> Lihat Profil
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-[#475569] pl-3 sm:pl-5 border-l-2 border-dashed border-[rgba(34,211,238,0.06)]">Detail tidak tersedia.</p>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </ScrollReveal>
    </div>
  );
}

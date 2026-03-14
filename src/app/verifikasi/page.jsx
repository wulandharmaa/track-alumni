'use client';

import { useState } from 'react';
import { Check, X, ExternalLink, AlertCircle, AlertTriangle } from 'lucide-react';
import { useAlumni } from '@/lib/alumniStore';
import ScrollReveal from '@/components/ScrollReveal';

export default function VerifikasiManual() {
  const { alumniList, updateAlumni, errorMsg } = useAlumni();
  const [confirmed, setConfirmed] = useState({});
  const [localError, setLocalError] = useState(null);

  const toVerify = alumniList.filter(a => a.status_lacak === 'Perlu Verifikasi Manual');

  function handleValid(alumni) {
    try {
      updateAlumni(alumni.id, { status_lacak: 'Teridentifikasi dari sumber publik' });
      setConfirmed(prev => ({ ...prev, [alumni.id]: 'valid' }));
    } catch (err) {
      setLocalError(`Gagal memvalidasi ${alumni.nama}. Silakan coba lagi.`);
      console.error('Error handleValid:', err);
    }
  }

  function handleTolak(alumni) {
    try {
      updateAlumni(alumni.id, { status_lacak: 'Belum Ditemukan di Sumber Publik', confidence_score: 0 });
      setConfirmed(prev => ({ ...prev, [alumni.id]: 'tolak' }));
    } catch (err) {
      setLocalError(`Gagal menolak ${alumni.nama}. Silakan coba lagi.`);
      console.error('Error handleTolak:', err);
    }
  }

  const displayError = localError || errorMsg;

  return (
    <div className="max-w-5xl mx-auto w-full pb-16">
      {/* Header */}
      <ScrollReveal>
        <div className="pt-2 pb-10">
          <div className="lp-mono text-[11px] text-[#475569] tracking-widest uppercase mb-6">Review</div>
          <h1 className="lp-h1 text-3xl sm:text-4xl md:text-5xl text-white mb-3">
            <span className="text-[#fbbf24]">{toVerify.length}</span> perlu diverifikasi
          </h1>
          <p className="lp-body max-w-lg">Tinjau kandidat yang skornya ambigu dan tentukan validitasnya secara manual.</p>
        </div>
      </ScrollReveal>

      {displayError && (
        <div className="mb-8 flex items-center gap-3 p-4 bg-red-500/8 border-l-2 border-red-500 text-red-300 text-sm fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p>{displayError}</p>
        </div>
      )}

      {toVerify.length === 0 ? (
        <ScrollReveal delay={100}>
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: 'rgba(52, 211, 153, 0.06)', border: '1px dashed rgba(52, 211, 153, 0.2)' }}>
              <Check className="w-7 h-7 text-[#34d399]" />
            </div>
            <p className="lp-h3 text-xl text-white mb-2">Semua sudah diverifikasi</p>
            <p className="text-sm text-[#475569]">Tidak ada profil yang perlu ditinjau saat ini.</p>
          </div>
        </ScrollReveal>
      ) : (
        <div className="space-y-0">
          {toVerify.map((alumni, i) => {
            const decision = confirmed[alumni.id];
            return (
              <ScrollReveal key={alumni.id} delay={i * 100} direction="up">
                <div className={`py-8 border-b border-[rgba(34,211,238,0.06)] transition-opacity duration-500 ${decision ? 'opacity-40' : ''}`}>
                  {/* Overlay message jika sudah diputuskan */}
                  {decision && (
                    <div className="mb-4 lp-mono text-xs font-bold" style={{
                      color: decision === 'valid' ? '#34d399' : '#ef4444'
                    }}>
                      {decision === 'valid' ? '// TERVERIFIKASI VALID' : '// DITOLAK'}
                    </div>
                  )}

                  {/* Top */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-[#fbbf24] shrink-0" />
                      <h3 className="lp-h3 text-xl text-white">{alumni.nama || '-'}</h3>
                    </div>
                    <div className="lp-mono text-sm font-black text-[#fbbf24]">
                      {alumni.confidence_score ?? 0}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="lp-mono text-[11px] text-[#475569] tracking-wide mb-5 ml-0 sm:ml-8">
                    NIM: {alumni.nim || '-'}
                    <span className="mx-2 text-[rgba(34,211,238,0.15)]">|</span>
                    {alumni.prodi || '-'}
                  </div>

                  {/* Kandidat info */}
                  {alumni.kandidat ? (
                    <div className="ml-0 sm:ml-8 pl-3 sm:pl-5 border-l-2 border-dashed border-[rgba(251,191,36,0.15)] space-y-1.5 mb-6">
                      <div className="lp-mono text-[10px] text-[#475569] uppercase tracking-wider mb-2">
                        Kandidat dari <span className="text-[#22d3ee] lowercase">{alumni.kandidat.sinyal?.sumber || '?'}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-white font-semibold">{alumni.kandidat.sinyal?.nama_ditemukan || '-'}</span>
                      </div>
                      <div className="text-sm text-[#94a3b8]">
                        {alumni.kandidat.sinyal?.jabatan_role || '-'} — {alumni.kandidat.sinyal?.afiliasi || '-'}
                      </div>
                      <div className="text-xs text-[#475569] lp-mono">
                        Lokasi: {alumni.kandidat.sinyal?.lokasi || '-'}
                      </div>
                      {alumni.kandidat.sinyal?.url_profil && (
                        <a href={alumni.kandidat.sinyal.url_profil} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#22d3ee] text-xs lp-mono font-semibold mt-2 hover:text-white transition-colors">
                          <ExternalLink className="w-3 h-3" /> Cek Profil
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-[#475569] ml-0 sm:ml-8 pl-3 sm:pl-5 border-l-2 border-dashed border-[rgba(34,211,238,0.06)] mb-6">
                      Data kandidat tidak tersedia.
                    </p>
                  )}

                  {/* Action buttons - inline, bukan card */}
                  {!decision && (
                    <div className="ml-0 sm:ml-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button onClick={() => handleValid(alumni)}
                        className="py-2.5 sm:py-2 px-5 rounded-lg lp-mono text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.15)' }}>
                        <Check className="w-3.5 h-3.5" /> Valid
                      </button>
                      <button onClick={() => handleTolak(alumni)}
                        className="py-2.5 sm:py-2 px-5 rounded-lg lp-mono text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.12)' }}>
                        <X className="w-3.5 h-3.5" /> Tolak
                      </button>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
}

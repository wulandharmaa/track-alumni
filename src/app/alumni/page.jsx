'use client';

import { useState } from 'react';
import { Search, Plus, X, Loader2, AlertTriangle, ArrowRight, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAlumni } from '@/lib/alumniStore';
import ScrollReveal from '@/components/ScrollReveal';

// Modal form tambah alumni
function TambahModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ nama: '', nim: '', universitas: '', prodi: '', tahun_lulus: '', kota_asal: '', bidang: '' });
  const [formErrors, setFormErrors] = useState([]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormErrors([]);

    const errors = [];
    if (!form.nama.trim()) errors.push('Nama wajib diisi.');
    if (!form.nim.trim()) errors.push('NIM wajib diisi.');
    if (!form.universitas.trim()) errors.push('Universitas wajib diisi.');
    if (!form.prodi.trim()) errors.push('Program Studi wajib diisi.');
    if (!form.tahun_lulus.trim()) errors.push('Tahun Lulus wajib diisi.');
    if (form.tahun_lulus.trim() && !/^\d{4}$/.test(form.tahun_lulus.trim())) {
      errors.push('Tahun Lulus harus 4 digit angka (misal: 2023).');
    }
    if (!form.kota_asal.trim()) errors.push('Kota Asal wajib diisi.');
    if (!form.bidang.trim()) errors.push('Bidang Kerja wajib diisi.');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    const result = await onSubmit(form);
    if (result && !result.success) {
      setFormErrors(result.errors || ['Gagal menambahkan alumni.']);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-full max-w-md relative max-h-[90vh] overflow-y-auto fade-in p-8 rounded-2xl"
        style={{ background: 'rgba(6, 10, 20, 0.96)', border: '1px solid rgba(34, 211, 238, 0.1)' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[#475569] hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="lp-mono text-[10px] text-[#22d3ee] tracking-widest uppercase mb-2">Formulir</div>
        <h2 className="lp-h3 text-2xl text-white mb-6">Tambah Alumni</h2>

        {formErrors.length > 0 && (
          <div className="mb-4 p-3 border-l-2 border-red-500 bg-red-500/5 text-red-300 text-sm space-y-1">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4" />
              <span>Periksa data berikut:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {formErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'nama', label: 'Nama Lengkap', placeholder: 'Muhammad Rizky...' },
            { key: 'nim', label: 'NIM', placeholder: '202310370311...' },
            { key: 'universitas', label: 'Universitas', placeholder: 'Universitas Teknologi Yogyakarta' },
            { key: 'prodi', label: 'Program Studi', placeholder: 'Informatika' },
            { key: 'tahun_lulus', label: 'Tahun Lulus', placeholder: '2023' },
            { key: 'kota_asal', label: 'Kota Asal', placeholder: 'Malang' },
            { key: 'bidang', label: 'Bidang Kerja', placeholder: 'Software Engineering' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block lp-mono text-[10px] text-[#475569] uppercase tracking-wider mb-1.5">{label}</label>
              <input
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="input-field"
              />
            </div>
          ))}
          <button type="submit" className="w-full py-3 rounded-xl lp-mono text-sm font-bold mt-2"
            style={{ background: '#22d3ee', color: '#060a14' }}>
            Simpan Alumni
          </button>
        </form>
      </div>
    </div>
  );
}

export default function MasterAlumni() {
  const {
    alumniList,
    tambahAlumni,
    jalankanPelacakan,
    isTracking,
    errorMsg,
    isLoading,
    refreshVerificationStatus,
    currentPage,
    totalPages,
    totalAlumniCount,
    pageSize,
    goNextPage,
    goPrevPage,
  } = useAlumni();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [trackingId, setTrackingId] = useState(null);
  const [trackError, setTrackError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = alumniList.filter(a =>
    a.nama.toLowerCase().includes(search.toLowerCase()) ||
    a.nim.includes(search)
  );

  async function handleLacak(alumni) {
    setTrackingId(alumni.id);
    setTrackError(null);
    try {
      const hasil = await jalankanPelacakan([alumni.id]);
      if (hasil?.[0]?.error) {
        setTrackError(`Gagal melacak ${alumni.nama}: ${hasil[0].error}`);
      }
    } catch (err) {
      setTrackError(`Gagal melacak ${alumni.nama}. Silakan coba lagi.`);
      console.error('Error handleLacak:', err);
    } finally {
      setTrackingId(null);
    }
  }

  const displayError = trackError || errorMsg;

  async function handleRefreshTable() {
    setIsRefreshing(true);
    try {
      await refreshVerificationStatus();
    } finally {
      setIsRefreshing(false);
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto w-full pb-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#22d3ee] mx-auto mb-4" />
          <p className="text-[#94a3b8]">Memuat data alumni...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full pb-16">
      {showModal && (
        <TambahModal onClose={() => setShowModal(false)} onSubmit={tambahAlumni} />
      )}

      {/* Header */}
      <ScrollReveal>
        <div className="pt-2 pb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
          <div>
            <div className="lp-mono text-[11px] text-[#475569] tracking-widest uppercase mb-6">Master Data</div>
            <h1 className="lp-h1 text-3xl sm:text-4xl md:text-5xl text-white mb-3">
              Data Alumni <span className="text-[#22d3ee]">({totalAlumniCount})</span>
            </h1>
            <p className="lp-body max-w-lg">Kelola data target alumni yang akan dilacak jejak digitalnya.</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="shrink-0 w-full sm:w-auto py-3 px-6 rounded-xl lp-mono text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={{ background: '#22d3ee', color: '#060a14' }}>
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>
      </ScrollReveal>

      {displayError && (
        <div className="mb-8 flex items-center gap-3 p-4 bg-red-500/8 border-l-2 border-red-500 text-red-300 text-sm fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p>{displayError}</p>
        </div>
      )}

      {/* Search - minimal, tanpa card wrapper */}
      <ScrollReveal delay={100}>
        <div className="mb-8">
          <div className="relative max-w-sm">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
            <input
              type="text"
              placeholder="Cari nama atau NIM..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent border-b border-[rgba(34,211,238,0.1)] focus:border-[#22d3ee] text-white text-sm py-2.5 pl-7 pr-2 outline-none transition-colors placeholder:text-[#475569]"
            />
          </div>
        </div>
      </ScrollReveal>

      {/* Alumni list - flat, tanpa table wrapper */}
      <ScrollReveal delay={150}>
        <div className="flex justify-end mb-3">
          <button
            onClick={handleRefreshTable}
            disabled={isRefreshing || isLoading}
            className="px-3 py-2 rounded-lg lp-mono text-[11px] font-bold text-[#22d3ee] border border-[rgba(34,211,238,0.18)] hover:border-[#22d3ee] hover:text-white transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Menyegarkan...' : 'Refresh Tabel'}
          </button>
        </div>

        {/* Table header - hidden di mobile */}
        <div className="hidden lg:flex items-center gap-4 py-3 mb-1 lp-mono text-[10px] text-[#22d3ee] uppercase tracking-widest">
          <div className="w-8" />
          <div className="flex-1">Nama</div>
          <div className="w-32">NIM</div>
          <div className="w-40">Prodi / Tahun</div>
          <div className="w-40">Universitas</div>
          <div className="w-40">Verifikasi PPDIKTI</div>
          <div className="w-32 text-right">Aksi</div>
        </div>

        <div className="divide-y divide-[rgba(34,211,238,0.05)]">
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[#475569] text-sm">Tidak ada data ditemukan.</div>
          )}
          {filtered.map((alumni, i) => (
            <div key={alumni.id} className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 py-4 group hover:pl-1 transition-all duration-200">
              <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center lp-mono text-xs font-bold text-[#22d3ee] shrink-0"
                  style={{ background: 'rgba(34, 211, 238, 0.06)', border: '1px solid rgba(34, 211, 238, 0.08)' }}>
                  {alumni.nama?.[0] || '?'}
                </div>
                <div className="font-semibold text-white text-sm group-hover:text-[#22d3ee] transition-colors truncate">
                  {alumni.nama || '-'}
                </div>
              </div>

              {/* Detail info: inline di desktop, stacked di mobile */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-11 lg:pl-0 lg:contents">
                <div className="lg:w-32 lp-mono text-xs text-[#94a3b8]">{alumni.nim || '-'}</div>
                <div className="lg:w-40 text-xs text-[#94a3b8]">
                  {alumni.prodi || '-'} <span className="text-[#475569]">/</span> {alumni.tahun_lulus || '-'}
                </div>
                <div className="lg:w-40 text-xs text-[#94a3b8] truncate">
                  {alumni.universitas || '-'}
                </div>

                {/* Verifikasi PPDIKTI Status Badge */}
                <div className="lg:w-40 flex items-center gap-2">
                  <div 
                    className="w-1.5 h-1.5 rounded-full shrink-0" 
                    style={{ 
                      background: alumni.verifikasi_ppdikti === 'Terverifikasi' ? '#34d399' : '#fbbf24'
                    }} 
                  />
                  <span 
                    className="text-xs font-medium"
                    style={{ 
                      color: alumni.verifikasi_ppdikti === 'Terverifikasi' ? '#34d399' : '#fbbf24'
                    }}
                  >
                    {alumni.verifikasi_ppdikti || 'Tidak Diketahui'}
                  </span>
                </div>

                <div className="lg:w-32 lg:text-right ml-auto lg:ml-0">
                  {alumni.status_lacak === 'Belum Dilacak' || alumni.status_lacak === 'Gagal diproses' ? (
                    <button
                      onClick={() => handleLacak(alumni)}
                      disabled={isTracking}
                      className="lp-mono text-[11px] font-bold text-[#22d3ee] hover:text-white transition-colors disabled:opacity-40 inline-flex items-center gap-1"
                    >
                      {trackingId === alumni.id ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Scanning</>
                      ) : <>Lacak <ArrowRight className="w-3 h-3" /></>}
                    </button>
                  ) : (
                    <span className="text-[10px] text-[#475569] lp-mono">done</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="lp-mono text-[11px] text-[#475569] uppercase tracking-wider">
            Menampilkan {alumniList.length} dari {totalAlumniCount} alumni • {pageSize} per halaman
          </div>
          <div className="inline-flex items-center gap-2">
            <button
              onClick={goPrevPage}
              disabled={currentPage <= 1 || isLoading}
              className="px-3 py-2 rounded-lg lp-mono text-[11px] font-bold text-[#22d3ee] border border-[rgba(34,211,238,0.18)] hover:border-[#22d3ee] hover:text-white transition-colors disabled:opacity-40 inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <div className="lp-mono text-[11px] text-[#94a3b8] min-w-[120px] text-center">
              Halaman {currentPage} / {totalPages}
            </div>
            <button
              onClick={goNextPage}
              disabled={currentPage >= totalPages || isLoading}
              className="px-3 py-2 rounded-lg lp-mono text-[11px] font-bold text-[#22d3ee] border border-[rgba(34,211,238,0.18)] hover:border-[#22d3ee] hover:text-white transition-colors disabled:opacity-40 inline-flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

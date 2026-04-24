'use client';

// Supabase-backed alumni store with verification logic
import { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient } from './supabaseClient';
import { JalankanPelacakanSatuAlumni } from './trackingLogic';

const ALUMNI_PAGE_SIZE = 50;

// Validasi field wajib saat menambah alumni
function validasiAlumni(data) {
  const errors = [];
  if (!data.nama?.trim()) errors.push('Nama wajib diisi.');
  if (!data.nim?.trim()) errors.push('NIM wajib diisi.');
  if (!data.universitas?.trim()) errors.push('Universitas wajib diisi.');
  if (!data.prodi?.trim()) errors.push('Program Studi wajib diisi.');
  if (!data.tahun_lulus?.trim()) errors.push('Tahun Lulus wajib diisi.');
  if (!data.kota_asal?.trim()) errors.push('Kota Asal wajib diisi.');
  if (!data.bidang?.trim()) errors.push('Bidang Kerja wajib diisi.');
  return errors;
}

const AlumniContext = createContext(null);

// Fetch alumni by page from Supabase and return exact total count
async function fetchAlumniFromSupabase(page = 1, pageSize = ALUMNI_PAGE_SIZE) {
  try {
    const supabase = getSupabaseClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('alumni')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      rows: data || [],
      totalCount: typeof count === 'number' ? count : 0,
    };
  } catch (err) {
    console.error('Gagal mengambil alumni dari Supabase:', err);
    return { rows: [], totalCount: 0 };
  }
}

// Fetch all detail alumni for verification purposes
async function fetchDetailAlumniFromSupabase() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('detail-alumni')
      .select('nim, nama, universitas:nama_pt');

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Gagal mengambil detail alumni dari Supabase:', err);
    return [];
  }
}

// Check if alumni is verified in detail-alumni table
// Matching strategy: prefer NIM, fallback to nama + universitas
function isAlumniVerified(alumni, detailAlumniList) {
  // Strategy 1: Match by NIM (primary)
  if (alumni.nim) {
    const matchedByNim = detailAlumniList.some(d => d.nim === alumni.nim);
    if (matchedByNim) return true;
  }

  // Strategy 2: Match by nama + universitas (fallback)
  if (alumni.nama && alumni.universitas) {
    const matchedByNameUniv = detailAlumniList.some(
      d => d.nama?.toLowerCase() === alumni.nama.toLowerCase() &&
           d.universitas?.toLowerCase() === alumni.universitas.toLowerCase()
    );
    if (matchedByNameUniv) return true;
  }

  return false;
}

// Merge verification status into alumni list
function mergeVerificationStatus(alumniList, detailAlumniList) {
  return alumniList.map(alumni => ({
    ...alumni,
    verifikasi_ppdikti: isAlumniVerified(alumni, detailAlumniList) 
      ? 'Terverifikasi' 
      : 'Belum Terverifikasi'
  }));
}

export function AlumniProvider({ children }) {
  const [alumniList, setAlumniList] = useState([]);
  const [laporanList, setLaporanList] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null); // Global error state
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAlumniCount, setTotalAlumniCount] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalAlumniCount / ALUMNI_PAGE_SIZE));

  async function loadAlumniPage(page = 1) {
    setIsLoading(true);
    try {
      const [alumniRes, detailAlumni] = await Promise.all([
        fetchAlumniFromSupabase(page, ALUMNI_PAGE_SIZE),
        fetchDetailAlumniFromSupabase()
      ]);
      const mergedAlumni = mergeVerificationStatus(alumniRes.rows, detailAlumni);
      setAlumniList(mergedAlumni);
      setTotalAlumniCount(alumniRes.totalCount);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading data:', err);
      setErrorMsg('Gagal memuat data alumni');
    } finally {
      setIsLoading(false);
    }
  }

  // Load alumni and detail-alumni from Supabase
  useEffect(() => {
    loadAlumniPage(1);
  }, []);

  // Bersihkan pesan error setelah 5 detik
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Tambah alumni baru dengan validasi dan simpan ke Supabase
  async function tambahAlumni(data) {
    const errors = validasiAlumni(data);
    if (errors.length > 0) {
      setErrorMsg(errors.join(' '));
      return { success: false, errors };
    }

    try {
      const supabase = getSupabaseClient();
      
      // Cek duplikasi NIM di Supabase
      const { data: existing, error: checkError } = await supabase
        .from('alumni')
        .select('id')
        .eq('nim', data.nim.trim())
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        setErrorMsg('NIM sudah terdaftar dalam sistem.');
        return { success: false, errors: ['NIM sudah terdaftar.'] };
      }

      // Insert new alumni ke Supabase
      const newAlumni = {
        nama: data.nama.trim(),
        nim: data.nim.trim(),
        universitas: data.universitas.trim(),
        prodi: data.prodi.trim(),
        tahun_lulus: data.tahun_lulus.trim(),
        kota_asal: data.kota_asal.trim(),
        bidang: data.bidang.trim(),
        status_lacak: 'Belum Dilacak',
        confidence_score: 0,
        tanggal_update: new Date().toISOString().split('T')[0]
      };

      const { error: insertError } = await supabase
        .from('alumni')
        .insert([newAlumni]);

      if (insertError) throw insertError;

      // Muat ulang halaman pertama agar data terbaru langsung terlihat
      await loadAlumniPage(1);

      return { success: true };
    } catch (err) {
      console.error('Error tambah alumni:', err);
      setErrorMsg('Gagal menambahkan alumni');
      return { success: false, errors: [err.message] };
    }
  }

  // Update alumni status in Supabase
  async function updateAlumni(id, updates) {
    if (!id) {
      console.error('updateAlumni: ID alumni tidak boleh kosong.');
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('alumni')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setAlumniList(prev => prev.map(item => (
        item.id === id ? { ...item, ...updates } : item
      )));
    } catch (err) {
      console.error('Error update alumni:', err);
      setErrorMsg('Gagal memperbarui alumni');
    }
  }

  // Jalankan pelacakan dengan error handling per-alumni
  async function jalankanPelacakan(targetIds) {
    setIsTracking(true);
    setErrorMsg(null);

    try {
      const targets = alumniList.filter(a =>
        targetIds
          ? targetIds.includes(a.id)
          : a.status_lacak === 'Belum Dilacak' || a.confidence_score < 50
      );

      if (targets.length === 0) {
        setIsTracking(false);
        return [];
      }

      const newLaporan = [];

      for (const alumni of targets) {
        try {
          const hasil = await JalankanPelacakanSatuAlumni(alumni);

          // Jika tracking gagal, catat error tapi lanjutkan alumni berikutnya
          if (hasil.error) {
            console.warn(`Pelacakan ${alumni.nama} gagal:`, hasil.error);
            newLaporan.push({
              id: `LAP-${Date.now()}-${alumni.id}`,
              alumni_id: alumni.id,
              alumni_nama: alumni.nama,
              waktu: new Date().toLocaleString('id-ID'),
              status_baru: hasil.status_baru,
              skor: 0,
              sumber: '-',
              jabatan: '-',
              instansi: '-',
              sukses: false,
              error: hasil.error
            });
            continue;
          }

          // Update status di Supabase
          await updateAlumni(alumni.id, {
            status_lacak: hasil.status_baru,
            confidence_score: hasil.kandidat_terbaik?.skor || 0,
            tanggal_update: new Date().toISOString().split('T')[0]
          });

          newLaporan.push({
            id: `LAP-${Date.now()}-${alumni.id}`,
            alumni_id: alumni.id,
            alumni_nama: alumni.nama,
            waktu: new Date().toLocaleString('id-ID'),
            status_baru: hasil.status_baru,
            skor: hasil.kandidat_terbaik?.skor || 0,
            sumber: hasil.kandidat_terbaik?.sinyal?.sumber || '-',
            jabatan: hasil.kandidat_terbaik?.sinyal?.jabatan_role || '-',
            instansi: hasil.kandidat_terbaik?.sinyal?.afiliasi || '-',
            sukses: (hasil.kandidat_terbaik?.skor || 0) >= 50
          });
        } catch (err) {
          // Error tak terduga pada satu alumni, lanjutkan ke yang lain
          console.error(`Error tak terduga saat melacak ${alumni.nama}:`, err);
          newLaporan.push({
            id: `LAP-${Date.now()}-${alumni.id}`,
            alumni_id: alumni.id,
            alumni_nama: alumni.nama,
            waktu: new Date().toLocaleString('id-ID'),
            status_baru: "Gagal diproses",
            skor: 0,
            sumber: '-',
            jabatan: '-',
            instansi: '-',
            sukses: false,
            error: err.message || 'Error tidak diketahui'
          });
        }
      }

      setLaporanList(prev => [...newLaporan, ...prev]);
      return newLaporan;
    } catch (err) {
      console.error('Error global pada proses pelacakan:', err);
      setErrorMsg('Terjadi kesalahan saat menjalankan pelacakan. Silakan coba lagi.');
      return [];
    } finally {
      setIsTracking(false);
    }
  }

  // Refresh verification status after PDDIKTI sync
  async function refreshVerificationStatus() {
    try {
      await loadAlumniPage(currentPage);
    } catch (err) {
      console.error('Error refreshing verification:', err);
      setErrorMsg('Gagal menyegarkan status verifikasi');
    }
  }

  async function goToPage(page) {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    if (safePage === currentPage) return;
    await loadAlumniPage(safePage);
  }

  async function goNextPage() {
    await goToPage(currentPage + 1);
  }

  async function goPrevPage() {
    await goToPage(currentPage - 1);
  }

  return (
    <AlumniContext.Provider value={{
      alumniList, tambahAlumni, updateAlumni,
      laporanList, jalankanPelacakan, isTracking,
      errorMsg, setErrorMsg, isLoading, refreshVerificationStatus,
      currentPage, totalPages, totalAlumniCount, pageSize: ALUMNI_PAGE_SIZE,
      goToPage, goNextPage, goPrevPage
    }}>
      {children}
    </AlumniContext.Provider>
  );
}

export function useAlumni() {
  const ctx = useContext(AlumniContext);
  if (!ctx) {
    throw new Error('useAlumni harus digunakan di dalam AlumniProvider.');
  }
  return ctx;
}

'use client';

// Shared in-memory data store using localStorage untuk persistensi antar halaman
import { createContext, useContext, useState, useEffect } from 'react';
import { JalankanPelacakanSatuAlumni } from './trackingLogic';

const defaultAlumni = [
  {
    id: "ALM-001",
    nama: "Wulan Dharma Putri",
    nim: "202310370311279",
    prodi: "Informatika",
    tahun_lulus: "2023",
    kota_asal: "Malang",
    bidang: "Software Engineering",
    status_lacak: "Teridentifikasi dari sumber publik",
    confidence_score: 95,
    tanggal_update: "2024-03-14",
    kandidat: {
      sinyal: {
        nama_ditemukan: "Wulan Dharma Putri",
        jabatan_role: "Software Engineer",
        afiliasi: "Tokopedia",
        lokasi: "Jakarta",
        sumber: "LinkedIn",
        url_profil: "#"
      },
      skor: 95
    }
  },
  {
    id: "ALM-002",
    nama: "Rikza Ahmad Nur Muhammad",
    nim: "202310370311265",
    prodi: "Informatika",
    tahun_lulus: "2023",
    kota_asal: "Surabaya",
    bidang: "Web Development",
    status_lacak: "Belum Dilacak",
    confidence_score: 0,
    tanggal_update: "2023-08-10",
    kandidat: null
  },
  {
    id: "ALM-003",
    nama: "Budi Santoso",
    nim: "202310370311100",
    prodi: "Teknik Mesin",
    tahun_lulus: "2022",
    kota_asal: "Jakarta",
    bidang: "Otomotif",
    status_lacak: "Perlu Verifikasi Manual",
    confidence_score: 55,
    tanggal_update: "2024-01-20",
    kandidat: {
      sinyal: {
        nama_ditemukan: "Budi S.",
        jabatan_role: "Mechanical Engineer",
        afiliasi: "PT. Astra International",
        lokasi: "Jakarta",
        sumber: "LinkedIn",
        url_profil: "#"
      },
      skor: 55
    }
  }
];

// Validasi field wajib saat menambah alumni
function validasiAlumni(data) {
  const errors = [];
  if (!data.nama?.trim()) errors.push('Nama wajib diisi.');
  if (!data.nim?.trim()) errors.push('NIM wajib diisi.');
  if (!data.prodi?.trim()) errors.push('Program Studi wajib diisi.');
  if (!data.tahun_lulus?.trim()) errors.push('Tahun Lulus wajib diisi.');
  if (!data.kota_asal?.trim()) errors.push('Kota Asal wajib diisi.');
  if (!data.bidang?.trim()) errors.push('Bidang Kerja wajib diisi.');
  return errors;
}

const AlumniContext = createContext(null);

export function AlumniProvider({ children }) {
  const [alumniList, setAlumniList] = useState(defaultAlumni);
  const [laporanList, setLaporanList] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null); // Global error state

  // Load from localStorage jika ada
  useEffect(() => {
    try {
      const stored = localStorage.getItem('alumniData');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAlumniList(parsed);
        }
      }
      const storedLaporan = localStorage.getItem('laporanData');
      if (storedLaporan) {
        const parsed = JSON.parse(storedLaporan);
        if (Array.isArray(parsed)) {
          setLaporanList(parsed);
        }
      }
    } catch (err) {
      console.error('Gagal memuat data dari localStorage:', err);
      // Data tetap menggunakan default
    }
  }, []);

  // Save ke localStorage setiap ada perubahan
  useEffect(() => {
    try {
      localStorage.setItem('alumniData', JSON.stringify(alumniList));
    } catch (err) {
      console.error('Gagal menyimpan data alumni ke localStorage:', err);
    }
  }, [alumniList]);

  useEffect(() => {
    try {
      localStorage.setItem('laporanData', JSON.stringify(laporanList));
    } catch (err) {
      console.error('Gagal menyimpan laporan ke localStorage:', err);
    }
  }, [laporanList]);

  // Bersihkan pesan error setelah 5 detik
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Tambah alumni baru dengan validasi
  function tambahAlumni(data) {
    const errors = validasiAlumni(data);
    if (errors.length > 0) {
      setErrorMsg(errors.join(' '));
      return { success: false, errors };
    }

    // Cek duplikasi NIM
    const nimSudahAda = alumniList.some(a => a.nim === data.nim.trim());
    if (nimSudahAda) {
      setErrorMsg('NIM sudah terdaftar dalam sistem.');
      return { success: false, errors: ['NIM sudah terdaftar.'] };
    }

    const newAlumni = {
      ...data,
      nama: data.nama.trim(),
      nim: data.nim.trim(),
      prodi: data.prodi.trim(),
      tahun_lulus: data.tahun_lulus.trim(),
      kota_asal: data.kota_asal.trim(),
      bidang: data.bidang.trim(),
      id: `ALM-${Date.now()}`,
      status_lacak: "Belum Dilacak",
      confidence_score: 0,
      tanggal_update: new Date().toISOString().split('T')[0],
      kandidat: null
    };
    setAlumniList(prev => [...prev, newAlumni]);
    return { success: true };
  }

  // Update status alumni (untuk verifikasi)
  function updateAlumni(id, updates) {
    if (!id) {
      console.error('updateAlumni: ID alumni tidak boleh kosong.');
      return;
    }
    setAlumniList(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
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

          // Update status di list
          updateAlumni(alumni.id, {
            status_lacak: hasil.status_baru,
            confidence_score: hasil.kandidat_terbaik?.skor || 0,
            tanggal_update: new Date().toISOString().split('T')[0],
            kandidat: hasil.kandidat_terbaik
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

  return (
    <AlumniContext.Provider value={{
      alumniList, tambahAlumni, updateAlumni,
      laporanList, jalankanPelacakan, isTracking,
      errorMsg, setErrorMsg
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

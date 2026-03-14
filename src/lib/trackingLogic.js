// Mengimplementasikan Pseudocode dari Wulan & Rikza
import { mockPublicSearch } from '../data/mockDb';

// LANGKAH 1: BuatProfilTarget
export function BuatProfilTarget(alumni) {
  if (!alumni || !alumni.nama) {
    throw new Error('Data alumni tidak valid: nama wajib diisi.');
  }

  const namaParts = alumni.nama.trim().split(" ");
  const variasi_nama = [
    alumni.nama,
    namaParts.length > 1
      ? namaParts[0] + " " + namaParts[namaParts.length - 1]
      : namaParts[0], // Jika nama satu kata, gunakan apa adanya
  ];

  return {
    id: alumni.id,
    nama_lengkap: alumni.nama,
    variasi_nama: variasi_nama,
    kata_kunci_afiliasi: ["Universitas Muhammadiyah Malang", "UMM", alumni.prodi || ''],
    kata_kunci_konteks: [alumni.bidang || '', alumni.tahun_lulus || '', alumni.kota_asal || ''],
    status_lacak: "Belum Dilacak",
    opt_out: false 
  };
}

// LANGKAH 4: GenerateSearchQuery
export function GenerateSearchQuery(profil) {
  if (!profil || !profil.variasi_nama) {
    throw new Error('Profil target tidak valid untuk generate query.');
  }

  let queries = [];
  profil.variasi_nama.forEach(nama => {
    queries.push(`${nama} Universitas Muhammadiyah Malang`);
    queries.push(`${nama} site:linkedin.com`);
    queries.push(`${nama} ORCID`);
    if (profil.kata_kunci_konteks?.[0]) {
      queries.push(`${nama} ${profil.kata_kunci_konteks[0]}`);
    }
  });
  return queries;
}

// LANGKAH 7: Disambiguasi & Hitung Skor
export function HitungSkorKecocokan(profil, kandidatSinyal) {
  if (!profil || !kandidatSinyal) return 0;

  let skor = 0.0;

  // Cek Nama (Bobot max 30)
  try {
    const isNamaMatch = profil.variasi_nama.some(v => 
      kandidatSinyal.nama_ditemukan?.toLowerCase().includes(v.toLowerCase())
    );
    if (isNamaMatch) skor += 30;
  } catch {
    // Jika ada error pada pencocokan nama, lanjutkan tanpa skor nama
  }

  // Cek Afiliasi Kampus (Bobot max 25)
  try {
    const isAfiliasiMatch = profil.kata_kunci_afiliasi.some(v => 
      v && kandidatSinyal.afiliasi?.toLowerCase().includes(v.toLowerCase())
    );
    if (isAfiliasiMatch) skor += 25;
  } catch {
    // Lanjutkan tanpa skor afiliasi
  }

  // Cek Bidang (Bobot max 15)
  try {
    const bidang = profil.kata_kunci_konteks?.[0];
    if (bidang && kandidatSinyal.bidang_topik) {
      const isBidangMatch = kandidatSinyal.bidang_topik.toLowerCase().includes(bidang.toLowerCase());
      if (isBidangMatch) skor += 15;
    }
  } catch {
    // Lanjutkan tanpa skor bidang
  }

  // Cek Lokasi (Bobot max 10)
  try {
    const lokasi = profil.kata_kunci_konteks?.[2];
    if (lokasi && kandidatSinyal.lokasi) {
      const isLokasiMatch = kandidatSinyal.lokasi.toLowerCase().includes(lokasi.toLowerCase());
      if (isLokasiMatch) skor += 10;
    }
  } catch {
    // Lanjutkan tanpa skor lokasi
  }

  return skor;
}

// LANGKAH 9: Cross Validation
export function CrossValidation(kandidat_list) {
  if (!Array.isArray(kandidat_list) || kandidat_list.length === 0) {
    return [];
  }

  kandidat_list.forEach(kandidat => {
    // Jika skor awal sudah lumayan, tambah skor dari cross-validation
    if (kandidat.skor >= 50) {
      kandidat.skor = Math.min(kandidat.skor + 10, 100); 
    }
  });
  return kandidat_list;
}

// MAIN FUNCTION: JalankanPelacakanSatuAlumni
export async function JalankanPelacakanSatuAlumni(alumni) {
  if (!alumni || !alumni.nama) {
    return {
      alumni_id: alumni?.id || 'unknown',
      status_baru: "Gagal diproses",
      kandidat_terbaik: null,
      waktu: new Date().toISOString(),
      error: "Data alumni tidak valid atau kosong."
    };
  }

  try {
    console.log(`Memulai pelacakan untuk: ${alumni.nama}`);
    
    const profil = BuatProfilTarget(alumni);
    const daftar_query = GenerateSearchQuery(profil);
    
    // Simulasi pencarian publik (bisa gagal jika sumber tidak tersedia)
    let semua_kandidat_mentah;
    try {
      semua_kandidat_mentah = await mockPublicSearch(daftar_query, 'Semua Sumber');
    } catch (searchError) {
      console.error(`Gagal mengambil data pencarian untuk ${alumni.nama}:`, searchError);
      return {
        alumni_id: alumni.id,
        status_baru: "Gagal diproses",
        kandidat_terbaik: null,
        waktu: new Date().toISOString(),
        error: `Pencarian publik gagal: ${searchError.message}`
      };
    }

    // Pastikan hasil pencarian valid
    if (!Array.isArray(semua_kandidat_mentah) || semua_kandidat_mentah.length === 0) {
      return {
        alumni_id: alumni.id,
        status_baru: "Belum Ditemukan di Sumber Publik",
        kandidat_terbaik: null,
        waktu: new Date().toISOString()
      };
    }
    
    // Disambiguasi dan Scoring
    let kandidat_dengan_skor = semua_kandidat_mentah
      .filter(item => item && item.nama_ditemukan) // Filter data tidak valid
      .map(item => {
        const skor = HitungSkorKecocokan(profil, item);
        return { sinyal: item, skor: skor };
      });

    // Urutkan dari tertinggi
    kandidat_dengan_skor.sort((a, b) => b.skor - a.skor);

    // Cross Validation
    kandidat_dengan_skor = CrossValidation(kandidat_dengan_skor);

    const kandidat_terbaik = kandidat_dengan_skor[0] || null;
    let status = "Belum Ditemukan di Sumber Publik";

    if (kandidat_terbaik) {
      if (kandidat_terbaik.skor >= 80) {
        status = "Teridentifikasi dari sumber publik";
      } else if (kandidat_terbaik.skor >= 50) {
        status = "Perlu Verifikasi Manual";
      }
    }

    return {
      alumni_id: alumni.id,
      status_baru: status,
      kandidat_terbaik: kandidat_terbaik,
      waktu: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error saat pelacakan ${alumni.nama}:`, error);
    return {
      alumni_id: alumni.id,
      status_baru: "Gagal diproses",
      kandidat_terbaik: null,
      waktu: new Date().toISOString(),
      error: error.message || 'Terjadi kesalahan yang tidak diketahui.'
    };
  }
}

/**
 * Mock database alumni dan simulasi pencarian multi-sumber publik.
 * Sumber yang disimulasikan: LinkedIn, Google Scholar, ResearchGate,
 * ORCID, GitHub, Instagram, Facebook, Web Umum.
 */

export const alumniData = [
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

/**
 * Kandidat dummy per sumber publik.
 * Setiap sumber mengembalikan data yang berbeda-beda untuk
 * mensimulasikan proses cross-validation antar platform.
 */
const MOCK_RESULTS_BY_SOURCE = {
  "LinkedIn": [
    {
      sumber: "LinkedIn",
      nama_ditemukan: "Wulan Dharma Putri",
      afiliasi: "Universitas Muhammadiyah Malang → Tokopedia",
      jabatan_role: "Software Engineer",
      lokasi: "Jakarta, Indonesia",
      bidang_topik: "Software Engineering",
      tahun_aktivitas: "2023-2024",
      url_profil: "https://linkedin.com/in/wulan-dharma-putri"
    },
    {
      sumber: "LinkedIn",
      nama_ditemukan: "Rikza Ahmad N.",
      afiliasi: "PT Maju Digital",
      jabatan_role: "Frontend Developer",
      lokasi: "Surabaya, Indonesia",
      bidang_topik: "Web Development",
      tahun_aktivitas: "2023-2024",
      url_profil: "https://linkedin.com/in/rikza-ahmad"
    },
    {
      sumber: "LinkedIn",
      nama_ditemukan: "Dewi Sartika",
      afiliasi: "Universitas Muhammadiyah Malang → Bank BCA",
      jabatan_role: "Account Executive",
      lokasi: "Bandung",
      bidang_topik: "Manajemen, Keuangan",
      tahun_aktivitas: "2022-2024",
      url_profil: "https://linkedin.com/in/dewi-sartika-mngmt"
    },
    {
      sumber: "LinkedIn",
      nama_ditemukan: "Ahmad Firmansyah",
      afiliasi: "Firma Hukum Sejahtera",
      jabatan_role: "Legal Officer",
      lokasi: "Jakarta",
      bidang_topik: "Hukum, Legal",
      tahun_aktivitas: "2021-2024",
      url_profil: "https://linkedin.com/in/ahmad-firmansyah-law"
    }
  ],
  "Google Scholar": [
    {
      sumber: "Google Scholar",
      nama_ditemukan: "Wulan Dharma Putri",
      afiliasi: "Universitas Muhammadiyah Malang",
      jabatan_role: "Researcher / Alumni",
      lokasi: "Malang",
      bidang_topik: "Informatika, Machine Learning",
      tahun_aktivitas: "2022-2023",
      url_profil: "https://scholar.google.com/wulandharmaputri"
    },
    {
      sumber: "Google Scholar",
      nama_ditemukan: "Rikza Ahmad Nur Muhammad",
      afiliasi: "UMM Informatika",
      jabatan_role: "Researcher",
      lokasi: "Surabaya",
      bidang_topik: "Web Development, IoT",
      tahun_aktivitas: "2022-2023",
      url_profil: "https://scholar.google.com/rikzaahmad"
    },
    {
      sumber: "Google Scholar",
      nama_ditemukan: "dr. Siska Amelia",
      afiliasi: "Fakultas Kedokteran UMM",
      jabatan_role: "Peneliti Medis",
      lokasi: "Malang",
      bidang_topik: "Kedokteran",
      tahun_aktivitas: "2023",
      url_profil: "https://scholar.google.com/siskaamelia"
    }
  ],
  "ResearchGate": [
    {
      sumber: "ResearchGate",
      nama_ditemukan: "W. D. Putri",
      afiliasi: "UMM",
      jabatan_role: "Bachelor Graduate",
      lokasi: "Malang",
      bidang_topik: "Software Engineering",
      tahun_aktivitas: "2023",
      url_profil: "https://researchgate.net/profile/WulanDharma"
    },
    {
      sumber: "ResearchGate",
      nama_ditemukan: "Dewi Sartika",
      afiliasi: "UMM",
      jabatan_role: "Undergrad",
      lokasi: "Bandung",
      bidang_topik: "Manajemen SDM",
      tahun_aktivitas: "2022",
      url_profil: "https://researchgate.net/profile/DewiSartika"
    }
  ],
  "ORCID": [
    {
      sumber: "ORCID",
      nama_ditemukan: "Wulan Dharma Putri",
      afiliasi: "Universitas Muhammadiyah Malang",
      jabatan_role: "Alumni Researcher",
      lokasi: "Indonesia",
      bidang_topik: "Informatika",
      tahun_aktivitas: "2023",
      url_profil: "https://orcid.org/0000-0001-wulan"
    },
    {
      sumber: "ORCID",
      nama_ditemukan: "Siska Amelia",
      afiliasi: "RSUD Dr. Saiful Anwar",
      jabatan_role: "Dokter Umum",
      lokasi: "Indonesia",
      bidang_topik: "Kedokteran",
      tahun_aktivitas: "2024",
      url_profil: "https://orcid.org/0000-0002-siska"
    }
  ],
  "GitHub": [
    {
      sumber: "GitHub",
      nama_ditemukan: "wulandharma",
      afiliasi: "Freelance / UMM Graduate",
      jabatan_role: "Open Source Contributor",
      lokasi: "Malang",
      bidang_topik: "JavaScript, Python",
      tahun_aktivitas: "2022-2024",
      url_profil: "https://github.com/wulandharma"
    },
    {
      sumber: "GitHub",
      nama_ditemukan: "rikzaahmad",
      afiliasi: "Self",
      jabatan_role: "Developer",
      lokasi: "Surabaya",
      bidang_topik: "React, Node.js",
      tahun_aktivitas: "2023-2024",
      url_profil: "https://github.com/rikzaahmad"
    }
  ],
  "Instagram": [
    {
      sumber: "Instagram",
      nama_ditemukan: "wulan.dharma__",
      afiliasi: "-",
      jabatan_role: "Content Creator (Tech)",
      lokasi: "Jakarta",
      bidang_topik: "Teknologi, Coding",
      tahun_aktivitas: "2024",
      url_profil: "https://instagram.com/wulan.dharma__"
    },
    {
      sumber: "Instagram",
      nama_ditemukan: "dewisartika_official",
      afiliasi: "-",
      jabatan_role: "Marketing Enthusiast",
      lokasi: "Bandung",
      bidang_topik: "Manajemen, Bisnis",
      tahun_aktivitas: "2024",
      url_profil: "https://instagram.com/dewisartika"
    }
  ],
  "Facebook": [
    {
      sumber: "Facebook",
      nama_ditemukan: "Wulan Dharma Putri",
      afiliasi: "Universitas Muhammadiyah Malang (Alumni)",
      jabatan_role: "Software Engineer di Tokopedia",
      lokasi: "Jakarta",
      bidang_topik: "Tech",
      tahun_aktivitas: "2023",
      url_profil: "https://facebook.com/wulan.dharmaputri"
    },
    {
      sumber: "Facebook",
      nama_ditemukan: "Ahmad Firmansyah",
      afiliasi: "Universitas Muhammadiyah Malang",
      jabatan_role: "Lawyer",
      lokasi: "Surabaya",
      bidang_topik: "Hukum",
      tahun_aktivitas: "2023",
      url_profil: "https://facebook.com/ahmad.hukum"
    }
  ],
  "Web Umum": [
    {
      sumber: "Web Umum",
      nama_ditemukan: "Wulan Dharma Putri",
      afiliasi: "Tokopedia",
      jabatan_role: "Software Engineer",
      lokasi: "Jakarta",
      bidang_topik: "Engineering",
      tahun_aktivitas: "2024",
      url_profil: "https://techblog.tokopedia.com/author/wulan"
    },
    {
      sumber: "Web Umum",
      nama_ditemukan: "Rikza Ahmad Nur",
      afiliasi: "Blog Pribadi",
      jabatan_role: "Fullstack Developer",
      lokasi: "Surabaya",
      bidang_topik: "Web Development",
      tahun_aktivitas: "2024",
      url_profil: "https://rikzablog.dev"
    },
    {
      sumber: "Web Umum",
      nama_ditemukan: "dr. Siska Amelia",
      afiliasi: "Klinik Medika Sehat",
      jabatan_role: "Kepala Klinik",
      lokasi: "Malang",
      bidang_topik: "Kesehatan, Kedokteran",
      tahun_aktivitas: "2024",
      url_profil: "https://klinikmedikasehat.com/tim-dokter"
    }
  ]
};

/**
 * Simulasi pencarian publik ke berbagai sumber.
 * Mengembalikan gabungan semua hasil dari setiap sumber publik.
 */
export async function mockPublicSearch(queries, sumber) {
  // Simulasi delay jaringan per sumber (~200–700ms)
  const delay = Math.floor(Math.random() * 300) + 200;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Ambil semua sumber atau sumber spesifik
  const targetSources = sumber === 'Semua Sumber'
    ? Object.keys(MOCK_RESULTS_BY_SOURCE)
    : [sumber];

  let hasilGabungan = [];
  for (const src of targetSources) {
    const results = MOCK_RESULTS_BY_SOURCE[src] || [];
    hasilGabungan = hasilGabungan.concat(results);
  }

  return hasilGabungan;
}

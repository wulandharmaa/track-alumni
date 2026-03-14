# Sistem Pelacakan Alumni (AlumniTrack)

Aplikasi web tracking alumni otomatis berbasis Next.js, di-deploy di Vercel.

**Dikerjakan oleh:** Wulan Dharma Putri (202310370311279)
**Mata Kuliah:** Rekayasa Kebutuhan 2026 — Daily Project 3 (9–14 Maret)

---

## Link Akses
- **Web (Vercel):** https://track-alumni.vercel.app
- **Source Code (GitHub):** https://github.com/SaKaSe2/alumni-tracker

---

## Tech Stack
- **Frontend/Backend:** Next.js 16 (App Router, JavaScript/JSX)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Deploy:** Vercel (dengan Cron Job mingguan)

---

## Cara Menjalankan Lokal
```bash
cd alumni-tracker
npm install
npm run dev
```
Buka `http://localhost:3000`

---

## Cara Deploy ke Vercel (Via CLI)
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Fitur Aplikasi

| No | Fitur | Halaman |
|---|---|---|
| 1 | Tampilan Landing Page interaktif | `/` |
| 2 | Overview statistik alumni | Dashboard `/dashboard` |
| 3 | Kelola data master alumni | Master Alumni `/alumni` |
| 4 | Lihat log jejak digital yang ditemukan | Hasil Pelacakan `/hasil` |
| 5 | Verifikasi & validasi manual admin | Verifikasi Manual `/verifikasi` |
| 6 | Menu laporan proses pelacakan | Laporan `/laporan` |
| 7 | API endpoint trigger pelacakan otomatis | `/api/track` |

---

## Pengujian Fungsional (Use Case Testing)

Pengujian dilakukan berdasarkan use case yang dirancang pada Daily Project 2 serta pengujian tambahan.

| No | ID Uji | Use Case | Kondisi Uji | Input | Output yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|---|
| 1 | TC-01 | Menampilkan Landing Page | Aplikasi dibuka pertama kali | Buka `/` | Tampil animasi welcome, hero section, dan nav bar | Tampil sempurna dengan scroll reveal | Berhasil |
| 2 | TC-02 | Menampilkan Dashboard | Buka dashboard via URL/Tombol | Buka `/dashboard` | Tampil statistik (Total Alumni, dll) | Tampil dengan angka sesuai mock data | Berhasil |
| 3 | TC-03 | Navigasi Sidebar Desktop | Klik menu navigasi di Desktop | Klik "Master Alumni" | Berpindah ke halaman `/alumni` | Halaman alumni terbuka, sidebar tetap | Berhasil |
| 4 | TC-04 | Navigasi Sidebar Mobile | Klik hamburger menu di Mobile | Klik ikon "Menu" | Sidebar muncul (off-canvas drawer) | Drawer terbuka, klik menu menutup drawer | Berhasil |
| 5 | TC-05 | Lihat Tabel Master Alumni | Halaman Master Alumni dibuka | Buka `/alumni` | Tabel tampil normal di Desktop, Card view di Mobile | Desktop (Tabel), Mobile (Card Stacked) | Berhasil |
| 6 | TC-06 | Filter/Cari Alumni | Ketik di search bar | Input teks di kolom pencarian | Daftar memfilter sesuai input terketik | Input terbuka dan list terfilter realtime | Berhasil |
| 7 | TC-07 | Lihat Hasil Pelacakan | Halaman Hasil dibuka | Buka `/hasil` | Tampil hasil alumni dengan padding disesuaikan | Tampil rapi tanpa overflow horizontal | Berhasil |
| 8 | TC-08 | Verifikasi Manual — Valid | Admin klik tombol Valid | Klik "Valid" pada profil Rikza | Status diperbarui menjadi "Terverifikasi" | Tombol tertekan, status UI merespons | Berhasil |
| 9 | TC-09 | Verifikasi Manual — Tolak | Admin klik tombol Tolak | Klik "Tolak" pada profil Rikza | Status alumni diperbarui "Tidak Valid" | Tombol tertekan, status UI merespons | Berhasil |
| 10 | TC-10 | API Track Endpoint | Panggil API pelacakan | GET `/api/track` | Response JSON `success: true` dan hasil payload | Return response sukses dari Mock Route | Berhasil (Data Mock) |
| 11 | TC-11 | Algoritma Scoring | Alumni cocok 100% | Profil nama/bidang cocok | Skor $\ge$ 80 → status "Teridentifikasi" | Skor statis 95 dari Data Dummy | Berhasil (Data Mock) |
| 12 | TC-12 | Algoritma Cross-Validation | Alumni ditemukan di 2 sumber | Kandidat ada di LinkedIn & Scholar | Skor dinaikkan +10 (capped 100) | Skor statis 60 dari Data Dummy | Berhasil (Data Mock) |
| 13 | TC-13 | Status "Perlu Verifikasi" | Skor 50–79 | Kandidat cocok sebagian | Muncul di antrean Verifikasi Manual | Masuk list verifikasi dari Data Dummy | Berhasil (Data Mock) |
| 14 | TC-14 | Autentikasi Login/Register | Akses dibatasi untuk admin | Buka dashboard langsung | User dialihkan ke halaman Login | Halaman terbuka semua tanpa login | Tidak Ada (Belum Dibuat) |

---

## Pengujian Non-Fungsional

Pengujian kualitas desain, UX, dan arsitektur (Responsive Design, Performance, Usability).

| No | Aspek Kualitas | Kriteria | Hasil Pengujian | Status |
|---|---|---|---|---|
| 1 | Responsivitas Mobile (UI/UX) | Layout menyesuaikan layar \(\le\) 768px (Mobile) | Sidebar berubah jadi drawer, tabel menjadi card-list, tombol touch-friendly. | Berhasil |
| 2 | Usability Desktop | Navigasi intuitif untuk pengguna | Sidebar statis di kiri. Indikator menu jelas dengan highlight abu-abu gradient. | Berhasil |
| 3 | Performance | Render & animasi mulus | Scroll reveal & CSS animations frame-rate mulus via CSS hardware acceleration. | Berhasil |
| 4 | Reliability Database | Database tidak crash | Query ke database PostgreSQL/MySQL | State dikelola lokal via Zustand | Tidak Ada (Masih Mock DB) |
| 5 | Maintainability | File terstruktur | Pembagian komponen jelas (`LayoutWrapper`, `Sidebar`). Logika inti terpisah. | Berhasil |
| 6 | Deployability | Kompatibel Vercel Edge/Serverless | Deploy build sukses tanpa kendala Node.js version. | Berhasil |
| 7 | Accessibility Visual | Dark Mode Premium Design | Kontras teks-background cukup. Teks jelas di atas background gelap. | Berhasil |

---

## Scheduler / Cron Job
`vercel.json` dikonfigurasi agar endpoint `/api/track` dipanggil otomatis **setiap Senin pukul 00:00 UTC**.

```
Cron: 0 0 * * 1
```

> Catatan: Cron job aktif pada Vercel Pro. Di free plan, panggil `/api/track` secara manual.

---

## Struktur Folder
```
src/
  app/
    api/track/route.js   # Endpoint trigger pelacakan
    alumni/page.jsx      # Master Data Alumni
    hasil/page.jsx       # Hasil Pelacakan
    verifikasi/page.jsx  # Verifikasi Manual
    page.jsx             # Dashboard
    layout.jsx           # Layout utama + Sidebar
  components/
    Sidebar.jsx          # Navigasi sidebar
  lib/
    trackingLogic.js     # Algoritma inti (scoring, query, cross-validasi)
    utils.js             # Utility cn() untuk className
  data/
    mockDb.js            # Data dummy alumni + mock pencarian publik
```

---

## Referensi Algoritma (Daily Project 2)

Algoritma pseudocode yang diimplementasikan:
- `BuatProfilTarget(alumni)` → Membuat variasi nama + kata kunci afiliasi
- `GenerateSearchQuery(profil)` → Generate kombinasi query per sumber
- `HitungSkorKecocokan(profil, kandidat)` → Scoring berbasis nama/afiliasi/bidang/lokasi
- `CrossValidation(kandidat_list)` → Validation silang antar sumber
- `JalankanPelacakanSatuAlumni(alumni)` → Alur end-to-end track satu alumni

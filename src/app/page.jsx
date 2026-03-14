'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [activeRow, setActiveRow] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Scroll reveal logic
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.lp-sr, .lp-sr-left').forEach(el => observer.observe(el));

    // Nav scroll
    const nav = document.getElementById('mainNav');
    const handleScroll = () => {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animasi scan row
    const interval = setInterval(() => {
      setActiveRow((prev) => (prev + 1) % 3);
    }, 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-[#060a14] min-h-screen text-[#94a3b8] font-[family-name:var(--font-body)]">
      {/* Grid Overlay */}
      <div className="lp-grid-overlay" />

      {/* Navigation */}
      <nav id="mainNav" className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <Link href="/" className="lp-logo">
            <div className="lp-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#060a14" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            Alumni<span>Track</span>
          </Link>

          {/* Desktop nav links */}
          <div className="lp-nav-links">
            <a href="#masalah">Masalah</a>
            <a href="#produk">Produk</a>
            <a href="#testimoni">Testimoni</a>
            <a href="#teknologi">Teknologi</a>
            <Link href="/dashboard" className="lp-btn lp-btn-accent" style={{ padding: '8px 20px', fontSize: '12px' }}>Buka Dashboard</Link>
          </div>

          {/* Hamburger button untuk mobile */}
          <button
            className="lp-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`lp-hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`lp-hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`lp-hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`lp-mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="lp-mobile-menu-inner">
          <a href="#masalah" onClick={() => setMobileMenuOpen(false)}>Masalah</a>
          <a href="#produk" onClick={() => setMobileMenuOpen(false)}>Produk</a>
          <a href="#testimoni" onClick={() => setMobileMenuOpen(false)}>Testimoni</a>
          <a href="#teknologi" onClick={() => setMobileMenuOpen(false)}>Teknologi</a>
          <Link href="/dashboard" className="lp-btn lp-btn-accent w-full justify-center" onClick={() => setMobileMenuOpen(false)}>Buka Dashboard</Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="lp-hero">
        <div className="lp-container lp-grid-2">
          <div>
            <div className="lp-hero-eyebrow lp-stagger lp-stagger-1 w-fit">Pelacakan Alumni Otomatis</div>
            <h1 className="lp-h1 lp-stagger lp-stagger-2 mt-4 text-4xl md:text-6xl font-black">Lacak Jejak <span style={{color: 'var(--lp-accent)'}}>Digital</span> Alumni dari Sumber Publik</h1>
            <p className="lp-body lp-stagger lp-stagger-3 mt-6 mb-10 max-w-md">Sistem cerdas yang menemukan, memverifikasi, dan menilai keberadaan alumni melalui analisis multi-sumber secara otomatis.</p>
            <div className="flex gap-4 flex-wrap lp-stagger lp-stagger-4">
              <Link href="/dashboard" className="lp-btn lp-btn-accent">Buka Dashboard</Link>
              <Link href="/alumni" className="lp-btn lp-btn-ghost">Lihat Master Data</Link>
            </div>
            <div className="flex gap-10 mt-12 pt-8 border-t border-[rgba(34,211,238,0.08)] lp-stagger lp-stagger-5">
              <div>
                <div className="lp-mono text-3xl font-bold text-white">95%</div>
                <div className="text-sm mt-1">Akurasi Skor</div>
              </div>
              <div>
                <div className="lp-mono text-3xl font-bold text-white">&lt;3s</div>
                <div className="text-sm mt-1">Waktu Respons</div>
              </div>
              <div>
                <div className="lp-mono text-3xl font-bold text-white">4+</div>
                <div className="text-sm mt-1">Sumber Data</div>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative h-[480px] flex items-center justify-center lp-stagger lp-stagger-3">
            <div className="lp-scan-container">
              <div className="lp-scan-line"></div>
              <div className="flex items-center gap-2 mb-5 lp-mono text-xs text-[#22d3ee]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse"></div>
                SCANNING DIGITAL FOOTPRINT...
              </div>
              
              {[
                { initial: 'WD', name: 'Wulan Dharma Putri', detail: 'LinkedIn + Google Scholar', score: 95, colorClass: 'text-[#34d399] bg-[#34d399]/10' },
                { initial: 'RA', name: 'Rikza Ahmad N.M.', detail: 'ResearchGate + Portal', score: 55, colorClass: 'text-[#fbbf24] bg-[#fbbf24]/10' },
                { initial: 'AS', name: 'Andi Setiawan', detail: 'LinkedIn', score: 30, colorClass: 'text-[#94a3b8] bg-[#475569]/15' },
              ].map((row, idx) => (
                <div key={idx} className="lp-scan-row" style={{
                  background: activeRow === idx ? 'rgba(34, 211, 238, 0.08)' : 'rgba(34, 211, 238, 0.03)',
                  borderColor: activeRow === idx ? 'rgba(34, 211, 238, 0.15)' : 'rgba(34, 211, 238, 0.04)',
                }}>
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#22d3ee]/15 to-[#06b6d4]/10 flex items-center justify-center lp-mono text-xs font-semibold text-[#22d3ee] shrink-0">
                    {row.initial}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{row.name}</div>
                    <div className="lp-mono text-[11px] text-[#475569]">{row.detail}</div>
                  </div>
                  <div className={`lp-mono text-xs font-bold px-2.5 py-1 rounded-md ${row.colorClass}`}>
                    {row.score}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t border-[rgba(34,211,238,0.08)] flex justify-between lp-mono text-[11px]">
                <span>3 profil ditemukan</span>
                <span className="text-[#22d3ee]">Cross-validating...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section id="masalah" className="lp-section">
        <div className="lp-container">
          <div className="lp-narrative-header lp-sr">
            <div className="lp-section-label">Kenapa AlumniTrack?</div>
            <h2 className="lp-h2 text-3xl md:text-4xl mb-4">Melacak Alumni Tidak Harus Manual dan Melelahkan</h2>
            <p>Universitas menghabiskan berminggu-minggu menghubungi alumni satu per satu. AlumniTrack mengotomatiskan seluruh proses dalam hitungan detik.</p>
          </div>
          <div className="lp-grid-3">
            <div className="lp-glass p-8 lp-sr" style={{transitionDelay: '100ms'}}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-xl bg-red-500/10 text-red-400">✗</div>
              <h3 className="lp-h3 text-lg mb-3">Cara Lama: Manual</h3>
              <p className="text-sm">Menelepon, mengirim email, browsing satu per satu. Hasilnya tidak akurat, memakan waktu berminggu-minggu, dan data sering outdated.</p>
            </div>
            <div className="lp-glass p-8 lp-sr" style={{transitionDelay: '250ms'}}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-xl bg-amber-500/10 text-amber-400">⇄</div>
              <h3 className="lp-h3 text-lg mb-3">Transisi: Semi-Otomatis</h3>
              <p className="text-sm">Survei online + spreadsheet. Lebih baik, tapi response rate rendah dan verifikasi tetap harus manual. Data masih banyak yang tidak valid.</p>
            </div>
            <div className="lp-glass p-8 lp-sr" style={{transitionDelay: '400ms'}}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-xl bg-[#22d3ee]/10 text-[#22d3ee]">✓</div>
              <h3 className="lp-h3 text-lg mb-3">AlumniTrack: Otomatis</h3>
              <p className="text-sm">Generate query cerdas, scraping multi-sumber, dan scoring otomatis dengan cross-validation. Admin hanya perlu verifikasi kasus ambigu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section id="produk" className="lp-section">
        <div className="lp-container">
          <div className="lp-narrative-header lp-sr">
            <div className="lp-section-label">Cara Kerjanya</div>
            <h2 className="lp-h2 text-3xl md:text-4xl mb-4">Dari Data Alumni ke Jejak Digital Terverifikasi</h2>
          </div>
          <div className="lp-grid-2">
            <div className="bg-[#060a14]/80 border border-[rgba(34,211,238,0.08)] rounded-xl overflow-hidden lp-sr-left">
              <div className="flex items-center gap-1.5 p-3.5 border-b border-[rgba(34,211,238,0.08)]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="ml-3 lp-mono text-xs text-[#475569]">api/track — response</span>
              </div>
              <div className="p-5 lp-mono text-sm leading-relaxed text-[#94a3b8]">
                <span className="text-[#475569] italic">// GET /api/track</span><br/>
                {`{`}<br/>
                &nbsp;&nbsp;<span className="text-[#a78bfa]">"success"</span>: <span className="text-[#34d399]">true</span>,<br/>
                &nbsp;&nbsp;<span className="text-[#a78bfa]">"hasil"</span>: [<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;{`{`}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#a78bfa]">"nama"</span>: <span className="text-[#34d399]">"Wulan Dharma Putri"</span>,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#a78bfa]">"skor"</span>: <span className="text-[#fbbf24]">95</span>,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#a78bfa]">"sumber"</span>: [<span className="text-[#34d399]">"LinkedIn"</span>, <span className="text-[#34d399]">"Scholar"</span>],<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#a78bfa]">"status"</span>: <span className="text-[#34d399]">"Teridentifikasi"</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;{`}`}<br/>
                &nbsp;&nbsp;]<br/>
                {`}`}
              </div>
            </div>
            <div>
              <ul className="lp-sr divide-y divide-[rgba(34,211,238,0.08)]">
                {[
                  { title: 'Profil Target Otomatis', desc: 'Sistem membuat variasi nama dan kata kunci afiliasi dari data master alumni.' },
                  { title: 'Query Multi-Sumber', desc: 'Generate kombinasi pencarian untuk LinkedIn, Google Scholar, ResearchGate, dan portal kampus.' },
                  { title: 'Scoring Cerdas', desc: 'Menghitung kecocokan berdasarkan nama, afiliasi, bidang keahlian, dan lokasi.' },
                  { title: 'Cross-Validation', desc: 'Validasi silang antar sumber. Ditemukan di 2+ sumber? Skor naik otomatis.' },
                ].map((ft, i) => (
                  <li key={i} className="py-4 flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-md bg-[#22d3ee]/10 flex items-center justify-center shrink-0 mt-0.5 text-[#22d3ee] text-xs lp-mono">0{i+1}</div>
                    <div><strong className="text-white block mb-0.5">{ft.title}</strong><span className="text-sm">{ft.desc}</span></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="mulai" className="lp-section bg-gradient-to-b from-transparent via-[#22d3ee]/[0.03] to-transparent">
        <div className="lp-container text-center max-w-2xl mx-auto lp-sr">
          <div className="lp-section-label">Akses Sistem</div>
          <h2 className="lp-h2 text-3xl md:text-4xl mb-4">Masuk ke AlumniTrack</h2>
          <p className="mb-10">Mulai lacak alumni Anda sekarang. Sistem sudah siap digunakan langsung dengan data master yang ada.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard" className="lp-btn lp-btn-accent min-w-[200px] justify-center">Buka Dashboard</Link>
            <Link href="/alumni" className="lp-btn lp-btn-ghost min-w-[200px] justify-center">Data Master</Link>
          </div>
          <div className="mt-8 text-sm">Butuh melihat hasil pelacakan langsung? <Link href="/hasil" className="text-[#22d3ee] border-b border-[#22d3ee]/30 hover:border-[#22d3ee] pb-0.5">Cek Menu Hasil</Link></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-[rgba(34,211,238,0.08)]">
        <div className="lp-container flex justify-between items-center flex-wrap gap-6">
          <div className="lp-logo" style={{fontSize: '18px'}}>Alumni<span className="text-[#22d3ee]">Track</span></div>
          <div className="flex gap-6 text-xs lp-mono">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/alumni" className="hover:text-white transition-colors">Alumni</Link>
            <Link href="/hasil" className="hover:text-white transition-colors">Hasil</Link>
            <Link href="/verifikasi" className="hover:text-white transition-colors">Verifikasi</Link>
          </div>
          <div className="text-xs lp-mono text-[#475569]">2026 AlumniTrack. UMM.</div>
        </div>
      </footer>
    </div>
  );
}

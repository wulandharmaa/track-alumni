"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated, signInWithEmail, signUpWithEmail } from '@/lib/authState';

export default function AuthPage() {
	const router = useRouter();
	const [ready, setReady] = useState(false);
	const [isSigningIn, setIsSigningIn] = useState(true);
	const [signInForm, setSignInForm] = useState({ email: '', password: '' });
	const [signUpForm, setSignUpForm] = useState({ name: '', email: '', password: '' });
	const [feedback, setFeedback] = useState({ type: '', message: '' });
	const [isSubmittingSignIn, setIsSubmittingSignIn] = useState(false);
	const [isSubmittingSignUp, setIsSubmittingSignUp] = useState(false);

	function resetFeedback() {
		setFeedback({ type: '', message: '' });
	}

	function toBahasaErrorMessage(rawMessage, mode = 'signin') {
		const msg = (rawMessage || '').toLowerCase();

		if (msg.includes('invalid login credentials')) return 'Email atau kata sandi tidak sesuai.';
		if (msg.includes('email not confirmed')) return 'Akun belum aktif. Hubungi admin untuk menonaktifkan verifikasi email di Supabase.';
		if (msg.includes('user already registered')) return 'Email sudah terdaftar. Silakan masuk menggunakan akun tersebut.';
		if (msg.includes('password should be at least')) return 'Kata sandi minimal 6 karakter.';
		if (msg.includes('unable to validate email address')) return 'Format email tidak valid.';
		if (msg.includes('signup is disabled')) return 'Pendaftaran akun saat ini dinonaktifkan.';
		if (msg.includes('network')) return 'Koneksi bermasalah. Periksa internet Anda lalu coba lagi.';

		if (mode === 'signup') return 'Pendaftaran gagal. Silakan coba lagi.';
		return 'Masuk gagal. Silakan coba lagi.';
	}

	function validateSignIn() {
		if (!signInForm.email.trim() || !signInForm.password.trim()) {
			setFeedback({ type: 'warning', message: 'Email dan kata sandi wajib diisi.' });
			return false;
		}

		return true;
	}

	function validateSignUp() {
		if (!signUpForm.name.trim() || !signUpForm.email.trim() || !signUpForm.password.trim()) {
			setFeedback({ type: 'warning', message: 'Nama, email, dan kata sandi wajib diisi.' });
			return false;
		}

		if (signUpForm.password.trim().length < 6) {
			setFeedback({ type: 'warning', message: 'Kata sandi minimal 6 karakter.' });
			return false;
		}

		return true;
	}

	useEffect(() => {
		let mounted = true;

		async function checkSession() {
			const loggedIn = await isAuthenticated();

			if (!mounted) return;
			if (loggedIn) {
				router.replace('/dashboard');
				return;
			}

			setReady(true);
		}

		checkSession();

		return () => {
			mounted = false;
		};
	}, [router]);

	async function handleSignInSubmit(event) {
		event.preventDefault();
		resetFeedback();

		if (!validateSignIn()) return;

		setIsSubmittingSignIn(true);

		const { error } = await signInWithEmail({
			email: signInForm.email,
			password: signInForm.password,
		});

		setIsSubmittingSignIn(false);

		if (error) {
			setFeedback({
				type: 'danger',
				message: toBahasaErrorMessage(error.message, 'signin'),
			});
			return;
		}

		setFeedback({ type: 'success', message: 'Berhasil masuk. Mengarahkan ke dashboard...' });
		router.push('/dashboard');
	}

	async function handleSignUpSubmit(event) {
		event.preventDefault();
		resetFeedback();

		if (!validateSignUp()) return;

		setIsSubmittingSignUp(true);

		const { error } = await signUpWithEmail({
			name: signUpForm.name,
			email: signUpForm.email,
			password: signUpForm.password,
		});

		if (error) {
			setIsSubmittingSignUp(false);
			setFeedback({
				type: 'danger',
				message: toBahasaErrorMessage(error.message, 'signup'),
			});
			return;
		}

		const { error: signInError } = await signInWithEmail({
			email: signUpForm.email,
			password: signUpForm.password,
		});

		setIsSubmittingSignUp(false);

		if (signInError) {
			setFeedback({
				type: 'error',
				message: 'Akun berhasil dibuat, tetapi login otomatis gagal. Silakan coba masuk manual.',
			});
			setIsSigningIn(true);
			setSignInForm({ email: signUpForm.email, password: '' });
			return;
		}

		setFeedback({ type: 'success', message: 'Pendaftaran berhasil. Anda langsung masuk ke sistem.' });
		router.push('/dashboard');
	}

	if (!ready) {
		return (
			<div className="min-h-screen flex items-center justify-center lp-mono text-sm text-[#22d3ee]">
				Menyiapkan autentikasi...
			</div>
		);
	}

	return (
		<div className="min-h-screen text-[#94a3b8] font-[family-name:var(--font-body)] relative overflow-hidden">
			<div className="lp-grid-overlay" />

			<main className="relative z-10 px-5 sm:px-8 py-10 sm:py-14">
				<div className="lp-container">
					<div className="mb-10 sm:mb-14 flex items-center justify-between gap-4 flex-wrap">
						<Link href="/" className="lp-logo text-xl">
							<div className="lp-logo-icon">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#060a14" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
							</div>
							Alumni<span>Track</span>
						</Link>
						<p className="lp-mono text-[11px] tracking-widest uppercase text-[#475569]">Akses Sistem</p>
					</div>

					<section className="grid grid-cols-1 xl:grid-cols-[1.05fr_1.25fr] gap-6 lg:gap-8 items-stretch">
						<div className="lp-glass p-7 sm:p-9 flex flex-col justify-between">
							<div>
								<div className="lp-hero-eyebrow w-fit">Authentication Gateway</div>
								<h1 className="lp-h1 text-3xl sm:text-4xl leading-tight mt-4">
									Satu Gerbang untuk <span style={{ color: 'var(--lp-accent)' }}>Sign In</span> dan <span style={{ color: 'var(--lp-accent)' }}>Sign Up</span>
								</h1>
								<p className="lp-body mt-5 max-w-md">
									Halaman ini disiapkan sebagai fondasi autentikasi. Struktur state dan alur redirect sudah siap untuk integrasi Supabase pada tahap berikutnya.
								</p>
							</div>
						</div>

						<div className="lp-glass p-7 sm:p-9">
							{feedback.message && (
								<div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
									feedback.type === 'success'
										? 'border-[rgba(52,211,153,0.2)] bg-[rgba(52,211,153,0.08)] text-[#34d399]'
										: feedback.type === 'warning'
											? 'border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)] text-amber-300'
											: 'border-[rgba(248,113,113,0.28)] bg-[rgba(248,113,113,0.08)] text-red-300'
								}`}>
									{feedback.message}
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<form onSubmit={handleSignInSubmit} onFocusCapture={() => setIsSigningIn(true)} className={`rounded-2xl border p-5 transition-all duration-300 ${isSigningIn ? 'border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.05)]' : 'border-[rgba(34,211,238,0.08)] bg-[rgba(6,10,20,0.35)]'}`}>
									<div className="flex items-center justify-between mb-4">
										<h2 className="lp-h3 text-xl">Sign In</h2>
									</div>

									<label className="block mb-4">
										<span className="lp-mono text-[11px] uppercase tracking-widest text-[#475569]">Email</span>
										<input
											type="email"
											value={signInForm.email}
											onChange={(event) => {
												setIsSigningIn(true);
												setSignInForm((prev) => ({ ...prev, email: event.target.value }));
											}}
											className="mt-2 w-full rounded-xl border border-[rgba(34,211,238,0.12)] bg-[rgba(6,10,20,0.6)] px-4 py-3 text-sm text-[#e2e8f0] outline-none focus:border-[rgba(34,211,238,0.3)]"
											placeholder="name@kampus.ac.id"
										/>
									</label>

									<label className="block mb-5">
										<span className="lp-mono text-[11px] uppercase tracking-widest text-[#475569]">Password</span>
										<input
											type="password"
											value={signInForm.password}
											onChange={(event) => {
												setIsSigningIn(true);
												setSignInForm((prev) => ({ ...prev, password: event.target.value }));
											}}
											className="mt-2 w-full rounded-xl border border-[rgba(34,211,238,0.12)] bg-[rgba(6,10,20,0.6)] px-4 py-3 text-sm text-[#e2e8f0] outline-none focus:border-[rgba(34,211,238,0.3)]"
											placeholder="••••••••"
										/>
									</label>

									<button type="submit" disabled={isSubmittingSignIn} className="lp-btn lp-btn-accent w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
										{isSubmittingSignIn ? 'Memproses...' : 'Masuk ke Dashboard'}
									</button>
								</form>

								<form onSubmit={handleSignUpSubmit} onFocusCapture={() => setIsSigningIn(false)} className={`rounded-2xl border p-5 transition-all duration-300 ${!isSigningIn ? 'border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.05)]' : 'border-[rgba(34,211,238,0.08)] bg-[rgba(6,10,20,0.35)]'}`}>
									<div className="flex items-center justify-between mb-4">
										<h2 className="lp-h3 text-xl">Sign Up</h2>
									</div>

									<label className="block mb-4">
										<span className="lp-mono text-[11px] uppercase tracking-widest text-[#475569]">Nama</span>
										<input
											type="text"
											value={signUpForm.name}
											onChange={(event) => {
												setIsSigningIn(false);
												setSignUpForm((prev) => ({ ...prev, name: event.target.value }));
											}}
											className="mt-2 w-full rounded-xl border border-[rgba(34,211,238,0.12)] bg-[rgba(6,10,20,0.6)] px-4 py-3 text-sm text-[#e2e8f0] outline-none focus:border-[rgba(34,211,238,0.3)]"
											placeholder="Nama lengkap"
										/>
									</label>

									<label className="block mb-4">
										<span className="lp-mono text-[11px] uppercase tracking-widest text-[#475569]">Email</span>
										<input
											type="email"
											value={signUpForm.email}
											onChange={(event) => {
												setIsSigningIn(false);
												setSignUpForm((prev) => ({ ...prev, email: event.target.value }));
											}}
											className="mt-2 w-full rounded-xl border border-[rgba(34,211,238,0.12)] bg-[rgba(6,10,20,0.6)] px-4 py-3 text-sm text-[#e2e8f0] outline-none focus:border-[rgba(34,211,238,0.3)]"
											placeholder="name@kampus.ac.id"
										/>
									</label>

									<label className="block mb-5">
										<span className="lp-mono text-[11px] uppercase tracking-widest text-[#475569]">Password</span>
										<input
											type="password"
											value={signUpForm.password}
											onChange={(event) => {
												setIsSigningIn(false);
												setSignUpForm((prev) => ({ ...prev, password: event.target.value }));
											}}
											className="mt-2 w-full rounded-xl border border-[rgba(34,211,238,0.12)] bg-[rgba(6,10,20,0.6)] px-4 py-3 text-sm text-[#e2e8f0] outline-none focus:border-[rgba(34,211,238,0.3)]"
											placeholder="••••••••"
										/>
									</label>

									<button type="submit" disabled={isSubmittingSignUp} className="lp-btn lp-btn-ghost w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
										{isSubmittingSignUp ? 'Memproses...' : 'Buat Akun'}
									</button>
								</form>
							</div>


						</div>
					</section>
				</div>
			</main>
		</div>
	);
}

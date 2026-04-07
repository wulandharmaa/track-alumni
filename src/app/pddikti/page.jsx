'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { searchAndSavePddikti } from '@/lib/pddiktiService';
import ScrollReveal from '@/components/ScrollReveal';

function FieldRow({ label, value }) {
	return (
		<div className="flex items-start justify-between gap-4 py-2.5 border-b border-[rgba(34,211,238,0.08)] last:border-none">
			<div className="text-[11px] text-[#475569] lp-mono uppercase tracking-widest">{label}</div>
			<div className="text-sm text-right text-[#e2e8f0] max-w-[68%] break-words">{value || '-'}</div>
		</div>
	);
}

export default function PDDIKTIPage() {
	const [alumniList, setAlumniList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchingId, setSearchingId] = useState(null);
	const [feedback, setFeedback] = useState({ type: '', message: '' });
	const [detailData, setDetailData] = useState(null);
	const [selectedAlumni, setSelectedAlumni] = useState(null);

	// Load alumni from Supabase with verification status
	async function loadAlumni() {
		try {
			const supabase = getSupabaseClient();
			const [alumniRes, detailRes] = await Promise.all([
				supabase.from('alumni').select('*').order('created_at', { ascending: false }),
				supabase.from('detail-alumni').select('nim, nama, universitas:nama_pt')
			]);

			if (alumniRes.error) throw alumniRes.error;
			if (detailRes.error) throw detailRes.error;

			const alumni = alumniRes.data || [];
			const detailAlumni = detailRes.data || [];

			// Merge verification status
			const verifiedAlumni = alumni.map(a => ({
				...a,
				verifikasi_ppdikti: isAlumniVerified(a, detailAlumni) ? 'Terverifikasi' : 'Belum Terverifikasi'
			}));

			setAlumniList(verifiedAlumni);
		} catch (err) {
			console.error('Error loading alumni:', err);
			setFeedback({ type: 'danger', message: 'Gagal memuat data alumni' });
		}
	}

	// Helper function to check verification
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

	// Load alumni on mount
	useEffect(() => {
		async function init() {
			setIsLoading(true);
			await loadAlumni();
			setIsLoading(false);
		}
		init();
	}, []);

	// Handle search PDDIKTI for specific alumni
	async function handleSearchPddikti(alumni) {
		setSearchingId(alumni.id);
		setFeedback({ type: '', message: '' });
		setDetailData(null);
		setSelectedAlumni(alumni);

		try {
			const result = await searchAndSavePddikti(alumni);
			setDetailData(result.detail);
			setFeedback({
				type: 'success',
				message: `${result.saveResult.message}. Verifikasi untuk ${alumni.nama} telah diperbarui.`,
			});

			// Refresh alumni list to update verification status
			await loadAlumni();
		} catch (err) {
			console.error('Error searching PDDIKTI:', err);
			setFeedback({
				type: 'danger',
				message: err.message || 'Terjadi kesalahan saat mencari di PDDIKTI',
			});
		} finally {
			setSearchingId(null);
		}
	}

	if (isLoading) {
		return (
			<div className="max-w-7xl mx-auto w-full pb-16 flex items-center justify-center min-h-[60vh]">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin text-[#22d3ee] mx-auto mb-4" />
					<p className="text-[#94a3b8]">Memuat data alumni...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto w-full pb-16">
			{/* Header */}
			<div className="pt-2 pb-10">
				<div className="lp-mono text-[11px] text-[#475569] tracking-widest uppercase mb-6">PDDIKTI / Verifikasi</div>
				<h1 className="lp-h1 text-3xl sm:text-4xl md:text-5xl text-white leading-[1.05] mb-4">Verifikasi Alumni PDDIKTI</h1>
				<p className="lp-body text-base max-w-3xl">
					Pilih alumni dari daftar dan klik <span className="lp-mono text-[#22d3ee]">"Cari PDDIKTI"</span> untuk melakukan verifikasi otomatis. Sistem akan mencari data di PDDIKTI dan menyimpan hasil ke database.
				</p>
			</div>

			{feedback.message && (
				<div className={`mb-8 flex items-center gap-3 p-4 rounded-xl text-sm border ${
					feedback.type === 'success'
						? 'bg-[#34d399]/10 border-[#34d399]/20 text-[#34d399]'
						: feedback.type === 'warning'
							? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
							: 'bg-red-500/8 border-red-500/25 text-red-300'
				}`}>
					{feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
					<p>{feedback.message}</p>
				</div>
			)}

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				{/* Alumni List */}
				<section className="rounded-2xl border border-[rgba(34,211,238,0.1)] bg-[rgba(6,10,20,0.55)] p-5 xl:col-span-2">
					<div className="mb-4">
						<h2 className="lp-h3 text-xl text-white mb-1">Daftar Alumni</h2>
						<p className="text-sm text-[#94a3b8]">Total: {alumniList.length} alumni</p>
					</div>

					{alumniList.length === 0 ? (
						<div className="py-8 text-center text-[#475569]">Belum ada data alumni.</div>
					) : (
						<div className="space-y-2 max-h-[600px] overflow-y-auto">
							{alumniList.map((alumni) => (
								<div
									key={alumni.id}
									className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(6,10,20,0.45)] p-3 hover:border-[rgba(34,211,238,0.2)] transition-all"
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex-1 min-w-0">
											<div className="font-semibold text-white text-sm truncate">{alumni.nama}</div>
											<div className="text-xs text-[#94a3b8] mt-1">NIM: {alumni.nim}</div>
											<div className="text-xs text-[#94a3b8]">Universitas: {alumni.universitas}</div>
											<div className="text-xs text-[#94a3b8]">Prodi: {alumni.prodi}</div>
										</div>
										<button
											onClick={() => handleSearchPddikti(alumni)}
											disabled={searchingId !== null}
											className="shrink-0 px-3 py-2 rounded-lg lp-mono text-xs font-bold flex items-center gap-1 transition-all"
											style={{
												background: searchingId === alumni.id ? 'rgba(34, 211, 238, 0.1)' : 'rgba(34, 211, 238, 0.15)',
												color: searchingId === alumni.id ? '#22d3ee' : '#22d3ee',
												opacity: searchingId !== null && searchingId !== alumni.id ? 0.5 : 1,
											}}
										>
											{searchingId === alumni.id ? (
												<><Loader2 className="w-3 h-3 animate-spin" /> Searching...</>
											) : (
												<>Cari <Search className="w-3 h-3" /></>
											)}
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</section>

				{/* Detail Result */}
				<section className="rounded-2xl border border-[rgba(34,211,238,0.1)] bg-[rgba(6,10,20,0.55)] p-5">
					<div className="mb-4">
						<h2 className="lp-h3 text-xl text-white">Detail Hasil</h2>
						<p className="text-sm text-[#94a3b8]">Data dari PDDIKTI</p>
					</div>

					{!selectedAlumni ? (
						<div className="py-8 text-center text-[#475569]">Pilih alumni untuk melihat detail.</div>
					) : (
						<>
							<div className="mb-4 pb-4 border-b border-[rgba(34,211,238,0.1)]">
								<div className="font-semibold text-white text-sm">{selectedAlumni.nama}</div>
								<div className="text-xs text-[#94a3b8] mt-2">NIM: {selectedAlumni.nim}</div>
							</div>

							{!detailData ? (
								<div className="py-8 text-center text-[#475569]">Data detail akan tampil setelah pencarian.</div>
							) : (
								<div className="space-y-1">
									<FieldRow label="Nama" value={detailData.nama} />
									<FieldRow label="NIM" value={detailData.nim} />
									<FieldRow label="Perguruan Tinggi" value={detailData.nama_pt} />
									<FieldRow label="Kode PT" value={detailData.kode_pt} />
									<FieldRow label="Program Studi" value={detailData.prodi} />
									<FieldRow label="Kode Prodi" value={detailData.kode_prodi} />
									<FieldRow label="Jenjang" value={detailData.jenjang} />
									<FieldRow label="Jenis Kelamin" value={detailData.jenis_kelamin} />
									<FieldRow label="Status Saat Ini" value={detailData.status_saat_ini} />
									<FieldRow label="Tanggal Masuk" value={detailData.tanggal_masuk} />
								</div>
							)}
						</>
					)}
				</section>
			</div>
		</div>
	);
}

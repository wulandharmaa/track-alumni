import { getSupabaseClient } from './supabaseClient';

// Use local proxy route to avoid browser CORS/redirect issues.
const PDDIKTI_PROXY_PATH = '/api/pddikti';

/**
 * Build search query from alumni data
 * Combines: nama + universitas + prodi
 */
export function buildSearchQuery(alumni) {
  return [alumni.nama, alumni.universitas, alumni.prodi]
    .filter(Boolean)
    .map(v => (v || '').trim())
    .filter(Boolean)
    .join(' ');
}

/**
 * Search PDDIKTI API with fallback
 * Tries primary first, then fallback
 */
export async function searchPddiktiAPI(query) {
  if (!query || !query.trim()) {
    throw new Error('Query kosong');
  }

  const url = `${PDDIKTI_PROXY_PATH}?query=${encodeURIComponent(query.trim())}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.success) {
    throw new Error(json?.error || `HTTP ${response.status}`);
  }

  const data = normalizeSearchResponse(json?.data);
  if (!data.length) {
    throw new Error('Data mahasiswa tidak ditemukan.');
  }

  return data;
}

/**
 * Get detail from PDDIKTI using student ID
 */
export async function getPddiktiDetail(studentId) {
  if (!studentId) {
    throw new Error('Student ID tidak valid');
  }

  const url = `${PDDIKTI_PROXY_PATH}?detailId=${encodeURIComponent(studentId)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.success) {
    throw new Error(json?.error || `HTTP ${response.status}`);
  }

  const data = normalizeDetailResponse(json?.data);
  if (!data) {
    throw new Error('Detail mahasiswa tidak ditemukan.');
  }

  return data;
}

/**
 * Normalize search API response
 */
function normalizeSearchResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.mahasiswa)) return data.mahasiswa;
  if (Array.isArray(data?.data)) return data.data;
  if (data?.success && Array.isArray(data?.data)) return data.data;
  return [];
}

/**
 * Normalize detail API response
 */
function normalizeDetailResponse(data) {
  if (data?.id && data?.nama) return data;
  if (data?.mahasiswa?.id) return data.mahasiswa;
  if (data?.data && data.data?.id) return data.data;
  return null;
}

/**
 * Save PDDIKTI detail to Supabase
 * Uses upsert to avoid duplicates based on nim
 */
export async function savePddiktiDetailToSupabase(detailData, keyword) {
  const supabase = getSupabaseClient();
  const mahasiswaId = detailData?.id || null;
  const nim = detailData?.nim || null;

  if (!mahasiswaId || !nim) {
    throw new Error('ID mahasiswa atau NIM tidak valid');
  }

  const payload = {
    mahasiswa_id: mahasiswaId,
    nama: detailData.nama || null,
    nim: nim,
    nama_pt: detailData.nama_pt || null,
    kode_pt: detailData.kode_pt || null,
    prodi: detailData.prodi || null,
    kode_prodi: detailData.kode_prodi || null,
    jenjang: detailData.jenjang || null,
    jenis_kelamin: detailData.jenis_kelamin || null,
    jenis_daftar: detailData.jenis_daftar || null,
    status_saat_ini: detailData.status_saat_ini || null,
    tanggal_masuk: detailData.tanggal_masuk || null,
    keyword_pencarian: keyword,
  };

  // Upsert by mahasiswa_id. If nim is unique in DB, this still remains idempotent for same mahasiswa.
  const { error: upsertError } = await supabase
    .from('detail-alumni')
    .upsert([payload], { onConflict: 'mahasiswa_id' });

  if (upsertError) throw upsertError;
  return { inserted: true, updated: true, message: 'Data mahasiswa berhasil disimpan/diperbarui' };
}

/**
 * Full workflow: search → get detail → save to Supabase
 */
export async function searchAndSavePddikti(alumni) {
  if (!alumni || !alumni.nim) {
    throw new Error('Data alumni tidak valid');
  }

  const query = buildSearchQuery(alumni);
  if (!query) {
    throw new Error('Tidak dapat membuat query dari alumni data');
  }

  // Step 1: Search
  const searchResults = await searchPddiktiAPI(query);
  const firstResult = searchResults[0];

  if (!firstResult || !firstResult.id) {
    throw new Error('Tidak ada hasil pencarian yang valid');
  }

  // Step 2: Get detail
  const detailData = await getPddiktiDetail(firstResult.id);

  // Step 3: Save to Supabase
  const saveResult = await savePddiktiDetailToSupabase(detailData, query);

  return {
    alumni_id: alumni.id,
    alumni_nama: alumni.nama,
    alumni_nim: alumni.nim,
    detail: detailData,
    saveResult,
  };
}

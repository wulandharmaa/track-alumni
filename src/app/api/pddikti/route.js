import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PRIMARY_BASE = 'https://pddikti.rone.dev/api';
const SECONDARY_BASE = 'https://pddikti.fastapicloud.dev/api';
const REQUEST_TIMEOUT_MS = 12000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

const rateLimitStore = new Map();

function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for') || '';
  const forwardedIp = forwardedFor.split(',')[0]?.trim();
  return forwardedIp || request.headers.get('x-real-ip') || 'unknown';
}

function applyRateLimit(key) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);
  return true;
}

function sanitizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function validateSearchQuery(query) {
  if (!query) return 'Parameter query wajib diisi.';
  if (query.length < 3) return 'Parameter query terlalu pendek. Minimal 3 karakter.';
  if (query.length > 180) return 'Parameter query terlalu panjang. Maksimal 180 karakter.';

  const allowed = /^[\p{L}\p{N}\s.,'()\-\/]+$/u;
  if (!allowed.test(query)) {
    return 'Parameter query mengandung karakter yang tidak diizinkan.';
  }

  return '';
}

function validateDetailId(detailId) {
  if (!detailId) return 'Parameter detailId wajib diisi.';
  if (detailId.length < 3 || detailId.length > 120) return 'Parameter detailId tidak valid.';

  // PDDIKTI memakai ID mirip base64/base64url, jadi karakter +, /, =, _, - harus diizinkan.
  const allowed = /^[A-Za-z0-9+/=_\-]+$/;
  if (!allowed.test(detailId)) {
    return 'Parameter detailId mengandung karakter yang tidak diizinkan.';
  }

  return '';
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readUpstreamResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    return {
      ok: false,
      status: response.status,
      error: `Respons API bukan JSON: ${text.slice(0, 120).replace(/\s+/g, ' ').trim()}`,
    };
  }

  const json = await response.json().catch(() => null);
  if (!json) {
    return {
      ok: false,
      status: response.status,
      error: 'Respons JSON tidak dapat diproses.',
    };
  }

  if (!response.ok) {
    const upstreamMessage = typeof json === 'object' && json
      ? json.error || json.message || JSON.stringify(json).slice(0, 120)
      : 'Permintaan ke API gagal.';

    return {
      ok: false,
      status: response.status,
      error: upstreamMessage,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: json,
  };
}

async function fetchFromFallbacks(pathBuilder) {
  const attempts = [PRIMARY_BASE, SECONDARY_BASE];
  const errors = [];

  for (const baseUrl of attempts) {
    try {
      const targetUrl = pathBuilder(baseUrl);
      const response = await fetchWithTimeout(targetUrl);
      const parsed = await readUpstreamResponse(response);

      if (parsed.ok) {
        return {
          ok: true,
          baseUrl,
          data: parsed.data,
        };
      }

      errors.push(`${baseUrl}: ${parsed.error}`);
    } catch (error) {
      if (error?.name === 'AbortError') {
        errors.push(`${baseUrl}: batas waktu permintaan terlampaui`);
      } else {
        errors.push(`${baseUrl}: ${error?.message || 'gagal terhubung'}`);
      }
    }
  }

  return {
    ok: false,
    error: errors[0] || 'Semua endpoint PDDIKTI gagal dihubungi.',
    details: errors,
  };
}

export async function GET(request) {
  const clientIp = getClientIp(request);
  if (!applyRateLimit(clientIp)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Terlalu banyak permintaan. Silakan coba lagi beberapa saat lagi.',
      },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('query');
  const rawName = searchParams.get('name');
  const rawUniversity = searchParams.get('university');
  const rawMajor = searchParams.get('major');
  const rawDetailId = searchParams.get('detailId');

  const detailId = sanitizeText(rawDetailId);
  if (detailId) {
    const validationError = validateDetailId(detailId);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const result = await fetchFromFallbacks((baseUrl) => `${baseUrl}/mhs/detail/${encodeURIComponent(detailId)}`);
    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: result.details,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        mode: 'detail',
        source: result.baseUrl,
        data: result.data,
      },
      { status: 200 }
    );
  }

  const searchQuery = sanitizeText(rawQuery || [rawName, rawUniversity, rawMajor].filter(Boolean).join(' '));
  const validationError = validateSearchQuery(searchQuery);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 400 });
  }

  const result = await fetchFromFallbacks((baseUrl) => `${baseUrl}/search/mhs/${encodeURIComponent(searchQuery)}`);
  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        details: result.details,
      },
      { status: 502 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      mode: 'search',
      source: result.baseUrl,
      data: result.data,
    },
    { status: 200 }
  );
}

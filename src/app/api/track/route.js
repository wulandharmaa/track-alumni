import { NextResponse } from 'next/server';
import { alumniData } from '@/data/mockDb';
import { JalankanPelacakanSatuAlumni } from '@/lib/trackingLogic';

export async function GET(request) {
  try {
    // Validasi data sumber
    if (!Array.isArray(alumniData) || alumniData.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Data alumni tidak tersedia atau kosong.'
      }, { status: 500 });
    }

    // Mencari alumni yang statusnya "Belum Dilacak" atau perlu update
    const targetAlumni = alumniData.filter(
      (a) => a.status_lacak === 'Belum Dilacak' || a.confidence_score < 0.5
    );

    if (targetAlumni.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Semua target alumni sudah dilacak atau diperbarui.' 
      });
    }

    const hasilPelacakanTarget = [];
    let berhasil = 0;
    let gagal = 0;

    for (const alumni of targetAlumni) {
      try {
        const hasil = await JalankanPelacakanSatuAlumni(alumni);

        if (hasil.error) {
          gagal++;
        } else {
          berhasil++;
        }

        hasilPelacakanTarget.push(hasil);
      } catch (error) {
        gagal++;
        hasilPelacakanTarget.push({
          alumni_id: alumni.id,
          status_baru: "Gagal diproses",
          error: error.message || 'Error tidak diketahui'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Job pelacakan selesai: ${berhasil} berhasil, ${gagal} gagal dari ${targetAlumni.length} alumni.`,
      hasil: hasilPelacakanTarget
    });
  } catch (error) {
    // Error fatal di level API
    console.error('API /api/track error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server saat menjalankan pelacakan.',
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}

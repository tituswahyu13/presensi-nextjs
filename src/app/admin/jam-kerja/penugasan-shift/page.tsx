import { prisma, prismaKep } from "@/lib/prisma";
import PenugasanShiftClient from "./PenugasanShiftClient";
import { CalendarDays } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function PenugasanShiftPage({
  searchParams
}: {
  searchParams: Promise<{ month?: string; tipe?: string }>
}) {
  const resolvedParams = await searchParams;
  
  // Parse month and year
  let year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;
  let selectedMonth = `${year}-${String(month).padStart(2, "0")}`;

  if (resolvedParams.month) {
    const parts = resolvedParams.month.split("-");
    if (parts.length === 2) {
      year = parseInt(parts[0]);
      month = parseInt(parts[1]);
      selectedMonth = resolvedParams.month;
    }
  }

  // Get all tipe jadwal
  const tipeJadwals = await prisma.tipe_jadwal.findMany({
    where: { is_deleted: false },
    orderBy: { nama_tipe: 'asc' }
  });

  const activeTipeId = resolvedParams.tipe ? parseInt(resolvedParams.tipe) : (tipeJadwals.length > 0 ? tipeJadwals[0].id : null);
  const activeTipeJadwal = activeTipeId ? tipeJadwals.find(t => t.id === activeTipeId) : null;

  // Prepare data if a tipe is selected
  let pegawais: any[] = [];
  let penugasans: any[] = [];
  let shiftRules: any[] = [];

  if (activeTipeId) {
    // Get shift rules for this tipe
    shiftRules = await prisma.jam_kerja_tipe.findMany({
      where: { 
        id_tipe_jadwal: activeTipeId,
        is_shift: true 
      },
      orderBy: { tipe_hari: 'asc' }
    });

    // Get pegawais in this tipe
    pegawais = await prismaKep.pegawai.findMany({
      where: {
        is_deleted: false,
        id_tipe_jadwal: activeTipeId
      },
      orderBy: { nama: 'asc' }
    });

    if (pegawais.length > 0) {
      const pegawaiIds = pegawais.map(p => p.id);
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      penugasans = await prisma.penugasan_shift.findMany({
        where: {
          id_pegawai: { in: pegawaiIds },
          tanggal: {
            gte: startDate,
            lte: endDate
          }
        }
      });
    }
  }

  return (
    <div className="max-w-[100vw] mx-auto overflow-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-cyan-500" />
          Penugasan Shift Bulanan
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Atur jadwal shift dinamis bulanan untuk pegawai berdasarkan Tipe Jadwal masing-masing.
        </p>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        <PenugasanShiftClient 
          tipeJadwals={tipeJadwals}
          activeTipeJadwal={activeTipeJadwal}
          pegawais={pegawais} 
          penugasans={penugasans}
          shiftRules={shiftRules}
          selectedMonth={selectedMonth} 
          year={year} 
          month={month} 
        />
      </div>
    </div>
  );
}

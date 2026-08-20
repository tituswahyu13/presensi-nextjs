import { CalendarDays } from "lucide-react";
import JadwalSumberClient from "./JadwalSumberClient";
import { getJadwalSumberData } from "@/app/actions/jadwalSumber";

export default async function JadwalSumberPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; tipe?: string }>;
}) {
  const resolvedParams = await searchParams;
  
  // Default to current month
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const selectedMonth = resolvedParams.month || defaultMonth;
  const tipeId = resolvedParams.tipe ? parseInt(resolvedParams.tipe) : undefined;

  const [yearStr, monthStr] = selectedMonth.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  const { pegawais, jadwals, tipeJadwalList, activeTipeId } = await getJadwalSumberData(year, month, tipeId);

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-cyan-500" />
            Jadwal Harian Pegawai
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Pengaturan jadwal kerja harian (shift A/B/Malam) per bulan.
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        <JadwalSumberClient 
          pegawais={pegawais} 
          jadwals={jadwals} 
          tipeJadwalList={tipeJadwalList}
          activeTipeId={activeTipeId}
          selectedMonth={selectedMonth} 
          year={year} 
          month={month} 
        />
      </div>
    </div>
  );
}

import { Clock } from "lucide-react";
import { getJamKerjaKantor } from "@/app/actions/jamKerja";
import JamKerjaKantorFormClient from "./JamKerjaKantorFormClient";

export default async function JamKerjaKantorPage() {
  const data = await getJamKerjaKantor();

  // Parse time correctly for the input (HH:mm)
  const formatTime = (dateStr: Date | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const h = date.getUTCHours().toString().padStart(2, "0");
    const m = date.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const initialData = {
    jam_masuk_senin: formatTime(data?.jam_masuk_senin || null),
    jam_pulang_senin: formatTime(data?.jam_pulang_senin || null),
    jam_masuk_selasa: formatTime(data?.jam_masuk_selasa || null),
    jam_pulang_selasa: formatTime(data?.jam_pulang_selasa || null),
    jam_masuk_rabu: formatTime(data?.jam_masuk_rabu || null),
    jam_pulang_rabu: formatTime(data?.jam_pulang_rabu || null),
    jam_masuk_kamis: formatTime(data?.jam_masuk_kamis || null),
    jam_pulang_kamis: formatTime(data?.jam_pulang_kamis || null),
    jam_masuk_jumat: formatTime(data?.jam_masuk_jumat || null),
    jam_pulang_jumat: formatTime(data?.jam_pulang_jumat || null),
    jam_masuk_sabtu: formatTime(data?.jam_masuk_sabtu || null),
    jam_pulang_sabtu: formatTime(data?.jam_pulang_sabtu || null),
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-500" />
            Jam Kerja Kantor
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Pengaturan jam masuk dan jam pulang harian untuk kantor.
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        <JamKerjaKantorFormClient initialData={initialData} />
      </div>
    </div>
  );
}

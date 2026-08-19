import { Clock } from "lucide-react";
import { getJamKerjaShift } from "@/app/actions/jamKerja";
import JamKerjaShiftFormClient from "./JamKerjaShiftFormClient";

export default async function JamKerjaShiftPage() {
  const data = await getJamKerjaShift();

  const formatTime = (dateStr: Date | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const h = date.getUTCHours().toString().padStart(2, "0");
    const m = date.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const initialData = {
    masuk_a: formatTime(data?.masuk_a || null),
    pulang_a: formatTime(data?.pulang_a || null),
    masuk_b: formatTime(data?.masuk_b || null),
    pulang_b: formatTime(data?.pulang_b || null),
    masuk_c: formatTime(data?.masuk_c || null),
    pulang_c: formatTime(data?.pulang_c || null),
    masuk_d: formatTime(data?.masuk_d || null),
    pulang_d: formatTime(data?.pulang_d || null),
    masuk_e: formatTime(data?.masuk_e || null),
    pulang_e: formatTime(data?.pulang_e || null),
    masuk_f: formatTime(data?.masuk_f || null),
    pulang_f: formatTime(data?.pulang_f || null),
    masuk_g: formatTime(data?.masuk_g || null),
    pulang_g: formatTime(data?.pulang_g || null),
    masuk_h: formatTime(data?.masuk_h || null),
    pulang_h: formatTime(data?.pulang_h || null),
    masuk_i: formatTime(data?.masuk_i || null),
    pulang_i: formatTime(data?.pulang_i || null),
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-500" />
            Jam Kerja Shift
          </h1>
          <p className="text-gray-500 mt-1">
            Pengaturan jadwal kerja untuk berbagai lokasi dan posisi.
          </p>
        </div>
      </div>

      <JamKerjaShiftFormClient initialData={initialData} />
    </div>
  );
}

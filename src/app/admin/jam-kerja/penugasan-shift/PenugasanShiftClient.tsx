"use client";

import { useState, useMemo } from "react";
import { updatePenugasanShift } from "@/app/actions/penugasanShift";
import { Save, Loader2, AlertCircle, CheckCircle2, Download, Upload, Info } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface PenugasanShiftClientProps {
  tipeJadwals: any[];
  activeTipeJadwal: any | null;
  pegawais: any[];
  penugasans: any[];
  shiftRules: any[];
  selectedMonth: string;
  year: number;
  month: number;
}

export default function PenugasanShiftClient({ 
  tipeJadwals,
  activeTipeJadwal,
  pegawais, 
  penugasans,
  shiftRules,
  selectedMonth, 
  year, 
  month 
}: PenugasanShiftClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // gridData maps id_pegawai -> day -> string code (e.g. 'P', 'S')
  const initialGrid = useMemo(() => {
    const grid: Record<number, Record<number, string>> = {};
    pegawais.forEach(p => {
      grid[p.id] = {};
      daysArray.forEach(d => {
        grid[p.id][d] = "";
      });
    });

    penugasans.forEach(j => {
      const d = new Date(j.tanggal).getUTCDate();
      if (grid[j.id_pegawai]) {
        const rule = shiftRules.find(r => r.id === j.id_jam_kerja_tipe);
        if (rule) {
          // 'Pagi' -> 'P', 'Siang' -> 'S', dll.
          grid[j.id_pegawai][d] = rule.tipe_hari.substring(0, 1).toUpperCase();
        }
      }
    });
    return grid;
  }, [pegawais, penugasans, daysArray, shiftRules]);

  const [gridData, setGridData] = useState(initialGrid);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/admin/jam-kerja/penugasan-shift?${params.toString()}`);
  };

  const handleInputChange = (pegawaiId: number, day: number, value: string) => {
    setGridData(prev => ({
      ...prev,
      [pegawaiId]: {
        ...prev[pegawaiId],
        [day]: value.toUpperCase()
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    const payload = [];
    let hasInvalidCode = false;

    for (const [pegawaiIdStr, daysObj] of Object.entries(gridData)) {
      const id_pegawai = parseInt(pegawaiIdStr);
      for (const [dayStr, code] of Object.entries(daysObj)) {
        const day = parseInt(dayStr);
        const tanggal = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00Z`;
        
        if (!code) {
          payload.push({
            id_pegawai,
            tanggal,
            id_jam_kerja_tipe: null
          });
          continue;
        }

        const rule = shiftRules.find(r => r.tipe_hari.substring(0, 1).toUpperCase() === code);
        if (rule) {
          payload.push({
            id_pegawai,
            tanggal,
            id_jam_kerja_tipe: rule.id
          });
        } else {
          hasInvalidCode = true;
        }
      }
    }

    if (hasInvalidCode) {
      setMessage({ type: 'error', text: "Ada kode shift yang tidak valid/tidak terdaftar di Tipe Jadwal ini." });
      setLoading(false);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const result = await updatePenugasanShift(payload);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Terjadi kesalahan sistem" });
    } finally {
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  // Helper to find a short label for shift
  const getShiftShortLabel = (id: number | null) => {
    if (!id) return "-";
    const rule = shiftRules.find(r => r.id === id);
    if (!rule) return "-";
    return rule.tipe_hari.substring(0, 3).toUpperCase();
  };

  return (
    <div className="flex flex-col">
      <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-card)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="font-semibold text-[var(--text-primary)]">Tipe Jadwal:</label>
            <select 
              value={activeTipeJadwal?.id || ""}
              onChange={(e) => handleFilterChange("tipe", e.target.value)}
              className="px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-cyan-500 min-w-[200px]"
            >
              <option value="">-- Pilih Tipe Jadwal --</option>
              {tipeJadwals.map(t => (
                <option key={t.id} value={t.id}>{t.nama_tipe}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="font-semibold text-[var(--text-primary)]">Pilih Bulan:</label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => handleFilterChange("month", e.target.value)}
              className="px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setMessage({type: "info", text: "Fitur Excel belum diaktifkan."})}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm"
          >
            <Download className="w-4 h-4" /> Download Excel
          </button>
        </div>
      </div>

      {message && (
        <div className={`m-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
           message.type === 'info' ? <Info className="w-5 h-5" /> : 
           <AlertCircle className="w-5 h-5" />}
          <p>{message.text}</p>
        </div>
      )}

      {!activeTipeJadwal ? (
        <div className="p-12 text-center text-[var(--text-muted)]">
          Silakan pilih Tipe Jadwal terlebih dahulu untuk melihat daftar pegawai dan mengatur shift.
        </div>
      ) : shiftRules.length === 0 ? (
        <div className="p-12 text-center text-red-500 flex flex-col items-center">
          <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
          <p className="font-medium text-lg">Tidak Ada Aturan Shift</p>
          <p className="mt-2 text-[var(--text-secondary)] max-w-md">
            Tipe Jadwal <strong>{activeTipeJadwal.nama_tipe}</strong> belum memiliki aturan shift dinamis. 
            Silakan tambahkan aturan shift di menu Master Tipe Jadwal terlebih dahulu.
          </p>
        </div>
      ) : (
        <div className="p-6 overflow-x-auto">
          <div className="mb-4 flex gap-4 flex-wrap bg-cyan-50 p-3 rounded-lg border border-cyan-100">
            <span className="font-semibold text-cyan-800 text-sm flex items-center mr-2">Opsi Shift:</span>
            {shiftRules.map(rule => (
              <div key={rule.id} className="text-sm text-cyan-800 flex items-center gap-1">
                <span className="font-bold bg-cyan-200 px-1.5 py-0.5 rounded text-xs">
                  {rule.tipe_hari.substring(0, 3).toUpperCase()}
                </span>
                = {rule.tipe_hari} ({rule.jam_masuk}-{rule.jam_pulang})
              </div>
            ))}
          </div>

          <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-700 text-white border border-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3 border border-[var(--border)] sticky left-0 bg-gray-100 z-10 w-64 min-w-[200px]">Nama Pegawai</th>
                {daysArray.map(day => (
                  <th key={day} className="px-1 py-3 border border-[var(--border)] text-center min-w-[50px] text-xs">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pegawais.map(pegawai => (
                <tr key={pegawai.id} className="hover:bg-cyan-50/50 transition-colors">
                  <td className="px-4 py-2 border border-[var(--border)] sticky left-0 bg-[var(--bg-surface)] font-medium text-[var(--text-primary)] z-10 truncate max-w-[200px]" title={pegawai.nama}>
                    {pegawai.nama}
                  </td>
                  {daysArray.map(day => (
                    <td key={day} className="p-0.5 border border-[var(--border)] text-center">
                      <input
                        type="text"
                        maxLength={1}
                        value={gridData[pegawai.id]?.[day] || ""}
                        onChange={(e) => handleInputChange(pegawai.id, day, e.target.value)}
                        className="w-full text-center p-1 text-xs uppercase border border-transparent hover:border-[var(--border)] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded bg-transparent"
                        title={gridData[pegawai.id]?.[day] ? shiftRules.find(r => r.tipe_hari.substring(0, 1).toUpperCase() === gridData[pegawai.id]?.[day])?.tipe_hari || "Tidak Valid" : ""}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              {pegawais.length === 0 && (
                <tr>
                  <td colSpan={daysInMonth + 1} className="px-6 py-8 text-center text-[var(--text-muted)]">
                    Tidak ada data pegawai untuk tipe jadwal ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTipeJadwal && shiftRules.length > 0 && (
        <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-card)] flex justify-end sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:ring-4 focus:ring-cyan-100 transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{loading ? "Menyimpan..." : "Simpan Semua Jadwal"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

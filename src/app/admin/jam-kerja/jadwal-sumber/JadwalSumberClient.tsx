"use client";

import { useState, useMemo } from "react";
import { updateJadwalSumber } from "@/app/actions/jadwalSumber";
import { Save, Loader2, AlertCircle, CheckCircle2, Download, Upload, Info } from "lucide-react";
import { useRouter } from "next/navigation";

interface JadwalSumberClientProps {
  pegawais: any[];
  jadwals: any[];
  tipeJadwalList: any[];
  activeTipeId?: number;
  selectedMonth: string;
  year: number;
  month: number;
}

export default function JadwalSumberClient({ pegawais, jadwals, tipeJadwalList, activeTipeId, selectedMonth, year, month }: JadwalSumberClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // Number of days in the month
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Initial state for form data
  const initialGrid = useMemo(() => {
    const grid: Record<number, Record<number, string>> = {};
    pegawais.forEach(p => {
      grid[p.id] = {};
      daysArray.forEach(d => {
        grid[p.id][d] = "";
      });
    });

    jadwals.forEach(j => {
      const d = new Date(j.tanggal).getUTCDate();
      if (grid[j.id_pegawai]) {
        grid[j.id_pegawai][d] = j.shift;
      }
    });
    return grid;
  }, [pegawais, jadwals, daysArray]);

  const [gridData, setGridData] = useState(initialGrid);

  const handleTipeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/admin/jam-kerja/jadwal-sumber?month=${selectedMonth}&tipe=${e.target.value}`);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(`/admin/jam-kerja/jadwal-sumber?month=${e.target.value}&tipe=${activeTipeId || ''}`);
  };

  const handleInputChange = (pegawaiId: number, day: number, value: string) => {
    setGridData(prev => ({
      ...prev,
      [pegawaiId]: {
        ...prev[pegawaiId],
        [day]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    const payload = [];
    for (const [pegawaiIdStr, daysObj] of Object.entries(gridData)) {
      const id_pegawai = parseInt(pegawaiIdStr);
      for (const [dayStr, shift] of Object.entries(daysObj)) {
        const day = parseInt(dayStr);
        // Format YYYY-MM-DD
        const tanggal = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00Z`;
        payload.push({
          id_pegawai,
          tanggal,
          shift
        });
      }
    }

    try {
      const result = await updateJadwalSumber(payload);
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

  const handleExcelClick = () => {
    setMessage({
      type: "info",
      text: "Fitur Excel (Upload/Download) saat ini sedang dinonaktifkan karena terkendala izin akses pengunduhan pustaka excel (403 Forbidden). Silakan gunakan grid manual di bawah ini untuk sementara waktu."
    });
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex flex-col">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">Pilih Bulan:</label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={handleMonthChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">Tipe Jadwal:</label>
            <select
              value={activeTipeId || ""}
              onChange={handleTipeChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
            >
              {tipeJadwalList.map(t => (
                <option key={t.id} value={t.id}>{t.nama_tipe}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleExcelClick}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm"
          >
            <Download className="w-4 h-4" /> Download Excel
          </button>
          <button 
            type="button"
            onClick={handleExcelClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
          >
            <Upload className="w-4 h-4" /> Upload Excel
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

      <div className="p-6 overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-4 py-3 border border-gray-200 sticky left-0 bg-gray-100 z-10 w-64 min-w-[200px]">Nama Pegawai</th>
              {daysArray.map(day => (
                <th key={day} className="px-2 py-3 border border-gray-200 text-center min-w-[40px]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pegawais.map(pegawai => (
              <tr key={pegawai.id} className="hover:bg-cyan-50/50 transition-colors">
                <td className="px-4 py-2 border border-gray-200 sticky left-0 bg-white font-medium text-gray-900 z-10">
                  {pegawai.nama}
                </td>
                {daysArray.map(day => (
                  <td key={day} className="p-1 border border-gray-200 text-center">
                    <input
                      type="text"
                      maxLength={1}
                      value={gridData[pegawai.id]?.[day] || ""}
                      onChange={(e) => handleInputChange(pegawai.id, day, e.target.value)}
                      className="w-full text-center p-1 uppercase border border-transparent hover:border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded"
                    />
                  </td>
                ))}
              </tr>
            ))}
            {pegawais.length === 0 && (
              <tr>
                <td colSpan={daysInMonth + 1} className="px-6 py-8 text-center text-gray-500">
                  Tidak ada data pegawai
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
    </div>
  );
}

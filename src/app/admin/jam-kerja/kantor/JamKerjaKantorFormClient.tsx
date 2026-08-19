"use client";

import { useState } from "react";
import { updateJamKerjaKantor } from "@/app/actions/jamKerja";
import { Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function JamKerjaKantorFormClient({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await updateJamKerjaKantor(formData);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Terjadi kesalahan sistem" });
    } finally {
      setLoading(false);
    }
  };

  const days = [
    { key: "senin", label: "Senin" },
    { key: "selasa", label: "Selasa" },
    { key: "rabu", label: "Rabu" },
    { key: "kamis", label: "Kamis" },
    { key: "jumat", label: "Jum'at" },
    { key: "sabtu", label: "Sabtu" },
  ];

  return (
    <form onSubmit={handleSubmit} className="p-6">
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p>{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Jam Masuk */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 border-b pb-2 mb-4">Jam Masuk</h3>
          {days.map((day) => (
            <div key={`masuk_${day.key}`} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {day.label}
              </label>
              <input
                type="time"
                name={`jam_masuk_${day.key}`}
                defaultValue={initialData[`jam_masuk_${day.key}`]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Kolom Jam Pulang */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 border-b pb-2 mb-4">Jam Pulang</h3>
          {days.map((day) => (
            <div key={`pulang_${day.key}`} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {day.label}
              </label>
              <input
                type="time"
                name={`jam_pulang_${day.key}`}
                defaultValue={initialData[`jam_pulang_${day.key}`]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:ring-4 focus:ring-cyan-100 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{loading ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>
    </form>
  );
}

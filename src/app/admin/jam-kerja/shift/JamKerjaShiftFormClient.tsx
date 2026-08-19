"use client";

import { useState } from "react";
import { updateJamKerjaShift } from "@/app/actions/jamKerja";
import { Save, Loader2, AlertCircle, CheckCircle2, MapPin, Shield } from "lucide-react";

export default function JamKerjaShiftFormClient({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await updateJamKerjaShift(formData);
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

  const sections = [
    {
      title: "SUMBER",
      icon: <MapPin className="w-5 h-5" />,
      fields: [
        { label: "Pagi", masuk: "masuk_a", pulang: "pulang_a" },
        { label: "Sore", masuk: "masuk_b", pulang: "pulang_b" },
      ],
    },
    {
      title: "TIDAR",
      icon: <MapPin className="w-5 h-5" />,
      fields: [
        { label: "Pagi", masuk: "masuk_c", pulang: "pulang_c" },
        { label: "Sore", masuk: "masuk_d", pulang: "pulang_d" },
      ],
    },
    {
      title: "KALIMAS",
      icon: <MapPin className="w-5 h-5" />,
      fields: [
        { label: "Jam Kerja", masuk: "masuk_h", pulang: "pulang_h" },
      ],
    },
    {
      title: "SRI PONGANTEN",
      icon: <MapPin className="w-5 h-5" />,
      fields: [
        { label: "Jam Kerja", masuk: "masuk_i", pulang: "pulang_i" },
      ],
    },
    {
      title: "SATPAM (Security)",
      icon: <Shield className="w-5 h-5" />,
      fields: [
        { label: "Pagi", masuk: "masuk_e", pulang: "pulang_e" },
        { label: "Sore", masuk: "masuk_f", pulang: "pulang_f" },
        { label: "Malam", masuk: "masuk_g", pulang: "pulang_g" },
      ],
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p>{message.text}</p>
        </div>
      )}

      {sections.map((section, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm text-cyan-600">
              {section.icon}
            </div>
            <h2 className="text-lg font-bold text-gray-800">{section.title}</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.fields.map((field, fIdx) => (
                <div key={fIdx} className="space-y-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <h3 className="font-semibold text-gray-700 pb-2 border-b border-gray-200">
                    Shift {field.label}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-600 mb-1">Jam Masuk</label>
                      <input
                        type="time"
                        name={field.masuk}
                        defaultValue={initialData[field.masuk]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-white"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-600 mb-1">Jam Pulang</label>
                      <input
                        type="time"
                        name={field.pulang}
                        defaultValue={initialData[field.pulang]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end sticky bottom-6 z-10 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-gray-200 shadow-sm">
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

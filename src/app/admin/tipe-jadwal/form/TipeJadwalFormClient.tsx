"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTipeJadwal, updateTipeJadwal } from "@/app/actions/tipeJadwal";
import { Save, ArrowLeft } from "lucide-react";

type TipeJadwalFormClientProps = {
  initialData: any;
  isEdit: boolean;
};

export default function TipeJadwalFormClient({ initialData, isEdit }: TipeJadwalFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    nama_tipe: initialData?.nama_tipe || "",
    jenis_konfigurasi: initialData?.jenis_konfigurasi || "Kantor",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let res;
    if (isEdit) {
      res = await updateTipeJadwal(initialData.id, formData);
    } else {
      res = await createTipeJadwal(formData);
    }

    if (res.success) {
      router.push("/admin/tipe-jadwal");
      router.refresh();
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden p-6 max-w-2xl">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">Nama Tipe Jadwal</label>
            <input 
              type="text" 
              name="nama_tipe" 
              value={formData.nama_tipe} 
              onChange={handleChange}
              required
              placeholder="Contoh: Kantor, Satpam, dsb"
              className="mt-1 w-full px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-[var(--border)]">
          <Link 
            href="/admin/tipe-jadwal"
            className="px-5 py-2.5 rounded-lg font-medium text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 transition-colors text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Batal
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="px-5 py-2.5 rounded-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createJabatan, updateJabatan } from "@/app/actions/jabatan";
import { Save, ArrowLeft } from "lucide-react";

type JabatanFormClientProps = {
  initialData: any;
  isEdit: boolean;
  listBagian: any[];
};

export default function JabatanFormClient({ initialData, isEdit, listBagian }: JabatanFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    jabatan: initialData?.jabatan || "",
    id_bagian: initialData?.id_bagian ? initialData.id_bagian.toString() : "",
    is_kepala: initialData?.is_kepala || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let res;
    if (isEdit) {
      res = await updateJabatan(initialData.id, formData);
    } else {
      res = await createJabatan(formData);
    }

    if (res.success) {
      router.push("/admin/jabatan");
      router.refresh();
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nama Jabatan</label>
            <input 
              type="text" 
              name="jabatan" 
              value={formData.jabatan} 
              onChange={handleChange}
              required
              placeholder="Cth: Manager IT, Staff Keuangan"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Divisi (Bagian)</label>
            <select
              name="id_bagian"
              value={formData.id_bagian}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white"
            >
              <option value="">-- Pilih Divisi --</option>
              {listBagian.map((b) => (
                <option key={b.id} value={b.id}>{b.bagian}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center h-5">
              <input
                id="is_kepala"
                name="is_kepala"
                type="checkbox"
                checked={formData.is_kepala}
                onChange={handleChange}
                className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="is_kepala" className="font-medium text-gray-700">Kepala Bagian / Pimpinan Divisi</label>
              <p className="text-gray-500">Centang jika jabatan ini adalah posisi tertinggi di divisi tersebut.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Link 
            href="/admin/jabatan"
            className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
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
            {loading ? "Menyimpan..." : "Simpan Data"}
          </button>
        </div>
      </form>
    </div>
  );
}

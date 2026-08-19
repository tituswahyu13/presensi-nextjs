"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBagian, updateBagian } from "@/app/actions/bagian";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";

type BagianFormClientProps = {
  initialData: any;
  isEdit: boolean;
  listBagian: any[];
  unassignedJabatans: any[];
};

export default function BagianFormClient({ initialData, isEdit, listBagian, unassignedJabatans }: BagianFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    bagian: initialData?.bagian || "",
    parent_id: initialData?.parent_id ? initialData.parent_id.toString() : "",
  });

  const [jabatanList, setJabatanList] = useState<any[]>(
    initialData?.jabatan && initialData.jabatan.length > 0
      ? initialData.jabatan
      : []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleJabatanChange = (index: number, field: string, value: any) => {
    const newList = [...jabatanList];
    newList[index][field] = value;
    setJabatanList(newList);
  };

  const addJabatan = () => {
    setJabatanList([...jabatanList, { jabatan: "", is_kepala: false }]);
  };

  const removeJabatan = (index: number) => {
    const newList = [...jabatanList];
    newList.splice(index, 1);
    setJabatanList(newList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate jabatan
    const hasEmptyJabatan = jabatanList.some(j => !j.jabatan.trim());
    if (hasEmptyJabatan) {
      setError("Semua nama jabatan harus diisi jika baris ditambahkan.");
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      jabatanList
    };

    let res;
    if (isEdit) {
      res = await updateBagian(initialData.id, payload);
    } else {
      res = await createBagian(payload);
    }

    if (res.success) {
      router.push("/admin/bagian");
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Data Divisi</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nama Bagian / Divisi</label>
            <input 
              type="text" 
              name="bagian" 
              value={formData.bagian} 
              onChange={handleChange}
              required
              placeholder="Cth: IT, HRD, Keuangan"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-gray-900 bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Induk Divisi (Opsional)</label>
            <select
              name="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white"
            >
              <option value="">-- Paling Atas (Tidak ada Induk) --</option>
              {listBagian.filter(b => b.id !== initialData?.id).map((b) => (
                <option key={b.id} value={b.id}>{b.bagian}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Pilih jika divisi ini merupakan bawahan dari divisi lain.</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Daftar Jabatan</h3>
              <p className="text-sm text-gray-500">Tambahkan atau tarik jabatan yang ada ke dalam divisi ini.</p>
            </div>
            <div className="flex items-center gap-2">
              {unassignedJabatans && unassignedJabatans.length > 0 && (
                <select 
                  onChange={(e) => {
                    if (e.target.value) {
                      const selected = unassignedJabatans.find((j: any) => j.id.toString() === e.target.value);
                      if (selected && !jabatanList.find(j => j.id === selected.id)) {
                        setJabatanList([...jabatanList, { id: selected.id, jabatan: selected.jabatan, is_kepala: selected.is_kepala || false }]);
                      }
                      e.target.value = ""; // reset
                    }
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="">-- Tarik Jabatan Tersedia --</option>
                  {unassignedJabatans.filter((uj: any) => !jabatanList.find((lj: any) => lj.id === uj.id)).map((uj: any) => (
                    <option key={uj.id} value={uj.id}>{uj.jabatan}</option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={addJabatan}
                className="px-3 py-1.5 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Buat Baru
              </button>
            </div>
          </div>

          {jabatanList.length === 0 ? (
            <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
              Belum ada jabatan. Klik tombol Tambah Jabatan di atas.
            </div>
          ) : (
            <div className="space-y-3">
              {jabatanList.map((jab, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Nama Jabatan</label>
                    <input
                      type="text"
                      value={jab.jabatan}
                      onChange={(e) => handleJabatanChange(index, "jabatan", e.target.value)}
                      placeholder="Cth: Staff Administrasi"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2 sm:pt-6">
                    <input
                      type="checkbox"
                      id={`is_kepala_${index}`}
                      checked={jab.is_kepala}
                      onChange={(e) => handleJabatanChange(index, "is_kepala", e.target.checked)}
                      className="w-4 h-4 text-cyan-600 rounded"
                    />
                    <label htmlFor={`is_kepala_${index}`} className="text-sm text-gray-700 select-none whitespace-nowrap mr-2">Kepala Bagian</label>
                    
                    <button
                      type="button"
                      onClick={() => removeJabatan(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      title="Hapus Jabatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Link 
            href="/admin/bagian"
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

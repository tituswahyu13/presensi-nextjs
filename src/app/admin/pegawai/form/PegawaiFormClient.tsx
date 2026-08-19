"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPegawai, updatePegawai } from "@/app/actions/pegawai";
import { Save, ArrowLeft } from "lucide-react";

type Bagian = { id: number; bagian: string; is_deleted: boolean };
type Jabatan = { id: number; jabatan: string | null; id_bagian: number | null; is_deleted: boolean };
type Lokasi = { id: number; nama_lokasi: string; is_deleted: boolean };
type TipeJadwal = { id: number; nama_tipe: string; is_deleted: boolean };

type PegawaiFormClientProps = {
  initialData: any;
  isEdit: boolean;
  bagians: Bagian[];
  jabatans: Jabatan[];
  lokasis: Lokasi[];
  tipeJadwals: TipeJadwal[];
};

export default function PegawaiFormClient({ initialData, isEdit, bagians, jabatans, lokasis, tipeJadwals }: PegawaiFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    nama: initialData?.nama || "",
    nik: initialData?.nik || "",
    jabatan: initialData?.jabatan || "",
    bagian: initialData?.bagian || "",
    id_bagian: initialData?.id_bagian || null,
    id_jabatan: initialData?.id_jabatan || null,
    lokasi_presensi: initialData?.lokasi_presensi || "",
    tipe_jadwal: initialData?.tipe_jadwal || "Kantor",
    id_lokasi: initialData?.id_lokasi || null,
    id_tipe_jadwal: initialData?.id_tipe_jadwal || null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBagianChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value ? parseInt(e.target.value) : null;
    const selectedBagian = bagians.find(b => b.id === selectedId);
    
    setFormData(prev => ({ 
      ...prev, 
      id_bagian: selectedId,
      bagian: selectedBagian ? selectedBagian.bagian : "",
      id_jabatan: null,
      jabatan: ""
    }));
  };

  const handleJabatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value ? parseInt(e.target.value) : null;
    const selectedJabatan = jabatans.find(j => j.id === selectedId);
    
    setFormData(prev => ({ 
      ...prev, 
      id_jabatan: selectedId,
      jabatan: selectedJabatan?.jabatan || ""
    }));
  };

  const handleLokasiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value ? parseInt(e.target.value) : null;
    const selectedLokasi = lokasis.find(l => l.id === selectedId);
    
    setFormData(prev => ({
      ...prev,
      id_lokasi: selectedId,
      lokasi_presensi: selectedLokasi ? selectedLokasi.nama_lokasi : ""
    }));
  };

  const handleTipeJadwalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value ? parseInt(e.target.value) : null;
    const selectedTipe = tipeJadwals.find(t => t.id === selectedId);
    
    setFormData(prev => ({
      ...prev,
      id_tipe_jadwal: selectedId,
      tipe_jadwal: selectedTipe ? selectedTipe.nama_tipe : ""
    }));
  };

  // Filter jabatan based on selected bagian
  const filteredJabatans = useMemo(() => {
    if (!formData.id_bagian) return jabatans.filter(j => !j.id_bagian);
    return jabatans.filter(j => j.id_bagian === formData.id_bagian || !j.id_bagian);
  }, [formData.id_bagian, jabatans]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.nik.length > 7) {
      setError("NIK tidak boleh lebih dari 7 karakter.");
      return;
    }

    setLoading(true);
    setError("");

    let res;
    if (isEdit) {
      res = await updatePegawai(initialData.id, formData);
    } else {
      res = await createPegawai(formData);
    }

    if (res.success) {
      router.push("/admin/pegawai");
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">NIK (Maks 7 Karakter)</label>
            <input 
              type="text" 
              name="nik" 
              value={formData.nik} 
              onChange={handleChange}
              required
              maxLength={7}
              placeholder="Masukkan NIK"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
            {!isEdit && (
              <p className="text-xs text-gray-500">NIK akan digunakan sebagai Username dan Password default.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input 
              type="text" 
              name="nama" 
              value={formData.nama} 
              onChange={handleChange}
              required
              placeholder="Nama Pegawai"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Bagian / Divisi</label>
            <select
              name="id_bagian"
              value={formData.id_bagian || ""}
              onChange={handleBagianChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white"
            >
              <option value="">-- Pilih Bagian / Divisi --</option>
              {bagians.map((b) => (
                <option key={b.id} value={b.id}>{b.bagian}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Jabatan</label>
            <select
              name="id_jabatan"
              value={formData.id_jabatan || ""}
              onChange={handleJabatanChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white"
            >
              <option value="">-- Pilih Jabatan --</option>
              {filteredJabatans.map((j) => (
                <option key={j.id} value={j.id}>{j.jabatan}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Lokasi Presensi</label>
            <select
              name="id_lokasi"
              value={formData.id_lokasi || ""}
              onChange={handleLokasiChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white"
            >
              <option value="">-- Pilih Lokasi --</option>
              {lokasis.map((l) => (
                <option key={l.id} value={l.id}>{l.nama_lokasi}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipe Jam Kerja / Jadwal</label>
            <select
              name="id_tipe_jadwal"
              value={formData.id_tipe_jadwal || ""}
              onChange={handleTipeJadwalChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white"
            >
              <option value="">-- Pilih Tipe Jadwal --</option>
              {tipeJadwals.map((t) => (
                <option key={t.id} value={t.id}>{t.nama_tipe}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Menentukan jenis jadwal yang digunakan oleh pegawai ini.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Link 
            href="/admin/pegawai"
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createLokasi, updateLokasi } from "@/app/actions/lokasi";
import { Save, ArrowLeft } from "lucide-react";

// Load map component dynamically to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center rounded-lg border border-[var(--border)]">Memuat Peta...</div>
});

type LokasiFormClientProps = {
  initialData: any;
  isEdit: boolean;
};

// Default center: Magelang (-7.4797, 110.2177)
const DEFAULT_LAT = -7.4797;
const DEFAULT_LNG = 110.2177;

export default function LokasiFormClient({ initialData, isEdit }: LokasiFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    nama_lokasi: initialData?.nama_lokasi || "",
    alamat_lokasi: initialData?.alamat_lokasi || "",
    latitude: initialData?.latitude || String(DEFAULT_LAT),
    longitude: initialData?.longitude || String(DEFAULT_LNG),
    radius: initialData?.radius || 50, // default radius 50 meters
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMapChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: String(lat),
      longitude: String(lng)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Convert string inputs to proper types
    const submissionData = {
      ...formData,
      radius: parseInt(String(formData.radius)) || 0,
    };

    let res;
    if (isEdit) {
      res = await updateLokasi(initialData.id, submissionData);
    } else {
      res = await createLokasi(submissionData);
    }

    if (res.success) {
      router.push("/admin/lokasi-presensi");
      router.refresh();
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  // Convert to numbers for the map component
  const latNum = parseFloat(formData.latitude) || DEFAULT_LAT;
  const lngNum = parseFloat(formData.longitude) || DEFAULT_LNG;
  const radiusNum = parseInt(String(formData.radius)) || 0;

  return (
    <div className="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">Nama Lokasi</label>
            <input 
              type="text" 
              name="nama_lokasi" 
              value={formData.nama_lokasi} 
              onChange={handleChange}
              required
              placeholder="Cth: Kantor Pusat, Cabang Utara"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">Alamat Lokasi / Nama Event</label>
            <input 
              type="text" 
              name="alamat_lokasi" 
              value={formData.alamat_lokasi} 
              onChange={handleChange}
              required
              placeholder="Alamat lengkap lokasi"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">Latitude</label>
            <input 
              type="text" 
              name="latitude" 
              value={formData.latitude} 
              onChange={handleChange}
              required
              placeholder="Latitude"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">Longitude</label>
            <input 
              type="text" 
              name="longitude" 
              value={formData.longitude} 
              onChange={handleChange}
              required
              placeholder="Longitude"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">Radius (Meter)</label>
            <input 
              type="number" 
              name="radius" 
              value={formData.radius} 
              onChange={handleChange}
              required
              min="1"
              placeholder="Cth: 50"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
            <p className="text-xs text-[var(--text-muted)]">Jarak toleransi maksimal dari titik koordinat untuk melakukan presensi.</p>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">Pilih Titik di Peta</label>
            <p className="text-xs text-[var(--text-muted)] mb-2">Klik pada peta untuk mengatur koordinat latitude dan longitude. Lingkaran biru menunjukkan radius presensi.</p>
            <MapPicker 
              position={[latNum, lngNum]} 
              radius={radiusNum} 
              onPositionChange={handleMapChange} 
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--border)]">
          <Link 
            href="/admin/lokasi-presensi" 
            className="px-6 py-2 border border-[var(--border)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors flex items-center gap-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Batal
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md flex items-center gap-2 font-medium disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {loading ? "Menyimpan..." : "Simpan Data"}
          </button>
        </div>
      </form>
    </div>
  );
}

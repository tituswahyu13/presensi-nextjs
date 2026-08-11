"use client";

import { useState, useEffect } from "react";
import { MapPin, Fingerprint, Map, ArrowRight, Loader2, FileText, Clock } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getLokasiPresensi } from "@/app/actions/lokasi";
import { getStatusPresensiHariIni } from "@/app/actions/presensi";
import { calculateDistance } from "@/lib/haversine";

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function PegawaiDashboard() {
  const [time, setTime] = useState<Date | null>(null);
  const [locationName, setLocationName] = useState<string>("Sedang mencari lokasi Anda...");
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [officeLocation, setOfficeLocation] = useState<{lat: number, lng: number, radius: number} | null>(null);
  const [statusHariIni, setStatusHariIni] = useState<{status: string, jam_masuk: string | null, jam_keluar: string | null, jam_masuk_lembur: string | null, jam_keluar_lembur: string | null} | null>(null);

  useEffect(() => {
    // Fetch Status Presensi
    getStatusPresensiHariIni().then((data) => {
      if (data) setStatusHariIni(data);
    });

    // Fetch Office Location Config
    getLokasiPresensi().then((data) => {
      if (data) {
        setOfficeLocation({
          lat: data.latitude,
          lng: data.longitude,
          radius: data.radius ?? 50
        });
      }
    });

    // Fix Leaflet icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Set initial time
    setTime(new Date());
    
    // Update time every second
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    // Get Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            setLocationCoords({ lat: latitude, lng: longitude });
            // Gunakan Nominatim (OpenStreetMap) untuk Reverse Geocoding
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.display_name) {
              // Ambil bagian terpenting dari alamat (kota/jalan)
              const parts = data.display_name.split(', ');
              const shortAddress = parts.length > 2 ? `${parts[0]}, ${parts[1]}, ${parts[2]}` : data.display_name;
              setLocationName(shortAddress);
            } else {
              setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } catch (error) {
            setLocationName("Lokasi ditemukan (Gagal memuat nama jalan)");
          }
        },
        (error) => {
          setLocationName("Akses lokasi tidak diizinkan");
        }
      );
    } else {
      setLocationName("GPS tidak didukung di perangkat ini");
    }

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).replace(/\./g, ':');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Clock Card (HIG Style) */}
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
        <p className="text-gray-500 text-[13px] font-medium mb-1 uppercase tracking-wider">
          {time ? formatDate(time) : "Memuat..."}
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-black mb-2 font-mono">
          {time ? formatTime(time).split(":")[0] : "--"}
          <span className="opacity-50">:</span>
          {time ? formatTime(time).split(":")[1] : "--"}
        </h1>
        <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500 mb-6">
          <MapPin size={14} className="text-gray-400" />
          <span className="truncate max-w-[250px]">{locationName}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/pegawai/riwayat" className="bg-gray-50 p-4 rounded-xl flex items-center justify-between shadow-sm active:scale-95 transition-transform border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-[#007AFF]/10 p-2 rounded-lg text-[#007AFF]">
                <Map size={20} />
              </div>
              <span className="font-medium text-[14px] text-gray-800">Riwayat</span>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </Link>

          <Link href="/pegawai/pengajuan" className="bg-gray-50 p-4 rounded-xl flex items-center justify-between shadow-sm active:scale-95 transition-transform border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-[#34C759]/10 p-2 rounded-lg text-[#34C759]">
                <FileText size={20} />
              </div>
              <span className="font-medium text-[14px] text-gray-800">Ijin/Cuti</span>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Action Buttons (Smart) */}
      <div className="mb-6">
        {statusHariIni === null ? (
          <div className="flex justify-center py-6">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : statusHariIni.status === "Lembur Selesai" ? (
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center shadow-sm border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759] mb-1">
              <i className="fas fa-check text-2xl"></i>
            </div>
            <h3 className="font-semibold text-black text-[17px]">Semua Selesai</h3>
            <p className="text-[13px] text-gray-500">Terima kasih atas kerja ekstra Anda hari ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {statusHariIni.status === "Belum Presensi" && (
              <Link href="/pegawai/presensi?type=masuk" className="bg-[#007AFF] hover:bg-[#006ee6] active:bg-[#005bb5] transition-colors rounded-[14px] p-4 flex items-center justify-center gap-2 text-white shadow-sm">
                <Fingerprint size={22} />
                <span className="font-semibold text-[17px]">Presensi Masuk</span>
              </Link>
            )}

            {statusHariIni.status === "Sedang Bekerja" && (
              <Link href="/pegawai/presensi?type=keluar" className="bg-[#34C759] hover:bg-[#2eb350] active:bg-[#289e47] transition-colors rounded-[14px] p-4 flex items-center justify-center gap-2 text-white shadow-sm">
                <LogOutIcon size={22} />
                <span className="font-semibold text-[17px]">Presensi Keluar</span>
              </Link>
            )}

            {statusHariIni.status === "Pekerjaan Selesai" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center shadow-sm border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759] mb-1">
                    <i className="fas fa-check text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-black text-[17px]">Pekerjaan Selesai</h3>
                  <p className="text-[13px] text-gray-500">Anda dapat memulai lembur jika ada jadwal.</p>
                </div>
                <Link href="/pegawai/presensi?type=masuk_lembur" className="bg-[#FF9500] hover:bg-[#e68600] active:bg-[#cc7700] transition-colors rounded-[14px] p-4 flex items-center justify-center gap-2 text-white shadow-sm">
                  <Clock size={22} />
                  <span className="font-semibold text-[17px]">Mulai Lembur</span>
                </Link>
              </div>
            )}

            {statusHariIni.status === "Sedang Lembur" && (
              <Link href="/pegawai/presensi?type=keluar_lembur" className="bg-[#FF3B30] hover:bg-[#e6352b] active:bg-[#cc2f26] transition-colors rounded-[14px] p-4 flex items-center justify-center gap-2 text-white shadow-sm">
                <LogOutIcon size={22} />
                <span className="font-semibold text-[17px]">Selesai Lembur</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-black text-[15px] flex items-center gap-2">
            <MapPin size={18} className="text-[#007AFF]" /> Lokasi Anda
          </h3>
          {locationCoords && officeLocation && (() => {
            const distance = Math.round(calculateDistance(locationCoords.lat, locationCoords.lng, officeLocation.lat, officeLocation.lng));
            const isInside = distance <= officeLocation.radius;
            return (
              <span className={`text-[11px] font-semibold px-2 py-1 rounded-md flex items-center gap-1 ${
                isInside ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'
              }`}>
                {isInside ? (
                  <>Area Valid ({distance}m)</>
                ) : (
                  <>Di Luar Area ({distance}m)</>
                )}
              </span>
            );
          })()}
        </div>
        <div className="h-40 bg-gray-100 rounded-xl overflow-hidden relative z-0">
          {locationCoords && typeof window !== 'undefined' ? (
            <MapComponent 
              locationCoords={locationCoords} 
              officeLocation={officeLocation}
              radiusColor={officeLocation && calculateDistance(locationCoords.lat, locationCoords.lng, officeLocation.lat, officeLocation.lng) <= officeLocation.radius ? '#34C759' : '#FF3B30'}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-xs font-medium">Memuat peta...</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Today */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-black text-[15px]">Aktivitas Hari Ini</h3>
          <span className={`px-2 py-1 rounded-md text-[11px] font-semibold ${
            statusHariIni?.status === "Belum Presensi" ? "bg-gray-100 text-gray-600" :
            statusHariIni?.status === "Sedang Bekerja" ? "bg-[#007AFF]/10 text-[#007AFF]" :
            "bg-[#34C759]/10 text-[#34C759]"
          }`}>
            {statusHariIni?.status || "Memuat..."}
          </span>
        </div>
        
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-200">
          <div className="relative flex items-center gap-4 group">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white z-10 shrink-0 ${statusHariIni?.jam_masuk ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'bg-gray-100 text-gray-400'}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${statusHariIni?.jam_masuk ? 'bg-[#007AFF]' : 'bg-gray-300'}`}></span>
            </div>
            <div className="flex-1 py-1">
              <p className="text-[13px] text-gray-500 mb-0.5">Presensi Masuk</p>
              <h4 className={`text-[17px] font-semibold ${statusHariIni?.jam_masuk ? 'text-black' : 'text-gray-400'}`}>
                {statusHariIni?.jam_masuk || "--:--"}
              </h4>
            </div>
          </div>

          <div className="relative flex items-center gap-4 group">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white z-10 shrink-0 ${statusHariIni?.jam_keluar ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-gray-100 text-gray-400'}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${statusHariIni?.jam_keluar ? 'bg-[#34C759]' : 'bg-gray-300'}`}></span>
            </div>
            <div className="flex-1 py-1">
              <p className="text-[13px] text-gray-500 mb-0.5">Presensi Keluar</p>
              <h4 className={`text-[17px] font-semibold ${statusHariIni?.jam_keluar ? 'text-black' : 'text-gray-400'}`}>
                {statusHariIni?.jam_keluar || "--:--"}
              </h4>
            </div>
          </div>

          {(statusHariIni?.jam_masuk_lembur || statusHariIni?.status === "Pekerjaan Selesai" || statusHariIni?.status === "Sedang Lembur" || statusHariIni?.status === "Lembur Selesai") && (
            <>
              <div className="relative flex items-center gap-4 group">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white z-10 shrink-0 ${statusHariIni?.jam_masuk_lembur ? 'bg-[#FF9500]/10 text-[#FF9500]' : 'bg-gray-100 text-gray-400'}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${statusHariIni?.jam_masuk_lembur ? 'bg-[#FF9500]' : 'bg-gray-300'}`}></span>
                </div>
                <div className="flex-1 py-1">
                  <p className="text-[13px] text-gray-500 mb-0.5">Mulai Lembur</p>
                  <h4 className={`text-[17px] font-semibold ${statusHariIni?.jam_masuk_lembur ? 'text-black' : 'text-gray-400'}`}>
                    {statusHariIni?.jam_masuk_lembur || "--:--"}
                  </h4>
                </div>
              </div>

              <div className="relative flex items-center gap-4 group">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white z-10 shrink-0 ${statusHariIni?.jam_keluar_lembur ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'bg-gray-100 text-gray-400'}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${statusHariIni?.jam_keluar_lembur ? 'bg-[#FF3B30]' : 'bg-gray-300'}`}></span>
                </div>
                <div className="flex-1 py-1">
                  <p className="text-[13px] text-gray-500 mb-0.5">Selesai Lembur</p>
                  <h4 className={`text-[17px] font-semibold ${statusHariIni?.jam_keluar_lembur ? 'text-black' : 'text-gray-400'}`}>
                    {statusHariIni?.jam_keluar_lembur || "--:--"}
                  </h4>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

// Custom icon since we don't have LogOut icon imported at top
function LogOutIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { MapPin, Camera, X, Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';

import { getLokasiPresensi } from "@/app/actions/lokasi";
import { calculateDistance } from "@/lib/haversine";

// Leaflet components (dynamically imported to avoid SSR issues)
const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

import 'leaflet/dist/leaflet.css';
// Leaflet default icon fix
import L from 'leaflet';

export default function PresensiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [type, setType] = useState<"masuk" | "keluar" | "masuk_lembur" | "keluar_lembur">("masuk");

  useEffect(() => {
    const t = searchParams.get("type");
    if (t === "masuk" || t === "keluar" || t === "masuk_lembur" || t === "keluar_lembur") {
      setType(t);
    }
  }, [searchParams]);

  const isMasuk = type === "masuk" || type === "masuk_lembur";
  const isLembur = type === "masuk_lembur" || type === "keluar_lembur";

  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [officeLocation, setOfficeLocation] = useState<{lat: number, lng: number, radius: number} | null>(null);

  useEffect(() => {
    // Fetch Office Location
    getLokasiPresensi().then((data) => {
      if (data) {
        setOfficeLocation({
          lat: data.latitude,
          lng: data.longitude,
          radius: data.radius
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

    // Start GPS
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Deteksi Fake GPS sederhana (Akurasi sempurna bulat yang tidak wajar)
          // atau sinyal sangat buruk (> 100 meter)
          if (accuracy <= 1.0) {
            setErrorMsg(`Akurasi GPS mencurigakan (${accuracy}m). Harap matikan aplikasi Fake GPS atau matikan mode pengembang Mock Location.`);
            setLoading(false);
            return;
          }
          
          if (accuracy > 100) {
            setErrorMsg(`Sinyal GPS terlalu lemah/tidak akurat (${Math.round(accuracy)}m). Harap pindah ke area terbuka.`);
            setLoading(false);
            return;
          }

          setLocation({
            lat: latitude,
            lng: longitude
          });
          setLoading(false);
        },
        (error) => {
          setErrorMsg("Gagal mendapatkan lokasi GPS. Pastikan izin lokasi diberikan.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setErrorMsg("Browser Anda tidak mendukung Geolocation.");
      setLoading(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setErrorMsg("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Mirror the image
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setCapturedImage(canvas.toDataURL("image/jpeg", 0.8));
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const handleSubmit = async () => {
    if (!location || !capturedImage) return;
    
    setSubmitting(true);
    setErrorMsg("");
    
    try {
      const res = await fetch('/api/absen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isMasuk ? "masuk" : "keluar",
          isLembur: isLembur,
          latitude: location.lat,
          longitude: location.lng,
          image_base64: capturedImage
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan presensi");
      }

      alert(data.message);
      router.push("/pegawai");
    } catch (err: any) {
      setErrorMsg(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-6 font-sans">
      {/* Header (HIG) */}
      <header className="px-5 py-3 flex items-center justify-between bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <Link href="/pegawai" className="text-[#007AFF] flex items-center gap-1 font-medium hover:opacity-80">
          <ArrowLeft size={22} strokeWidth={2.5} />
          <span>Kembali</span>
        </Link>
        <h1 className="text-[17px] font-semibold text-black absolute left-1/2 -translate-x-1/2">
          Presensi {isMasuk ? "Masuk" : "Keluar"} {isLembur ? "Lembur" : ""}
        </h1>
        <div className="w-16"></div> {/* Spacer for centering */}
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full space-y-6">
        
        {errorMsg && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl border border-red-100 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Camera Section */}
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <div className="aspect-[3/4] bg-black rounded-[14px] overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${capturedImage ? 'hidden' : 'block'}`}
            />
            
            {capturedImage && (
              <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
            )}
            
            {/* Camera Overlay */}
            {!capturedImage && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[50%] border border-white/40 rounded-[100px] shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]"></div>
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-center">
            {!capturedImage ? (
              <button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white border-[4px] border-gray-300 ring-4 ring-offset-2 ring-gray-100 flex items-center justify-center active:scale-95 transition-transform"
              ></button>
            ) : (
              <div className="flex gap-3 w-full">
                <button
                  onClick={retakePhoto}
                  disabled={submitting}
                  className="flex-1 py-3.5 px-4 bg-gray-100 text-black font-semibold rounded-[14px] flex items-center justify-center gap-2 active:bg-gray-200"
                >
                  <X size={20} /> Ulangi
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !location}
                  className={`flex-1 py-3.5 px-4 font-semibold rounded-[14px] flex items-center justify-center gap-2 text-white transition-colors disabled:opacity-50 ${isMasuk ? 'bg-[#007AFF] hover:bg-[#006ee6] active:bg-[#005bb5]' : 'bg-[#34C759] hover:bg-[#2eb350] active:bg-[#289e47]'}`}
                >
                  {submitting ? <Loader2 size={20} className="animate-spin" /> : <><Check size={20} /> Kirim Presensi</>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${isMasuk ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'bg-[#34C759]/10 text-[#34C759]'}`}>
                <MapPin size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-black text-[15px]">Lokasi Anda</h3>
                <p className="text-[11px] text-gray-500">Sistem memverifikasi lokasi secara otomatis</p>
              </div>
            </div>
            {location && officeLocation && (() => {
              const distance = Math.round(calculateDistance(location.lat, location.lng, officeLocation.lat, officeLocation.lng));
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
          
          <div className="h-40 bg-gray-100 rounded-[14px] overflow-hidden relative z-0">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-xs font-medium">Mencari sinyal GPS...</span>
              </div>
            ) : location && officeLocation && typeof window !== 'undefined' ? (
              <MapComponent 
                locationCoords={{ lat: location.lat, lng: location.lng }}
                officeLocation={officeLocation}
                radiusColor={calculateDistance(location.lat, location.lng, officeLocation.lat, officeLocation.lng) <= officeLocation.radius ? '#34C759' : '#FF3B30'}
                showPopup={true}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-xs font-medium">Memuat peta...</span>
              </div>
            )}
          </div>
        </div>
        
      </main>
    </div>
  );
}

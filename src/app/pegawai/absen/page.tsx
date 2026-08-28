"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { MapPin, Camera, X, Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';

// Leaflet components (dynamically imported to avoid SSR issues)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

import 'leaflet/dist/leaflet.css';
// Leaflet default icon fix
import L from 'leaflet';

function AbsenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const type = searchParams.get('type') || 'masuk';
  const isMasuk = type === 'masuk';

  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Hardcoded office location for demo (will be fetched from API in full implementation)
  const OFFICE_LOC = {
    lat: -7.0, // Replace with actual latitude
    lng: 110.0, // Replace with actual longitude
    radius: 50 // meters
  };

  useEffect(() => {
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
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
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
          type: type,
          latitude: location.lat,
          longitude: location.lng,
          image_base64: capturedImage
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan absensi");
      }

      alert(data.message);
      router.push("/pegawai");
    } catch (err: any) {
      setErrorMsg(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-6">
      {/* Header */}
      <header className={`px-6 py-4 flex items-center gap-4 text-white rounded-b-3xl shadow-md ${isMasuk ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`}>
        <Link href="/pegawai" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-lg font-bold">Absen {isMasuk ? 'Masuk' : 'Keluar'}</h1>
          <p className="text-xs text-white/80">Ambil foto di area kantor</p>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full space-y-6">
        
        {errorMsg && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl border border-red-100 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Camera Section */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden relative shadow-inner">
            {!capturedImage ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
            )}
            
            {/* Camera Overlay */}
            {!capturedImage && (
              <div className="absolute inset-0 pointer-events-none border-[4px] border-white/20 rounded-2xl m-4">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-dashed border-white/50 rounded-[4rem]"></div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            {!capturedImage ? (
              <button
                onClick={capturePhoto}
                className={`w-16 h-16 rounded-full border-4 border-gray-100 flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isMasuk ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
              >
                <Camera size={28} />
              </button>
            ) : (
              <div className="flex gap-4 w-full">
                <button
                  onClick={retakePhoto}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 bg-gray-100 text-[var(--text-primary)] font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <X size={18} /> Ulangi
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !location}
                  className={`flex-1 py-3 px-4 font-bold rounded-xl flex items-center justify-center gap-2 text-white shadow-md transition-all ${isMasuk ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'} disabled:opacity-50`}
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Kirim Absen</>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-lg ${isMasuk ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
              <MapPin size={16} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm">Lokasi Anda</h3>
              <p className="text-[10px] text-[var(--text-muted)]">Pastikan berada dalam zona hijau</p>
            </div>
          </div>
          
          <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden relative z-0">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-xs font-medium">Mencari sinyal GPS...</span>
              </div>
            ) : location && typeof window !== 'undefined' ? (
              <MapContainer 
                center={[location.lat, location.lng]} 
                zoom={16} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[location.lat, location.lng]}>
                  <Popup>Lokasi Anda saat ini</Popup>
                </Marker>
                {/* Simulated Office Zone */}
                <Circle 
                  center={[location.lat + 0.0005, location.lng]} // Just for demo, slightly offset
                  pathOptions={{ color: isMasuk ? '#10b981' : '#f43f5e', fillColor: isMasuk ? '#10b981' : '#f43f5e', fillOpacity: 0.2 }}
                  radius={OFFICE_LOC.radius}
                />
              </MapContainer>
            ) : null}
          </div>
        </div>
        
      </main>
    </div>
  );
}

export default function AbsenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    }>
      <AbsenContent />
    </Suspense>
  );
}

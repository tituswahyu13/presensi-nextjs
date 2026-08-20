"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, MapPin, Loader2, Check, RefreshCcw, X } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';
import * as faceapi from '@vladmandic/face-api';

function getEAR(eye: {x: number, y: number}[]) {
  const v1 = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
  const v2 = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
  const h = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
  if (h === 0) return 0;
  return (v1 + v2) / (2.0 * h);
}

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
  const [selectedShift, setSelectedShift] = useState<string>("");

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [hasBlinked, setHasBlinked] = useState(false);
  const hasBlinkedRef = useRef(false);
  const earHistory = useRef<number[]>([]);
  const [faceWarningMsg, setFaceWarningMsg] = useState("Memuat model AI...");

  const role = session?.user?.role || "";
  let shiftOptions: { label: string, value: string }[] = [];
  if (role === "sumber") {
    shiftOptions = [{ label: "Pagi", value: "A" }, { label: "Sore", value: "B" }];
  } else if (role === "tidar") {
    shiftOptions = [{ label: "Pagi", value: "C" }, { label: "Sore", value: "D" }];
  } else if (role === "satpam") {
    shiftOptions = [{ label: "Pagi", value: "E" }, { label: "Sore", value: "F" }, { label: "Malam", value: "G" }];
  } else if (role === "kalimas") {
    shiftOptions = [{ label: "Masuk", value: "H" }];
  } else if (role === "sri_ponganten") {
    shiftOptions = [{ label: "Masuk", value: "I" }];
  }

  // Set default shift if options exist
  useEffect(() => {
    if (shiftOptions.length > 0 && !selectedShift) {
      setSelectedShift(shiftOptions[0].value);
    }
  }, [role, selectedShift]);

  const [officeLocation, setOfficeLocation] = useState<{lat: number, lng: number, radius: number} | null>(null);

  useEffect(() => {
    // Load face-api models
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
        setIsModelLoaded(true);
        setFaceWarningMsg("Mendeteksi wajah...");
      } catch (e) {
        console.error("Gagal memuat model face-api", e);
        setFaceWarningMsg("Gagal memuat model AI");
      }
    };
    loadModels();

    // Fetch Office Location
    getLokasiPresensi().then((data) => {
      if (data) {
        setOfficeLocation({
          lat: parseFloat(data.latitude || "0"),
          lng: parseFloat(data.longitude || "0"),
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

  const handleVideoPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    const runDetection = async () => {
      if (video.paused || video.ended || capturedImage) return;

      if (isModelLoaded && video.videoWidth > 0) {
        try {
          const detection = await faceapi.detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
          ).withFaceLandmarks(true);

          if (detection) {
            const { width, height, x, y } = detection.detection.box;
            const { videoWidth, videoHeight } = video;
            
            const faceCenterX = x + width / 2;
            const faceCenterY = y + height / 2;
            
            const vidCenterX = videoWidth / 2;
            const vidCenterY = videoHeight / 2;
            
            const isCenteredX = Math.abs(faceCenterX - vidCenterX) < (videoWidth * 0.10);
            const isCenteredY = Math.abs(faceCenterY - vidCenterY) < (videoHeight * 0.10);
            
            const minDim = Math.min(videoWidth, videoHeight);
            const faceSizeRatio = Math.max(width, height) / minDim;
            const isTooFar = faceSizeRatio < 0.25;
            const isTooClose = faceSizeRatio > 0.55;
            const isGoodSize = !isTooFar && !isTooClose;

            if (isCenteredX && isCenteredY && isGoodSize) {
              setIsFaceAligned(true);
              
              if (!hasBlinkedRef.current) {
                setFaceWarningMsg("Wajah pas! Mohon kedipkan mata untuk verifikasi.");
                
                const landmarks = detection.landmarks;
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();
                
                const leftEAR = getEAR(leftEye);
                const rightEAR = getEAR(rightEye);
                const avgEAR = (leftEAR + rightEAR) / 2.0;
                
                earHistory.current.push(avgEAR);
                if (earHistory.current.length > 20) earHistory.current.shift();
                
                const minEAR = Math.min(...earHistory.current);
                const lastEAR = earHistory.current[earHistory.current.length - 1];
                
                // Blink logic: drop below 0.26 and rise back above 0.28
                if (minEAR <= 0.26 && lastEAR >= 0.28 && earHistory.current.length > 3) {
                  setHasBlinked(true);
                  hasBlinkedRef.current = true;
                  setFaceWarningMsg("Liveness OK! Memotret otomatis dalam 1 detik...");
                }
              } else {
                setFaceWarningMsg("Liveness OK! Memotret otomatis dalam 1 detik...");
              }
            } else {
              setIsFaceAligned(false);
              setHasBlinked(false);
              hasBlinkedRef.current = false;
              earHistory.current = [];
              
              if (isTooFar) setFaceWarningMsg("Mendekat ke layar");
              else if (isTooClose) setFaceWarningMsg("Mundur sedikit, terlalu dekat");
              else setFaceWarningMsg("Posisikan wajah tepat di tengah oval");
            }
          } else {
            setIsFaceAligned(false);
            setHasBlinked(false);
            hasBlinkedRef.current = false;
            earHistory.current = [];
            setFaceWarningMsg("Wajah tidak terdeteksi");
          }
        } catch (error) {
          console.error("Face detection error:", error);
        }
      }
      
      // Call requestAnimationFrame directly to maximize FPS for blink detection
      requestAnimationFrame(runDetection);
    };

    runDetection();
  };

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
      const video = videoRef.current;
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;
      const vAspect = vWidth / vHeight;
      const containerAspect = 3 / 4;
      
      let sx = 0, sy = 0, sWidth = vWidth, sHeight = vHeight;
      
      if (vAspect > containerAspect) {
        // Video is wider, potong kiri & kanan
        sWidth = vHeight * containerAspect;
        sx = (vWidth - sWidth) / 2;
      } else {
        // Video is taller, potong atas & bawah
        sHeight = vWidth / containerAspect;
        sy = (vHeight - sHeight) / 2;
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = sWidth;
      canvas.height = sHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        setCapturedImage(canvas.toDataURL("image/jpeg", 0.8));
      }
    }
  };

  useEffect(() => {
    if (hasBlinked && !capturedImage) {
      const timer = setTimeout(() => {
        capturePhoto();
      }, 1000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBlinked, capturedImage]);

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
          image_base64: capturedImage,
          shift: selectedShift || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan presensi");
      }

      setSuccessMsg(data.message);
      setShowSuccessPopup(true);
      
      setTimeout(() => {
        router.push("/pegawai");
      }, 2000);
      
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

        {/* Shift Selection Section */}
        {isMasuk && shiftOptions.length > 0 && (
          <div className="bg-white p-4 rounded-2xl shadow-sm space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Pilih Shift Anda
            </label>
            <div className="relative">
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="block w-full appearance-none bg-[#F2F2F7] border-0 rounded-[14px] px-4 py-3.5 text-black font-semibold focus:ring-2 focus:ring-[#007AFF] outline-none"
              >
                {shiftOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Shift {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--text-muted)]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
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
              onPlay={handleVideoPlay}
              className={`w-full h-full object-cover transform -scale-x-100 ${capturedImage ? 'hidden' : 'block'}`}
            />
            
            {capturedImage && (
              <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
            )}
            
            {/* Camera Overlay */}
            {!capturedImage && (
              <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[50%] border-4 rounded-[100px] shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] transition-colors duration-300 ${isFaceAligned && hasBlinked ? 'border-green-500' : isFaceAligned ? 'border-yellow-400' : 'border-red-500/70'}`}></div>
                {faceWarningMsg && (
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                      {faceWarningMsg}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-center">
            {!capturedImage ? (
              <button
                  onClick={capturePhoto}
                  disabled={!isFaceAligned || !hasBlinked}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    isFaceAligned && hasBlinked 
                      ? "bg-white scale-100 hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                      : "bg-gray-400 scale-90 cursor-not-allowed opacity-50"}`}
              >
                  <div className={`w-16 h-16 rounded-full border-[3px] ${isFaceAligned && hasBlinked ? 'border-[#007AFF]' : 'border-gray-500'}`}></div>
              </button>
            ) : (
              <div className="flex gap-3 w-full">
                <button
                  onClick={retakePhoto}
                  disabled={submitting}
                  className="flex-1 py-3.5 px-4 bg-gray-100 text-black font-semibold rounded-[14px] flex items-center justify-center gap-2 active:bg-slate-600"
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
                <p className="text-[11px] text-[var(--text-muted)]">Sistem memverifikasi lokasi secara otomatis</p>
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

      {/* Success Popup Overlay */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center max-w-[80%] shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-5">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2 text-center">Berhasil!</h2>
            <p className="text-[var(--text-muted)] text-center text-sm font-medium leading-relaxed">
              {successMsg}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

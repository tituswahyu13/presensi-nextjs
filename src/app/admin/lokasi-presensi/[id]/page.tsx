import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowLeft, Building2, CircleDot } from "lucide-react";
import MapViewerClient from "./MapViewerClient";

export default async function DetailLokasiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  
  if (isNaN(id)) {
    notFound();
  }

  const lokasi = await prisma.lokasi_presensi.findUnique({
    where: { id, is_deleted: false },
  });

  if (!lokasi) {
    notFound();
  }

  const latNum = parseFloat(lokasi.latitude || "0");
  const lngNum = parseFloat(lokasi.longitude || "0");
  const radiusNum = lokasi.radius || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/admin/lokasi-presensi"
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Detail Lokasi Presensi</h1>
          <p className="text-[var(--text-muted)] mt-1">Informasi lengkap tentang titik lokasi absensi.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-1 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Nama Lokasi
              </h3>
              <p className="text-lg font-semibold text-[var(--text-primary)]">{lokasi.nama_lokasi}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Alamat Lokasi / Event
              </h3>
              <p className="text-base text-[var(--text-primary)]">{lokasi.alamat_lokasi || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-600" /> Koordinat (Latitude, Longitude)
              </h3>
              <p className="text-base text-[var(--text-primary)] font-mono bg-[var(--bg-card)] p-2 rounded inline-block border border-[var(--border)]">
                {lokasi.latitude}, {lokasi.longitude}
              </p>
              <div className="mt-2">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${lokasi.latitude},${lokasi.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-600 hover:underline"
                >
                  Buka di Google Maps ↗
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-1 flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-blue-500" /> Radius Jangkauan
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold border border-blue-100">
                  {lokasi.radius} meter
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Pegawai harus berada dalam radius ini dari titik pusat untuk dapat melakukan presensi.
              </p>
            </div>
            
            <div className="pt-6 border-t border-[var(--border)]">
              <Link 
                href={`/admin/lokasi-presensi/form?id=${lokasi.id}`}
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors shadow-sm"
              >
                Edit Lokasi Ini
              </Link>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-xl p-2 border border-[var(--border)] h-[450px]">
            <MapViewerClient position={[latNum, lngNum]} radius={radiusNum} />
          </div>
        </div>
      </div>
    </div>
  );
}

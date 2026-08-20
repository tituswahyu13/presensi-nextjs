import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import DeleteButton from "./DeleteButton";
import SearchBar from "@/components/SearchBar";

export const dynamic = 'force-dynamic';

export default async function AdminLokasiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";

  const lokasis = await prisma.lokasi_presensi.findMany({
    where: {
      is_deleted: false,
      ...(q ? {
        OR: [
          { nama_lokasi: { contains: q } },
          { alamat_lokasi: { contains: q } }
        ]
      } : {})
    },
    orderBy: { nama_lokasi: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-surface)] p-6 rounded-xl shadow-sm border border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-600" />
            Data Lokasi Presensi
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Kelola data titik koordinat dan radius absensi.</p>
        </div>
        <Link 
          href="/admin/lokasi-presensi/form" 
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md font-medium"
        >
          <Plus className="w-5 h-5" /> Tambah Lokasi
        </Link>
      </div>

      <div className="bg-[var(--bg-surface)] p-6 rounded-xl shadow-sm border border-[var(--border)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Daftar Lokasi Presensi</h2>
          <SearchBar placeholder="Cari lokasi presensi..." />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-card)] border-b border-[var(--border)]">
                <th className="py-3 px-4 text-sm font-semibold text-[var(--text-secondary)] w-16 text-center">No</th>
                <th className="py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">Nama Lokasi</th>
                <th className="py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">Alamat Lokasi</th>
                <th className="py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">Koordinat (Lat / Long)</th>
                <th className="py-3 px-4 text-sm font-semibold text-[var(--text-secondary)] text-center">Radius</th>
                <th className="py-3 px-4 text-sm font-semibold text-[var(--text-secondary)] text-center w-48">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lokasis.length > 0 ? (
                lokasis.map((lokasi, index) => (
                  <tr key={lokasi.id} className="hover:bg-[var(--bg-card)]/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-[var(--text-secondary)] text-center">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-[var(--text-primary)]">{lokasi.nama_lokasi}</td>
                    <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{lokasi.alamat_lokasi}</td>
                    <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${lokasi.latitude},${lokasi.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 hover:underline inline-flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        {lokasi.latitude} / {lokasi.longitude}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--text-secondary)] text-center">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                        {lokasi.radius} meter
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/admin/lokasi-presensi/${lokasi.id}`}
                          className="px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-md hover:bg-cyan-100 transition-colors font-medium text-xs border border-cyan-100"
                        >
                          Detail
                        </Link>
                        <Link 
                          href={`/admin/lokasi-presensi/form?id=${lokasi.id}`}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors font-medium text-xs border border-indigo-100"
                        >
                          Edit
                        </Link>
                        <DeleteButton id={lokasi.id} lokasiName={lokasi.nama_lokasi || ""} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center">
                      <MapPin className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-medium text-[var(--text-secondary)]">Belum ada data lokasi</p>
                      <p className="text-sm mt-1">Silakan tambahkan lokasi presensi baru.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

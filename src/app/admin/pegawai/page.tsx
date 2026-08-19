import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import DeleteButton from "./DeleteButton";
import SearchBar from "@/components/SearchBar";

export const dynamic = 'force-dynamic';

export default async function AdminPegawaiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";

  const pegawais = await prisma.pegawai.findMany({
    where: {
      is_deleted: false,
      ...(q ? {
        OR: [
          { nama: { contains: q } },
          { nik: { contains: q } },
          { bagian: { contains: q } },
          { jabatan: { contains: q } }
        ]
      } : {})
    },
    orderBy: { nama: 'asc' },
    include: { 
      users: true,
      lokasi_rel: true,
      tipe_jadwal_rel: true
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Data Pegawai</h1>
          <p className="text-gray-500 mt-1">Kelola data pegawai dan akun login sistem.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SearchBar placeholder="Cari pegawai, NIK..." />
          <Link href="/admin/pegawai/form" className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap">
            <Plus className="w-5 h-5" />
            Tambah Pegawai
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                <th className="px-6 py-4">Nama & NIK</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4">Bagian</th>
                <th className="px-6 py-4">Lokasi & Jadwal</th>
                <th className="px-6 py-4">Akun Login</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {pegawais.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {q ? "Pegawai tidak ditemukan." : "Belum ada data pegawai."}
                  </td>
                </tr>
              ) : (
                pegawais.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{p.nama || '-'}</div>
                      <div className="text-xs text-gray-500">{p.nik || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{p.jabatan || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {p.bagian || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">{p.lokasi_rel?.nama_lokasi || p.lokasi_presensi || '-'}</div>
                      <div className="text-xs font-medium text-cyan-600 mt-0.5 px-1.5 py-0.5 bg-cyan-50 rounded inline-block">
                        Jadwal: {p.tipe_jadwal_rel?.nama_tipe || p.tipe_jadwal || 'Kantor'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.users && p.users.length > 0 ? (
                        <span className="text-green-600 font-medium">Aktif ({p.users[0].username})</span>
                      ) : (
                        <span className="text-red-500 font-medium">Belum Ada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <Link href={`/admin/pegawai/form?id=${p.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <DeleteButton id={p.id} nama={p.nama || 'Pegawai'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

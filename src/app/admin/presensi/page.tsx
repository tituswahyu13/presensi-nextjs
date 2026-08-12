import { prisma } from "@/lib/prisma";
import FilterPanel from "./FilterPanel";

export const dynamic = 'force-dynamic';

export default async function AdminPresensiPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Get filter values from URL params
  const dateStr = typeof searchParams.date === 'string' ? searchParams.date : new Date().toISOString().split('T')[0];
  const filterBagian = typeof searchParams.bagian === 'string' ? searchParams.bagian : '';

  // Get list of 'Bagian' for the dropdown
  const bagianList = await prisma.bagian.findMany({
    orderBy: { bagian: 'asc' }
  });

  // Query presensi
  const presensiData = await prisma.presensi.findMany({
    where: {
      tanggal_masuk: new Date(dateStr),
      ...(filterBagian ? {
        pegawai: {
          bagian: filterBagian
        }
      } : {})
    },
    include: {
      pegawai: {
        select: {
          nama: true,
          nik: true,
          bagian: true
        }
      }
    },
    orderBy: {
      jam_masuk: 'desc'
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Rekap Presensi Harian</h1>
        <p className="text-gray-500 mt-1">Kelola dan pantau kehadiran pegawai secara real-time.</p>
      </div>

      <FilterPanel 
        bagianList={bagianList} 
        defaultDate={dateStr} 
        defaultBagian={filterBagian} 
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                <th className="px-6 py-4">Pegawai</th>
                <th className="px-6 py-4">Bagian</th>
                <th className="px-6 py-4">Jam Masuk</th>
                <th className="px-6 py-4">Jam Keluar</th>
                <th className="px-6 py-4 text-center">Foto Masuk</th>
                <th className="px-6 py-4 text-center">Foto Keluar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {presensiData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Belum ada data presensi untuk filter ini.
                  </td>
                </tr>
              ) : (
                presensiData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{item.pegawai?.nama || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">NIK: {item.pegawai?.nik || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.pegawai?.bagian || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {item.jam_masuk ? new Date(item.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {item.jam_keluar ? new Date(item.jam_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.foto_masuk ? (
                        <a href={`/${item.foto_masuk}`} target="_blank" rel="noopener noreferrer" className="inline-block p-1 border border-gray-200 rounded-lg hover:border-cyan-500 transition-colors">
                          <img src={`/${item.foto_masuk}`} alt="Foto Masuk" className="w-10 h-10 object-cover rounded-md" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.foto_keluar ? (
                        <a href={`/${item.foto_keluar}`} target="_blank" rel="noopener noreferrer" className="inline-block p-1 border border-gray-200 rounded-lg hover:border-cyan-500 transition-colors">
                          <img src={`/${item.foto_keluar}`} alt="Foto Keluar" className="w-10 h-10 object-cover rounded-md" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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

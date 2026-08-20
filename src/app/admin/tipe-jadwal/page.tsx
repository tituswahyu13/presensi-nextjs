import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Settings } from "lucide-react";
import DeleteButton from "./DeleteButton";

export const dynamic = 'force-dynamic';

export default async function AdminTipeJadwalPage() {
  const tipeJadwals = await prisma.tipe_jadwal.findMany({
    where: { is_deleted: false },
    orderBy: { nama_tipe: 'asc' }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Master Tipe Jadwal</h1>
          <p className="text-[var(--text-muted)] mt-1">Kelola data tipe jadwal (Kantor, Satpam, dsb) untuk penugasan pegawai.</p>
        </div>
        <Link href="/admin/tipe-jadwal/form" className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Tambah Tipe Jadwal
        </Link>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-card)] border-b border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)]">
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama Tipe Jadwal</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {tipeJadwals.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-[var(--text-muted)]">
                    Belum ada data tipe jadwal.
                  </td>
                </tr>
              ) : (
                tipeJadwals.map((item, idx) => {
                  let settingUrl = `/admin/tipe-jadwal/${item.id}/aturan`;
                  
                  return (
                    <tr key={item.id} className="hover:bg-[var(--bg-card)]/50">
                      <td className="px-6 py-4 w-16">{idx + 1}</td>
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{item.nama_tipe}</td>
                      <td className="px-6 py-4 text-center flex justify-center gap-2">
                        <Link 
                          href={settingUrl} 
                          className="px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors flex items-center gap-1.5"
                          title="Atur Jam Kerja"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Atur Jam
                        </Link>
                        <Link 
                          href={`/admin/tipe-jadwal/form?id=${item.id}`} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Tipe Jadwal"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteButton id={item.id} nama={item.nama_tipe} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

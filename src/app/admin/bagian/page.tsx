import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import DeleteButton from "./DeleteButton";
import SearchBar from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export default async function AdminBagianPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";

  const listBagian = await prisma.bagian.findMany({
    where: { 
      is_deleted: false,
      ...(q ? { bagian: { contains: q } } : {})
    },
    include: {
      parent: true,
      _count: {
        select: { 
          jabatan: { where: { is_deleted: false } }, 
          pegawai: true 
        }
      }
    }
  });

  const orderedBagianIds: number[] = [];
  const buildHierarchy = (parentId: number | null) => {
    const children = listBagian.filter(b => b.parent_id === parentId).sort((a, b) => a.bagian.localeCompare(b.bagian));
    for (const child of children) {
      orderedBagianIds.push(child.id);
      buildHierarchy(child.id);
    }
  };
  
  if (!q) {
    buildHierarchy(null);
    listBagian.sort((a, b) => {
      const aIdx = orderedBagianIds.indexOf(a.id);
      const bIdx = orderedBagianIds.indexOf(b.id);
      return aIdx - bIdx;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Bagian (Divisi)</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola struktur divisi perusahaan Anda</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SearchBar placeholder="Cari divisi..." />
          <Link 
            href="/admin/bagian/form" 
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Tambah Bagian
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nama Bagian / Divisi</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Induk (Parent)</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total Jabatan</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listBagian.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    {q ? "Divisi tidak ditemukan." : "Belum ada data bagian."}
                  </td>
                </tr>
              ) : (
                listBagian.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.bagian}</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.parent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.parent.bagian}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item._count.jabatan} Jabatan
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        href={`/admin/bagian/form?id=${item.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Data"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <DeleteButton id={item.id} />
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

import { prisma } from "@/lib/prisma";
import InteractiveOrgChart from "./InteractiveOrgChart";

export const dynamic = "force-dynamic";

export default async function StrukturOrganisasiPage() {
  const allBagian = await prisma.bagian.findMany({
    where: { is_deleted: false },
    include: {
      jabatan: {
        where: { is_deleted: false },
        include: {
          _count: { select: { pegawai: true } }
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Struktur Organisasi (Interaktif)</h2>
        <p className="text-gray-500 text-sm mt-1">
          Bagan hirarki divisi dan jabatan di perusahaan. Tarik garis penghubung antar-divisi untuk mengubah struktur.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        {allBagian.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            Belum ada data divisi (bagian). Silakan tambahkan divisi di menu Divisi (Bagian).
          </div>
        ) : (
          <InteractiveOrgChart allBagian={allBagian} />
        )}
      </div>
    </div>
  );
}

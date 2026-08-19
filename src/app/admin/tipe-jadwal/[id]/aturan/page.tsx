import { getJamKerjaTipeByTipeJadwal } from "@/app/actions/jamKerjaTipe";
import AturanFormClient from "./AturanFormClient";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

export default async function AturanTipeJadwalPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const idTipeJadwal = parseInt(resolvedParams.id);

  if (isNaN(idTipeJadwal)) {
    return <div>ID tidak valid</div>;
  }

  const { tipeJadwal, aturan } = await getJamKerjaTipeByTipeJadwal(idTipeJadwal);

  if (!tipeJadwal) {
    return <div>Tipe Jadwal tidak ditemukan</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/tipe-jadwal"
          className="p-2 text-gray-500 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-500" />
            Pengaturan Jam Kerja: {tipeJadwal.nama_tipe}
          </h1>
          <p className="text-gray-500 mt-1">
            Atur jam masuk dan pulang harian atau shift dinamis khusus untuk tipe jadwal ini.
          </p>
        </div>
      </div>

      <AturanFormClient 
        idTipeJadwal={idTipeJadwal}
        namaTipe={tipeJadwal.nama_tipe}
        initialAturan={aturan}
      />
    </div>
  );
}

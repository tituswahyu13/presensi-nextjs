import { prisma } from "@/lib/prisma";
import LokasiFormClient from "./LokasiFormClient";

export const dynamic = 'force-dynamic';

export default async function AdminLokasiFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const isEdit = !!params.id;
  let initialData = null;

  if (isEdit) {
    initialData = await prisma.lokasi_presensi.findUnique({
      where: { id: parseInt(params.id as string) },
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Edit Lokasi Presensi" : "Tambah Lokasi Presensi"}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEdit 
            ? "Perbarui informasi dan titik koordinat lokasi presensi." 
            : "Masukkan detail lokasi dan tentukan titik koordinat presensi pada peta."}
        </p>
      </div>

      <LokasiFormClient initialData={initialData} isEdit={isEdit} />
    </div>
  );
}

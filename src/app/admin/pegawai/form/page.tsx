import { prisma } from "@/lib/prisma";
import PegawaiFormClient from "./PegawaiFormClient";

export const dynamic = 'force-dynamic';

export default async function AdminPegawaiFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const isEdit = !!params.id;
  let initialData = null;

  if (isEdit) {
    initialData = await prisma.pegawai.findUnique({
      where: { id: parseInt(params.id as string) },
    });
  }

  const bagians = await prisma.bagian.findMany({
    where: { is_deleted: false },
    orderBy: { bagian: 'asc' }
  });

  const jabatans = await prisma.jabatan.findMany({
    where: { is_deleted: false },
    orderBy: { jabatan: 'asc' }
  });

  const lokasis = await prisma.lokasi_presensi.findMany({
    where: { is_deleted: false },
    orderBy: { nama_lokasi: 'asc' }
  });

  const tipeJadwals = await prisma.tipe_jadwal.findMany({
    where: { is_deleted: false },
    orderBy: { nama_tipe: 'asc' }
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEdit 
            ? "Perbarui informasi data pegawai." 
            : "Masukkan data pegawai baru. Akun login akan dibuatkan otomatis menggunakan NIK sebagai username dan password default."}
        </p>
      </div>

      <PegawaiFormClient 
        initialData={initialData} 
        isEdit={isEdit} 
        bagians={bagians} 
        jabatans={jabatans} 
        lokasis={lokasis.map(l => ({...l, nama_lokasi: l.nama_lokasi || ""}))} 
        tipeJadwals={tipeJadwals}
      />
    </div>
  );
}

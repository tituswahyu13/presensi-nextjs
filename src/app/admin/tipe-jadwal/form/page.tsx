import { prisma } from "@/lib/prisma";
import TipeJadwalFormClient from "./TipeJadwalFormClient";

export const dynamic = 'force-dynamic';

export default async function AdminTipeJadwalFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const isEdit = !!params.id;
  let initialData = null;

  if (isEdit) {
    initialData = await prisma.tipe_jadwal.findUnique({
      where: { id: parseInt(params.id as string) },
    });
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {isEdit ? "Edit Tipe Jadwal" : "Tambah Tipe Jadwal Baru"}
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          {isEdit 
            ? "Perbarui informasi nama tipe jadwal." 
            : "Tambahkan opsi tipe jadwal baru ke dalam sistem."}
        </p>
      </div>

      <TipeJadwalFormClient initialData={initialData} isEdit={isEdit} />
    </div>
  );
}

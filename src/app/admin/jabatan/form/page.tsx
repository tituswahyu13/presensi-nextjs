import { prisma } from "@/lib/prisma";
import JabatanFormClient from "./JabatanFormClient";

export const dynamic = "force-dynamic";

export default async function JabatanFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const isEdit = !!resolvedParams.id;
  
  let initialData = null;
  if (isEdit) {
    initialData = await prisma.jabatan.findUnique({
      where: { id: parseInt(resolvedParams.id as string) },
    });
  }

  const listBagian = await prisma.bagian.findMany({
    where: { is_deleted: false },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Edit Jabatan" : "Tambah Jabatan Baru"}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Lengkapi form di bawah untuk menyimpan data jabatan dan posisinya di struktur perusahaan.
        </p>
      </div>

      <JabatanFormClient initialData={initialData} isEdit={isEdit} listBagian={listBagian} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import BagianFormClient from "./BagianFormClient";

export const dynamic = "force-dynamic";

export default async function BagianFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const isEdit = !!resolvedParams.id;
  
  let initialData = null;
  if (isEdit) {
    initialData = await prisma.bagian.findUnique({
      where: { id: parseInt(resolvedParams.id as string) },
      include: { jabatan: { where: { is_deleted: false } } }
    });
  }

  // Get all bagian for parent selection (exclude self if edit)
  const listBagian = await prisma.bagian.findMany({
    where: isEdit ? { id: { not: parseInt(resolvedParams.id as string) }, is_deleted: false } : { is_deleted: false },
  });

  const unassignedJabatans = await prisma.jabatan.findMany({
    where: { id_bagian: null, is_deleted: false },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Edit Bagian" : "Tambah Bagian Baru"}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Lengkapi form di bawah untuk menyimpan data bagian (divisi).
        </p>
      </div>

      <BagianFormClient 
        initialData={initialData} 
        isEdit={isEdit} 
        listBagian={listBagian}
        unassignedJabatans={unassignedJabatans}
      />
    </div>
  );
}

"use server";

import { prisma, prismaKep } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createJabatan(data: any) {
  try {
    await prismaKep.jabatan.create({
      data: {
        jabatan: data.jabatan,
        id_bagian: data.id_bagian ? parseInt(data.id_bagian) : null,
        is_kepala: data.is_kepala === true || data.is_kepala === 'true',
      },
    });
    revalidatePath("/admin/jabatan");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateJabatan(id: number, data: any) {
  try {
    await prismaKep.jabatan.update({
      where: { id },
      data: {
        jabatan: data.jabatan,
        id_bagian: data.id_bagian ? parseInt(data.id_bagian) : null,
        is_kepala: data.is_kepala === true || data.is_kepala === 'true',
      },
    });
    revalidatePath("/admin/jabatan");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteJabatan(id: number) {
  try {
    await prismaKep.jabatan.update({
      where: { id },
      data: { is_deleted: true },
    });
    revalidatePath("/admin/jabatan");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type JamKerjaTipeInput = {
  tipe_hari: string;
  jam_masuk: string;
  jam_pulang: string;
  is_shift: boolean;
};

export async function getJamKerjaTipeByTipeJadwal(id_tipe_jadwal: number) {
  const tipeJadwal = await prisma.tipe_jadwal.findUnique({
    where: { id: id_tipe_jadwal }
  });

  const aturan = await prisma.jam_kerja_tipe.findMany({
    where: { id_tipe_jadwal },
    orderBy: [
      { is_shift: 'asc' },
      { tipe_hari: 'asc' }
    ]
  });

  return { tipeJadwal, aturan };
}

export async function createJamKerjaTipe(id_tipe_jadwal: number, data: JamKerjaTipeInput) {
  try {
    await prisma.jam_kerja_tipe.create({
      data: {
        id_tipe_jadwal,
        tipe_hari: data.tipe_hari,
        jam_masuk: data.jam_masuk,
        jam_pulang: data.jam_pulang,
        is_shift: data.is_shift
      }
    });
    revalidatePath(`/admin/tipe-jadwal/${id_tipe_jadwal}/aturan`);
    return { success: true, message: "Aturan berhasil ditambahkan" };
  } catch (error: any) {
    console.error("Error create jam kerja tipe:", error);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

export async function updateJamKerjaTipe(id: number, id_tipe_jadwal: number, data: JamKerjaTipeInput) {
  try {
    await prisma.jam_kerja_tipe.update({
      where: { id },
      data: {
        tipe_hari: data.tipe_hari,
        jam_masuk: data.jam_masuk,
        jam_pulang: data.jam_pulang,
        is_shift: data.is_shift
      }
    });
    revalidatePath(`/admin/tipe-jadwal/${id_tipe_jadwal}/aturan`);
    return { success: true, message: "Aturan berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error update jam kerja tipe:", error);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

export async function deleteJamKerjaTipe(id: number, id_tipe_jadwal: number) {
  try {
    await prisma.jam_kerja_tipe.delete({
      where: { id }
    });
    revalidatePath(`/admin/tipe-jadwal/${id_tipe_jadwal}/aturan`);
    return { success: true, message: "Aturan berhasil dihapus" };
  } catch (error: any) {
    console.error("Error delete jam kerja tipe:", error);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

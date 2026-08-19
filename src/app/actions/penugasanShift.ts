"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePenugasanShift(payload: { id_pegawai: number; tanggal: string; id_jam_kerja_tipe: number | null }[]) {
  try {
    for (const item of payload) {
      if (item.id_jam_kerja_tipe === null) {
        // Delete if exists
        await prisma.penugasan_shift.deleteMany({
          where: {
            id_pegawai: item.id_pegawai,
            tanggal: new Date(item.tanggal)
          }
        });
      } else {
        // Upsert
        await prisma.penugasan_shift.upsert({
          where: {
            id_pegawai_tanggal: {
              id_pegawai: item.id_pegawai,
              tanggal: new Date(item.tanggal)
            }
          },
          update: {
            id_jam_kerja_tipe: item.id_jam_kerja_tipe
          },
          create: {
            id_pegawai: item.id_pegawai,
            tanggal: new Date(item.tanggal),
            id_jam_kerja_tipe: item.id_jam_kerja_tipe
          }
        });
      }
    }
    revalidatePath("/admin/jam-kerja/penugasan-shift");
    return { success: true, message: "Penugasan shift berhasil disimpan" };
  } catch (error: any) {
    console.error("Error update penugasan shift:", error);
    return { success: false, message: "Terjadi kesalahan sistem saat menyimpan data" };
  }
}

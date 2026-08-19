"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type TipeJadwalInput = {
  nama_tipe: string;
  jenis_konfigurasi?: string;
};

export async function createTipeJadwal(data: TipeJadwalInput) {
  try {
    const existing = await prisma.tipe_jadwal.findFirst({ 
      where: { nama_tipe: data.nama_tipe, is_deleted: false } 
    });
    
    if (existing) {
      return { success: false, message: "Tipe jadwal dengan nama tersebut sudah ada!" };
    }

    await prisma.tipe_jadwal.create({ data });
    revalidatePath("/admin/tipe-jadwal");
    return { success: true, message: "Tipe Jadwal berhasil ditambahkan" };
  } catch (error: any) {
    return { success: false, message: error?.message || "Terjadi kesalahan saat menyimpan data" };
  }
}

export async function updateTipeJadwal(id: number, data: TipeJadwalInput) {
  try {
    const existing = await prisma.tipe_jadwal.findFirst({ 
      where: { 
        nama_tipe: data.nama_tipe, 
        is_deleted: false,
        id: { not: id }
      } 
    });
    
    if (existing) {
      return { success: false, message: "Tipe jadwal dengan nama tersebut sudah ada!" };
    }

    await prisma.tipe_jadwal.update({ where: { id }, data });
    revalidatePath("/admin/tipe-jadwal");
    return { success: true, message: "Tipe Jadwal berhasil diperbarui" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan saat memperbarui data" };
  }
}

export async function deleteTipeJadwal(id: number) {
  try {
    await prisma.tipe_jadwal.update({ where: { id }, data: { is_deleted: true } });
    revalidatePath("/admin/tipe-jadwal");
    return { success: true, message: "Tipe Jadwal berhasil dihapus" };
  } catch (error) {
    return { success: false, message: "Gagal menghapus Tipe Jadwal" };
  }
}

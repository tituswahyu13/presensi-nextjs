"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type LokasiInput = {
  nama_lokasi: string;
  alamat_lokasi: string;
  latitude: string;
  longitude: string;
  radius: number;
};

export async function getLokasiPresensi() {
  try {
    const lokasi = await prisma.lokasi_presensi.findFirst({
      where: { is_deleted: false },
    });
    return lokasi;
  } catch (error) {
    return null;
  }
}

export async function createLokasi(data: LokasiInput) {
  try {
    await prisma.lokasi_presensi.create({
      data: {
        nama_lokasi: data.nama_lokasi,
        alamat_lokasi: data.alamat_lokasi,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
      }
    });

    revalidatePath("/admin/lokasi-presensi");
    return { success: true, message: "Lokasi berhasil ditambahkan" };
  } catch (error: any) {
    return { success: false, message: error?.message || "Terjadi kesalahan" };
  }
}

export async function updateLokasi(id: number, data: LokasiInput) {
  try {
    await prisma.lokasi_presensi.update({ 
      where: { id }, 
      data: {
        nama_lokasi: data.nama_lokasi,
        alamat_lokasi: data.alamat_lokasi,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
      } 
    });
    revalidatePath("/admin/lokasi-presensi");
    return { success: true, message: "Berhasil diperbarui" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan" };
  }
}

export async function deleteLokasi(id: number) {
  try {
    await prisma.lokasi_presensi.update({ 
      where: { id }, 
      data: { is_deleted: true } 
    });
    revalidatePath("/admin/lokasi-presensi");
    return { success: true, message: "Lokasi dihapus" };
  } catch (error) {
    return { success: false, message: "Gagal menghapus" };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

type PegawaiInput = {
  nama: string;
  nik: string;
  jabatan: string;
  bagian: string;
  lokasi_presensi: string;
  tipe_jadwal: string;
  id_bagian?: number | null;
  id_jabatan?: number | null;
  id_lokasi?: number | null;
  id_tipe_jadwal?: number | null;
};

export async function createPegawai(data: PegawaiInput) {
  try {
    const existing = await prisma.pegawai.findFirst({ where: { nik: data.nik, is_deleted: false } });
    if (existing) return { success: false, message: "NIK sudah terdaftar!" };

    const hashedPassword = await bcrypt.hash(data.nik, 10);

    await prisma.$transaction(async (tx) => {
      const newPegawai = await tx.pegawai.create({
        data: {
          nama: data.nama,
          nik: data.nik,
          jabatan: data.jabatan,
          bagian: data.bagian,
          id_bagian: data.id_bagian,
          id_jabatan: data.id_jabatan,
          lokasi_presensi: data.lokasi_presensi,
          tipe_jadwal: data.tipe_jadwal,
          id_lokasi: data.id_lokasi,
          id_tipe_jadwal: data.id_tipe_jadwal,
        }
      });

      await tx.users.create({
        data: {
          username: data.nik,
          password: hashedPassword,
          role: "pegawai",
          status: "Aktif",
          id_pegawai: newPegawai.id,
        }
      });
    });

    revalidatePath("/admin/pegawai");
    return { success: true, message: "Pegawai berhasil ditambahkan" };
  } catch (error: any) {
    return { success: false, message: error?.message || "Terjadi kesalahan" };
  }
}

export async function updatePegawai(id: number, data: PegawaiInput) {
  try {
    await prisma.pegawai.update({ where: { id }, data });
    await prisma.users.updateMany({ where: { id_pegawai: id }, data: { username: data.nik } });
    revalidatePath("/admin/pegawai");
    return { success: true, message: "Berhasil diperbarui" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan" };
  }
}

export async function deletePegawai(id: number) {
  try {
    await prisma.pegawai.update({ where: { id }, data: { is_deleted: true } });
    revalidatePath("/admin/pegawai");
    return { success: true, message: "Pegawai dihapus" };
  } catch (error) {
    return { success: false, message: "Gagal menghapus" };
  }
}

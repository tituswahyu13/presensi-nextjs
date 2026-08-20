"use server";

import { prisma, prismaKep } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getJadwalSumberData(year: number, month: number, id_tipe_jadwal?: number) {
  // First day of the month
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  // Last day of the month
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

  // Get tipe_jadwal list that use "Sumber" config
  const tipeJadwalList = await prisma.tipe_jadwal.findMany({
    where: { jenis_konfigurasi: 'Sumber', is_deleted: false },
    orderBy: { nama_tipe: 'asc' }
  });

  const activeTipeId = id_tipe_jadwal || (tipeJadwalList.length > 0 ? tipeJadwalList[0].id : undefined);

  // Get employees with that tipe jadwal
  const pegawais = await prismaKep.pegawai.findMany({
    where: { 
      is_deleted: false,
      id_tipe_jadwal: activeTipeId
    },
    select: {
      id: true,
      nama: true,
      lokasi_presensi: true,
    },
    orderBy: { nama: "asc" }
  });

  // Fetch schedules for this month
  const jadwals = await prisma.jadwal_sumber.findMany({
    where: {
      tanggal: {
        gte: startDate,
        lte: endDate,
      },
      // Optionally filter by employees if we only want to fetch relevant schedules
      id_pegawai: { in: pegawais.map(p => p.id) }
    },
  });

  return { pegawais, jadwals, tipeJadwalList, activeTipeId };
}

export async function updateJadwalSumber(payload: { id_pegawai: number; tanggal: string; shift: string }[]) {
  try {
    // Process each item in the payload
    for (const item of payload) {
      const date = new Date(item.tanggal);
      
      if (!item.shift || item.shift.trim() === "") {
        // Delete if empty
        await prisma.jadwal_sumber.deleteMany({
          where: {
            id_pegawai: item.id_pegawai,
            tanggal: date,
          }
        });
      } else {
        // Find existing
        const existing = await prisma.jadwal_sumber.findFirst({
          where: {
            id_pegawai: item.id_pegawai,
            tanggal: date,
          }
        });

        if (existing) {
          await prisma.jadwal_sumber.update({
            where: { id: existing.id },
            data: { shift: item.shift.trim().toUpperCase() }
          });
        } else {
          await prisma.jadwal_sumber.create({
            data: {
              id_pegawai: item.id_pegawai,
              tanggal: date,
              shift: item.shift.trim().toUpperCase(),
            }
          });
        }
      }
    }

    revalidatePath("/admin/jam-kerja/jadwal-sumber");
    return { success: true, message: "Jadwal berhasil disimpan" };
  } catch (error) {
    console.error("Error updating jadwal sumber:", error);
    return { success: false, message: "Terjadi kesalahan saat menyimpan jadwal" };
  }
}

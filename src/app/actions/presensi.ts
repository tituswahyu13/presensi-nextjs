"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function getStatusPresensiHariIni() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id_pegawai) {
      return null;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const presensiList = await prisma.presensi.findMany({
      where: {
        id_pegawai: session.user.id_pegawai,
        tanggal_masuk: {
          gte: todayStart,
          lt: todayEnd
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    if (presensiList.length === 0) {
      return { status: "Belum Presensi", jam_masuk: null, jam_keluar: null, jam_masuk_lembur: null, jam_keluar_lembur: null };
    }

    // Format time: HH:mm
    const formatTime = (dateStr: Date | null | undefined) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      // Prisma mengembalikan kolom db.Time sebagai objek Date dalam zona waktu UTC.
      // Jadi kita harus mengambil jam dari nilai UTC-nya agar sesuai dengan yang ada di database.
      return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
    };

    const regular = presensiList.find(p => !p.is_lembur);
    const lembur = presensiList.find(p => p.is_lembur);

    let status = "Pekerjaan Selesai"; // Default to done if regular is done

    if (lembur) {
      if (lembur.jam_masuk && !lembur.jam_keluar) {
        status = "Sedang Lembur";
      } else if (lembur.jam_keluar) {
        status = "Lembur Selesai";
      }
    } else if (regular) {
      if (regular.jam_masuk && !regular.jam_keluar) {
        status = "Sedang Bekerja";
      }
      // If regular is done, status remains "Pekerjaan Selesai"
    }

    return {
      status: status,
      jam_masuk: formatTime(regular?.jam_masuk),
      jam_keluar: formatTime(regular?.jam_keluar),
      jam_masuk_lembur: formatTime(lembur?.jam_masuk),
      jam_keluar_lembur: formatTime(lembur?.jam_keluar)
    };

  } catch (error) {
    console.error("Error fetching presensi hari ini:", error);
    return null;
  }
}

export async function getRiwayatPresensi() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id_pegawai) {
      return [];
    }

    // Get the last 30 days of presensi
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const presensiList = await prisma.presensi.findMany({
      where: {
        id_pegawai: session.user.id_pegawai,
        tanggal_masuk: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        tanggal_masuk: 'desc'
      }
    });

    // Group by tanggal_masuk
    const grouped = presensiList.reduce((acc: any, curr) => {
      const dateKey = curr.tanggal_masuk.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { regular: null, lembur: null };
      }
      if (curr.is_lembur) {
        acc[dateKey].lembur = curr;
      } else {
        acc[dateKey].regular = curr;
      }
      return acc;
    }, {});

    const formatTime = (dateStr: Date | null) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
    };

    const result = Object.keys(grouped).map(dateKey => {
      const { regular, lembur } = grouped[dateKey];
      
      let status = "Selesai";
      if (lembur) {
        if (lembur.jam_masuk && !lembur.jam_keluar) status = "Sedang Lembur";
        else if (lembur.jam_keluar) status = "Lembur Selesai";
      } else if (regular) {
        if (regular.jam_masuk && !regular.jam_keluar) status = "Belum Pulang";
      }

      return {
        tanggal: dateKey,
        status: status,
        jam_masuk: formatTime(regular?.jam_masuk),
        jam_keluar: formatTime(regular?.jam_keluar),
        jam_masuk_lembur: formatTime(lembur?.jam_masuk),
        jam_keluar_lembur: formatTime(lembur?.jam_keluar)
      };
    });

    return result;

  } catch (error) {
    console.error("Error fetching riwayat presensi:", error);
    return [];
  }
}

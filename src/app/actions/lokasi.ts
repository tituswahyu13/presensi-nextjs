"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function getLokasiPresensi() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.lokasi_presensi) {
    return null;
  }

  const lokasi = await prisma.lokasi_presensi.findFirst({
    where: {
      nama_lokasi: session.user.lokasi_presensi
    }
  });

  if (!lokasi) return null;

  return {
    latitude: parseFloat(lokasi.latitude ?? "0"),
    longitude: parseFloat(lokasi.longitude ?? "0"),
    radius: lokasi.radius
  };
}

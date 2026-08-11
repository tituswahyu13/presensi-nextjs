import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { calculateDistance } from "@/lib/haversine";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id_pegawai) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, latitude, longitude, image_base64, isLembur } = await request.json();

    if (!latitude || !longitude || !image_base64) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // 1. Get Location Rules
    const namaLokasi = session.user.lokasi_presensi;
    if (!namaLokasi) {
      return NextResponse.json({ error: "Lokasi presensi pegawai belum diset" }, { status: 400 });
    }

    const lokasi = await prisma.lokasi_presensi.findFirst({
      where: { nama_lokasi: namaLokasi }
    });

    if (!lokasi || !lokasi.latitude || !lokasi.longitude || !lokasi.radius) {
      return NextResponse.json({ error: "Pengaturan lokasi tidak valid di database" }, { status: 400 });
    }

    // 2. Validate Distance
    const distance = calculateDistance(
      latitude, 
      longitude, 
      parseFloat(lokasi.latitude), 
      parseFloat(lokasi.longitude)
    );

    if (distance > lokasi.radius) {
      return NextResponse.json({ error: `Anda berada di luar radius kantor (${Math.round(distance)}m > ${lokasi.radius}m)` }, { status: 400 });
    }

    // 3. Process Image
    const base64Data = image_base64.replace(/^data:image\/jpeg;base64,/, "");
    const dateObj = new Date();
    const dateStr = dateObj.toISOString().split('T')[0];
    const timeStr = dateObj.toTimeString().split(' ')[0].replace(/:/g, '_');
    const id_pegawai = session.user.id_pegawai;
    
    const fileName = `${type}_${id_pegawai}_${dateStr}_${timeStr}.png`;
    const publicDir = path.join(process.cwd(), 'public', 'foto');
    
    // Create directory if not exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const filePath = path.join(publicDir, fileName);
    fs.writeFileSync(filePath, base64Data, 'base64');
    
    const relativeFilePath = `foto/${fileName}`;

    // 4. Save to Database
    const todayStr = dateObj.toISOString();
    
    // Check duplication for 'masuk'
    if (type === 'masuk') {
      // Find if already checked in today
      const existing = await prisma.presensi.findFirst({
        where: {
          id_pegawai: id_pegawai,
          is_lembur: isLembur === true,
          tanggal_masuk: {
            gte: new Date(new Date().setHours(0,0,0,0)),
            lt: new Date(new Date().setHours(23,59,59,999))
          }
        }
      });

      if (existing) {
        return NextResponse.json({ error: "Anda sudah melakukan absen masuk hari ini" }, { status: 400 });
      }

      // Create a Date object offset by local timezone to trick Prisma into saving the local time in the TIME column
      const localTimeDate = new Date();
      localTimeDate.setMinutes(localTimeDate.getMinutes() - localTimeDate.getTimezoneOffset());

      await prisma.presensi.create({
        data: {
          id_pegawai: id_pegawai,
          tanggal_masuk: new Date(),
          jam_masuk: localTimeDate,
          foto_masuk: relativeFilePath,
          is_lembur: isLembur === true
        }
      });
    } else if (type === 'keluar') {
      const existing = await prisma.presensi.findFirst({
        where: {
          id_pegawai: id_pegawai,
          is_lembur: isLembur === true,
          tanggal_masuk: {
            gte: new Date(new Date().setHours(0,0,0,0)),
            lt: new Date(new Date().setHours(23,59,59,999))
          }
        },
        orderBy: { id: 'desc' }
      });

      if (!existing) {
        return NextResponse.json({ error: "Anda belum absen masuk hari ini" }, { status: 400 });
      }

      const localTimeDate = new Date();
      localTimeDate.setMinutes(localTimeDate.getMinutes() - localTimeDate.getTimezoneOffset());

      await prisma.presensi.updateMany({
        where: { id: existing.id },
        data: {
          tanggal_keluar: new Date(),
          jam_keluar: localTimeDate,
          foto_keluar: relativeFilePath
        }
      });
    }

    return NextResponse.json({ success: true, message: `Absen ${type} berhasil!`, distance: Math.round(distance) });

  } catch (error: any) {
    console.error("Absen API Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem: " + error.message }, { status: 500 });
  }
}

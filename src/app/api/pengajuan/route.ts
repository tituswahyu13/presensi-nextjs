import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Anda belum login" }, { status: 401 });
    }

    const id_pegawai = parseInt(session.user.id);
    const body = await req.json();
    const { jenis_pengajuan, tanggal_pengajuan, jam_pengajuan, keterangan } = body;

    if (!jenis_pengajuan || !tanggal_pengajuan || !jam_pengajuan || !keterangan) {
      return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 });
    }

    const tgl = new Date(tanggal_pengajuan);
    
    // Convert jam_pengajuan (e.g. "09:00") to a valid DateTime object for Prisma
    // We append the local time and shift it by timezone offset to make it correct in DB
    const [hours, minutes] = jam_pengajuan.split(':');
    const jamDate = new Date();
    jamDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    jamDate.setMinutes(jamDate.getMinutes() - jamDate.getTimezoneOffset());

    // Cek apakah sudah ada pengajuan di tanggal tersebut
    const existing = await prisma.absensi.findFirst({
      where: {
        id_pegawai: id_pegawai,
        tanggal_absen: tgl
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Anda sudah melakukan pengajuan untuk tanggal tersebut" }, { status: 400 });
    }

    // Simpan ke tabel absensi
    await prisma.absensi.create({
      data: {
        id_pegawai: id_pegawai,
        tanggal_absen: tgl,
        jam_absen: jamDate,
        keterangan: jenis_pengajuan,
        info: keterangan
      }
    });

    return NextResponse.json({ success: true, message: "Pengajuan berhasil disimpan" });
  } catch (error: any) {
    console.error("API Pengajuan Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

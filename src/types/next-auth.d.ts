import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      id_pegawai?: number;
      nik?: string;
      jabatan?: string;
      lokasi_presensi?: string;
      foto?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string | null;
    id_pegawai?: number | null;
    nik?: string | null;
    jabatan?: string | null;
    lokasi_presensi?: string | null;
    foto?: string | null;
  }
}

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      username?: string;
      role?: string;
      id_pegawai?: number;
      nik?: string;
      jabatan?: string;
      lokasi_presensi?: string;
      foto?: string;
      tipe_jadwal?: string | null;
    };
  }

  interface User {
    role?: string;
    id_pegawai?: number | null;
    nik?: string;
    jabatan?: string;
    lokasi_presensi?: string;
    foto?: string;
    tipe_jadwal?: string | null;
  }
}

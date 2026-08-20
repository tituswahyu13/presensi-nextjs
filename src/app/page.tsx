import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Admin/Superadmin diarahkan ke halaman admin presensi
  if (session.user.role === "admin" || session.user.role === "superadmin") {
    redirect("/admin");
  }

  // Pegawai biasa diarahkan ke dashboard pegawai
  // Penanganan tipe_jadwal (Shift vs Kantor) akan ditangani di dalam /pegawai
  redirect("/pegawai");
}

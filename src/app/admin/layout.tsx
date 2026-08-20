import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminSidebarNav from "./AdminSidebarNav";
import LogoutButton from "./LogoutButton";
import Link from "next/link";
import { Droplets, ChevronLeft } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    const callbackUrl = encodeURIComponent("http://localhost:3001/admin/presensi");
    redirect(`http://localhost:3000/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* Sidebar */}
      <aside className="w-60 flex flex-col flex-shrink-0" style={{ background: "var(--bg-base)", borderRight: "1px solid var(--border)" }}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-muted)", border: "1px solid var(--accent)" }}>
            <Droplets className="w-4 h-4" style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: "var(--text-primary)" }}>Perumdam</p>
            <p className="text-xs leading-none mt-0.5" style={{ color: "var(--text-muted)" }}>Presensi</p>
          </div>
        </div>

        {/* Back to portal */}
        <div className="px-3 pt-3">
          <Link href="http://localhost:3000"
            className="sidebar-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ color: "var(--accent)" }}>
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Portal
          </Link>
        </div>

        {/* Nav Items */}
        <AdminSidebarNav />

        {/* User + Logout */}
        <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1" style={{ background: "var(--bg-surface)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{session.user.name}</p>
              <p className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{session.user.role}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: "var(--bg-surface)" }}>
        <header className="h-16 flex items-center px-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Modul Presensi</p>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

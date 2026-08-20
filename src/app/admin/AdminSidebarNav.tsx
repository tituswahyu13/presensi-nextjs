"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, MapPin, Clock, CalendarDays, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function AdminSidebarNav() {
  const pathname = usePathname();
  const [jamKerjaOpen, setJamKerjaOpen] = useState(
    pathname.startsWith("/admin/jam-kerja") || pathname.startsWith("/admin/tipe-jadwal")
  );

  const navItems = [
    { name: "Rekap Presensi", href: "/admin/presensi", icon: FileText, color: "var(--accent)" },
    { name: "Lokasi Presensi", href: "/admin/lokasi-presensi", icon: MapPin, color: "#34d399" },
  ];

  const isJamKerjaActive = pathname.startsWith("/admin/jam-kerja") || pathname.startsWith("/admin/tipe-jadwal");

  return (
    <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Presensi</p>

      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: isActive ? "var(--accent-muted)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text-secondary)",
              borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
            }}>
            <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? "var(--accent)" : item.color }} />
            {item.name}
          </Link>
        );
      })}

      {/* Jam Kerja Group */}
      <p className="px-3 text-xs font-semibold uppercase tracking-wider mt-4 mb-1" style={{ color: "var(--text-muted)" }}>Pengaturan</p>
      <button onClick={() => setJamKerjaOpen(!jamKerjaOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{
          background: isJamKerjaActive ? "var(--accent-muted)" : "transparent",
          color: isJamKerjaActive ? "var(--accent)" : "var(--text-secondary)",
          borderLeft: isJamKerjaActive ? "2px solid var(--accent)" : "2px solid transparent",
        }}>
        <span className="flex items-center gap-3">
          <Clock className="w-4 h-4" style={{ color: isJamKerjaActive ? "var(--accent)" : "#fbbf24" }} />
          Jam Kerja
        </span>
        {jamKerjaOpen
          ? <ChevronDown className="w-3.5 h-3.5" />
          : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {jamKerjaOpen && (
        <div className="ml-4 space-y-0.5 border-l pl-3" style={{ borderColor: "var(--border)" }}>
          {[
            { name: "Manajemen Jam Kerja", href: "/admin/jam-kerja" },
            { name: "Tipe Jadwal", href: "/admin/tipe-jadwal" },
          ].map(sub => {
            const isActive = pathname.startsWith(sub.href);
            return (
              <Link key={sub.href} href={sub.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{ color: isActive ? "var(--accent)" : "var(--text-secondary)", background: isActive ? "var(--accent-muted)" : "transparent" }}>
                <CalendarDays className="w-3.5 h-3.5" />
                {sub.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

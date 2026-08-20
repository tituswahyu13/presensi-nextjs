"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText, Briefcase, Building2, Network, MapPin, Clock, ChevronDown, ChevronRight, CalendarDays, ListOrdered } from "lucide-react";
import { useState } from "react";

export default function AdminSidebarNav() {
  const pathname = usePathname();
  // Expanded logic for jamKerjaOpen to include tipe-jadwal
  const [jamKerjaOpen, setJamKerjaOpen] = useState(
    pathname.startsWith("/admin/jam-kerja") || pathname.startsWith("/admin/tipe-jadwal")
  );

  const navItems = [
    { name: "Rekap Presensi", href: "/admin/presensi", icon: FileText },
    { name: "Lokasi Presensi", href: "/admin/lokasi-presensi", icon: MapPin },
  ];

  return (
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              isActive 
                ? "bg-cyan-50 text-cyan-700" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.name}
          </Link>
        );
      })}

      <div className="pt-2">
        <button 
          onClick={() => setJamKerjaOpen(!jamKerjaOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${
            (pathname.startsWith("/admin/jam-kerja") || pathname.startsWith("/admin/tipe-jadwal")) 
              ? "bg-cyan-50 text-cyan-700" 
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <span>Manajemen Jam Kerja</span>
          </div>
          {jamKerjaOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {jamKerjaOpen && (
          <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-1">
            <Link 
              href="/admin/tipe-jadwal" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/admin/tipe-jadwal") ? "bg-cyan-50 text-cyan-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <ListOrdered className="w-4 h-4" /> Master Tipe Jadwal
            </Link>
            <Link 
              href="/admin/jam-kerja/penugasan-shift" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/admin/jam-kerja/penugasan-shift") ? "bg-cyan-50 text-cyan-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <CalendarDays className="w-4 h-4" /> Penugasan Shift
            </Link>
            <Link 
              href="/admin/jam-kerja/kantor" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors opacity-50 ${
                pathname === "/admin/jam-kerja/kantor" ? "bg-cyan-50 text-cyan-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Building2 className="w-4 h-4" /> Jam Kerja Kantor (Lama)
            </Link>
            <Link 
              href="/admin/jam-kerja/shift" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors opacity-50 ${
                pathname === "/admin/jam-kerja/shift" ? "bg-cyan-50 text-cyan-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Clock className="w-4 h-4" /> Jam Kerja Shift (Lama)
            </Link>
            <Link 
              href="/admin/jam-kerja/jadwal-sumber" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors opacity-50 ${
                pathname === "/admin/jam-kerja/jadwal-sumber" ? "bg-cyan-50 text-cyan-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <CalendarDays className="w-4 h-4" /> Jadwal Sumber (Lama)
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

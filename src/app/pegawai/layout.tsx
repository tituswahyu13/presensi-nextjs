"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Home, Clock, User, LogOut, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function PegawaiLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col relative pb-20 font-sans">
      {/* Top Header */}
      <header className="bg-[#F2F2F7]/80 backdrop-blur-lg px-5 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
            {session.user.foto ? (
              <img src={session.user.foto} alt="Profile" className="object-cover w-full h-full" />
            ) : (
              session.user.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Selamat datang,</p>
            <h2 className="text-[17px] font-semibold text-black leading-tight tracking-tight">
              {session.user.name}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="http://localhost:3001"
            className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            title="Kembali ke Portal"
          >
            <LayoutGrid size={20} />
          </Link>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="h-8 w-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
            title="Keluar"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-5 max-w-md mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-200/60 pb-safe z-50">
        <div className="max-w-md mx-auto px-6 h-[83px] flex justify-between items-start pt-2">
          <Link 
            href="/pegawai" 
            className={`flex flex-col items-center justify-center w-16 transition-colors duration-200 ${pathname === '/pegawai' ? 'text-[#007AFF]' : 'text-gray-400'}`}
          >
            <Home size={26} strokeWidth={pathname === '/pegawai' ? 2.5 : 2} className={pathname === '/pegawai' ? 'fill-current opacity-20' : ''} />
            <span className="text-[10px] mt-1 font-medium">Home</span>
          </Link>
          
          <Link 
            href="/pegawai/riwayat" 
            className={`flex flex-col items-center justify-center w-16 transition-colors duration-200 ${pathname === '/pegawai/riwayat' ? 'text-[#007AFF]' : 'text-gray-400'}`}
          >
            <Clock size={26} strokeWidth={pathname === '/pegawai/riwayat' ? 2.5 : 2} className={pathname === '/pegawai/riwayat' ? 'fill-current opacity-20' : ''} />
            <span className="text-[10px] mt-1 font-medium">Riwayat</span>
          </Link>

          <Link 
            href="/pegawai/profil" 
            className={`flex flex-col items-center justify-center w-16 transition-colors duration-200 ${pathname === '/pegawai/profil' ? 'text-[#007AFF]' : 'text-gray-400'}`}
          >
            <User size={26} strokeWidth={pathname === '/pegawai/profil' ? 2.5 : 2} className={pathname === '/pegawai/profil' ? 'fill-current opacity-20' : ''} />
            <span className="text-[10px] mt-1 font-medium">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

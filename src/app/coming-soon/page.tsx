import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-10 overflow-hidden relative text-center">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <div className="text-6xl mb-6">🚀</div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Segera Hadir!</h1>
          <p className="text-cyan-100 font-medium mb-8">
            Modul ini sedang dalam tahap pengembangan dan akan segera tersedia.
          </p>
          
          <Link
            href="/portal"
            className="inline-flex items-center justify-center space-x-2 py-3 px-6 border border-transparent rounded-xl shadow-lg text-sm font-bold text-blue-600 bg-white hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 transition-all duration-200 transform hover:scale-[1.02]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

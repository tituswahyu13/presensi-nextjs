"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLokasi } from "@/app/actions/lokasi";
import { Trash2, AlertTriangle, X } from "lucide-react";

export default function DeleteButton({ id, lokasiName }: { id: number; lokasiName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteLokasi(id);
    setIsOpen(false);
    setLoading(false);
    router.refresh();
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-red-50  rounded-md hover:bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-transparent hover:border-red-800/50 transition-colors font-medium text-xs border border-red-100 flex items-center justify-center"
      >
        Hapus
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-[var(--bg-surface)] rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--bg-card)]/50">
              <div className="flex items-center gap-2 ">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold text-[var(--text-primary)]">Konfirmasi Hapus</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors rounded-full p-1 hover:bg-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-[var(--text-secondary)] text-sm">
                Apakah Anda yakin ingin menghapus data lokasi presensi <span className="font-bold text-[var(--text-primary)]">"{lokasiName}"</span>?
              </p>
              <p className="text-[var(--text-muted)] text-xs mt-2 italic">
                Data yang dihapus akan disembunyikan (soft delete) dari sistem.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border)] bg-[var(--bg-card)]">
              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-card)] transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Ya, Hapus Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

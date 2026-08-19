"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteTipeJadwal } from "@/app/actions/tipeJadwal";

export default function DeleteButton({ id, nama }: { id: number; nama: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteTipeJadwal(id);
    setIsOpen(false);
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Hapus"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus tipe jadwal <span className="font-semibold text-gray-800">"{nama}"</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="px-4 py-2 font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

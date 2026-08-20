"use client";

import { useState, useEffect } from "react";
import { getRiwayatPresensi } from "@/app/actions/presensi";
import { Calendar, Clock, CheckCircle2, History, ChevronRight } from "lucide-react";
import Link from "next/link";

interface RiwayatItem {
  tanggal: string;
  status: string;
  jam_masuk: string | null;
  jam_keluar: string | null;
  jam_masuk_lembur: string | null;
  jam_keluar_lembur: string | null;
}

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRiwayatPresensi().then((data) => {
      setRiwayat(data);
      setLoading(false);
    });
  }, []);

  // Format YYYY-MM-DD to Indonesian Date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Selesai":
      case "Lembur Selesai":
        return "bg-green-100 text-green-700";
      case "Sedang Bekerja":
      case "Belum Pulang":
        return "bg-blue-100 text-blue-700";
      case "Sedang Lembur":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-[var(--text-primary)]";
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600">
          <History size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Riwayat</h1>
          <p className="text-[var(--text-muted)] text-sm">30 hari terakhir</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-4"></div>
          <p>Memuat riwayat...</p>
        </div>
      ) : riwayat.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 mt-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Calendar size={32} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Belum Ada Riwayat</h3>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            Data presensi Anda dalam 30 hari terakhir masih kosong.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {riwayat.map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              {/* Header Card */}
              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{formatDate(item.tanggal)}</h3>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mt-2 ${getStatusColor(item.status)}`}>
                    <CheckCircle2 size={12} />
                    {item.status}
                  </div>
                </div>
              </div>

              {/* Body Card */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                {/* Jam Kerja Regular */}
                <div>
                  <p className="text-[11px] text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wider">Masuk</p>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="font-semibold text-[var(--text-primary)]">{item.jam_masuk || '--:--'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wider">Pulang</p>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="font-semibold text-[var(--text-primary)]">{item.jam_keluar || '--:--'}</span>
                  </div>
                </div>

                {/* Jam Lembur (Only show if there is lembur activity) */}
                {(item.jam_masuk_lembur || item.jam_keluar_lembur) && (
                  <>
                    <div className="col-span-2 pt-2 border-t border-gray-50"></div>
                    <div>
                      <p className="text-[11px] text-orange-500 mb-1 font-medium uppercase tracking-wider">Masuk Lembur</p>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-orange-300" />
                        <span className="font-semibold text-[var(--text-primary)]">{item.jam_masuk_lembur || '--:--'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] text-orange-500 mb-1 font-medium uppercase tracking-wider">Selesai Lembur</p>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-orange-300" />
                        <span className="font-semibold text-[var(--text-primary)]">{item.jam_keluar_lembur || '--:--'}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

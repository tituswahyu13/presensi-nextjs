"use client";

import { useState } from "react";
import { ArrowLeft, Send, FileText, Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PengajuanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [formData, setFormData] = useState({
    jenis_pengajuan: "ijin", // ijin, sakit, cuti, dinas
    tanggal_pengajuan: new Date().toISOString().split('T')[0],
    jam_pengajuan: new Date().toTimeString().split(' ')[0].substring(0, 5),
    keterangan: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/pengajuan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim pengajuan");
      }

      setSuccessMsg("Pengajuan berhasil dikirim!");
      setTimeout(() => {
        router.push("/pegawai");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans">
      {/* Header */}
      <header className="px-5 py-3 flex items-center bg-white shadow-sm sticky top-0 z-50">
        <Link href="/pegawai" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-[#007AFF]">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-[17px] font-semibold text-black ml-2">Form Pengajuan</h1>
      </header>

      <main className="flex-1 p-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: Jenis Pengajuan */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Jenis Pengajuan</label>
              <div className="relative">
                <select 
                  name="jenis_pengajuan" 
                  value={formData.jenis_pengajuan}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[var(--text-primary)] text-[17px] outline-none appearance-none font-medium"
                >
                  <option value="ijin">Ijin / Keperluan Pribadi</option>
                  <option value="sakit">Sakit</option>
                  <option value="cuti">Cuti</option>
                  <option value="dinas">Dinas Luar Kota</option>
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <Calendar size={20} className="text-[#007AFF]" />
              <div className="flex-1">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Tanggal</label>
                <input 
                  type="date" 
                  name="tanggal_pengajuan"
                  value={formData.tanggal_pengajuan}
                  onChange={handleChange}
                  className="w-full text-[var(--text-primary)] text-[17px] outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <Clock size={20} className="text-[#007AFF]" />
              <div className="flex-1">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Jam</label>
                <input 
                  type="time" 
                  name="jam_pengajuan"
                  value={formData.jam_pengajuan}
                  onChange={handleChange}
                  className="w-full text-[var(--text-primary)] text-[17px] outline-none bg-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Keterangan */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm p-4">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block flex items-center gap-1">
              <FileText size={14} /> Detail Keterangan / Alasan
            </label>
            <textarea 
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              rows={4}
              placeholder="Tuliskan alasan pengajuan Anda di sini..."
              className="w-full text-[var(--text-primary)] placeholder:text-gray-400 text-[16px] outline-none bg-transparent resize-none pt-2"
              required
            ></textarea>
          </div>

          {errorMsg && (
            <div className="bg-[#FF3B30]/10 text-[#FF3B30] p-3 rounded-xl text-[14px] font-medium text-center">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-[#34C759]/10 text-[#34C759] p-3 rounded-xl text-[14px] font-medium text-center">
              {successMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-semibold text-[17px] shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Mengirim...
              </>
            ) : (
              <>
                <Send size={20} /> Kirim Pengajuan
              </>
            )}
          </button>

        </form>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Save, Trash2, Clock, CalendarDays, Loader2 } from "lucide-react";
import { JamKerjaTipeInput, createJamKerjaTipe, updateJamKerjaTipe, deleteJamKerjaTipe } from "@/app/actions/jamKerjaTipe";

type Aturan = {
  id: number;
  id_tipe_jadwal: number;
  tipe_hari: string;
  jam_masuk: string;
  jam_pulang: string;
  is_shift: boolean;
};

export default function AturanFormClient({ 
  idTipeJadwal, 
  namaTipe, 
  initialAturan 
}: { 
  idTipeJadwal: number; 
  namaTipe: string;
  initialAturan: Aturan[] 
}) {
  const [aturan, setAturan] = useState<Aturan[]>(initialAturan);
  const [loading, setLoading] = useState<number | null>(null);
  
  // Form add new
  const [isAdding, setIsAdding] = useState(false);
  const [newRow, setNewRow] = useState<JamKerjaTipeInput>({
    tipe_hari: "Senin",
    jam_masuk: "08:00",
    jam_pulang: "16:00",
    is_shift: false
  });

  const handleAdd = async () => {
    if (!newRow.tipe_hari || !newRow.jam_masuk || !newRow.jam_pulang) {
      alert("Semua field harus diisi!");
      return;
    }
    setLoading(-1);
    const res = await createJamKerjaTipe(idTipeJadwal, newRow);
    setLoading(null);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.message);
    }
  };

  const handleUpdate = async (item: Aturan, field: keyof JamKerjaTipeInput, value: any) => {
    const updated = { ...item, [field]: value };
    setAturan(prev => prev.map(a => a.id === item.id ? updated : a));
  };

  const saveUpdate = async (item: Aturan) => {
    setLoading(item.id);
    const res = await updateJamKerjaTipe(item.id, idTipeJadwal, {
      tipe_hari: item.tipe_hari,
      jam_masuk: item.jam_masuk,
      jam_pulang: item.jam_pulang,
      is_shift: item.is_shift
    });
    setLoading(null);
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus aturan ini?")) return;
    setLoading(id);
    const res = await deleteJamKerjaTipe(id, idTipeJadwal);
    setLoading(null);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
      <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-500" />
          Daftar Aturan Jam Kerja
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Aturan
        </button>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--bg-card)] text-[var(--text-primary)] uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Tipe (Reguler/Shift)</th>
                <th className="px-4 py-3">Hari / Nama Shift</th>
                <th className="px-4 py-3 text-center">Jam Masuk (HH:mm)</th>
                <th className="px-4 py-3 text-center">Jam Pulang (HH:mm)</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isAdding && (
                <tr className="bg-cyan-50/30">
                  <td className="px-4 py-3">
                    <select 
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-cyan-500"
                      value={newRow.is_shift ? "true" : "false"}
                      onChange={(e) => setNewRow({...newRow, is_shift: e.target.value === "true", tipe_hari: e.target.value === "true" ? "Pagi" : "Senin"})}
                    >
                      <option value="false">Mingguan Tetap</option>
                      <option value="true">Shift Dinamis</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {newRow.is_shift ? (
                      <select 
                        value={newRow.tipe_hari} 
                        onChange={(e) => setNewRow({...newRow, tipe_hari: e.target.value})}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                      >
                        <option value="Pagi">Pagi</option>
                        <option value="Siang">Siang</option>
                        <option value="Malam">Malam</option>
                        <option value="Full">Full</option>
                        <option value="Libur">Libur</option>
                      </select>
                    ) : (
                      <select 
                        value={newRow.tipe_hari} 
                        onChange={(e) => setNewRow({...newRow, tipe_hari: e.target.value})}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                      >
                        {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input type="time" value={newRow.jam_masuk} onChange={(e) => setNewRow({...newRow, jam_masuk: e.target.value})} className="px-3 py-2 border border-[var(--border)] rounded-lg text-center" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input type="time" value={newRow.jam_pulang} onChange={(e) => setNewRow({...newRow, jam_pulang: e.target.value})} className="px-3 py-2 border border-[var(--border)] rounded-lg text-center" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={handleAdd} disabled={loading === -1} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        {loading === -1 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setIsAdding(false)} className="p-2 bg-[var(--bg-card)]0 text-white rounded-lg hover:bg-gray-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {aturan.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--bg-card)]/50">
                  <td className="px-4 py-3">
                    <select 
                      className="w-full px-3 py-2 border border-transparent hover:border-[var(--border)] focus:border-cyan-500 rounded-lg bg-transparent"
                      value={item.is_shift ? "true" : "false"}
                      onChange={(e) => handleUpdate(item, 'is_shift', e.target.value === "true")}
                      onBlur={() => saveUpdate(item)}
                    >
                      <option value="false">Mingguan Tetap</option>
                      <option value="true">Shift Dinamis</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {item.is_shift ? (
                      <select 
                        value={item.tipe_hari} 
                        onChange={(e) => handleUpdate(item, 'tipe_hari', e.target.value)}
                        onBlur={() => saveUpdate(item)}
                        className="w-full px-3 py-2 border border-transparent hover:border-[var(--border)] focus:border-cyan-500 rounded-lg bg-transparent"
                      >
                        <option value="Pagi">Pagi</option>
                        <option value="Siang">Siang</option>
                        <option value="Malam">Malam</option>
                        <option value="Full">Full</option>
                        <option value="Libur">Libur</option>
                      </select>
                    ) : (
                      <select 
                        value={item.tipe_hari} 
                        onChange={(e) => handleUpdate(item, 'tipe_hari', e.target.value)}
                        onBlur={() => saveUpdate(item)}
                        className="w-full px-3 py-2 border border-transparent hover:border-[var(--border)] focus:border-cyan-500 rounded-lg bg-transparent"
                      >
                        {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input 
                      type="time" 
                      value={item.jam_masuk} 
                      onChange={(e) => handleUpdate(item, 'jam_masuk', e.target.value)} 
                      onBlur={() => saveUpdate(item)}
                      className="px-3 py-2 border border-transparent hover:border-[var(--border)] focus:border-cyan-500 rounded-lg text-center bg-transparent" 
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input 
                      type="time" 
                      value={item.jam_pulang} 
                      onChange={(e) => handleUpdate(item, 'jam_pulang', e.target.value)} 
                      onBlur={() => saveUpdate(item)}
                      className="px-3 py-2 border border-transparent hover:border-[var(--border)] focus:border-cyan-500 rounded-lg text-center bg-transparent" 
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      disabled={loading === item.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Aturan"
                    >
                      {loading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}

              {aturan.length === 0 && !isAdding && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    Belum ada aturan jam kerja untuk Tipe Jadwal ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

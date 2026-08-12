"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type FilterPanelProps = {
  bagianList: { id: number; bagian: string }[];
  defaultDate: string;
  defaultBagian: string;
};

export default function FilterPanel({ bagianList, defaultDate, defaultBagian }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [date, setDate] = useState(defaultDate);
  const [bagian, setBagian] = useState(defaultBagian);

  const applyFilters = (newDate: string, newBagian: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newDate) params.set("date", newDate);
    else params.delete("date");

    if (newBagian) params.set("bagian", newBagian);
    else params.delete("bagian");

    router.push(`?${params.toString()}`);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    applyFilters(newDate, bagian);
  };

  const handleBagianChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBagian = e.target.value;
    setBagian(newBagian);
    applyFilters(date, newBagian);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-600">Pilih Tanggal</label>
        <input 
          type="date" 
          value={date}
          onChange={handleDateChange}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-600">Filter Bagian</label>
        <select 
          value={bagian}
          onChange={handleBagianChange}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none min-w-[200px]"
        >
          <option value="">Semua Bagian</option>
          {bagianList.map((b) => (
            <option key={b.id} value={b.bagian}>{b.bagian}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

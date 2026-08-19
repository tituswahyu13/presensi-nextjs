"use client";

import { Trash2 } from "lucide-react";
import { deletePegawai } from "@/app/actions/pegawai";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id, nama }: { id: number, nama: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm(`Yakin ingin menghapus data ${nama}? Akun loginnya juga akan terhapus.`)) {
      setIsDeleting(true);
      const res = await deletePegawai(id);
      if (!res.success) {
        alert(res.message);
      } else {
        router.refresh();
      }
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

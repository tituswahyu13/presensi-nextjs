"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- JAM KERJA KANTOR ---

export async function getJamKerjaKantor() {
  const data = await prisma.jam_kerja.findUnique({
    where: { id: 1 },
  });
  return data;
}

export async function updateJamKerjaKantor(formData: FormData) {
  try {
    const dataToUpdate = {
      jam_masuk_senin: formData.get("jam_masuk_senin") ? new Date(`1970-01-01T${formData.get("jam_masuk_senin")}:00Z`) : null,
      jam_pulang_senin: formData.get("jam_pulang_senin") ? new Date(`1970-01-01T${formData.get("jam_pulang_senin")}:00Z`) : null,
      jam_masuk_selasa: formData.get("jam_masuk_selasa") ? new Date(`1970-01-01T${formData.get("jam_masuk_selasa")}:00Z`) : null,
      jam_pulang_selasa: formData.get("jam_pulang_selasa") ? new Date(`1970-01-01T${formData.get("jam_pulang_selasa")}:00Z`) : null,
      jam_masuk_rabu: formData.get("jam_masuk_rabu") ? new Date(`1970-01-01T${formData.get("jam_masuk_rabu")}:00Z`) : null,
      jam_pulang_rabu: formData.get("jam_pulang_rabu") ? new Date(`1970-01-01T${formData.get("jam_pulang_rabu")}:00Z`) : null,
      jam_masuk_kamis: formData.get("jam_masuk_kamis") ? new Date(`1970-01-01T${formData.get("jam_masuk_kamis")}:00Z`) : null,
      jam_pulang_kamis: formData.get("jam_pulang_kamis") ? new Date(`1970-01-01T${formData.get("jam_pulang_kamis")}:00Z`) : null,
      jam_masuk_jumat: formData.get("jam_masuk_jumat") ? new Date(`1970-01-01T${formData.get("jam_masuk_jumat")}:00Z`) : null,
      jam_pulang_jumat: formData.get("jam_pulang_jumat") ? new Date(`1970-01-01T${formData.get("jam_pulang_jumat")}:00Z`) : null,
      jam_masuk_sabtu: formData.get("jam_masuk_sabtu") ? new Date(`1970-01-01T${formData.get("jam_masuk_sabtu")}:00Z`) : null,
      jam_pulang_sabtu: formData.get("jam_pulang_sabtu") ? new Date(`1970-01-01T${formData.get("jam_pulang_sabtu")}:00Z`) : null,
    };

    // Use upsert in case row id=1 doesn't exist yet
    await prisma.jam_kerja.upsert({
      where: { id: 1 },
      update: dataToUpdate,
      create: { id: 1, ...dataToUpdate },
    });

    revalidatePath("/admin/jam-kerja/kantor");
    return { success: true, message: "Jam kerja kantor berhasil diperbarui" };
  } catch (error) {
    console.error("Error updating jam kerja kantor:", error);
    return { success: false, message: "Terjadi kesalahan saat memperbarui data" };
  }
}

// --- JAM KERJA SHIFT ---

export async function getJamKerjaShift() {
  const data = await prisma.shift.findUnique({
    where: { id: 1 },
  });
  return data;
}

export async function updateJamKerjaShift(formData: FormData) {
  try {
    const keys = [
      "masuk_a", "pulang_a", "masuk_b", "pulang_b", 
      "masuk_c", "pulang_c", "masuk_d", "pulang_d", 
      "masuk_e", "pulang_e", "masuk_f", "pulang_f", 
      "masuk_g", "pulang_g", "masuk_h", "pulang_h", 
      "masuk_i", "pulang_i"
    ];

    const dataToUpdate: any = {};
    for (const key of keys) {
      const val = formData.get(key);
      dataToUpdate[key] = val ? new Date(`1970-01-01T${val}:00Z`) : null;
    }

    await prisma.shift.upsert({
      where: { id: 1 },
      update: dataToUpdate,
      create: { id: 1, ...dataToUpdate },
    });

    revalidatePath("/admin/jam-kerja/shift");
    return { success: true, message: "Jam kerja shift berhasil diperbarui" };
  } catch (error) {
    console.error("Error updating jam kerja shift:", error);
    return { success: false, message: "Terjadi kesalahan saat memperbarui data" };
  }
}

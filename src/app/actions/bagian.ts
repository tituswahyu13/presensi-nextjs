"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBagian(data: any) {
  try {
    const parent_id = data.parent_id ? parseInt(data.parent_id) : null;
    
    const jabatanCreateData = Array.isArray(data.jabatanList) 
      ? data.jabatanList.filter(j => !j.id).map((j: any) => ({
          jabatan: j.jabatan,
          is_kepala: j.is_kepala
        }))
      : [];

    const jabatanConnectData = Array.isArray(data.jabatanList)
      ? data.jabatanList.filter(j => j.id).map(j => ({ id: parseInt(j.id) }))
      : [];

    const newBagian = await prisma.bagian.create({
      data: {
        bagian: data.bagian,
        parent_id: parent_id,
        jabatan: {
          create: jabatanCreateData,
          connect: jabatanConnectData.length > 0 ? jabatanConnectData : undefined
        }
      },
    });

    if (jabatanConnectData.length > 0) {
      for (const j of data.jabatanList.filter((j: any) => j.id)) {
        await prisma.jabatan.update({
          where: { id: parseInt(j.id) },
          data: { is_kepala: j.is_kepala }
        });
      }
    }

    revalidatePath("/admin/bagian");
    revalidatePath("/admin/jabatan");
    revalidatePath("/admin/struktur");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateBagian(id: number, data: any) {
  try {
    const parent_id = data.parent_id ? parseInt(data.parent_id) : null;
    
    // Prevent setting self as parent
    if (parent_id === id) {
       return { success: false, message: "Bagian tidak bisa menjadi induk bagi dirinya sendiri." };
    }
    
    let jabatanMutation = {};
    let newlyConnected: any[] = [];

    if (Array.isArray(data.jabatanList)) {
      const existingJabatan = await prisma.jabatan.findMany({ where: { id_bagian: id } });
      const existingIds = existingJabatan.map(ej => ej.id);
      
      const incomingIds = data.jabatanList.filter((j: any) => j.id).map((j: any) => parseInt(j.id));
      
      const toSoftDelete = existingJabatan
        .filter(ej => !incomingIds.includes(ej.id))
        .map(ej => ({
          where: { id: ej.id },
          data: { is_deleted: true }
        }));
        
      const toCreate = data.jabatanList
        .filter((j: any) => !j.id)
        .map((j: any) => ({ jabatan: j.jabatan, is_kepala: j.is_kepala }));

      const toConnect = data.jabatanList
        .filter((j: any) => j.id && !existingIds.includes(parseInt(j.id)))
        .map((j: any) => ({ id: parseInt(j.id) }));
        
      newlyConnected = data.jabatanList.filter((j: any) => j.id && !existingIds.includes(parseInt(j.id)));
        
      const toUpdate = data.jabatanList
        .filter((j: any) => j.id && existingIds.includes(parseInt(j.id)))
        .map((j: any) => ({
          where: { id: parseInt(j.id) },
          data: { jabatan: j.jabatan, is_kepala: j.is_kepala }
        }));

      const allUpdates = [...toUpdate, ...toSoftDelete];

      jabatanMutation = {
        create: toCreate.length > 0 ? toCreate : undefined,
        update: allUpdates.length > 0 ? allUpdates : undefined,
        connect: toConnect.length > 0 ? toConnect : undefined
      };
    }

    await prisma.bagian.update({
      where: { id },
      data: {
        bagian: data.bagian,
        parent_id: parent_id,
        jabatan: Object.keys(jabatanMutation).length > 0 ? jabatanMutation : undefined,
      },
    });

    if (newlyConnected.length > 0) {
      for (const j of newlyConnected) {
        await prisma.jabatan.update({
          where: { id: parseInt(j.id) },
          data: { is_kepala: j.is_kepala }
        });
      }
    }
    revalidatePath("/admin/bagian");
    revalidatePath("/admin/jabatan");
    revalidatePath("/admin/struktur");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteBagian(id: number) {
  try {
    await prisma.bagian.update({
      where: { id }, data: { is_deleted: true },
    });
    revalidatePath("/admin/bagian");
    revalidatePath("/admin/jabatan");
    revalidatePath("/admin/struktur");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateBagianParent(id: number, newParentId: number | null) {
  try {
    if (newParentId === id) {
       return { success: false, message: "Bagian tidak bisa menjadi induk bagi dirinya sendiri." };
    }
    
    if (newParentId !== null) {
      let currentId: number | null = newParentId;
      while (currentId) {
        if (currentId === id) {
          return { success: false, message: "Siklus terdeteksi! Tidak dapat memindahkan divisi ini ke bawah bawahannya sendiri." };
        }
        const record: any = await prisma.bagian.findUnique({ where: { id: currentId } });
        currentId = record?.parent_id || null;
      }
    }

    await prisma.bagian.update({
      where: { id },
      data: { parent_id: newParentId },
    });
    revalidatePath("/admin/struktur");
    revalidatePath("/admin/bagian");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

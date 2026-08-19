const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function runTest() {
  try {
    console.log("1. Creating dummy pegawai...");
    const hashedPassword = await bcrypt.hash('dummy123', 10);
    const newPegawai = await prisma.pegawai.create({
      data: {
        nama: "Test Dummy",
        nik: "dummy123",
        jabatan: "Tester",
        bagian: "IT",
        lokasi_presensi: "Kantor",
      }
    });
    console.log("Created Pegawai ID:", newPegawai.id);

    console.log("2. Creating users...");
    const newUser = await prisma.users.create({
      data: {
        username: "dummy123",
        password: hashedPassword,
        role: "pegawai",
        status: "Aktif",
        id_pegawai: newPegawai.id,
      }
    });
    console.log("Created User ID:", newUser.id);

    console.log("3. Updating pegawai...");
    await prisma.pegawai.update({
      where: { id: newPegawai.id },
      data: { nama: "Test Dummy Updated" }
    });
    console.log("Updated!");

    console.log("4. Deleting pegawai...");
    await prisma.pegawai.delete({
      where: { id: newPegawai.id }
    });
    console.log("Deleted!");

    console.log("CRUD test completed successfully!");
  } catch (e) {
    console.error("Test failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}
runTest();

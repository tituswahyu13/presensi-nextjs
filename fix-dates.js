const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Fixing '0000-00-00' dates in MySQL...");
    await prisma.$executeRawUnsafe(`UPDATE pegawai SET pensiun = NULL WHERE CAST(pensiun AS CHAR) = '0000-00-00' OR pensiun IS NULL OR pensiun = '0000-00-00 00:00:00'`);
    await prisma.$executeRawUnsafe(`UPDATE pegawai SET lahir = NULL WHERE CAST(lahir AS CHAR) = '0000-00-00' OR lahir = '0000-00-00 00:00:00'`);
    await prisma.$executeRawUnsafe(`UPDATE pegawai SET mulai_kerja = NULL WHERE CAST(mulai_kerja AS CHAR) = '0000-00-00' OR mulai_kerja = '0000-00-00 00:00:00'`);
    console.log("Dates fixed successfully!");
  } catch (e) {
    console.error("Error fixing dates:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

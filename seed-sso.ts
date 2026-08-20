import { PrismaClient as PresensiPrisma } from "@prisma/client";
import { PrismaClient as SsoPrisma } from "@prisma-sso/client";

const presensiDb = new PresensiPrisma();
const ssoDb = new SsoPrisma();

async function main() {
  console.log("Fetching users from presensi...");
  const users = await presensiDb.users.findMany();
  
  console.log(`Found ${users.length} users. Migrating to SSO DB...`);
  for (const u of users) {
    const existing = await ssoDb.users.findUnique({ where: { id: u.id } });
    if (existing) {
      await ssoDb.users.update({
        where: { id: u.id },
        data: {
          id_pegawai: u.id_pegawai,
          username: u.username,
          password: u.password,
          status: u.status,
          role: u.role,
          ruang: u.ruang,
        },
      });
    } else {
      await ssoDb.users.create({
        data: {
          id: u.id,
          id_pegawai: u.id_pegawai,
          username: u.username,
          password: u.password,
          status: u.status,
          role: u.role,
          ruang: u.ruang,
        },
      });
    }
  }
  console.log("Migration complete!");
}

main()
  .catch(console.error)
  .finally(() => {
    presensiDb.$disconnect();
    ssoDb.$disconnect();
  });

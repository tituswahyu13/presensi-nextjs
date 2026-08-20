import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Kredensial tidak valid");
        }

        const user = await prisma.users.findFirst({
          where: { username: credentials.username },
          include: {
            pegawai: {
              select: {
                nama: true,
                nik: true,
                jabatan: true,
                lokasi_presensi: true,
                foto: true,
                tipe_jadwal: true
              }
            }
          }
        });

        if (!user || !user.password) {
          throw new Error("Username atau password salah");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error("Username atau password salah");
        }

        if (user.status !== "Aktif") {
          throw new Error("Akun Anda belum aktif");
        }

        return {
          id: user.id.toString(),
          name: user.pegawai?.nama || user.username,
          role: user.role,
          id_pegawai: user.id_pegawai,
          nik: user.pegawai?.nik,
          jabatan: user.pegawai?.jabatan,
          lokasi_presensi: user.pegawai?.lokasi_presensi,
          foto: user.pegawai?.foto,
          tipe_jadwal: user.pegawai?.tipe_jadwal
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id_pegawai = user.id_pegawai;
        token.nik = user.nik;
        token.jabatan = user.jabatan;
        token.lokasi_presensi = user.lokasi_presensi;
        token.foto = user.foto;
        token.tipe_jadwal = user.tipe_jadwal;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id_pegawai = token.id_pegawai as number;

        // If logged in via SSO (Portal), fetch pegawai data from DB
        if (!token.nik && token.id_pegawai) {
          const userPegawai = await prisma.pegawai.findUnique({
            where: { id: token.id_pegawai as number },
            select: { nik: true, jabatan: true, lokasi_presensi: true, foto: true, tipe_jadwal: true }
          });
          if (userPegawai) {
            session.user.nik = userPegawai.nik;
            session.user.jabatan = userPegawai.jabatan;
            session.user.lokasi_presensi = userPegawai.lokasi_presensi;
            session.user.foto = userPegawai.foto;
            session.user.tipe_jadwal = userPegawai.tipe_jadwal;
          }
        } else {
          session.user.nik = token.nik as string;
          session.user.jabatan = token.jabatan as string;
          session.user.lokasi_presensi = token.lokasi_presensi as string;
          session.user.foto = token.foto as string;
          session.user.tipe_jadwal = token.tipe_jadwal as string;
        }
      }
      return session;
    },
    // Allow cross-port callback (back to localhost:3001 after portal SSO login)
    async redirect({ url, baseUrl }) {
      if (url.startsWith("http://localhost:")) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    }
  },
  pages: {
    signIn: "http://localhost:3000/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

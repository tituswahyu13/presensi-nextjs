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
            pegawai: true
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
          foto: user.pegawai?.foto
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id_pegawai = token.id_pegawai as number;
        session.user.nik = token.nik as string;
        session.user.jabatan = token.jabatan as string;
        session.user.lokasi_presensi = token.lokasi_presensi as string;
        session.user.foto = token.foto as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

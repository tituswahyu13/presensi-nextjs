"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "http://localhost:3000/login" })}
      className="logout-btn flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm"
      style={{ color: "#f87171" }}>
      <LogOut className="w-4 h-4" /> Keluar
    </button>
  );
}

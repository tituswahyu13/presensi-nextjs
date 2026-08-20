"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect unauthenticated users to the Centralized SSO Portal
    window.location.href = "http://localhost:3001/login";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
        <p className="text-[var(--text-muted)] font-medium">Mengarahkan ke Portal SSO...</p>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";
import AdminSidebarNav from "./AdminSidebarNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin" && session.user.role !== "superadmin") {
    redirect("http://localhost:3001/login?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fadmin%2Fpresensi");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-cyan-600">Admin PresPAM</h1>
        </div>
        
        <AdminSidebarNav />
        
        <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
          <a 
            href="http://localhost:3001"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <i className="fas fa-th-large text-gray-400"></i>
            Kembali ke Portal
          </a>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm">
              A
            </div>
            <span className="text-sm font-medium text-gray-600">Administrator</span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

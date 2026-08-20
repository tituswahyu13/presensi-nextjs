export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Pegawai</p>
            <h3 className="text-2xl font-bold text-gray-800">--</h3>
          </div>
          <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center">
            <i className="fas fa-users text-xl"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Hadir Hari Ini</p>
            <h3 className="text-2xl font-bold text-gray-800">--</h3>
          </div>
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <i className="fas fa-check-circle text-xl"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Lokasi Presensi</p>
            <h3 className="text-2xl font-bold text-gray-800">--</h3>
          </div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <i className="fas fa-map-marker-alt text-xl"></i>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Selamat datang di Admin PresPAM</h2>
        <p className="text-gray-600">Gunakan menu di sebelah kiri untuk mengelola data master, presensi, jadwal, dan lainnya.</p>
      </div>
    </div>
  );
}

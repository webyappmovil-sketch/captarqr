export default function PartnerDashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
      <p className="text-gray-400 text-sm mb-6">
        Resumen de tu red de negocios y actividad
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Negocios</p>
          <p className="text-3xl font-bold text-white mt-1">0</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Leads</p>
          <p className="text-3xl font-bold text-white mt-1">0</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Vendedores</p>
          <p className="text-3xl font-bold text-white mt-1">0</p>
        </div>
      </div>
    </div>
  );
}
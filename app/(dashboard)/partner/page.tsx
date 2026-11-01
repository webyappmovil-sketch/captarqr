import { requireRole } from '@/lib/auth';
import { Users, Store, Key, TrendingUp } from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';

export default async function PartnerDashboardPage() {
  await requireRole(['partner', 'super_admin']);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 mt-1">Resumen de tu red de negocios y licencias</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Vendedores" value={0} icon={Users} color="blue" />
        <StatsCard title="Negocios" value={0} icon={Store} color="green" />
        <StatsCard title="Licencias Activas" value={0} icon={Key} color="purple" />
        <StatsCard title="Licencias Disponibles" value={0} icon={TrendingUp} color="orange" />
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 text-center text-gray-500">
        <p>Crea vendedores y registra negocios para empezar a ver datos de tu red.</p>
      </div>
    </div>
  );
}

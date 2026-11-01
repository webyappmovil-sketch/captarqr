import { requireRole } from '@/lib/auth';
import { QrCode, Users, Gift, MousePointerClick } from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';

export default async function BusinessDashboardPage() {
  await requireRole(['business_owner', 'business_staff', 'super_admin']);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 mt-1">
          Resumen de captación y actividad de tu negocio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Escaneos hoy" value={0} icon={QrCode} color="green" />
        <StatsCard title="Clientes hoy" value={0} icon={Users} color="blue" />
        <StatsCard title="Premios entregados" value={0} icon={Gift} color="purple" />
        <StatsCard title="Clics en enlaces" value={0} icon={MousePointerClick} color="orange" />
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 text-center text-gray-500">
        <p>Conecta tu negocio y crea tu primer QR para empezar a ver datos.</p>
      </div>
    </div>
  );
}

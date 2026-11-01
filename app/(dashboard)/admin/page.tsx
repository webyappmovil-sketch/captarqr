import { createClient } from '@/lib/supabase/server';
import { Users, Store, Key, TrendingUp } from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import RecentActivity from '@/components/admin/RecentActivity';
import PartnersOverview from '@/components/admin/PartnersOverview';

async function getAdminStats() {
  const supabase = await createClient();

  const [
    { count: partnersCount },
    { count: businessesCount },
    { count: activeLicenses },
    { count: totalLeads },
  ] = await Promise.all([
    supabase.from('partners').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('licenses').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
  ]);

  return {
    partners: partnersCount || 0,
    businesses: businessesCount || 0,
    activeLicenses: activeLicenses || 0,
    totalLeads: totalLeads || 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 mt-1">Resumen global de la plataforma CAPTARQR</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Partners" value={stats.partners} icon={Users} color="green" />
        <StatsCard title="Negocios" value={stats.businesses} icon={Store} color="blue" />
        <StatsCard title="Licencias Activas" value={stats.activeLicenses} icon={Key} color="purple" />
        <StatsCard title="Leads Totales" value={stats.totalLeads} icon={TrendingUp} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PartnersOverview />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

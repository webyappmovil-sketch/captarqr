import PartnersOverview from '@/components/admin/PartnersOverview';

export default function AdminPartnersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Partners</h2>
      <p className="text-gray-400 text-sm mb-6">
        Gestión de la red de partners de CAPTARQR
      </p>
      <PartnersOverview />
    </div>
  );
}
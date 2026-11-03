import Link from 'next/link';
import PartnersOverview from '@/components/admin/PartnersOverview';

export default function AdminPartnersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Partners</h2>
          <p className="text-gray-400 text-sm">
            Gestión de la red de partners de CAPTARQR
          </p>
        </div>
        <Link
          href="/admin/partners/new"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Nuevo Partner
        </Link>
      </div>
      <PartnersOverview />
    </div>
  );
}
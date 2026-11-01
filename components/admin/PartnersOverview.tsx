import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

async function getRecentPartners() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('partners')
    .select('id, name, country_code, is_active, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5);
  return data || [];
}

export default async function PartnersOverview() {
  const partners = await getRecentPartners();

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="font-semibold text-white">Partners recientes</h3>
        <Link href="/admin/partners" className="text-sm text-[#25D366] hover:underline">
          Ver todos
        </Link>
      </div>
      <div className="divide-y divide-gray-800">
        {partners.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">No hay partners todavía.</p>
        ) : (
          partners.map((partner) => (
            <div
              key={partner.id}
              className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-900/40 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-white">{partner.name}</p>
                <p className="text-xs text-gray-500">
                  {partner.country_code} ·{' '}
                  {new Date(partner.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  partner.is_active
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {partner.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

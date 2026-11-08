import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const statusLabel: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activa',
  paused: 'Pausada',
  finished: 'Finalizada',
};

export default async function BusinessCampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle();

  const { data: campaigns } = business
    ? await supabase
        .from('campaigns')
        .select('id, name, description, start_date, end_date, status, created_at')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Campañas</h2>
          <p className="text-gray-400 text-sm">
            Promociones por fechas · {business?.name}
          </p>
        </div>
        <Link
          href="/business/campaigns/new"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Nueva campaña
        </Link>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          Aún no hay campañas. Crea Black Friday, Navidad, apertura, etc.
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="text-white font-medium">{c.name}</p>
                {c.description && (
                  <p className="text-gray-500 text-sm mt-0.5">{c.description}</p>
                )}
                <p className="text-gray-600 text-xs mt-1">
                  {c.start_date ? new Date(c.start_date).toLocaleDateString('es-ES') : '—'} →{' '}
                  {c.end_date ? new Date(c.end_date).toLocaleDateString('es-ES') : '—'}
                </p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${
                  c.status === 'active'
                    ? 'bg-green-500/15 text-green-400'
                    : c.status === 'paused'
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-gray-500/15 text-gray-400'
                }`}
              >
                {statusLabel[c.status] || c.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
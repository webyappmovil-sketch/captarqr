import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function prizeTitle(title: unknown): string {
  if (!title) return 'Sin nombre';
  if (typeof title === 'string') return title;
  if (typeof title === 'object' && title !== null) {
    const t = title as Record<string, string>;
    return t.es || t.en || Object.values(t)[0] || 'Sin nombre';
  }
  return 'Sin nombre';
}

export default async function BusinessRoulettePage() {
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

  const { data: prizes } = business
    ? await supabase
        .from('roulette_prizes')
        .select(
          'id, title, probability, daily_limit, total_limit, is_active, sort_order, created_at'
        )
        .eq('business_id', business.id)
        .order('sort_order', { ascending: true })
    : { data: [] };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Ruleta</h2>
          <p className="text-gray-400 text-sm">
            Premios de la ruleta · {business?.name || 'tu negocio'}
          </p>
        </div>
        <Link
          href="/business/roulette/new"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Nuevo premio
        </Link>
      </div>

      {!business ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          No se encontró un negocio asociado.
        </div>
      ) : !prizes || prizes.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          Aún no hay premios. Crea el primero.
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {prizes.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <div>
                <p className="text-white font-medium">{prizeTitle(p.title)}</p>
                <p className="text-gray-500 text-sm">
                  Probabilidad: {p.probability ?? 0}% · Límite diario:{' '}
                  {p.daily_limit ?? '∞'} · Total: {p.total_limit ?? '∞'}
                </p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full ${
                  p.is_active
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-gray-500/15 text-gray-400'
                }`}
              >
                {p.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
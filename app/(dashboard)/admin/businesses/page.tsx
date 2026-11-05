import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminBusinessesPage() {
  const supabase = await createClient();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, status, country_code, email, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Negocios</h2>
          <p className="text-gray-400 text-sm">
            Todos los negocios de la plataforma
          </p>
        </div>
        <Link
          href="/admin/businesses/new"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Nuevo Negocio
        </Link>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        {!businesses || businesses.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Aún no hay negocios registrados.
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {businesses.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-800/40"
              >
                <div>
                  <p className="text-white font-medium">{b.name}</p>
                  <p className="text-gray-500 text-sm">
                    {b.country_code || '—'} · {b.email || 'sin email'} ·{' '}
                    {b.created_at
                      ? new Date(b.created_at).toLocaleDateString('es-ES')
                      : ''}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full ${
                    b.status === 'active'
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-gray-500/15 text-gray-400'
                  }`}
                >
                  {b.status || '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
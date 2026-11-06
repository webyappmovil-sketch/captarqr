import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function linkTitle(title: unknown): string {
  if (!title) return 'Sin título';
  if (typeof title === 'string') return title;
  if (typeof title === 'object' && title !== null) {
    const t = title as Record<string, string>;
    return t.es || t.en || Object.values(t)[0] || 'Sin título';
  }
  return 'Sin título';
}

export default async function BusinessLinksPage() {
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

  const { data: links } = business
    ? await supabase
        .from('links')
        .select('id, title, url, type, is_active, sort_order, click_count')
        .eq('business_id', business.id)
        .order('sort_order', { ascending: true })
    : { data: [] };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Enlaces</h2>
          <p className="text-gray-400 text-sm">
            Botones que verá el cliente tras la ruleta · {business?.name}
          </p>
        </div>
        <Link
          href="/business/links/new"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Nuevo enlace
        </Link>
      </div>

      {!links || links.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          Aún no hay enlaces. Crea Web, WhatsApp, Carta, etc.
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {links.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between px-5 py-4 gap-3"
            >
              <div className="min-w-0">
                <p className="text-white font-medium">{linkTitle(l.title)}</p>
                <p className="text-gray-500 text-sm truncate">{l.url}</p>
                <p className="text-gray-600 text-xs mt-1">
                  Tipo: {l.type || '—'} · Clics: {l.click_count ?? 0}
                </p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${
                  l.is_active
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-gray-500/15 text-gray-400'
                }`}
              >
                {l.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
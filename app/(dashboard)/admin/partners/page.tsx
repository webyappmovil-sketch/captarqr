import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminPartnersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: partners, error } = await supabase
    .from('partners')
    .select(
      'id, name, slug, company_name, phone, status, is_active, country_code, created_at'
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://captarqr.vercel.app';

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white">Partners</h2>
          <p className="text-gray-400 text-sm">
            Red comercial · {partners?.length ?? 0} registros
          </p>
        </div>
        <Link
          href="/admin/partners/new"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold text-sm px-4 py-2 rounded-lg"
        >
          + Nuevo partner
        </Link>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          {error.message}
        </div>
      )}

      {!partners || partners.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          No hay partners.
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Empresa / Tel</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Link de venta</th>
                <th className="px-4 py-3">Vendedores</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    <div>{p.company_name || '—'}</div>
                    <div className="text-xs">{p.phone || ''}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.is_active
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-gray-500/15 text-gray-400'
                      }`}
                    >
                      {p.status || (p.is_active ? 'active' : 'inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-[#25D366] break-all">
                      {appUrl}/r/{p.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/partners/${p.id}/sellers`}
                      className="text-xs text-white hover:text-[#25D366] underline"
                    >
                      Ver vendedores
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
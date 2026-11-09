import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import NewSellerForm from '@/components/admin/NewSellerForm';

export default async function PartnerSellersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: partner } = await supabase
    .from('partners')
    .select('id, name, slug')
    .eq('id', id)
    .maybeSingle();

  const { data: sellers, error } = await supabase
    .from('sellers')
    .select('id, partner_id, profile_id, commission_rate, is_active, created_at')
    .eq('partner_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://captarqr.vercel.app';

  return (
    <div>
      <Link href="/admin/partners" className="text-sm text-gray-400 hover:text-white">
        ← Partners
      </Link>

      <div className="mt-2 mb-6 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Vendedores · {partner?.name || 'Partner'}
          </h2>
          <p className="text-gray-400 text-sm">
            Link partner:{' '}
            <code className="text-[#25D366]">
              {appUrl}/r/{partner?.slug}
            </code>
          </p>
        </div>
        <NewSellerForm partnerId={id} />
      </div>

      {error && <p className="text-red-300 text-sm mb-4">{error.message}</p>}

      {!sellers || sellers.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          Aún no hay vendedores. Usa el botón de arriba.
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800">
                <th className="px-4 py-3">Profile ID</th>
                <th className="px-4 py-3">Comisión</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sellers.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-300">
                    {s.profile_id}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{s.commission_rate}%</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        s.is_active
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-gray-500/15 text-gray-400'
                      }`}
                    >
                      {s.is_active ? 'activo' : 'inactivo'}
                    </span>
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
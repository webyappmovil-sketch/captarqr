import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
      <h2 className="text-2xl font-bold text-white mt-2">
        Vendedores · {partner?.name || 'Partner'}
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Link partner:{' '}
        <code className="text-[#25D366]">
          {appUrl}/r/{partner?.slug}
        </code>
      </p>

      {error && <p className="text-red-300 text-sm mb-4">{error.message}</p>}

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-gray-400 text-sm">
        {(sellers || []).length === 0 ? (
          <p>
            Aún no hay vendedores. La alta con usuario/login y link propio{' '}
            <code className="text-gray-300">/r/{'{slug-vendedor}'}</code> la montamos en el
            siguiente paso (requiere crear usuario en Auth + fila en profiles + sellers).
          </p>
        ) : (
          <ul className="space-y-2">
            {sellers!.map((s) => (
              <li key={s.id} className="flex justify-between text-gray-300">
                <span className="font-mono text-xs">{s.profile_id}</span>
                <span>
                  {s.commission_rate}% · {s.is_active ? 'activo' : 'inactivo'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
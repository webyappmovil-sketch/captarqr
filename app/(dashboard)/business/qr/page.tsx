import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DeleteQrButton from '@/components/business/DeleteQrButton';

export default async function BusinessQrPage() {
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

  const { data: qrs } = business
    ? await supabase
        .from('qr_codes')
        .select('id, name, slug, is_active, scan_count, created_at')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://captarqr.vercel.app';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Códigos QR</h2>
          <p className="text-gray-400 text-sm">
            Crea y gestiona los QR de captación de tu negocio
          </p>
        </div>
        <Link
          href="/business/qr/new"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Nuevo QR
        </Link>
      </div>

      {!business ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          No se encontró un negocio asociado a tu cuenta.
        </div>
      ) : !qrs || qrs.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          Aún no tienes códigos QR. Crea el primero.
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {qrs.map((qr) => {
            const publicUrl = `${appUrl}/q/${qr.slug}`;
            return (
              <div
                key={qr.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="text-white font-medium">{qr.name}</p>
                  <p className="text-gray-500 text-sm break-all">{publicUrl}</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Escaneos: {qr.scan_count ?? 0}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-[#25D366] hover:underline"
                  >
                    Abrir
                  </a>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      qr.is_active
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-gray-500/15 text-gray-400'
                    }`}
                  >
                    {qr.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <DeleteQrButton id={qr.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
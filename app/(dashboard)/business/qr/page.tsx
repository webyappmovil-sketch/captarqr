import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import QrCard from '@/components/business/QrCard';

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
            Descarga e imprime tus QR de captación · {business?.name}
          </p>
        </div>
        <Link
          href="/business/qr/new"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Nuevo QR
        </Link>
      </div>

      {!qrs || qrs.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          Aún no tienes códigos QR. Crea el primero.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {qrs.map((qr) => (
            <QrCard
              key={qr.id}
              id={qr.id}
              name={qr.name}
              publicUrl={`${appUrl}/q/${qr.slug}`}
              scanCount={qr.scan_count ?? 0}
              isActive={!!qr.is_active}
            />
          ))}
        </div>
      )}
    </div>
  );
}
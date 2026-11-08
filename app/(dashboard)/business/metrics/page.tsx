import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function BusinessMetricsPage() {
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

  if (!business) {
    return <div className="text-gray-400">Sin negocio.</div>;
  }

  const bid = business.id;

  const [
    { count: leadsCount },
    { count: participationsCount },
    { count: qrCount },
    { data: qrs },
    { data: links },
  ] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('business_id', bid),
    supabase
      .from('participations')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', bid),
    supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('business_id', bid),
    supabase.from('qr_codes').select('name, scan_count').eq('business_id', bid),
    supabase.from('links').select('title, click_count, url').eq('business_id', bid),
  ]);

  const totalScans = (qrs || []).reduce((s, q) => s + (q.scan_count || 0), 0);
  const totalClicks = (links || []).reduce((s, l) => s + (l.click_count || 0), 0);

  const cards = [
    { label: 'Escaneos QR', value: totalScans },
    { label: 'Clientes (leads)', value: leadsCount ?? 0 },
    { label: 'Participaciones ruleta', value: participationsCount ?? 0 },
    { label: 'Códigos QR', value: qrCount ?? 0 },
    { label: 'Clics en enlaces', value: totalClicks },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Métricas</h2>
        <p className="text-gray-400 text-sm">Resumen de captación · {business.name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          >
            <p className="text-gray-400 text-sm">{c.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Escaneos por QR</h3>
        {!qrs || qrs.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin códigos QR.</p>
        ) : (
          <ul className="space-y-2">
            {qrs.map((q, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-gray-300">{q.name}</span>
                <span className="text-[#25D366] font-medium">{q.scan_count ?? 0}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
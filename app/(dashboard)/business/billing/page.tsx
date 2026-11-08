import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function BusinessBillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, plan_id, status')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!business) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
        No se encontró el negocio (revisa owner_profile_id).
      </div>
    );
  }

  const { count: qrCount } = await supabase
    .from('qr_codes')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', business.id);

  const { count: linksCount } = await supabase
    .from('links')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', business.id);

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: '19 €/mes',
      qr: 1,
      links: 1,
      desc: '1 ruleta y 1 enlace',
    },
    {
      id: 'commercial',
      name: 'Comercial',
      price: '49 €/mes',
      qr: 5,
      links: 5,
      desc: 'Hasta 5 QR y 5 enlaces',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '99 €/mes',
      qr: 20,
      links: 20,
      desc: 'Hasta 20 QR y 20 enlaces',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Facturación</h2>
        <p className="text-gray-400 text-sm">Plan y uso · {business.name}</p>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <p className="text-gray-400 text-sm">Estado del negocio</p>
        <p className="text-white font-semibold mt-1">
          Estado: {business.status || '—'} · Plan: {business.plan_id || 'sin asignar'}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Uso actual: {qrCount ?? 0} QR · {linksCount ?? 0} enlaces
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.id}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 flex flex-col"
          >
            <p className="text-white font-bold text-lg">{p.name}</p>
            <p className="text-[#25D366] font-semibold mt-1">{p.price}</p>
            <p className="text-gray-400 text-sm mt-2 flex-1">{p.desc}</p>
            <p className="text-gray-600 text-xs mt-3">
              {p.qr} QR · {p.links} enlaces
            </p>
            <button
              type="button"
              disabled
              className="mt-4 w-full border border-gray-700 text-gray-500 py-2 rounded-lg text-sm cursor-not-allowed"
            >
              Pagos próximamente
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
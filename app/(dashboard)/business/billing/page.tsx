import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const PLANS = [
  {
    id: 'starter',
    name: 'STARTER',
    price: '29,99 €/mes',
    tagline: 'Ideal para autónomos y pequeños negocios.',
    features: [
      '1 QR Inteligente',
      'Escaneos ilimitados',
      'Captación de clientes',
      'Ruleta de premios',
      'Base de datos de clientes',
      'Exportación de clientes',
      'Panel de métricas',
      'Estadísticas por fecha y hora',
    ],
    limits: '1 QR · 1 destino a elegir',
    checkout: 'https://checkout.revolut.com/pay/49115550-10f6-4e7b-8e36-74408997ae9',
  },
  {
    id: 'business',
    name: 'BUSINESS',
    price: '59,99 €/mes',
    tagline: 'Ideal para negocios en crecimiento.',
    features: [
      'Todo lo del plan Starter',
      'Hasta 5 QR Inteligentes',
      'Hasta 5 páginas de enlaces',
      'Hasta 5 agentes comerciales',
      'Base de datos unificada',
      'Métricas avanzadas',
      'Escaneos ilimitados',
      'Exportación Excel',
      'Soporte prioritario',
    ],
    limits: '5 QR · 5 enlaces',
    checkout: 'https://checkout.revolut.com/pay/cb041cbe-0fc5-466d-989c-c39055af5829',
    highlighted: true,
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: '99,99 €/mes',
    tagline: 'Ideal para empresas y equipos comerciales.',
    features: [
      'Todo lo del plan Business',
      'Hasta 20 QR Inteligentes',
      'Hasta 20 páginas de enlaces',
      'Hasta 20 agentes comerciales',
      'Gestión multiusuario',
      'Segmentación de clientes',
      'Analíticas avanzadas',
      'Exportación ilimitada',
      'Soporte prioritario',
      'Acceso anticipado a nuevas funciones',
    ],
    limits: '20 QR · 20 enlaces',
    checkout: 'https://checkout.revolut.com/pay/901d855c-ab81-4810-b7bb-91e9f3c66bbb',
  },
];

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
        No se encontró el negocio.
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

      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={`rounded-xl p-6 flex flex-col border ${
              p.highlighted
                ? 'bg-gray-900/80 border-[#25D366]/40 ring-1 ring-[#25D366]/30'
                : 'bg-gray-900/50 border-gray-800'
            }`}
          >
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Plan {p.name}
            </p>
            <p className="text-3xl font-bold text-white mt-2">{p.price}</p>
            <p className="text-gray-400 text-sm mt-1">{p.tagline}</p>

            <ul className="mt-5 space-y-2 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-[#25D366] shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <p className="text-xs text-gray-500 mt-4">{p.limits}</p>

            <a
              href={p.checkout}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-4 block w-full text-center font-semibold py-2.5 rounded-lg text-sm ${
                p.highlighted
                  ? 'bg-[#25D366] hover:bg-[#20bd5a] text-black'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-gray-700'
              }`}
            >
              Elegir {p.name}
            </a>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        El pago se procesa de forma segura con Revolut. Tras el pago, el administrador activará o
        actualizará tu plan en CAPTARQR.
      </p>
    </div>
  );
}
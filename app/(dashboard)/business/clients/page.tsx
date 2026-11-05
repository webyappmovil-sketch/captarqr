import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function BusinessClientsPage() {
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
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
        No se encontró un negocio asociado a tu cuenta.
      </div>
    );
  }

  const { data: leads } = await supabase
    .from('leads')
    .select(
      'id, first_name, last_name, whatsapp_full, whatsapp_number, country_code, privacy_accepted, created_at'
    )
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Clientes</h2>
        <p className="text-gray-400 text-sm">
          Leads captados con tus QR · {business.name}
        </p>
      </div>

      {!leads || leads.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          Aún no hay clientes captados.
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-400">
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">WhatsApp</th>
                  <th className="px-5 py-3 font-medium">País</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {leads.map((lead) => {
                  const name = [lead.first_name, lead.last_name]
                    .filter(Boolean)
                    .join(' ');
                  const phone =
                    lead.whatsapp_full || lead.whatsapp_number || '—';
                  return (
                    <tr key={lead.id} className="hover:bg-gray-800/40">
                      <td className="px-5 py-3 text-white font-medium">
                        {name || '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-300">{phone}</td>
                      <td className="px-5 py-3 text-gray-400">
                        {lead.country_code || '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {lead.created_at
                          ? new Date(lead.created_at).toLocaleString('es-ES')
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
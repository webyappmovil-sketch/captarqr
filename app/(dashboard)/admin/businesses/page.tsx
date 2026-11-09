import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminBusinessActions from '@/components/admin/AdminBusinessActions';

export default async function AdminBusinessesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(
      'id, name, email, phone, city, country_code, status, plan_id, created_at, is_demo'
    )
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Negocios</h2>
        <p className="text-gray-400 text-sm">
          Gestión de todos los negocios · {businesses?.length ?? 0} registros
        </p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          {error.message}
        </div>
      )}

      {!businesses || businesses.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          No hay negocios.
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium">Ubicación</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {businesses.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{b.name}</p>
                    {b.is_demo && (
                      <span className="text-[10px] text-amber-400">DEMO</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    <div>{b.email || '—'}</div>
                    <div className="text-xs text-gray-500">{b.phone || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {b.city || '—'}
                    {b.country_code ? ` · ${b.country_code}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        b.status === 'active'
                          ? 'bg-green-500/15 text-green-400'
                          : b.status === 'pending'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-gray-500/15 text-gray-400'
                      }`}
                    >
                      {b.status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs font-mono">
                    {b.plan_id
                      ? String(b.plan_id).slice(0, 8) + '…'
                      : 'sin plan'}
                  </td>
                  <td className="px-4 py-3">
                    <AdminBusinessActions
                      id={b.id}
                      currentStatus={b.status || 'pending'}
                    />
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
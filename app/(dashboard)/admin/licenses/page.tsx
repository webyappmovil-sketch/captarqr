import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AssignPlanForm from '@/components/admin/AssignPlanForm';

function planLabel(name: unknown, code: string): string {
  if (name && typeof name === 'object') {
    const n = name as Record<string, string>;
    return n.es || n.en || code;
  }
  if (typeof name === 'string') return name;
  return code;
}

export default async function AdminLicensesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, status, plan_id, email')
    .order('name', { ascending: true })
    .limit(200);

    const { data: plans } = await supabase
    .from('plans')
    .select('id, code, name, price_monthly, is_active')
    .order('price_monthly', { ascending: true });

  const planMap = new Map((plans || []).map((p) => [p.id, p]));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Licencias</h2>
        <p className="text-gray-400 text-sm">
          Asigna Starter (29,99) · Business (59,99) · Premium (99,99)
        </p>
      </div>

      {(!plans || plans.length === 0) && (
        <div className="text-amber-300 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
          No hay planes activos en la tabla plans.
        </div>
      )}

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-800">
              <th className="px-4 py-3">Negocio</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Plan actual</th>
              <th className="px-4 py-3">Asignar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(businesses || []).map((b) => {
              const plan = b.plan_id ? planMap.get(b.plan_id) : null;
              return (
                <tr key={b.id}>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{b.name}</p>
                    <p className="text-xs text-gray-500">{b.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{b.status}</td>
                  <td className="px-4 py-3 text-[#25D366]">
                    {plan
                      ? `${planLabel(plan.name, plan.code)} (${plan.price_monthly} €)`
                      : 'Sin plan'}
                  </td>
                  <td className="px-4 py-3">
                    <AssignPlanForm
                      businessId={b.id}
                      currentPlanId={b.plan_id || ''}
                      plans={(plans || []).map((p) => ({
                        id: p.id,
                        name: `${planLabel(p.name, p.code)} — ${p.price_monthly} €`,
                      }))}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
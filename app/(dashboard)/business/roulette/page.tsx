import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RouletteEditor from '@/components/business/RouletteEditor';
import RouletteSettings from '@/components/business/RouletteSettings';

function prizeTitle(title: unknown): string {
  if (!title) return '';
  if (typeof title === 'string') return title;
  if (typeof title === 'object' && title !== null) {
    const t = title as Record<string, string>;
    return t.es || t.en || Object.values(t)[0] || '';
  }
  return '';
}

export default async function BusinessRoulettePage() {
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

  const { data: prizes } = await supabase
    .from('roulette_prizes')
    .select('id, title, probability, daily_limit, total_limit, is_active, sort_order')
    .eq('business_id', business.id)
    .order('sort_order', { ascending: true });

  const { data: config } = await supabase
    .from('roulette_configs')
    .select('play_frequency, redeem_window, is_active, max_spins_per_person')
    .eq('business_id', business.id)
    .maybeSingle();

  const initial = (prizes || []).map((p, i) => ({
    id: p.id as string,
    title: prizeTitle(p.title),
    probability: Number(p.probability ?? 0),
    daily_limit: p.daily_limit != null ? Number(p.daily_limit) : null,
    is_active: p.is_active !== false,
    sort_order: p.sort_order ?? i,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Ruleta</h2>
        <p className="text-gray-400 text-sm">
          Configura casillas, frecuencia y canje · {business.name}
        </p>
      </div>

      <RouletteSettings
        initialFrequency={config?.play_frequency || 'once'}
        initialRedeem={config?.redeem_window || 'same_day'}
      />

      <RouletteEditor initialPrizes={initial} />
    </div>
  );
}
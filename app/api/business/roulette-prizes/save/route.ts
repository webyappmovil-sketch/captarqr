import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

type PrizeInput = {
  id?: string;
  title: string;
  probability: number;
  daily_limit: number | null;
  is_active: boolean;
  sort_order: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prizes: PrizeInput[] = Array.isArray(body.prizes) ? body.prizes : [];

    if (prizes.length < 2) {
      return NextResponse.json({ error: 'Mínimo 2 premios' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: business } = await admin
      .from('businesses')
      .select('id')
      .eq('owner_profile_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!business?.id) {
      return NextResponse.json({ error: 'Sin negocio' }, { status: 400 });
    }

    const { data: existing } = await admin
      .from('roulette_prizes')
      .select('id')
      .eq('business_id', business.id);

    const existingIds = new Set((existing || []).map((p) => p.id));
    const keptIds = new Set<string>();

    for (let i = 0; i < prizes.length; i++) {
      const p = prizes[i];
      const title = String(p.title || '').trim();
      if (!title) continue;

      const payload = {
        title: { es: title },
        description: { es: '' },
        probability: Number(p.probability) || 0,
        daily_limit: p.daily_limit == null ? null : Number(p.daily_limit),
        is_active: p.is_active !== false,
        sort_order: p.sort_order ?? i,
      };

      if (p.id && existingIds.has(p.id)) {
        const { error } = await admin
          .from('roulette_prizes')
          .update(payload)
          .eq('id', p.id)
          .eq('business_id', business.id);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        keptIds.add(p.id);
      } else {
        const { data: created, error } = await admin
          .from('roulette_prizes')
          .insert({
            business_id: business.id,
            ...payload,
          })
          .select('id')
          .single();
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        if (created?.id) keptIds.add(created.id);
      }
    }

    // Desactivar los que ya no están en el editor (no borrar: respeta prize_codes)
    const toDisable = [...existingIds].filter((id) => !keptIds.has(id));
    if (toDisable.length > 0) {
      await admin
        .from('roulette_prizes')
        .update({ is_active: false })
        .eq('business_id', business.id)
        .in('id', toDisable);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
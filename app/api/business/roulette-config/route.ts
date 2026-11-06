import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const play_frequency = body.play_frequency || 'once';
    const redeem_window = body.redeem_window || 'same_day';

    const allowedFreq = ['once', 'day', 'week', 'month'];
    const allowedRedeem = ['same_day', 'one_hour'];
    if (!allowedFreq.includes(play_frequency) || !allowedRedeem.includes(redeem_window)) {
      return NextResponse.json({ error: 'Valores inválidos' }, { status: 400 });
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
      .from('roulette_configs')
      .select('business_id')
      .eq('business_id', business.id)
      .maybeSingle();

    if (existing) {
      const { error } = await admin
        .from('roulette_configs')
        .update({
          play_frequency,
          redeem_window,
          updated_at: new Date().toISOString(),
        })
        .eq('business_id', business.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    } else {
      const { error } = await admin.from('roulette_configs').insert({
        business_id: business.id,
        is_active: true,
        max_spins_per_person: 1,
        max_daily_spins_per_phone: 1,
        play_frequency,
        redeem_window,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
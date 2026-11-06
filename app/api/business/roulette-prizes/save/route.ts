import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prizes = Array.isArray(body.prizes) ? body.prizes : [];

    if (prizes.length < 2) {
      return NextResponse.json(
        { error: 'Mínimo 2 premios' },
        { status: 400 }
      );
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

    // Borrar premios actuales del negocio y recrear (editor simple)
    const { error: delError } = await admin
      .from('roulette_prizes')
      .delete()
      .eq('business_id', business.id);

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 400 });
    }

    const rows = prizes.map(
      (
        p: {
          title: string;
          probability: number;
          daily_limit: number | null;
          is_active: boolean;
          sort_order: number;
        },
        i: number
      ) => ({
        business_id: business.id,
        title: { es: String(p.title || '').trim() },
        description: { es: '' },
        probability: Number(p.probability) || 0,
        daily_limit: p.daily_limit == null ? null : Number(p.daily_limit),
        is_active: p.is_active !== false,
        sort_order: p.sort_order ?? i,
      })
    );

    const { error: insError } = await admin.from('roulette_prizes').insert(rows);
    if (insError) {
      return NextResponse.json({ error: insError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
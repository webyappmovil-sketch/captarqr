import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = (body.title || '').trim();
    const probability = Number(body.probability);
    const daily_limit = body.daily_limit ? Number(body.daily_limit) : null;
    const total_limit = body.total_limit ? Number(body.total_limit) : null;

    if (!title || Number.isNaN(probability)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
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

    const { count } = await admin
      .from('roulette_prizes')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business.id);

    const { data: prize, error } = await admin
      .from('roulette_prizes')
      .insert({
        business_id: business.id,
        title: { es: title },
        description: { es: '' },
        probability,
        daily_limit,
        total_limit,
        is_active: true,
        sort_order: count ?? 0,
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, prize });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = (body.title || '').trim();
    const url = (body.url || '').trim();
    const type = (body.type || 'web').trim();

    if (!title || !url) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
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
      .from('links')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business.id);

    const { error } = await admin.from('links').insert({
      business_id: business.id,
      title: { es: title },
      url,
      type,
      is_active: true,
      sort_order: count ?? 0,
      click_count: 0,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
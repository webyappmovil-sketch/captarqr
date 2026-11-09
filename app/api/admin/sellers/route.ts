import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partner_id, email, password, full_name, commission_rate } = body;

    if (!partner_id || !email || !password) {
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

    const { data: created, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'seller' },
    });

    if (authError || !created.user) {
      return NextResponse.json(
        { error: authError?.message || 'No se pudo crear el usuario' },
        { status: 400 }
      );
    }

    const profileId = created.user.id;

    await admin.from('profiles').upsert({
      id: profileId,
      email,
      full_name: full_name || email,
      role: 'seller',
    });

    const { error: sellerError } = await admin.from('sellers').insert({
      partner_id,
      profile_id: profileId,
      commission_rate: Number(commission_rate) || 10,
      is_active: true,
    });

    if (sellerError) {
      return NextResponse.json({ error: sellerError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, profile_id: profileId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
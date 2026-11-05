import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, password, business_name, phone, country } = body;

    if (!full_name || !email || !password || !business_name) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Error al crear usuario' },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email,
      full_name,
      role: 'business_owner',
      is_active: true,
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    const { data: partner } = await supabaseAdmin
      .from('partners')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    const slug =
      business_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36);

    const insertPayload: Record<string, unknown> = {
      name: business_name,
      slug,
      owner_profile_id: userId,
      is_active: true,
      country_code: (country || 'ES').slice(0, 2).toUpperCase(),
    };

    if (partner?.id) {
      insertPayload.partner_id = partner.id;
    }
    if (phone) {
      insertPayload.phone = phone;
    }

    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .insert(insertPayload)
      .select('id')
      .single();

    if (businessError) {
      return NextResponse.json({ error: businessError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      userId,
      businessId: business?.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
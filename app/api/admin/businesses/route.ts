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

    // 1. Usuario Auth
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

    // 2. Perfil
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

    // 3. Partner activo (CONTAPLUS)
    const { data: partner } = await supabaseAdmin
      .from('partners')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (!partner?.id) {
      return NextResponse.json(
        { error: 'No hay partner activo para asignar el negocio' },
        { status: 400 }
      );
    }

    const slug =
      business_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36);

    // 4. Negocio (columnas reales de tu tabla)
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .insert({
        name: business_name,
        slug,
        partner_id: partner.id,
        owner_profile_id: userId,
        email,
        phone: phone || null,
        country_code: (country || 'ES').slice(0, 2).toUpperCase(),
        status: 'active',
      })
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
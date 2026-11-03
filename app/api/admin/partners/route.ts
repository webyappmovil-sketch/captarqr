import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, company_name, phone, country, password } = body;

    if (!full_name || !email || !company_name || !password) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Crear usuario en Auth
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
      role: 'partner',
      is_active: true,
    });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

        // Generar slug simple
    const slug =
      company_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36);

    // 3. Partner (columnas reales)
    const { error: partnerError } = await supabaseAdmin.from('partners').insert({
      name: company_name,
      slug,
      owner_profile_id: userId,
      country_code: (country || 'ES').slice(0, 2).toUpperCase(),
      is_active: true,
    });

    if (partnerError) {
      return NextResponse.json(
        { error: partnerError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, userId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
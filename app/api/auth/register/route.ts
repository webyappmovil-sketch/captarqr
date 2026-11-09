import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const full_name = String(body.full_name || '').trim();
    const business_name = String(body.business_name || '').trim();
    const phone = String(body.phone || '').trim();
    const ref = String(body.ref || '').trim();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Email y contraseña (mín. 6) obligatorios' },
        { status: 400 }
      );
    }
    if (!business_name) {
      return NextResponse.json(
        { error: 'Nombre del negocio obligatorio' },
        { status: 400 }
      );
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1) Usuario Auth
    const { data: created, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'business_owner' },
    });

    if (authError || !created.user) {
      return NextResponse.json(
        { error: authError?.message || 'No se pudo crear el usuario' },
        { status: 400 }
      );
    }

    const userId = created.user.id;

    // 2) Profile (si falla por columnas, se ignora y el trigger puede crearlo)
    await admin.from('profiles').upsert({
      id: userId,
      email,
      full_name: full_name || email,
      role: 'business_owner',
    });

    // 3) Partner por ref (slug)
    let partner_id: string | null = null;
    if (ref) {
      const { data: partner } = await admin
        .from('partners')
        .select('id')
        .eq('slug', ref)
        .maybeSingle();
      partner_id = partner?.id ?? null;
    }

    // 4) Negocio
    const slug = `${slugify(business_name)}-${Date.now().toString(36).slice(-4)}`;

    const { error: bizError } = await admin.from('businesses').insert({
      name: business_name,
      slug,
      phone: phone || null,
      email,
      owner_profile_id: userId,
      partner_id,
      status: 'active',
      country_code: 'ES',
    });

    if (bizError) {
      return NextResponse.json({ error: bizError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
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
      return NextResponse.json({ qrs: [] });
    }

    const { data: qrs } = await admin
      .from('qr_codes')
      .select('id, name')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ qrs: qrs || [] });
  } catch {
    return NextResponse.json({ qrs: [] });
  }
}
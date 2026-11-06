import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, phone, qr_id, business_id, country_code, privacy_accepted } = body;

    if (!full_name || !phone || !business_id) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }
    if (!privacy_accepted) {
      return NextResponse.json(
        { error: 'Debes autorizar el uso de tus datos para participar' },
        { status: 400 }
      );
    }

    const parts = String(full_name).trim().split(/\s+/);
    const first_name = parts[0] || full_name;
    const last_name = parts.slice(1).join(' ') || null;

    const digits = String(phone).replace(/\D/g, '');
    const cc = (country_code || 'ES').toString().slice(0, 2).toUpperCase();
    const phonePrefix =
      cc === 'ES' ? '34' : cc === 'MX' ? '52' : cc === 'CO' ? '57' : '34';
    const whatsapp_number = digits.startsWith(phonePrefix)
      ? digits.slice(phonePrefix.length)
      : digits;
    const whatsapp_full = `${phonePrefix}${whatsapp_number}`;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ¿Ya participó este teléfono en este negocio?
    const { data: previous } = await supabase
      .from('participations')
      .select('id')
      .eq('business_id', business_id)
      .or(`phone.eq.${whatsapp_full},phone.eq.${whatsapp_number},phone.eq.${digits}`)
      .limit(1)
      .maybeSingle();

    if (previous) {
      return NextResponse.json(
        { error: 'Ya has participado con este número. Solo se permite una vez.' },
        { status: 403 }
      );
    }

    // También si ya hay lead con el mismo móvil en el negocio y ya jugó
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('business_id', business_id)
      .or(
        `whatsapp_number.eq.${whatsapp_number},whatsapp_full.eq.${whatsapp_full}`
      )
      .limit(1)
      .maybeSingle();

    if (existingLead) {
      const { data: played } = await supabase
        .from('participations')
        .select('id')
        .eq('lead_id', existingLead.id)
        .limit(1)
        .maybeSingle();
      if (played) {
        return NextResponse.json(
          { error: 'Ya has participado con este número. Solo se permite una vez.' },
          { status: 403 }
        );
      }
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        business_id,
        first_name,
        last_name,
        whatsapp_country_code: phonePrefix.slice(0, 4),
        whatsapp_number,
        privacy_accepted: true,
        country_code: cc,
        source_qr_id: qr_id || null,
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (qr_id) {
      const { data: qr } = await supabase
        .from('qr_codes')
        .select('scan_count')
        .eq('id', qr_id)
        .maybeSingle();
      if (qr) {
        await supabase
          .from('qr_codes')
          .update({ scan_count: (qr.scan_count || 0) + 1 })
          .eq('id', qr_id);
      }
    }

    return NextResponse.json({ success: true, lead_id: lead?.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function pickPrize(
  prizes: { id: string; title: unknown; probability: number }[]
) {
  const total = prizes.reduce((s, p) => s + Number(p.probability || 0), 0);
  if (total <= 0) return prizes[0];
  let r = Math.random() * total;
  for (const p of prizes) {
    r -= Number(p.probability || 0);
    if (r <= 0) return p;
  }
  return prizes[prizes.length - 1];
}

function prizeName(title: unknown): string {
  if (!title) return 'Premio';
  if (typeof title === 'string') return title;
  if (typeof title === 'object' && title !== null) {
    const t = title as Record<string, string>;
    return t.es || t.en || Object.values(t)[0] || 'Premio';
  }
  return 'Premio';
}

export async function POST(request: Request) {
  try {
    const { slug, lead_id } = await request.json();
    if (!slug || !lead_id) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: qr } = await supabase
      .from('qr_codes')
      .select('id, business_id')
      .eq('slug', slug)
      .maybeSingle();

    if (!qr) {
      return NextResponse.json({ error: 'QR no encontrado' }, { status: 404 });
    }

    // Evitar doble giro del mismo lead
    const { data: existing } = await supabase
      .from('participations')
      .select('id, prize_id')
      .eq('lead_id', lead_id)
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { data: prize } = await supabase
        .from('roulette_prizes')
        .select('title')
        .eq('id', existing.prize_id)
        .maybeSingle();
      return NextResponse.json({
        prize_name: prizeName(prize?.title),
        already_played: true,
      });
    }

    const { data: prizes } = await supabase
      .from('roulette_prizes')
      .select('id, title, probability')
      .eq('business_id', qr.business_id)
      .eq('is_active', true);

    if (!prizes || prizes.length === 0) {
      return NextResponse.json(
        { error: 'No hay premios configurados' },
        { status: 400 }
      );
    }

    const won = pickPrize(prizes);
    const code = `CQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const { data: prizeCode } = await supabase
      .from('prize_codes')
      .insert({
        prize_id: won.id,
        business_id: qr.business_id,
        code,
        status: 'assigned',
        lead_id,
        assigned_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    const { data: lead } = await supabase
      .from('leads')
      .select('whatsapp_full, whatsapp_number')
      .eq('id', lead_id)
      .maybeSingle();

    await supabase.from('participations').insert({
      business_id: qr.business_id,
      lead_id,
      prize_id: won.id,
      prize_code_id: prizeCode?.id || null,
      phone: lead?.whatsapp_full || lead?.whatsapp_number || null,
      result: 'won',
    });

    return NextResponse.json({
      prize_name: prizeName(won.title),
      code,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
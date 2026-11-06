import { createClient } from '@supabase/supabase-js';
import PublicCaptureFlow from '@/components/public/PublicCaptureFlow';

function prizeTitle(title: unknown): string {
  if (!title) return 'Premio';
  if (typeof title === 'string') return title;
  if (typeof title === 'object' && title !== null) {
    const t = title as Record<string, string>;
    return t.es || t.en || Object.values(t)[0] || 'Premio';
  }
  return 'Premio';
}

function linkTitle(title: unknown): string {
  if (!title) return 'Enlace';
  if (typeof title === 'string') return title;
  if (typeof title === 'object' && title !== null) {
    const t = title as Record<string, string>;
    return t.es || t.en || Object.values(t)[0] || 'Enlace';
  }
  return 'Enlace';
}

export default async function PublicQrPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: qr } = await supabase
    .from('qr_codes')
    .select('id, name, slug, is_active, business_id')
    .eq('slug', slug)
    .maybeSingle();

  if (!qr || qr.is_active === false) {
    return (
      <div className="min-h-screen bg-[#f0f7f2] flex items-center justify-center p-4">
        <p className="text-gray-500">Este QR no está disponible.</p>
      </div>
    );
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('id', qr.business_id)
    .maybeSingle();

  const { data: prizesRaw } = await supabase
    .from('roulette_prizes')
    .select('id, title, probability, is_active, sort_order')
    .eq('business_id', qr.business_id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const prizes = (prizesRaw || []).map((p) => ({
    id: p.id,
    name: prizeTitle(p.title),
    probability: Number(p.probability || 0),
  }));

    const { data: linksRaw } = await supabase
    .from('links')
    .select('title, url, is_active, sort_order, type, qr_id')
    .eq('business_id', qr.business_id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const links = (linksRaw || [])
    .filter((l) => l.url)
    .filter((l) => !l.qr_id || l.qr_id === qr.id) // de este QR o globales
    .map((l) => ({
      label: linkTitle(l.title),
      url: l.url as string,
    }));

  

  return (
    <div className="min-h-screen bg-[#f0f7f2] flex items-center justify-center p-4">
      <PublicCaptureFlow
        slug={slug}
        qrId={qr.id}
        businessId={qr.business_id}
        businessName={business?.name || 'Bienvenido'}
        prizes={prizes}
        links={links}
      />
    </div>
  );
}
import { createClient } from '@supabase/supabase-js';
import LeadForm from '@/components/public/LeadForm';

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
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
        <p className="text-gray-400">Este QR no está disponible.</p>
      </div>
    );
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('id', qr.business_id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-[#25D366] font-bold text-xl">CAPTARQR</p>
          <h1 className="text-2xl font-bold text-white mt-2">
            {business?.name || 'Bienvenido'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Déjanos tus datos y accede a promociones
          </p>
        </div>
        <LeadForm qrId={qr.id} businessId={qr.business_id} />
      </div>
    </div>
  );
}
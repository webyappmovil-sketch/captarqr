import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ReferralPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: partner } = await supabase
    .from('partners')
    .select('id, name, slug, company_name, is_active')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle();

  if (!partner || partner.is_active === false) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900/80 border border-gray-800 rounded-2xl p-8 text-center space-y-6">
        <p className="text-[#25D366] text-sm font-semibold">CAPTARQR</p>
        <h1 className="text-2xl font-bold">Invitación comercial</h1>
        <p className="text-gray-400 text-sm">
          Te invita <span className="text-white font-medium">{partner.name}</span>
          {partner.company_name ? ` · ${partner.company_name}` : ''}
        </p>
        <Link
          href={`/register?ref=${encodeURIComponent(partner.slug)}&type=business`}
          className="block w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold py-3 rounded-xl"
        >
          Registrar mi negocio
        </Link>
        <Link href="/login" className="block text-sm text-gray-400 hover:text-white">
          Ya tengo cuenta
        </Link>
      </div>
    </div>
  );
}
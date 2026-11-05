import SpinRoulette from '@/components/public/SpinRoulette';

export default async function SpinPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lead?: string }>;
}) {
  const { slug } = await params;
  const { lead } = await searchParams;

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <p className="text-[#25D366] font-bold text-xl mb-2">CAPTARQR</p>
        <h1 className="text-2xl font-bold text-white mb-6">¡Gira la ruleta!</h1>
        <SpinRoulette slug={slug} leadId={lead || ''} />
      </div>
    </div>
  );
}
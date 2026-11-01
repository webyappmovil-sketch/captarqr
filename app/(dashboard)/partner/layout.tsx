import { requireRole } from '@/lib/auth';
import PartnerSidebar from '@/components/partner/PartnerSidebar';
import PartnerHeader from '@/components/partner/PartnerHeader';

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(['partner', 'super_admin']);

  return (
    <div className="flex min-h-screen bg-[#0B1120]">
      <PartnerSidebar />
      <div className="flex-1 flex flex-col">
        <PartnerHeader user={user} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

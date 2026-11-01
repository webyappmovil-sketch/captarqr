import { requireRole } from '@/lib/auth';
import BusinessSidebar from '@/components/business/BusinessSidebar';
import BusinessHeader from '@/components/business/BusinessHeader';

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole([
    'business_owner',
    'business_staff',
    'super_admin',
  ]);

  return (
    <div className="flex min-h-screen bg-[#0B1120]">
      <BusinessSidebar />
      <div className="flex-1 flex flex-col">
        <BusinessHeader user={user} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

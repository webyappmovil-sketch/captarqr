import PartnerSidebar from '@/components/partner/PartnerSidebar';

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0B1120]">
      <PartnerSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-800 bg-[#111827] flex items-center px-6">
          <h1 className="text-lg font-semibold text-white">Panel Partner</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
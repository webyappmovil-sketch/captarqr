export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#25D366]">CAPTARQR</h1>
          <p className="text-gray-400 mt-2">Captación inteligente de clientes</p>
        </div>
        {children}
      </div>
    </div>
  );
}

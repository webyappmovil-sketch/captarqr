import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold text-[#25D366] mb-4">CAPTARQR</h1>
      <p className="text-gray-400 text-lg mb-8 text-center max-w-md">
        Transforma cualquier QR en una herramienta de captación de clientes
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="border border-gray-700 hover:border-gray-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Registrarse
        </Link>
      </div>
    </div>
  );
}

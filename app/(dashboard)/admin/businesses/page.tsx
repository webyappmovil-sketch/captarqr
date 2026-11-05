import Link from 'next/link';

export default function AdminBusinessesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Negocios</h2>
          <p className="text-gray-400 text-sm">
            Todos los negocios de la plataforma
          </p>
        </div>
        <Link
          href="/admin/businesses/new"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Nuevo Negocio
        </Link>
      </div>
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
        Crea el primer negocio con el botón de arriba.
      </div>
    </div>
  );
}
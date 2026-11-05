'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewQrPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/business/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear QR');
      router.push('/business/qr');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <Link href="/business/qr" className="text-sm text-gray-400 hover:text-white">
        ← Volver a QR
      </Link>
      <h2 className="text-2xl font-bold text-white mt-2 mb-1">Nuevo QR</h2>
      <p className="text-gray-400 text-sm mb-6">
        Ponle un nombre interno (ej. Barra, Terraza, Carta)
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nombre del QR</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            placeholder="QR principal"
          />
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg"
        >
          {loading ? 'Creando...' : 'Crear QR'}
        </button>
      </form>
    </div>
  );
}
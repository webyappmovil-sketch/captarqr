'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewBusinessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    business_name: '',
    phone: '',
    country: 'ES',
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear el negocio');

      setSuccess('Negocio creado correctamente');
      setTimeout(() => router.push('/admin/businesses'), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/admin/businesses" className="text-sm text-gray-400 hover:text-white">
          ← Volver a Negocios
        </Link>
        <h2 className="text-2xl font-bold text-white mt-2">Nuevo Negocio</h2>
        <p className="text-gray-400 text-sm">
          Crea el negocio y su usuario propietario
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nombre del negocio</label>
          <input
            required
            value={form.business_name}
            onChange={(e) => update('business_name', e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Nombre del propietario</label>
          <input
            required
            value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Email del propietario</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Contraseña temporal</label>
          <input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Teléfono</label>
          <input
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">País (código)</label>
          <input
            value={form.country}
            onChange={(e) => update('country', e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          />
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg"
        >
          {loading ? 'Creando...' : 'Crear Negocio'}
        </button>
      </form>
    </div>
  );
}
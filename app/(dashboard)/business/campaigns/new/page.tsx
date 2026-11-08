'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'draft',
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/business/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear');
      router.push('/business/campaigns');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <Link href="/business/campaigns" className="text-sm text-gray-400 hover:text-white">
        ← Volver a Campañas
      </Link>
      <h2 className="text-2xl font-bold text-white mt-2 mb-6">Nueva campaña</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nombre</label>
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Black Friday, Navidad..."
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Inicio</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => update('start_date', e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Fin</label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => update('end_date', e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Estado</label>
          <select
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          >
            <option value="draft">Borrador</option>
            <option value="active">Activa</option>
            <option value="paused">Pausada</option>
            <option value="finished">Finalizada</option>
          </select>
        </div>
        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg"
        >
          {loading ? 'Creando...' : 'Crear campaña'}
        </button>
      </form>
    </div>
  );
}
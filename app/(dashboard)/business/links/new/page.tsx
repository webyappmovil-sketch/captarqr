'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewLinkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    url: '',
    type: 'web',
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/business/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear enlace');
      router.push('/business/links');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <Link href="/business/links" className="text-sm text-gray-400 hover:text-white">
        ← Volver a Enlaces
      </Link>
      <h2 className="text-2xl font-bold text-white mt-2 mb-6">Nuevo enlace</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nombre (botón)</label>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="WhatsApp, Web, Carta..."
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">URL</label>
          <input
            required
            type="url"
            value={form.url}
            onChange={(e) => update('url', e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Tipo</label>
          <select
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          >
            <option value="web">Web</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="menu">Carta / Menú</option>
            <option value="instagram">Instagram</option>
            <option value="maps">Google Maps</option>
            <option value="other">Otro</option>
          </select>
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
          {loading ? 'Guardando...' : 'Crear enlace'}
        </button>
      </form>
    </div>
  );
}
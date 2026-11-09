'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

export default function NewPartnerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    company_name: '',
    phone: '',
    country_code: 'ES',
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear');
      router.push('/admin/partners');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  const previewSlug = form.name
    ? `${slugify(form.name)}-${Date.now().toString(36).slice(-4)}`
    : '—';

  return (
    <div className="max-w-lg">
      <Link href="/admin/partners" className="text-sm text-gray-400 hover:text-white">
        ← Volver a Partners
      </Link>
      <h2 className="text-2xl font-bold text-white mt-2 mb-6">Nuevo partner</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nombre *</label>
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Empresa</label>
          <input
            value={form.company_name}
            onChange={(e) => update('company_name', e.target.value)}
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
          <label className="block text-sm text-gray-300 mb-1">País</label>
          <select
            value={form.country_code}
            onChange={(e) => update('country_code', e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
          >
            <option value="ES">España</option>
            <option value="MX">México</option>
            <option value="CO">Colombia</option>
            <option value="AR">Argentina</option>
            <option value="EC">Ecuador</option>
          </select>
        </div>
        <p className="text-xs text-gray-500">
          Link de venta previsto:{' '}
          <span className="text-[#25D366]">/r/{previewSlug}</span>
        </p>
        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg"
        >
          {loading ? 'Creando...' : 'Crear partner'}
        </button>
      </form>
    </div>
  );
}
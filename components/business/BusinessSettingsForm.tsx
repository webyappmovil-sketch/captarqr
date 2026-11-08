'use client';

import { useState } from 'react';

export default function BusinessSettingsForm({
  initial,
}: {
  initial: {
    name: string;
    email: string;
    phone: string;
    city: string;
    country_code: string;
  };
}) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setError('');
    try {
      const res = await fetch('/api/business/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      setMsg('Configuración guardada');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4"
    >
      <div>
        <label className="block text-sm text-gray-300 mb-1">Nombre del negocio</label>
        <input
          required
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Email de contacto</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Ciudad</label>
          <input
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
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
            <option value="PE">Perú</option>
            <option value="CL">Chile</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg"
      >
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
      {msg && <p className="text-sm text-green-400">{msg}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
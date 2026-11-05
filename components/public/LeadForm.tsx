'use client';

import { useState } from 'react';

export default function LeadForm({
  qrId,
  businessId,
}: {
  qrId: string;
  businessId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          qr_id: qrId,
          business_id: businessId,
          country_code: 'ES',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar');
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <p className="text-[#25D366] text-lg font-semibold">¡Gracias!</p>
        <p className="text-gray-400 text-sm mt-2">
          Tus datos se han registrado correctamente.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
    >
      <div>
        <label className="block text-sm text-gray-300 mb-1">Nombre</label>
        <input
          required
          value={form.full_name}
          onChange={(e) => update('full_name', e.target.value)}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Email (opcional)</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">WhatsApp / Teléfono</label>
        <input
          required
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
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
        {loading ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  );
}
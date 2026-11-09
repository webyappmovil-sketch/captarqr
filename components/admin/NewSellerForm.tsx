'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewSellerForm({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    commission_rate: '10',
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: partnerId,
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          commission_rate: Number(form.commission_rate),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setOpen(false);
      setForm({ email: '', password: '', full_name: '', commission_rate: '10' });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-[#25D366] text-black font-semibold text-sm px-4 py-2 rounded-lg"
      >
        + Nuevo vendedor
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-3"
    >
      <p className="text-white font-medium">Crear vendedor</p>
      <input
        required
        placeholder="Nombre"
        value={form.full_name}
        onChange={(e) => update('full_name', e.target.value)}
        className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm"
      />
      <input
        required
        type="email"
        placeholder="Email (login)"
        value={form.email}
        onChange={(e) => update('email', e.target.value)}
        className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm"
      />
      <input
        required
        type="password"
        minLength={6}
        placeholder="Contraseña"
        value={form.password}
        onChange={(e) => update('password', e.target.value)}
        className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm"
      />
      <input
        placeholder="Comisión %"
        value={form.commission_rate}
        onChange={(e) => update('commission_rate', e.target.value)}
        className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#25D366] text-black font-semibold text-sm px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Creando…' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-gray-400 text-sm px-3"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
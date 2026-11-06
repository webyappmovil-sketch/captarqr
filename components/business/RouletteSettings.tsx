'use client';

import { useState } from 'react';

export default function RouletteSettings({
  initialFrequency,
  initialRedeem,
}: {
  initialFrequency: string;
  initialRedeem: string;
}) {
  const [playFrequency, setPlayFrequency] = useState(initialFrequency);
  const [redeemWindow, setRedeemWindow] = useState(initialRedeem);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function save() {
    setLoading(true);
    setMsg('');
    setError('');
    try {
      const res = await fetch('/api/business/roulette-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          play_frequency: playFrequency,
          redeem_window: redeemWindow,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setMsg('Configuración guardada');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 space-y-4">
      <h3 className="text-white font-semibold">Reglas de participación y canje</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Un premio por persona cada
          </label>
          <select
            value={playFrequency}
            onChange={(e) => setPlayFrequency(e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm"
          >
            <option value="once">Una sola vez (histórico)</option>
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            El premio se puede canjear
          </label>
          <select
            value={redeemWindow}
            onChange={(e) => setRedeemWindow(e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm"
          >
            <option value="same_day">Solo el día en que se gana</option>
            <option value="one_hour">Hasta 1 hora después</option>
          </select>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Si elige “una sola vez”, el mismo WhatsApp no vuelve a jugar en este negocio.
      </p>
      <button
        type="button"
        onClick={save}
        disabled={loading}
        className="bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg text-sm"
      >
        {loading ? 'Guardando...' : 'Guardar reglas'}
      </button>
      {msg && <p className="text-sm text-green-400">{msg}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
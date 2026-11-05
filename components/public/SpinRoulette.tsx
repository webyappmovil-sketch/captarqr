'use client';

import { useState } from 'react';

export default function SpinRoulette({
  slug,
  leadId,
}: {
  slug: string;
  leadId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    prize_name: string;
    code?: string;
  } | null>(null);
  const [error, setError] = useState('');

  async function handleSpin() {
    if (!leadId) {
      setError('Falta el identificador del lead. Vuelve a rellenar el formulario.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/public/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, lead_id: leadId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al girar');
      setResult({
        prize_name: data.prize_name,
        code: data.code,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p className="text-gray-400 text-sm">Has ganado</p>
        <p className="text-2xl font-bold text-[#25D366] mt-1">
          {result.prize_name}
        </p>
        {result.code && (
          <p className="text-white mt-4 text-sm">
            Código: <span className="font-mono text-[#25D366]">{result.code}</span>
          </p>
        )}
        <p className="text-gray-500 text-xs mt-4">
          Muestra este premio en el local para canjearlo.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
      <p className="text-gray-400 text-sm">
        Pulsa el botón para descubrir tu premio
      </p>
      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleSpin}
        disabled={loading}
        className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-black font-semibold py-3 rounded-lg text-lg"
      >
        {loading ? 'Girando...' : 'Girar ruleta'}
      </button>
    </div>
  );
}
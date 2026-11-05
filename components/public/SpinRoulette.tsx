'use client';

import { useEffect, useState } from 'react';

const SEGMENTS = [
  { label: 'Premio', color: '#25D366' },
  { label: 'Suerte', color: '#1a9f4f' },
  { label: 'Premio', color: '#34e87a' },
  { label: 'Otra', color: '#0d7a3a' },
  { label: 'Premio', color: '#25D366' },
  { label: 'Suerte', color: '#1a9f4f' },
  { label: 'Premio', color: '#34e87a' },
  { label: 'Otra', color: '#0d7a3a' },
];

export default function SpinRoulette({
  slug,
  leadId,
}: {
  slug: string;
  leadId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{
    prize_name: string;
    code?: string;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // precarga visual
  }, []);

  async function handleSpin() {
    if (!leadId) {
      setError('Falta el lead. Vuelve a rellenar el formulario.');
      return;
    }
    if (spinning || result) return;

    setLoading(true);
    setSpinning(true);
    setError('');

    try {
      const res = await fetch('/api/public/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, lead_id: leadId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al girar');

      // Girar varias vueltas + ángulo final aleatorio
      const extraTurns = 5 + Math.floor(Math.random() * 3);
      const finalAngle = extraTurns * 360 + Math.floor(Math.random() * 360);
      setRotation((prev) => prev + finalAngle);

      // Esperar la animación
      await new Promise((r) => setTimeout(r, 4200));

      setResult({
        prize_name: data.prize_name,
        code: data.code,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSpinning(false);
    } finally {
      setLoading(false);
    }
  }

  const gradient = SEGMENTS.map((s, i) => {
    const start = (i / SEGMENTS.length) * 360;
    const end = ((i + 1) / SEGMENTS.length) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  }).join(', ');

  if (result) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p className="text-gray-400 text-sm">Has ganado</p>
        <p className="text-2xl font-bold text-[#25D366] mt-1">
          {result.prize_name}
        </p>
        {result.code && (
          <p className="text-white mt-4 text-sm">
            Código:{' '}
            <span className="font-mono text-[#25D366]">{result.code}</span>
          </p>
        )}
        <p className="text-gray-500 text-xs mt-4">
          Muestra este premio en el local para canjearlo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Puntero */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72">
        <div
          className="absolute left-1/2 -top-1 z-20 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '20px solid #25D366',
          }}
        />
        {/* Ruleta */}
        <div
          className="w-full h-full rounded-full border-4 border-gray-700 shadow-xl"
          style={{
            background: `conic-gradient(${gradient})`,
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? 'transform 4s cubic-bezier(0.15, 0.8, 0.2, 1)'
              : 'none',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#0B1120] border-2 border-gray-600 flex items-center justify-center text-[10px] text-gray-400 font-semibold">
              CAPTAR
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="w-full text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSpin}
        disabled={loading || spinning}
        className="w-full max-w-xs bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-black font-semibold py-3 rounded-lg text-lg"
      >
        {loading || spinning ? 'Girando...' : 'Girar ruleta'}
      </button>
    </div>
  );
}
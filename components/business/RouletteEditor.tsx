'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type PrizeRow = {
  id?: string;
  title: string;
  probability: string;
  daily_limit: string;
  is_active: boolean;
  sort_order: number;
};

const EMPTY_ROWS: PrizeRow[] = Array.from({ length: 6 }).map((_, i) => ({
  title: i === 5 ? 'Sigue participando' : '',
  probability: i === 5 ? '50' : '10',
  daily_limit: i === 5 ? '' : '5',
  is_active: true,
  sort_order: i,
}));

export default function RouletteEditor({
  initialPrizes,
}: {
  initialPrizes: {
    id?: string;
    title: string;
    probability: number;
    daily_limit: number | null;
    is_active: boolean;
    sort_order: number;
  }[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<PrizeRow[]>(() => {
    if (!initialPrizes.length) return EMPTY_ROWS;
    const filled = initialPrizes.map((p, i) => ({
      id: p.id,
      title: p.title,
      probability: String(p.probability ?? 0),
      daily_limit: p.daily_limit == null ? '' : String(p.daily_limit),
      is_active: p.is_active !== false,
      sort_order: p.sort_order ?? i,
    }));
    while (filled.length < 6) {
      filled.push({
        title: '',
        probability: '0',
        daily_limit: '5',
        is_active: true,
        sort_order: filled.length,
      });
    }
    return filled.slice(0, 8);
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const totalProb = useMemo(
    () => rows.reduce((s, r) => s + (parseFloat(r.probability) || 0), 0),
    [rows]
  );

  function updateRow(index: number, field: keyof PrizeRow, value: string | boolean) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  }

  function addRow() {
    if (rows.length >= 8) return;
    setRows((prev) => [
      ...prev,
      {
        title: '',
        probability: '0',
        daily_limit: '5',
        is_active: true,
        sort_order: prev.length,
      },
    ]);
  }

  function removeRow(index: number) {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const cleaned = rows
      .map((r, i) => ({
        id: r.id,
        title: r.title.trim(),
        probability: parseFloat(r.probability) || 0,
        daily_limit: r.daily_limit.trim() === '' ? null : Number(r.daily_limit),
        is_active: r.is_active,
        sort_order: i,
      }))
      .filter((r) => r.title.length > 0);

    if (cleaned.length < 2) {
      setError('Necesitas al menos 2 casillas con nombre');
      setLoading(false);
      return;
    }

    const sum = cleaned.reduce((s, r) => s + r.probability, 0);
    if (sum <= 0) {
      setError('La suma de probabilidades debe ser mayor que 0');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/business/roulette-prizes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prizes: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      setMessage('Ruleta guardada correctamente');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
          <div className="col-span-4">Texto casilla</div>
          <div className="col-span-2">¿Premio?</div>
          <div className="col-span-2">Prob. %</div>
          <div className="col-span-2">Tope/día</div>
          <div className="col-span-2" />
        </div>

        <div className="divide-y divide-gray-800">
          {rows.map((row, index) => (
            <div
              key={row.id || index}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-3 items-center"
            >
              <div className="sm:col-span-4">
                <input
                  value={row.title}
                  onChange={(e) => updateRow(index, 'title', e.target.value)}
                  placeholder="Ej. Café gratis"
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={row.is_active}
                  onChange={(e) => updateRow(index, 'is_active', e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-400">Activo</span>
              </div>
              <div className="sm:col-span-2">
                <input
                  inputMode="decimal"
                  value={row.probability}
                  onChange={(e) => updateRow(index, 'probability', e.target.value)}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  inputMode="numeric"
                  placeholder="∞"
                  value={row.daily_limit}
                  onChange={(e) => updateRow(index, 'daily_limit', e.target.value)}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <span
            className={
              Math.abs(totalProb - 100) < 0.01 ? 'text-green-400' : 'text-amber-400'
            }
          >
            Suma: {totalProb.toFixed(1)} %
          </span>
          <span className="text-gray-500 ml-2">(recomendado 100 %)</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addRow}
            className="text-sm text-[#25D366] hover:underline px-2"
          >
            + Añadir casilla
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg text-sm"
          >
            {loading ? 'Guardando...' : 'Guardar ruleta'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
    </form>
  );
}
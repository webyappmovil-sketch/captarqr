'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteQrButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('¿Eliminar este código QR?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/business/qr?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {loading ? '...' : 'Eliminar'}
    </button>
  );
}
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminBusinessActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(status: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/businesses/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {currentStatus !== 'active' && (
        <button
          type="button"
          disabled={loading}
          onClick={() => setStatus('active')}
          className="text-xs text-[#25D366] hover:underline disabled:opacity-50"
        >
          Activar
        </button>
      )}
      {currentStatus === 'active' && (
        <button
          type="button"
          disabled={loading}
          onClick={() => setStatus('paused')}
          className="text-xs text-amber-400 hover:underline disabled:opacity-50"
        >
          Pausar
        </button>
      )}
    </div>
  );
}
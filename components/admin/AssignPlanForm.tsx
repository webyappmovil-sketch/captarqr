'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AssignPlanForm({
  businessId,
  currentPlanId,
  plans,
}: {
  businessId: string;
  currentPlanId: string;
  plans: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [planId, setPlanId] = useState(currentPlanId);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/licenses/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          plan_id: planId || null,
        }),
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
    <div className="flex items-center gap-2">
      <select
        value={planId}
        onChange={(e) => setPlanId(e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs"
      >
        <option value="">Sin plan</option>
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={loading}
        onClick={save}
        className="text-xs bg-[#25D366] text-black font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50"
      >
        {loading ? '…' : 'Guardar'}
      </button>
    </div>
  );
}
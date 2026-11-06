'use client';

import { useMemo, useState } from 'react';

type Prize = { id: string; name: string; probability: number };
type LinkItem = { label: string; url: string };

const COLORS = [
  '#7c3aed',
  '#22c55e',
  '#f97316',
  '#eab308',
  '#3b82f6',
  '#94a3b8',
  '#ec4899',
  '#14b8a6',
];

export default function PublicCaptureFlow({
  slug,
  qrId,
  businessId,
  businessName,
  prizes,
  links,
}: {
  slug: string;
  qrId: string;
  businessId: string;
  businessName: string;
  prizes: Prize[];
  links: LinkItem[];
}) {
  const [step, setStep] = useState<'intro' | 'form' | 'spin' | 'result'>('intro');
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState('');
  const [leadId, setLeadId] = useState('');
  const [result, setResult] = useState<{ prize_name: string; code?: string } | null>(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });

  const segments = useMemo(() => {
    if (prizes.length === 0) {
      return [{ name: 'Sin premios', color: '#94a3b8' }];
    }
    return prizes.map((p, i) => ({
      name: p.name,
      color: COLORS[i % COLORS.length],
    }));
  }, [prizes]);

  const gradient = segments
    .map((s, i) => {
      const start = (i / segments.length) * 360;
      const end = ((i + 1) / segments.length) * 360;
      return `${s.color} ${start}deg ${end}deg`;
    })
    .join(', ');

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitForm(e: React.FormEvent) {
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
      setLeadId(data.lead_id);
      setStep('spin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  async function handleSpin() {
    if (!leadId || spinning || result) return;
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

      const extraTurns = 5 + Math.floor(Math.random() * 3);
      const finalAngle = extraTurns * 360 + Math.floor(Math.random() * 360);
      setRotation((prev) => prev + finalAngle);

      await new Promise((r) => setTimeout(r, 4200));
      setResult({ prize_name: data.prize_name, code: data.code });
      setStep('result');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSpinning(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-center text-xl font-bold text-gray-800 mb-4 tracking-wide">
        {businessName.toUpperCase()}
      </h1>

      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6">
        <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 mb-4">
          <div
            className="absolute left-1/2 -top-2 z-20 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '22px solid #eab308',
            }}
          />
          <div
            className="w-full h-full rounded-full border-[6px] border-black relative overflow-hidden"
            style={{
              background: `conic-gradient(${gradient})`,
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? 'transform 4s cubic-bezier(0.15, 0.8, 0.2, 1)'
                : 'none',
            }}
          >
            {segments.map((s, i) => {
              const 
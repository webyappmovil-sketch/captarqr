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

/** Solo móviles WhatsApp: España + Latinoamérica (desde México) */
function validateMobileWhatsApp(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');

  // España: 34 + 9 dígitos empezando por 6 o 7
  if (digits.startsWith('34') && digits.length === 11) {
    const local = digits.slice(2);
    if (/^[67]\d{8}$/.test(local)) return null;
    return 'En España solo se admiten móviles (6xx/7xx), no fijos';
  }
  if (digits.length === 9 && /^[67]\d{8}$/.test(digits)) return null;

  // México: 52 + 10 dígitos, o 10 dígitos locales
  if (digits.startsWith('52') && digits.length === 12) return null;
  if (digits.length === 10 && /^[1-9]\d{9}$/.test(digits)) return null;

  // Colombia: 57 + 10 dígitos (3xx…)
  if (digits.startsWith('57') && digits.length === 12 && digits[2] === '3') return null;
  if (digits.length === 10 && /^3\d{9}$/.test(digits)) return null;

  // Argentina: 54 + 10/11 dígitos
  if (digits.startsWith('54') && (digits.length === 12 || digits.length === 13)) return null;

  // Chile: 56 + 9 dígitos (9…)
  if (digits.startsWith('56') && digits.length === 11 && digits[2] === '9') return null;
  if (digits.length === 9 && /^9\d{8}$/.test(digits)) return null;

  // Perú: 51 + 9 dígitos (9…)
  if (digits.startsWith('51') && digits.length === 11 && digits[2] === '9') return null;

  // Ecuador: 593 + 9 dígitos (9…)
  if (digits.startsWith('593') && digits.length === 12 && digits[3] === '9') return null;

  // Venezuela: 58 + 10 dígitos
  if (digits.startsWith('58') && digits.length === 12) return null;

  // Uruguay: 598 + 8 dígitos
  if (digits.startsWith('598') && digits.length === 11) return null;

  // Paraguay: 595 + 9 dígitos
  if (digits.startsWith('595') && digits.length === 12) return null;

  // Bolivia: 591 + 8 dígitos
  if (digits.startsWith('591') && digits.length === 11) return null;

  // Centroamérica básica (502 GT, 503 SV, 504 HN, 505 NI, 506 CR, 507 PA)
  if (/^50[2-7]\d{8}$/.test(digits)) return null;

  return 'Introduce un móvil WhatsApp de España o Latinoamérica (no números fijos)';
}

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
    if (prizes.length === 0) return [{ id: '', name: 'Sin premios', color: '#94a3b8' }];
    return prizes.map((p, i) => ({
      id: p.id,
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

    const phoneError = validateMobileWhatsApp(form.phone);
    if (phoneError) {
      setError(phoneError);
      setLoading(false);
      return;
    }

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

      // Ángulo del segmento ganador (centro del sector)
      const idx = Math.max(
        0,
        segments.findIndex(
          (s) =>
            s.name.toLowerCase() === String(data.prize_name || '').toLowerCase()
        )
      );
      const segmentAngle = 360 / segments.length;
      const targetCenter = idx * segmentAngle + segmentAngle / 2;
      // El puntero está arriba (0°). Giramos para que el centro del premio quede arriba.
      const finalMod = (360 - targetCenter + 360) % 360;
      const extraTurns = 5 + Math.floor(Math.random() * 2);
      const currentMod = rotation % 360;
      const delta = (extraTurns * 360) + ((finalMod - currentMod + 360) % 360);
      setRotation((prev) => prev + delta);

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
              const angle = ((i + 0.5) / segments.length) * 360;
              return (
                <div
                  key={i}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span
                    className="text-[10px] sm:text-xs font-bold text-white text-center leading-tight drop-shadow"
                    style={{ transform: 'translateY(-78px)', width: 70 }}
                  >
                    {s.name}
                  </span>
                </div>
              );
            })}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300" />
            </div>
          </div>
        </div>

        {step === 'intro' && (
          <div className="text-center space-y-3">
            <p className="text-gray-800 font-semibold">
              ¿Quieres jugar a la ruleta y ganar premios?
            </p>
            <p className="text-gray-500 text-sm">Rellena tus datos y participa.</p>
            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold py-3 rounded-xl"
            >
              Quiero jugar
            </button>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={submitForm} className="space-y-3">
            <p className="text-center text-gray-700 font-medium text-sm mb-1">
              Completa tus datos para girar
            </p>
            <input
              required
              placeholder="Nombre"
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900"
            />
            <input
              type="email"
              placeholder="Email (opcional)"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900"
            />
            <input
              required
              inputMode="tel"
              placeholder="Móvil WhatsApp (ej. 612345678)"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900"
            />
            <p className="text-xs text-gray-400">
              Solo móviles WhatsApp de España o Latinoamérica (no fijos)
            </p>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-semibold py-3 rounded-xl"
            >
              {loading ? 'Enviando...' : 'Participar y girar'}
            </button>
          </form>
        )}

        {step === 'spin' && !result && (
          <div className="text-center space-y-3">
            <p className="text-gray-700 text-sm">¡Listo! Gira la ruleta</p>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="button"
              onClick={handleSpin}
              disabled={loading || spinning}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-semibold py-3 rounded-xl"
            >
              {loading || spinning ? 'Girando...' : 'Girar ruleta'}
            </button>
          </div>
        )}

        {step === 'result' && result && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Has obtenido</p>
              <p className="text-xl font-bold text-[#16a34a] mt-1">{result.prize_name}</p>
              {result.code && (
                <p className="text-sm text-gray-700 mt-2">
                  Código: <span className="font-mono font-semibold">{result.code}</span>
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">Muéstralo en el local para canjearlo</p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-center text-gray-800 font-semibold text-sm mb-3">
                ¿Ahora quieres continuar con…?
              </p>
              {links.length === 0 ? (
                <p className="text-center text-gray-400 text-sm">
                  El negocio aún no ha configurado enlaces.
                </p>
              ) : (
                <div className="space-y-2">
                  {links.map((l) => (
                    <a
                      key={l.url + l.label}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-xl text-sm"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">CAPTARQR · Captación inteligente</p>
    </div>
  );
}
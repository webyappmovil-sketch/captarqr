'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setError('');
    try {
      const supabase = createClient();
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });
      if (err) throw err;
      setMsg('Si el email existe, recibirás un enlace para restablecer la clave.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
      )}
      {msg && (
        <p className="text-sm text-green-400 bg-green-500/10 rounded-lg px-3 py-2">{msg}</p>
      )}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#25D366] text-black font-semibold py-2.5 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Enviando…' : 'Enviar enlace'}
      </button>
    </form>
  );
}
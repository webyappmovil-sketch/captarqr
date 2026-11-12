'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Mínimo 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      router.push('/login');
      router.refresh();
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
      <div>
        <label className="block text-sm text-gray-300 mb-1">Nueva contraseña</label>
        <input
          required
          type="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-white border border-gray-700"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Repetir contraseña</label>
        <input
          required
          type="password"
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white"
        />
        {confirm.length > 0 && (
          <p
            className={`text-xs mt-1 ${
              password === confirm ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {password === confirm ? 'Las claves coinciden' : 'No coinciden'}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || password !== confirm}
        className="w-full bg-[#25D366] text-black font-semibold py-2.5 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Guardando…' : 'Guardar contraseña'}
      </button>
    </form>
  );
}
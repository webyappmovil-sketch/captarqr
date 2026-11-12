'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    business_name: '',
    email: '',
    password: '',
    confirmPassword: '',    
    phone: '',
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }    
setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ref }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrarse');

      // Login automático
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (loginError) {
        router.push('/login');
        return;
      }

      router.push('/business');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {ref && (
        <p className="text-xs text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg px-3 py-2">
          Registro con invitación partner: <strong>{ref}</strong>
        </p>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-300 mb-1">Tu nombre</label>
        <input
          required
          value={form.full_name}
          onChange={(e) => update('full_name', e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#25D366] outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Nombre del negocio</label>
        <input
          required
          value={form.business_name}
          onChange={(e) => update('business_name', e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#25D366] outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Email</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#25D366] outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Teléfono</label>
        <input
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#25D366] outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Contraseña</label>
        <input
          required
          type="password"
          minLength={6}
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#25D366] outline-none"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Repetir contraseña</label>
        <input
          required
          type="password"
          minLength={6}
          value={form.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white"
        />
        {form.confirmPassword?.length > 0 && (
          <p
            className={`text-xs mt-1 ${
              form.password === form.confirmPassword
                ? 'text-green-400'
                : 'text-red-400'
            }`}
          >
            {form.password === form.confirmPassword
              ? 'Las claves coinciden'
              : 'No coinciden'}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg"
      >
        {loading ? 'Creando cuenta…' : 'Registrarme'}
      </button>
    </form>
  );
}
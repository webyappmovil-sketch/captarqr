import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 shadow-xl">
      <h2 className="text-xl font-semibold text-white mb-2 text-center">
        Crear cuenta
      </h2>
      <p className="text-gray-400 text-sm text-center mb-6">
        Registra tu negocio en CAPTARQR
      </p>
      <Suspense fallback={<p className="text-gray-400 text-center text-sm">Cargando…</p>}>
        <RegisterForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-gray-400">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-[#25D366] hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
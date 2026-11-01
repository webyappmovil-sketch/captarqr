import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 shadow-xl">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">
        Iniciar sesión
      </h2>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-gray-400">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-[#25D366] hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}

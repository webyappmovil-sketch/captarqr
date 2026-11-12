import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 shadow-xl max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-white mb-2 text-center">
        Recuperar contraseña
      </h2>
      <p className="text-gray-400 text-sm text-center mb-6">
        Te enviaremos un enlace a tu email
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-gray-400">
        <Link href="/login" className="text-[#25D366] hover:underline">
          Volver al login
        </Link>
      </p>
    </div>
  );
}
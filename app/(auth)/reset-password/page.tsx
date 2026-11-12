import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 shadow-xl max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">
        Nueva contraseña
      </h2>
      <ResetPasswordForm />
    </div>
  );
}
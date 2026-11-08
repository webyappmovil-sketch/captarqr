import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BusinessSettingsForm from '@/components/business/BusinessSettingsForm';

export default async function BusinessSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, email, phone, city, country_code, is_active')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!business) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
        No hay negocio asociado a tu cuenta.
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Configuración</h2>
        <p className="text-gray-400 text-sm">Datos del negocio</p>
      </div>
      <BusinessSettingsForm
        initial={{
          name: business.name || '',
          email: business.email || '',
          phone: business.phone || '',
          city: business.city || '',
          country_code: business.country_code || 'ES',
        }}
      />
    </div>
  );
}
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Disc3, Link2, QrCode,
  Megaphone, BarChart3, CreditCard, Settings, LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/business', icon: LayoutDashboard },
  { name: 'Clientes', href: '/business/clients', icon: Users },
  { name: 'Ruleta', href: '/business/roulette', icon: Disc3 },
  { name: 'Enlaces', href: '/business/links', icon: Link2 },
  { name: 'QR', href: '/business/qr', icon: QrCode },
  { name: 'Campañas', href: '/business/campaigns', icon: Megaphone },
  { name: 'Métricas', href: '/business/metrics', icon: BarChart3 },
  { name: 'Facturación', href: '/business/billing', icon: CreditCard },
  { name: 'Configuración', href: '/business/settings', icon: Settings },
];

export default function BusinessSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="text-xl font-bold text-[#25D366]">CAPTARQR</span>
        <span className="ml-2 text-xs text-gray-500 font-medium">NEGOCIO</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/business' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#25D366]/10 text-[#25D366]'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

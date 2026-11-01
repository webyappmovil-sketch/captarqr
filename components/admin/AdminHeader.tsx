import type { SessionUser } from '@/types/database';
import { Bell } from 'lucide-react';

interface AdminHeaderProps {
  user: SessionUser;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-gray-800 bg-[#111827] flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Panel de Administración</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {user.profile.full_name || 'Administrador'}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] font-semibold">
            {(user.profile.full_name || user.email)[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

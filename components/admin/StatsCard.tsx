import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'purple' | 'orange';
  subtitle?: string;
}

const colorStyles = {
  green: 'bg-[#25D366]/10 text-[#25D366]',
  blue: 'bg-blue-500/10 text-blue-400',
  purple: 'bg-purple-500/10 text-purple-400',
  orange: 'bg-orange-500/10 text-orange-400',
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'green',
  subtitle,
}: StatsCardProps) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {typeof value === 'number' ? value.toLocaleString('es-ES') : value}
          </p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={clsx('p-2.5 rounded-lg', colorStyles[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

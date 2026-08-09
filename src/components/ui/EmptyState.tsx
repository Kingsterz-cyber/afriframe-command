import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-[#D4AF37]/10 p-4 mb-4">
        <Icon className="h-8 w-8 text-[#D4AF37]" />
      </div>
      <h3 className={`text-lg font-semibold ${isDark ? 'text-[#F2ECDD]' : 'text-slate-900'}`}>
        {title}
      </h3>
      <p className={`mt-2 text-sm max-w-sm ${isDark ? 'text-[#F2ECDD]/70' : 'text-slate-500'}`}>
        {description}
      </p>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  delay?: number;
  animate?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  delay = 0,
  animate = true,
}) => {
  const { theme } = useApp();

  const base = theme === 'dark'
    ? 'bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
    : 'bg-white/80 border border-gray-200/60 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]';

  const hoverClass = hover
    ? theme === 'dark'
      ? 'cursor-pointer hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300'
      : 'cursor-pointer hover:bg-white/95 hover:border-gray-300/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300'
    : '';

  const content = (
    <div
      className={`rounded-2xl ${base} ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`rounded-2xl ${base} ${hoverClass} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -2, scale: 1.002 } : undefined}
    >
      {children}
    </motion.div>
  );
};

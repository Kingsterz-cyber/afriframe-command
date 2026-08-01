import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Aperture } from 'lucide-react';

export const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const phaseTimer = setTimeout(() => setPhase(1), 600);
    const phaseTimer2 = setTimeout(() => setPhase(2), 1200);
    return () => { clearTimeout(phaseTimer); clearTimeout(phaseTimer2); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed inset-0 z-[9999] bg-[#0D0D0D] flex flex-col items-center justify-center"
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-red-600/10 blur-3xl" />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative mb-8"
      >
        <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-red-600 via-red-700 to-red-900 flex items-center justify-center shadow-2xl shadow-red-900/60">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <Aperture size={36} className="text-white" />
          </motion.div>
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-[24px] ring-2 ring-red-600/30 animate-pulse" />
      </motion.div>

      {/* Text */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              Afriframe Studio
            </h1>
            <p className="text-white/30 text-xs uppercase tracking-[0.3em]">CMS Platform</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-48 space-y-2"
          >
            <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-white/20 text-[10px] text-center">Loading Studio…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Credits */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-white/15 text-[10px] tracking-widest uppercase"
      >
        Luxury Photography Management
      </motion.p>
    </motion.div>
  );
};

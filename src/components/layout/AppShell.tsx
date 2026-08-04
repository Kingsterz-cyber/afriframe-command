import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const AppContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex ${isDark ? 'bg-[#0D0D0D]' : 'bg-[#F6F6F8]'}`}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {isDark && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#2A1F04]/20 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-amber-900/10 blur-[100px]" />
        </div>
      )}

      <div className="relative z-10">
        <Sidebar />
      </div>

      <MobileDrawer />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        <TopNav />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Keyed by route (no exit animation): the outgoing copy would otherwise
              render the *incoming* children and leave stale media in the DOM. */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Quick upload"
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8A6A10] text-white flex items-center justify-center z-30"
        style={{ boxShadow: '0 8px 32px rgba(212,175,55,0.5)' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7-7 7 7" />
        </svg>
      </motion.button>
    </div>
  );
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  return (
    <AppProvider>
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen key="loading" onComplete={() => setLoading(false)} />
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <AppContent>{children}</AppContent>
          </motion.div>
        )}
      </AnimatePresence>
    </AppProvider>
  );
};

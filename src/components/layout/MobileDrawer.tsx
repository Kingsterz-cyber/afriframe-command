import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Image, Video, FolderOpen, Users, UserCheck,
  Bell, Settings, LogOut, Download, X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import afriframeLogo from "@/assets/afriframe-logo.png.asset.json";

const navItems = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'bookings',      label: 'Bookings',       icon: Calendar },
  { id: 'portfolio',     label: 'Portfolio',      icon: Image },
  { id: 'videos',        label: 'Videos',         icon: Video },
  { id: 'collections',   label: 'Collections',    icon: FolderOpen },
  { id: 'photographers', label: 'Photographers',  icon: UserCheck },
  { id: 'clients',       label: 'Clients',        icon: Users },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'settings',      label: 'Settings',       icon: Settings },
];

export const MobileDrawer: React.FC = () => {
  const { theme, activePage, setActivePage, mobileMenuOpen, setMobileMenuOpen, notificationCount } = useApp();
  const isDark = theme === 'dark';

  const getItemClasses = (id: string) => {
    const isActive = activePage === id;
    if (isActive) {
      return isDark
        ? 'bg-[#D4AF37]/20 text-[#E8C87A] border border-[#FCA311]/20'
        : 'bg-[#FDF6E3] text-[#D4AF37] border border-[#E8C87A]/60';
    }
    return isDark
      ? 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent';
  };

  const handleNav = (id: string) => {
    setActivePage(id as any);
    setMobileMenuOpen(false);
  };

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed left-0 top-0 bottom-0 z-50 w-72 md:hidden flex flex-col backdrop-blur-2xl ${
              isDark ? 'bg-[#0D0D0D]/98 border-r border-white/[0.08]' : 'bg-white/98 border-r border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-5 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8A6A10] flex items-center justify-center shadow-lg shadow-[#5C4406]/30">
                  <img src={afriframeLogo.url} alt="Afriframe Studio" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                    Afriframe
                  </p>
                  <p className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Studio CMS</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.06]' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${getItemClasses(item.id)}`}
                  >
                    <span className="relative">
                      <Icon size={17} />
                      {item.id === 'notifications' && notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FCA311] text-[#0B0B0B] text-[8px] flex items-center justify-center font-bold">
                          {notificationCount}
                        </span>
                      )}
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className={`px-4 pb-6 pt-3 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-200'} space-y-1`}>
              <button
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isDark ? 'text-white/50 hover:text-white hover:bg-white/[0.06]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Download size={17} />
                Install App
              </button>
              <button
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isDark ? 'text-[#FCA311]/70 hover:text-[#E8C87A] hover:bg-[#FCA311]/10' : 'text-[#FCA311] hover:text-[#D4AF37] hover:bg-[#FDF6E3]'
                }`}
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

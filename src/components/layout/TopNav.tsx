import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sun, Moon, Menu, Plus, Command } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const pageTitles: Record<string, { title: string; subtitle: string; emoji: string }> = {
  dashboard:     { title: 'Dashboard',     subtitle: 'Welcome back, Admin',              emoji: '🏠' },
  bookings:      { title: 'Bookings',      subtitle: 'Manage all studio bookings',        emoji: '📅' },
  portfolio:     { title: 'Portfolio',     subtitle: 'Curate your visual collection',     emoji: '🖼️' },
  videos:        { title: 'Videos',        subtitle: 'Manage video content library',      emoji: '🎬' },
  collections:   { title: 'Collections',   subtitle: 'Organise albums & galleries',       emoji: '📂' },
  clients:       { title: 'Clients',       subtitle: 'Client relationship management',    emoji: '👥' },
  notifications: { title: 'Notifications', subtitle: 'Stay updated on all activity',      emoji: '🔔' },
  settings:      { title: 'Settings',      subtitle: 'Configure studio preferences',      emoji: '⚙️' },
};

export const TopNav: React.FC = () => {
  const { theme, toggleTheme, activePage, notificationCount, setActivePage, setMobileMenuOpen } = useApp();
  const [searchValue, setSearchValue] = useState('');

  const isDark = theme === 'dark';
  const pageInfo = pageTitles[activePage] || pageTitles.dashboard;

  const navBg = isDark
    ? 'bg-[#0D0D0D]/85 border-b border-white/[0.06] backdrop-blur-2xl'
    : 'bg-white/85 border-b border-gray-200/70 backdrop-blur-2xl shadow-[0_1px_12px_rgba(0,0,0,0.04)]';

  const searchBg = isDark
    ? 'bg-white/[0.05] border border-white/[0.08] text-white/70 placeholder-white/25 focus:border-white/18 focus:bg-white/[0.07]'
    : 'bg-gray-50 border border-gray-200 text-gray-700 placeholder-gray-400 focus:border-gray-300 focus:bg-white focus:shadow-sm';

  return (
    <header className={`sticky top-0 z-30 ${navBg} px-4 md:px-6 py-3 flex items-center gap-3`}>
      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`md:hidden flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
          isDark ? 'text-white/50 hover:text-white hover:bg-white/[0.08]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`}
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu size={17} />
      </motion.button>

      {/* Breadcrumb / Page Title */}
      <div className="hidden sm:flex flex-col justify-center min-w-0 flex-shrink-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
          >
            <h1 className={`text-[13px] font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: 'Playfair Display, serif' }}>
              {pageInfo.title}
            </h1>
            <p className={`text-[10px] leading-tight ${isDark ? 'text-white/35' : 'text-gray-400'}`}>
              {pageInfo.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className={`hidden sm:block w-px h-6 flex-shrink-0 ${isDark ? 'bg-white/[0.08]' : 'bg-gray-200'}`} />

      {/* Search */}
      <div className="flex-1 max-w-[280px]">
        <div className="relative">
          <Search size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/25' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => {}}
            onBlur={() => {}}
            placeholder="Search anything…"
            className={`w-full h-8 pl-8 pr-10 rounded-xl text-[12px] transition-all duration-200 outline-none ${searchBg}`}
          />
          <div className={`absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none ${isDark ? 'text-white/15' : 'text-gray-300'}`}>
            <Command size={9} />
            <span className="text-[9px] font-medium">K</span>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-1.5">
        {/* Upload CTA */}
        <motion.button
          whileHover={{ scale: 1.04, y: -0.5 }}
          whileTap={{ scale: 0.96 }}
          className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#D4AF37] text-[#0B0B0B] text-[12px] font-medium shadow-lg shadow-[#5C4406]/30 hover:bg-[#FCA311] transition-colors duration-200"
        >
          <Plus size={12} />
          <span>Upload</span>
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActivePage('notifications')}
          className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200 ${
            isDark ? 'text-white/45 hover:text-white hover:bg-white/[0.08]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Bell size={15} />
          <AnimatePresence>
            {notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FCA311] text-[#0B0B0B] text-[9px] flex items-center justify-center font-bold"
              >
                {notificationCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
            isDark
              ? 'text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Sun size={15} />
              </motion.span>
            ) : (
              <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Moon size={15} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#D4AF37]/30 cursor-pointer"
        >
          <img
            src="https://images.pexels.com/photos/9866566/pexels-photo-9866566.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200"
            alt="Admin"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
    </header>
  );
};

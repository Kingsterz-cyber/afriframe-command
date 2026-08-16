import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Image, Video, Users,
  Bell, Settings, LogOut, Download, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { pwaSupported } from '@/lib/pwa';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const navItems = [
  { id: 'dashboard',       label: 'Dashboard',           icon: LayoutDashboard, group: 'main' },
  { id: 'bookings',        label: 'Bookings',            icon: Calendar,        group: 'main' },
  { id: 'availability',    label: 'Availability Calendar', icon: Calendar,      group: 'main' },
  { id: 'clients',         label: 'Clients',             icon: Users,           group: 'content' },
  { id: 'gallery',         label: 'Gallery',             icon: Image,           group: 'content' },
  { id: 'videos',          label: 'Videos',              icon: Video,           group: 'content' },
  { id: 'notifications',   label: 'Notifications',       icon: Bell,            group: 'system' },
];

const groups = [
  { id: 'main',    label: 'Overview' },
  { id: 'content', label: 'Content & Management' },
  { id: 'system',  label: 'System' },
];

export const Sidebar: React.FC = () => {
  const { theme, activePage, setActivePage, sidebarCollapsed, setSidebarCollapsed, notificationCount } = useApp();
  const { session, signOut } = useAuth();
  const adminEmail = session?.user?.email ?? 'Signed-in admin';
  const adminName = session?.user?.user_metadata?.full_name ?? session?.user?.user_metadata?.name ?? adminEmail.split('@')[0] ?? 'Admin';
  const adminPhoto = session?.user?.user_metadata?.avatar_url ?? session?.user?.user_metadata?.picture ?? '/icons/icon-192.png';
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } else if (pwaSupported()) {
      window.alert('To install Afriframe, use your browser menu and choose “Add to Home Screen” or “Install Afriframe”.');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate({ to: '/login', replace: true });
  };

  const sidebarBg = isDark
    ? 'bg-[#0D0D0D]/95 border-r border-white/[0.06] shadow-[4px_0_24px_rgba(0,0,0,0.4)]'
    : 'bg-white/95 border-r border-gray-200/80 shadow-[4px_0_16px_rgba(0,0,0,0.04)]';

  const getItemClasses = (id: string) => {
    const isActive = activePage === id;
    if (isActive) {
      return isDark
        ? 'bg-[#D4AF37]/15 text-[#E8C87A] border border-[#FCA311]/20 shadow-[0_0_12px_rgba(212,175,55,0.1)]'
        : 'bg-[#FDF6E3] text-[#D4AF37] border border-[#E8C87A]/60';
    }
    return isDark
      ? 'text-white/45 hover:text-white/90 hover:bg-white/[0.05] border border-transparent'
      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 border border-transparent';
  };

  const groupsBySection = groups.map(g => ({
    ...g,
    items: navItems.filter(n => n.group === g.id),
  }));

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 68 : 232 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`hidden md:flex flex-col h-screen sticky top-0 z-40 backdrop-blur-xl ${sidebarBg} flex-shrink-0 overflow-hidden`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'} flex-shrink-0`}>
        <motion.div
          whileHover={{ rotate: 15, scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#FCA311] via-[#D4AF37] to-[#8A6A10] flex items-center justify-center shadow-lg shadow-[#5C4406]/40"
        >
          <img src="/icons/icon-192.png" alt="Afriframe Studio" className="h-7 w-7 rounded-lg object-contain" />
        </motion.div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: -10, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className={`text-sm font-bold tracking-wide leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Playfair Display, serif' }}>
                Afriframe
              </p>
              <p className={`text-[9.5px] uppercase tracking-[0.18em] ${isDark ? 'text-white/35' : 'text-gray-400'}`}>Studio CMS</p>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`ml-auto flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
            isDark ? 'text-white/25 hover:text-white/70 hover:bg-white/[0.08]' : 'text-gray-300 hover:text-gray-600 hover:bg-gray-100'
          }`}
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto overflow-x-hidden scrollbar-none space-y-0.5">
        {groupsBySection.map((group) => (
          <div key={group.id} className="mb-1">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-[9.5px] uppercase tracking-[0.15em] font-semibold px-2.5 py-2 ${isDark ? 'text-white/20' : 'text-gray-300'}`}
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>
            {sidebarCollapsed && <div className="h-2" />}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: sidebarCollapsed ? 0 : 2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActivePage(item.id as any)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative ${getItemClasses(item.id)}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0 relative">
                    <Icon size={15} />
                    {item.id === 'notifications' && notificationCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#FCA311] text-[#0B0B0B] text-[8px] flex items-center justify-center font-bold leading-none"
                      >
                        {notificationCount}
                      </motion.span>
                    )}
                  </span>
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="truncate overflow-hidden whitespace-nowrap flex-1 text-left"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !sidebarCollapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FCA311] flex-shrink-0"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className={`px-3 pb-4 pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'} space-y-0.5 flex-shrink-0`}>
        {/* Install PWA */}
        <motion.button
          whileHover={{ x: sidebarCollapsed ? 0 : 2 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleInstall}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border border-transparent ${
            isDark ? 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100/80'
          }`}
          title={sidebarCollapsed ? 'Install App' : undefined}
        >
          <Download size={15} className="flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="truncate overflow-hidden whitespace-nowrap"
              >
                Install App
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Settings */}
        <motion.button
          whileHover={{ x: sidebarCollapsed ? 0 : 2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActivePage('settings')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${getItemClasses('settings')}`}
          title={sidebarCollapsed ? 'Settings' : undefined}
        >
          <Settings size={15} className="flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="truncate overflow-hidden whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Logout */}
        <motion.button
          whileHover={{ x: sidebarCollapsed ? 0 : 2 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border border-transparent ${
            isDark ? 'text-[#FCA311]/60 hover:text-[#E8C87A] hover:bg-[#FCA311]/10' : 'text-[#FCA311] hover:text-[#D4AF37] hover:bg-[#FDF6E3]/80'
          }`}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={15} className="flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="truncate overflow-hidden whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* User Card */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mt-2 mx-0.5 p-2.5 rounded-xl flex items-center gap-2.5 ${isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-gray-50/80 border border-gray-200/60'}`}
            >
              <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden ring-1 ring-white/10">
                <img
                  src={adminPhoto}
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className={`text-[12px] font-semibold truncate leading-tight ${isDark ? 'text-white/85' : 'text-gray-800'}`}>
                  {adminName}
                </p>
                <p className={`text-[10px] truncate leading-tight ${isDark ? 'text-white/35' : 'text-gray-400'}`}>
                  {adminEmail}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

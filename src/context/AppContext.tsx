import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';

type Theme = 'light' | 'dark';
export type ActivePage =
  | 'dashboard'
  | 'bookings'
  | 'portfolio'
  | 'videos'
  | 'collections'
  | 'clients'
  | 'notifications'
  | 'settings';

export const pagePaths: Record<ActivePage, string> = {
  dashboard: '/',
  bookings: '/bookings',
  portfolio: '/portfolio',
  videos: '/videos',
  collections: '/collections',
  clients: '/clients',
  notifications: '/notifications',
  settings: '/settings',
};

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  notificationCount: number;
  setNotificationCount: (count: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const activePage =
    (Object.keys(pagePaths) as ActivePage[]).find(
      (key) => key !== 'dashboard' && pathname.startsWith(pagePaths[key]),
    ) ?? 'dashboard';

  const setActivePage = useCallback(
    (page: ActivePage) => {
      setMobileMenuOpen(false);
      navigate({ to: pagePaths[page] });
    },
    [navigate],
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activePage,
        setActivePage,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        notificationCount,
        setNotificationCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

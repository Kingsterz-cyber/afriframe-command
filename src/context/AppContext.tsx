import React, { createContext, useContext, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';
type ActivePage = 'dashboard' | 'bookings' | 'portfolio' | 'videos' | 'collections' | 'photographers' | 'clients' | 'notifications' | 'settings';

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
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <AppContext.Provider value={{
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
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

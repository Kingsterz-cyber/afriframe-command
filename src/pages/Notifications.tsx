import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Upload, MessageSquare, Settings, DollarSign, CheckCheck, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

type NotificationType = 'booking' | 'upload' | 'message' | 'system' | 'payment';

function notificationType(value: string | null | undefined): NotificationType {
  if (value?.startsWith('booking.')) return 'booking';
  if (value === 'upload') return 'upload';
  if (value === 'message') return 'message';
  if (value === 'payment') return 'payment';
  return 'system';
}

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar: string | null;
  bookingId?: string | null;
};

const typeConfig: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  booking: {
    icon: <Calendar size={14} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/15 border border-blue-500/20',
  },
  upload: {
    icon: <Upload size={14} />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/15 border border-purple-500/20',
  },
  message: {
    icon: <MessageSquare size={14} />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15 border border-emerald-500/20',
  },
  system: {
    icon: <Settings size={14} />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15 border border-amber-500/20',
  },
  payment: {
    icon: <DollarSign size={14} />,
    color: 'text-green-400',
    bg: 'bg-green-500/15 border border-green-500/20',
  },
};

export const Notifications: React.FC = () => {
  const { theme, setNotificationCount } = useApp();
  const isDark = theme === 'dark';
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const mapped = data.map((row: any) => ({
          id: row.id,
          type: notificationType(row.type),
          title: row.title ?? 'Notification',
          message: row.message ?? row.body ?? '',
          time: row.created_at ?? '',
          read: Boolean(row.is_read ?? row.read),
          avatar: row.avatar ?? row.sender_avatar ?? null,
          bookingId: row.booking_id ?? null,
        }));
        setNotifications(mapped);
        setNotificationCount(mapped.filter((row: any) => !row.read).length);
      }
      setLoading(false);
    };

    void fetchNotifications();
    const channel = supabase.channel('notifications-live').on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchNotifications).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [setNotificationCount]);

  const filtered = filter === 'all' ? notifications : notifications.filter(n => !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length) {
      const { error } = await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
      if (error) return;
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setNotificationCount(0);
  };

  const markRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) return;
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      setNotificationCount(updated.filter(n => !n.read).length);
      return updated;
    });
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) return;
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      setNotificationCount(updated.filter(n => !n.read).length);
      return updated;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 space-y-5 max-w-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex gap-1.5`}>
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: `Unread (${unreadCount})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.key
                    ? 'bg-[#D4AF37] text-[#0B0B0B]'
                    : isDark ? 'bg-white/[0.05] text-white/50 border border-white/[0.06] hover:text-white' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:text-gray-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={markAllRead}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
          >
            <CheckCheck size={13} />
            Mark all read
          </motion.button>
        )}
      </div>

      {/* Notification Feed */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((notification, i) => {
            const config = typeConfig[notification.type as keyof typeof typeConfig] ?? typeConfig.system;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  void markRead(notification.id);
                  if (notification.bookingId) {
                    window.location.assign(`/bookings?bookingId=${encodeURIComponent(notification.bookingId)}`);
                  }
                }}
                className={`group relative flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                  !notification.read
                    ? isDark
                      ? 'bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.08]'
                      : 'bg-blue-50/50 border border-blue-200/40 hover:bg-blue-50'
                    : isDark
                      ? 'bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04]'
                      : 'bg-white border border-gray-200/60 hover:bg-gray-50 shadow-sm'
                }`}
              >
                {/* Unread indicator */}
                {!notification.read && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FCA311]" />
                )}

                {/* Icon or Avatar */}
                <div className="flex-shrink-0">
                  {notification.avatar ? (
                    <div className="relative">
                      <img src={notification.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10" />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${config.bg}`}>
                        <span className={config.color}>{config.icon}</span>
                      </div>
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg}`}>
                      <span className={config.color}>{config.icon}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold mb-0.5 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                    {notification.title}
                  </p>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.color}`}>
                      {config.icon}
                      {notification.type}
                    </span>
                    <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{notification.time}</span>
                  </div>
                </div>

                {/* Delete Action */}
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={e => { e.stopPropagation(); deleteNotification(notification.id); }}
                  className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${
                    isDark ? 'text-white/30 hover:text-[#E8C87A] hover:bg-[#FCA311]/10' : 'text-gray-300 hover:text-[#FCA311] hover:bg-[#FDF6E3]'
                  }`}
                >
                  <Trash2 size={12} />
                </motion.button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-16 rounded-2xl ${isDark ? 'bg-white/[0.02] border border-white/[0.05]' : 'bg-gray-50 border border-gray-200/60'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${isDark ? 'bg-white/[0.05]' : 'bg-gray-100'}`}>
              <Bell size={20} className={isDark ? 'text-white/30' : 'text-gray-400'} />
            </div>
            <p className={`text-sm font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>All caught up!</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>No notifications to display</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Image, Video, Users, Clock, CheckCircle2, XCircle,
  ArrowUpRight, Plus, Camera, Upload, Zap, Eye, Loader2,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';


// Animated counter hook
function useCounter(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = performance.now();
      const step = (timestamp: number) => {
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(ease * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return count;
}

const KPICard: React.FC<{
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  change: string;
  positive: boolean;
  color: string;
  iconColor: string;
  delay: number;
}> = ({ title, value, prefix = '', suffix = '', icon, change, positive, color, iconColor, delay }) => {
  const { theme } = useApp();
  const count = useCounter(value, 1200, delay * 1000);
  const isDark = theme === 'dark';

  return (
    <GlassCard delay={delay} className="p-4 xl:p-5 relative overflow-hidden group hover:cursor-default" hover>
      {/* Background glow */}
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-20 ${color} pointer-events-none`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
            <span className={iconColor}>{icon}</span>
          </div>
          <div className={`flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 ${
            positive
              ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              : isDark ? 'bg-[#FCA311]/10 text-[#E8C87A]' : 'bg-[#FDF6E3] text-[#FCA311]'
          }`}>
            <ArrowUpRight size={9} className={positive ? '' : 'rotate-180'} />
            {change}
          </div>
        </div>
        <div className={`text-[22px] font-bold mb-0.5 tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}
          style={{ fontFamily: 'Playfair Display, serif' }}>
          {prefix}{count.toLocaleString()}{suffix}
        </div>
        <p className={`text-[11px] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{title}</p>
      </div>
    </GlassCard>
  );
};

type TimelineEvent = {
  id: string;
  at: Date;
  action: string;
  target: string;
  icon: React.ReactNode;
  color: string;
};


const quickActions = [
  { label: 'New Booking',     icon: <Calendar size={13} />, color: 'from-blue-600 to-blue-700',   shadow: 'shadow-blue-900/40' },
  { label: 'Upload Photos',   icon: <Upload size={13} />,   color: 'from-emerald-600 to-emerald-700', shadow: 'shadow-emerald-900/40' },
  { label: 'Quick Actions',   icon: <Zap size={13} />,      color: 'from-amber-500 to-amber-600',    shadow: 'shadow-amber-900/40' },
];

export const Dashboard: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [bookings, setBookings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(
        'id, created_at, updated_at, service_id, client_id, booking_date, booking_time, message, status, admin_notes, confirmed_at, cancelled_at, completed_at, total_amount, payment_status, clients(id, full_name, email, phone), services(id, name, category, duration_minutes)'
      )
      .order('booking_date', { ascending: false });

    if (!error && data) {
      setBookings(
        data.map((row: any) => {
          const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;
          const service = Array.isArray(row.services) ? row.services[0] : row.services;
          const clientName = client?.full_name ?? client?.email ?? 'Guest';
          return {
            id: row.id,
            clientName,
            clientEmail: client?.email ?? '',
            clientPhone: client?.phone ?? '',
            clientAvatar: `https://ui-avatars.com/api/?background=D4AF37&color=0B0B0B&name=${encodeURIComponent(clientName)}`,
            service: service?.name ?? 'Session',
            duration: service?.duration_minutes ? `${service.duration_minutes} mins` : '',
            date: row.booking_date ?? '',
            time: row.booking_time ?? '',
            amount: row.total_amount == null ? null : Number(row.total_amount),
            status: (row.status ?? 'pending').toLowerCase(),
            notes: row.message ?? row.admin_notes ?? '',
            createdAt: row.created_at,
            confirmedAt: row.confirmed_at,
            cancelledAt: row.cancelled_at,
            completedAt: row.completed_at,
          };
        })
      );
    }
  };


  const loadClients = async () => {
    const { data, error } = await supabase.from('clients').select('*');
    if (!error && data) {
      setClients(data);
    }
  };

  const loadPhotos = async () => {
    const { data, error } = await supabase.from('photography_gallery').select('*');
    if (!error && data) {
      setPhotos(data);
    }
  };

  const loadVideos = async () => {
    const { data, error } = await supabase.from('videography_gallery').select('*');
    if (!error && data) {
      setVideos(data);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadBookings(), loadClients(), loadPhotos(), loadVideos()]);
      setLoading(false);
    };

    loadAll();

    const channel = supabase.channel('dashboard-realtime');

    const updateHandler = async () => {
      await loadBookings();
      await loadPhotos();
      await loadVideos();
    };

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, updateHandler)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photography_gallery' }, updateHandler)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videography_gallery' }, updateHandler)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, async () => {
        await loadClients();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayLabel = now.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const shortTodayLabel = now.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  const bookingsToday = bookings.filter((booking) => booking.date === today).length;
  const pendingRequests = bookings.filter((booking) => booking.status === 'pending').length;
  const confirmedBookings = bookings.filter((booking) => booking.status === 'confirmed').length;
  const completedShoots = bookings.filter((booking) => booking.status === 'completed').length;
  const cancelledBookings = bookings.filter((booking) => booking.status === 'cancelled').length;
  const totalBookings = bookings.length;
  const totalClients = clients.length;
  const upcomingShoots = bookings.filter((booking) => {
    if (!booking.date) return false;
    const bookingDate = new Date(`${booking.date}T00:00:00`).setHours(0, 0, 0, 0);
    return bookingDate >= new Date().setHours(0, 0, 0, 0) && booking.status !== 'cancelled' && booking.status !== 'completed';
  }).length;
  const galleryPhotos = photos.length;
  const videosUploaded = videos.length;

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt ?? b.date ?? 0).getTime() - new Date(a.createdAt ?? a.date ?? 0).getTime())
    .slice(0, 5);

  const recentUploads = photos.slice(0, 8);

  const formatTime = (value: string) => (value ? String(value).slice(0, 5) : '—');

  const todaySchedule = bookings
    .filter((booking) => booking.date === today)
    .sort((a, b) => String(a.time ?? '').localeCompare(String(b.time ?? '')))
    .slice(0, 4);

  const liveEvents = bookings
    .filter((booking) => booking.status !== 'cancelled')
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 3)
    .map((booking) => ({
      text: `${booking.clientName} booked a ${booking.service} session`,
      time: booking.date === today ? 'Today' : booking.date,
      type: 'booking' as const,
    }));

  const timeline = useMemo<TimelineEvent[]>(() => {
    const events: TimelineEvent[] = [];

    bookings.forEach((booking) => {
      const label = `${booking.clientName} · ${booking.service}`;
      if (booking.createdAt) {
        events.push({
          id: `b-new-${booking.id}`, at: new Date(booking.createdAt),
          action: 'New booking —', target: label,
          icon: <Calendar size={12} />, color: 'bg-blue-500/15 text-blue-400',
        });
      }
      if (booking.confirmedAt) {
        events.push({
          id: `b-conf-${booking.id}`, at: new Date(booking.confirmedAt),
          action: 'Booking confirmed —', target: label,
          icon: <CheckCircle2 size={12} />, color: 'bg-emerald-500/15 text-emerald-400',
        });
      }
      if (booking.completedAt) {
        events.push({
          id: `b-done-${booking.id}`, at: new Date(booking.completedAt),
          action: 'Shoot completed —', target: label,
          icon: <Camera size={12} />, color: 'bg-[#FCA311]/15 text-[#E8C87A]',
        });
      }
      if (booking.cancelledAt) {
        events.push({
          id: `b-canc-${booking.id}`, at: new Date(booking.cancelledAt),
          action: 'Booking cancelled —', target: label,
          icon: <XCircle size={12} />, color: 'bg-red-500/15 text-red-400',
        });
      }
    });

    clients.forEach((client: any) => {
      if (!client.created_at) return;
      events.push({
        id: `c-${client.id}`, at: new Date(client.created_at),
        action: 'New client —', target: client.full_name ?? client.email ?? 'Client',
        icon: <Users size={12} />, color: 'bg-purple-500/15 text-purple-400',
      });
    });

    photos.forEach((photo: any) => {
      if (!photo.created_at) return;
      events.push({
        id: `p-${photo.id}`, at: new Date(photo.created_at),
        action: 'Photo uploaded —', target: photo.title ?? photo.category ?? 'Untitled photo',
        icon: <Upload size={12} />, color: 'bg-emerald-500/15 text-emerald-400',
      });
    });

    videos.forEach((video: any) => {
      if (!video.created_at) return;
      events.push({
        id: `v-${video.id}`, at: new Date(video.created_at),
        action: 'Video uploaded —', target: video.title ?? video.category ?? 'Untitled video',
        icon: <Video size={12} />, color: 'bg-blue-500/15 text-blue-400',
      });
    });

    return events
      .filter((event) => !Number.isNaN(event.at.getTime()))
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, 8);
  }, [bookings, clients, photos, videos]);

  const welcomeSummary = bookingsToday > 0
    ? `You have ${bookingsToday} booking${bookingsToday === 1 ? '' : 's'} today and ${pendingRequests} pending request${pendingRequests === 1 ? '' : 's'}.`
    : 'No bookings today. Your schedule is clear.';

  const operationalStats = [
    { label: 'Total Bookings', value: totalBookings },
    { label: 'Confirmed Bookings', value: confirmedBookings },
    { label: 'Completed Shoots', value: completedShoots },
    { label: 'Cancelled Bookings', value: cancelledBookings },
  ];

  const kpiData = [
    {
      title: "Today's Bookings",
      value: bookingsToday,
      icon: <Calendar size={16} />,
      change: `${pendingRequests} pending`,
      positive: pendingRequests === 0,
      color: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      delay: 0,
    },
    {
      title: 'Pending Requests',
      value: pendingRequests,
      icon: <Clock size={16} />,
      change: pendingRequests > 0 ? `${pendingRequests} active` : 'All clear',
      positive: pendingRequests === 0,
      color: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      delay: 0.05,
    },
    {
      title: 'Upcoming Shoots',
      value: upcomingShoots,
      icon: <Camera size={16} />,
      change: `${upcomingShoots} scheduled`,
      positive: true,
      color: 'bg-purple-500/15',
      iconColor: 'text-purple-400',
      delay: 0.1,
    },
    {
      title: 'Total Clients',
      value: totalClients,
      icon: <Users size={16} />,
      change: `${totalClients} total`,
      positive: true,
      color: 'bg-[#D4AF37]/15',
      iconColor: 'text-[#E8C87A]',
      delay: 0.15,
    },
    {
      title: 'Gallery Photos',
      value: galleryPhotos,
      icon: <Image size={16} />,
      change: `${galleryPhotos} total`,
      positive: true,
      color: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      delay: 0.2,
    },
    {
      title: 'Videos Uploaded',
      value: videosUploaded,
      icon: <Video size={16} />,
      change: `${videosUploaded} total`,
      positive: true,
      color: 'bg-[#FCA311]/15',
      iconColor: 'text-[#E8C87A]',
      delay: 0.25,
    },
  ];


  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#D4AF37]" />
        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
          Loading dashboard data…
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-6 space-y-5"
    >
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative rounded-2xl overflow-hidden p-5 md:p-6 ${
          isDark
            ? 'bg-gradient-to-br from-[#2A1F04]/40 via-[#181818] to-[#0D0D0D] border border-white/[0.07]'
            : 'bg-gradient-to-br from-[#FDF6E3] via-white to-white border border-[#F2ECDD]'
        }`}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className="absolute right-32 -bottom-8 w-32 h-32 rounded-full bg-[#D4AF37]/5 blur-2xl" />
          {isDark && (
            <>
              <div className="absolute left-48 top-4 w-1 h-1 rounded-full bg-[#E8C87A]/40" />
              <div className="absolute left-72 top-8 w-1.5 h-1.5 rounded-full bg-amber-400/30" />
              <div className="absolute left-96 bottom-4 w-1 h-1 rounded-full bg-white/20" />
            </>
          )}
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className={`text-[11px] uppercase tracking-[0.18em] font-medium mb-1.5 ${isDark ? 'text-[#E8C87A]/70' : 'text-[#E8C87A]'}`}>
              {todayLabel}
            </p>
            <h2 className={`text-xl md:text-2xl font-bold mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: 'Playfair Display, serif' }}>
              {greeting}, Admin 👋
            </h2>

            <p className={`text-sm max-w-md ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              {welcomeSummary}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {quickActions.map((action, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-xs font-medium shadow-lg bg-gradient-to-r ${action.color} ${action.shadow} transition-all duration-200`}
              >
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiData.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      {/* Operational Stats Strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`flex flex-wrap items-center gap-0 rounded-2xl overflow-hidden ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200/60 shadow-sm'}`}
      >
        {operationalStats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex-1 min-w-[140px] px-5 py-4 ${i > 0 ? `border-l ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}` : ''}`}
          >
            <p className={`text-[10px] uppercase tracking-wider mb-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{stat.label}</p>
            <p className={`text-base font-bold tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </motion.div>


      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Bookings — 2/3 */}
        <div className="xl:col-span-2">
          <GlassCard delay={0.32} className="overflow-hidden h-full">
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}`}>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Playfair Display, serif' }}>
                Recent Bookings
              </h3>
              <button className={`text-xs font-medium ${isDark ? 'text-[#E8C87A] hover:text-[#E8C87A]' : 'text-[#D4AF37] hover:text-[#FCA311]'} transition-colors`}>
                View all →
              </button>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {recentBookings.length === 0 ? (
                <div className="px-5 py-12">
                  <EmptyState
                    icon={Calendar}
                    title="No bookings yet"
                    description="Your first booking will appear here. Share your booking link with clients to get started."
                  />
                </div>
              ) : (
                recentBookings.map((booking, i) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className={`flex items-center gap-3.5 px-5 py-3.5 transition-colors duration-200 cursor-pointer ${
                      isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={booking.clientAvatar}
                        alt={booking.clientName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                        {booking.clientName}
                      </p>
                      <p className={`text-[11px] truncate ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        {booking.service} · {booking.date}{booking.time ? ` · ${formatTime(booking.time)}` : ''}
                      </p>
                    </div>
                    {booking.amount != null && booking.amount > 0 && (
                      <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                        <p className={`text-xs font-bold ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                          {booking.amount.toLocaleString()}
                        </p>
                      </div>
                    )}

                    <StatusBadge status={booking.status} />
                  </motion.div>
                ))
              )}
              </div>
            </GlassCard>
          </div>

        {/* Activity + Live — 1/3 */}
        <div className="space-y-3">
          {/* Live Status */}
          <GlassCard delay={0.34} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className={`text-xs font-semibold ${isDark ? 'text-white/90' : 'text-gray-900'}`}>Live Activity</p>
            </div>
            <div className="space-y-2">
              {liveEvents.length === 0 ? (
                <div className={`rounded-2xl border px-4 py-6 text-center ${isDark ? 'border-white/[0.08] text-white/50 bg-white/[0.02]' : 'border-gray-200/60 text-gray-500 bg-gray-50'}`}>
                  <p className="text-sm font-semibold mb-1">No live activity yet</p>
                  <p className="text-[11px]">Live action appears here as soon as bookings or uploads are received.</p>
                </div>
              ) : (
                liveEvents.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className={`text-[11px] flex-1 truncate pr-2 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{item.text}</p>
                    <span className={`text-[10px] flex-shrink-0 ${isDark ? 'text-white/25' : 'text-gray-400'}`}>{item.time}</span>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Activity Timeline */}
          <GlassCard delay={0.36} className="overflow-hidden flex-1">
            <div className={`flex items-center justify-between px-4 py-3.5 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}`}>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                Timeline
              </h3>
            </div>
            <div className="px-4 py-4 space-y-3.5">
              {activityFeed.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex gap-3 items-start"
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[11px] mt-0.5 ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                      {item.action}{' '}
                      <span className={`font-semibold ${isDark ? 'text-white/85' : 'text-gray-800'}`}>{item.target}</span>
                    </p>
                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-white/25' : 'text-gray-400'}`}>{item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Today's Schedule */}
      <GlassCard delay={0.45} className="overflow-hidden">
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}`}>
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
            Today's Schedule
          </h3>
          <span className={`text-[11px] px-2.5 py-1 rounded-lg ${isDark ? 'bg-white/[0.05] text-white/40' : 'bg-gray-100 text-gray-400'}`}>
            28 Jan 2025
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {todaySchedule.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={Clock}
                  title="Nothing scheduled today"
                  description="Enjoy the calm — your schedule is clear until the next booking."
                />
              </div>
            ) : (
              todaySchedule.map((slot, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className={`p-4 rounded-xl border-l-2 ${slot.status === 'pending' ? 'border-amber-500' : slot.status === 'confirmed' ? 'border-emerald-500' : 'border-slate-500'} ${isDark ? 'bg-white/[0.04]' : 'bg-white'}`}
                >
                  <p className={`text-xs font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{slot.time}</p>
                  <p className={`text-xs font-semibold ${isDark ? 'text-white/80' : 'text-gray-800'}`}>{slot.clientName}</p>
                  <p className={`text-[11px] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{slot.service}</p>
                </motion.div>
              ))
            )}
            {todaySchedule.length > 0 && todaySchedule.length < 4 && (
              <div className={`rounded-2xl border border-dashed p-4 text-center ${isDark ? 'border-white/[0.08] bg-white/[0.03] text-white/50' : 'border-gray-200/60 bg-gray-50 text-gray-500'}`}>
                <p className="text-[11px]">More bookings will appear here as they are confirmed.</p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Latest Uploads Gallery */}
      <GlassCard delay={0.5} className="overflow-hidden">
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}`}>
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
            Latest Uploads
          </h3>
          <div className="flex items-center gap-3">
            <span className={`text-[11px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{photos.length} total</span>
            <button className="flex items-center gap-1.5 text-[11px] font-medium text-[#0B0B0B] bg-[#D4AF37] hover:bg-[#FCA311] px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={11} />
              Upload
            </button>
          </div>
        </div>
        <div className="p-4">
          {recentUploads.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <EmptyState
                icon={Camera}
                title="No photos uploaded yet"
                description="Start building your gallery by uploading your first portfolio photo."
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-8 gap-2">
              {recentUploads.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.93 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + i * 0.03 }}
                  className="group relative rounded-xl overflow-hidden cursor-pointer"
                  style={{ aspectRatio: '1' }}
                  whileHover={{ scale: 1.04 }}
                >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-[9px] font-medium truncate leading-tight">{item.title}</p>
                    </div>
                    <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-5 h-5 rounded-md bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <Eye size={9} className="text-white" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

      <GlassCard delay={0.55} className="overflow-hidden">
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}`}>
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
            Videos
          </h3>
          <span className={`text-[11px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{videosUploaded} uploaded</span>
        </div>
        <div className="p-8">
          {videosUploaded === 0 ? (
            <EmptyState
              icon={Video}
              title="No videos uploaded yet"
              description="Start building your video library so clients can see your work."
            />
          ) : (
            <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              You’ve uploaded {videosUploaded} video{videosUploaded === 1 ? '' : 's'}. Keep building your library with your latest work.
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

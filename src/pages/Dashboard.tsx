import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Image, Video, Users, TrendingUp, Clock,
  ArrowUpRight, Plus, Camera, Upload, Star, Zap, Eye,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';
import { mockBookings, mockPortfolio } from '@/data/mockData';

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

const kpiData = [
  { title: "Today's Bookings",    value: 4,    icon: <Calendar size={16} />,  change: '+2 today',      positive: true,  color: 'bg-blue-500/15',    iconColor: 'text-blue-400',    delay: 0 },
  { title: 'Pending Requests',    value: 6,    icon: <Clock size={16} />,     change: '+1 new',        positive: true,  color: 'bg-amber-500/15',   iconColor: 'text-amber-400',   delay: 0.05 },
  { title: 'Upcoming Shoots',     value: 12,   icon: <Camera size={16} />,    change: '+3 this week',  positive: true,  color: 'bg-purple-500/15',  iconColor: 'text-purple-400',  delay: 0.1 },
  { title: 'Portfolio Items',     value: 1034, icon: <Image size={16} />,     change: '+47 this month',positive: true,  color: 'bg-emerald-500/15', iconColor: 'text-emerald-400', delay: 0.15 },
  { title: 'Videos Uploaded',     value: 89,   icon: <Video size={16} />,     change: '+6 this week',  positive: true,  color: 'bg-[#FCA311]/15',     iconColor: 'text-[#E8C87A]',     delay: 0.2 },
  { title: 'Active Photographers',value: 5,    icon: <Users size={16} />,     change: '1 on leave',    positive: false, color: 'bg-cyan-500/15',    iconColor: 'text-cyan-400',    delay: 0.25 },
];

const activityFeed = [
  { time: '9:32 AM', action: 'New booking from', target: 'Efua Boateng', type: 'booking', icon: <Calendar size={12} />, color: 'bg-blue-500/15 text-blue-400' },
  { time: '9:15 AM', action: 'Payment received —', target: 'Kwame Asante (GH₵4,500)', type: 'payment', icon: <TrendingUp size={12} />, color: 'bg-emerald-500/15 text-emerald-400' },
  { time: '8:47 AM', action: 'Gallery uploaded by', target: 'Kofi Mensah (127 photos)', type: 'upload', icon: <Upload size={12} />, color: 'bg-purple-500/15 text-purple-400' },
  { time: '8:00 AM', action: 'Booking confirmed —', target: 'Nana Adjei Fashion Editorial', type: 'booking', icon: <Star size={12} />, color: 'bg-amber-500/15 text-amber-400' },
  { time: 'Yesterday', action: 'New photographer:', target: 'Akosua Amponsah', type: 'team', icon: <Users size={12} />, color: 'bg-cyan-500/15 text-cyan-400' },
];

const quickActions = [
  { label: 'New Booking',     icon: <Calendar size={13} />, color: 'from-blue-600 to-blue-700',   shadow: 'shadow-blue-900/40' },
  { label: 'Upload Photos',   icon: <Upload size={13} />,   color: 'from-emerald-600 to-emerald-700', shadow: 'shadow-emerald-900/40' },
  { label: 'Add Photographer',icon: <Camera size={13} />,   color: 'from-purple-600 to-purple-700',  shadow: 'shadow-purple-900/40' },
  { label: 'Quick Actions',   icon: <Zap size={13} />,      color: 'from-amber-500 to-amber-600',    shadow: 'shadow-amber-900/40' },
];

export const Dashboard: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const recentBookings = mockBookings.slice(0, 5);
  const recentUploads = mockPortfolio.slice(0, 8);

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
              Tuesday, January 28, 2025
            </p>
            <h2 className={`text-xl md:text-2xl font-bold mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Good morning, Admin 👋
            </h2>
            <p className={`text-sm max-w-md ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              You have <span className={`font-semibold ${isDark ? 'text-white/90' : 'text-gray-900'}`}>4 bookings</span> today and{' '}
              <span className="font-semibold text-amber-500">6 pending requests</span> awaiting response.
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

      {/* Revenue Strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`flex flex-wrap items-center gap-0 rounded-2xl overflow-hidden ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200/60 shadow-sm'}`}
      >
        {[
          { label: 'Monthly Revenue', value: 'GH₵38,400', change: '+18%', positive: true },
          { label: 'Yearly Revenue', value: 'GH₵428,000', change: '+24%', positive: true },
          { label: 'Avg per Booking', value: 'GH₵3,200', change: '+5%', positive: true },
          { label: 'Conversion Rate', value: '78%', change: '+3%', positive: true },
        ].map((stat, i) => (
          <div
            key={i}
            className={`flex-1 min-w-[140px] px-5 py-4 ${i > 0 ? `border-l ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}` : ''}`}
          >
            <p className={`text-[10px] uppercase tracking-wider mb-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{stat.label}</p>
            <div className="flex items-center gap-2">
              <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                {stat.value}
              </p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${stat.positive ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600' : 'bg-[#FCA311]/10 text-[#E8C87A]'}`}>
                {stat.change}
              </span>
            </div>
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
              {recentBookings.map((booking, i) => (
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
                      {booking.service} · {booking.date}
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                    <p className={`text-xs font-bold ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                      GH₵{booking.amount.toLocaleString()}
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{booking.photographer}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </motion.div>
              ))}
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
              {[
                { text: 'Kofi is shooting at Accra ICC', time: 'Now' },
                { text: 'Ama completed portrait session', time: '12 min' },
                { text: 'New gallery pending review', time: '1 hr' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className={`text-[11px] flex-1 truncate pr-2 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{item.text}</p>
                  <span className={`text-[10px] flex-shrink-0 ${isDark ? 'text-white/25' : 'text-gray-400'}`}>{item.time}</span>
                </div>
              ))}
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
            {[
              { time: '8:00 AM', client: 'Abena Frimpong', service: 'Graduation', photographer: 'Ama Darko', accentColor: 'bg-blue-500', lightBg: isDark ? 'bg-blue-500/5 border-blue-500/15' : 'bg-blue-50/50 border-blue-200/50' },
              { time: '11:00 AM', client: 'Kwame Asante', service: 'Corporate Event', photographer: 'Kwesi Boateng', accentColor: 'bg-purple-500', lightBg: isDark ? 'bg-purple-500/5 border-purple-500/15' : 'bg-purple-50/50 border-purple-200/50' },
              { time: '2:00 PM', client: 'Zara Mensah', service: 'Portrait Session', photographer: 'Ama Darko', accentColor: 'bg-amber-500', lightBg: isDark ? 'bg-amber-500/5 border-amber-500/15' : 'bg-amber-50/50 border-amber-200/50' },
              { time: '5:00 PM', client: 'Nana Adjei', service: 'Fashion Editorial', photographer: 'Kofi Mensah', accentColor: 'bg-emerald-500', lightBg: isDark ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-emerald-50/50 border-emerald-200/50' },
            ].map((slot, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className={`p-4 rounded-xl border-l-2 ${slot.accentColor.replace('bg-', 'border-l-')} ${slot.lightBg} border cursor-pointer hover:scale-[1.01] transition-transform duration-200`}
              >
                <p className={`text-xs font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{slot.time}</p>
                <p className={`text-xs font-semibold ${isDark ? 'text-white/80' : 'text-gray-800'}`}>{slot.client}</p>
                <p className={`text-[11px] mb-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{slot.service}</p>
                <div className="flex items-center gap-1.5">
                  <Camera size={10} className={isDark ? 'text-white/25' : 'text-gray-400'} />
                  <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{slot.photographer}</p>
                </div>
              </motion.div>
            ))}
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
            <span className={`text-[11px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{mockPortfolio.length} total</span>
            <button className="flex items-center gap-1.5 text-[11px] font-medium text-[#0B0B0B] bg-[#D4AF37] hover:bg-[#FCA311] px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={11} />
              Upload
            </button>
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-8 gap-2">
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
      </GlassCard>
    </motion.div>
  );
};

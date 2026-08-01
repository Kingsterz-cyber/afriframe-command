import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, X, Phone, Mail, MessageSquare,
  Calendar, Clock, MapPin, User, ChevronRight, Check,
  XCircle, UserPlus, Download,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';
import { mockBookings, Booking } from '@/data/mockData';

const FILTERS = ['All', 'Confirmed', 'Pending', 'Upcoming', 'Completed', 'Cancelled'];

export const Bookings: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filtered = mockBookings.filter(b => {
    const matchSearch =
      b.clientName.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'All' || b.status === activeFilter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const inputBg = isDark
    ? 'bg-white/[0.05] border-white/[0.08] text-white/80 placeholder-white/30 focus:border-white/20'
    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-gray-300';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
            <input
              className={`w-full h-9 pl-8 pr-4 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
              placeholder="Search bookings..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Filters */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeFilter === f
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                    : isDark
                      ? 'bg-white/[0.05] text-white/50 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                      : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-medium shadow-lg shadow-red-900/25 hover:bg-red-500 transition-colors flex-shrink-0"
        >
          <Plus size={13} />
          New Booking
        </motion.button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: mockBookings.length, color: isDark ? 'text-white' : 'text-gray-900' },
          { label: 'Confirmed', value: mockBookings.filter(b => b.status === 'confirmed').length, color: 'text-emerald-400' },
          { label: 'Pending', value: mockBookings.filter(b => b.status === 'pending').length, color: 'text-amber-400' },
          { label: 'Revenue', value: 'GH₵' + mockBookings.reduce((a, b) => a + b.amount, 0).toLocaleString(), color: isDark ? 'text-white' : 'text-gray-900' },
        ].map((s, i) => (
          <GlassCard key={i} delay={i * 0.04} className="px-4 py-3">
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'} mb-0.5`}>{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`} style={{ fontFamily: 'Playfair Display, serif' }}>{s.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Table */}
      <GlassCard delay={0.15} className="overflow-hidden">
        {/* Table Header */}
        <div className={`hidden md:grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr_1fr_auto] gap-3 px-5 py-3 border-b ${
          isDark ? 'border-white/[0.06]' : 'border-gray-200/60'
        }`}>
          {['Client', 'Service', 'Date & Time', 'Duration', 'Photographer', 'Status', ''].map((h, i) => (
            <p key={i} className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{h}</p>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.04]">
          <AnimatePresence>
            {filtered.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedBooking(booking)}
                className={`grid grid-cols-1 md:grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr_1fr_auto] gap-3 items-center px-5 py-4 cursor-pointer transition-colors duration-200 ${
                  isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50/80'
                } ${selectedBooking?.id === booking.id ? (isDark ? 'bg-white/[0.04]' : 'bg-red-50/30') : ''}`}
              >
                {/* Client */}
                <div className="flex items-center gap-2.5">
                  <img src={booking.clientAvatar} alt={booking.clientName} className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isDark ? 'text-white/90' : 'text-gray-900'}`}>{booking.clientName}</p>
                    <p className={`text-[10px] truncate ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{booking.id}</p>
                  </div>
                </div>
                {/* Service */}
                <div>
                  <p className={`text-xs font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{booking.service}</p>
                  <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{booking.package}</p>
                </div>
                {/* Date */}
                <div>
                  <p className={`text-xs ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{booking.date}</p>
                  <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{booking.time}</p>
                </div>
                {/* Duration */}
                <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{booking.duration}</p>
                {/* Photographer */}
                <div className="flex items-center gap-1.5">
                  <img src={booking.photographerAvatar} alt={booking.photographer} className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10" />
                  <p className={`text-xs truncate ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{booking.photographer}</p>
                </div>
                {/* Status */}
                <StatusBadge status={booking.status} />
                {/* Action */}
                <ChevronRight size={14} className={`${isDark ? 'text-white/20' : 'text-gray-300'} hidden md:block`} />
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>No bookings found</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Booking Detail Drawer */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedBooking(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col backdrop-blur-2xl overflow-y-auto ${
                isDark
                  ? 'bg-[#0D0D0D]/98 border-l border-white/[0.08]'
                  : 'bg-white/98 border-l border-gray-200'
              }`}
            >
              {/* Drawer Header */}
              <div className={`flex items-center justify-between px-6 py-5 border-b flex-shrink-0 ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
                <div>
                  <p className={`text-[10px] uppercase tracking-widest mb-0.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{selectedBooking.id}</p>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                    Booking Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.08]' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 px-6 py-5 space-y-6 overflow-y-auto">
                {/* Client Info */}
                <div>
                  <p className={`text-[10px] uppercase tracking-widest mb-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Client</p>
                  <div className="flex items-center gap-3">
                    <img src={selectedBooking.clientAvatar} alt={selectedBooking.clientName} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/10" />
                    <div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.clientName}</p>
                      <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{selectedBooking.clientEmail}</p>
                      <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{selectedBooking.clientPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: <Phone size={14} />, label: 'Call', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
                    { icon: <MessageSquare size={14} />, label: 'WhatsApp', color: 'bg-green-500/15 text-green-400 border border-green-500/20' },
                    { icon: <Mail size={14} />, label: 'Email', color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20' },
                  ].map((a, i) => (
                    <button key={i} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all hover:scale-105 ${a.color}`}>
                      {a.icon}
                      {a.label}
                    </button>
                  ))}
                </div>

                {/* Booking Details */}
                <div className={`rounded-2xl p-4 space-y-3 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200/60'}`}>
                  <p className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Booking Info</p>
                  {[
                    { icon: <Calendar size={13} />, label: 'Date', value: selectedBooking.date },
                    { icon: <Clock size={13} />, label: 'Time', value: `${selectedBooking.time} (${selectedBooking.duration})` },
                    { icon: <MapPin size={13} />, label: 'Location', value: selectedBooking.location },
                    { icon: <User size={13} />, label: 'Photographer', value: selectedBooking.photographer },
                  ].map((row, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className={`flex-shrink-0 mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{row.icon}</span>
                      <div>
                        <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{row.label}</p>
                        <p className={`text-xs font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Package & Amount */}
                <div className={`rounded-2xl p-4 flex items-center justify-between ${isDark ? 'bg-red-900/10 border border-red-500/15' : 'bg-red-50 border border-red-200/60'}`}>
                  <div>
                    <p className={`text-[10px] uppercase tracking-widest mb-0.5 ${isDark ? 'text-red-400/60' : 'text-red-400'}`}>Package</p>
                    <p className={`text-xs font-semibold ${isDark ? 'text-white/90' : 'text-gray-900'}`}>{selectedBooking.package}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] uppercase tracking-widest mb-0.5 ${isDark ? 'text-red-400/60' : 'text-red-400'}`}>Amount</p>
                    <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                      GH₵{selectedBooking.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Current Status</p>
                  <StatusBadge status={selectedBooking.status} size="md" />
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div className={`rounded-2xl p-4 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200/60'}`}>
                    <p className={`text-[10px] uppercase tracking-widest mb-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Notes</p>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{selectedBooking.notes}</p>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <p className={`text-[10px] uppercase tracking-widest mb-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Timeline</p>
                  <div className="space-y-3">
                    {selectedBooking.timeline.map((event, i) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                          {i < selectedBooking.timeline.length - 1 && (
                            <div className={`w-px flex-1 mt-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className={`text-xs font-medium ${isDark ? 'text-white/80' : 'text-gray-800'}`}>{event.action}</p>
                          <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>by {event.by} · {event.date} at {event.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className={`px-6 py-5 border-t flex-shrink-0 space-y-2 ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors"
                  >
                    <Check size={13} />
                    Confirm
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-colors border ${
                      isDark ? 'border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]' : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <UserPlus size={13} />
                    Assign
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600/15 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-600/25 transition-colors"
                >
                  <XCircle size={13} />
                  Cancel Booking
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-colors border ${
                    isDark ? 'border-white/[0.06] text-white/40 hover:text-white/60' : 'border-gray-200 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Download size={13} />
                  Export Details
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Phone, Mail, Star, Camera,
  X, Calendar, MapPin, Award,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';
import { mockPhotographers, Photographer } from '@/data/mockData';

export const Photographers: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Photographer | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'booked' | 'on-leave'>('all');

  const filtered = mockPhotographers.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.availability === filter;
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
      className="p-4 md:p-6 space-y-5"
    >
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <input
            className={`w-full h-9 pl-8 pr-4 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
            placeholder="Search photographers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { key: 'all', label: 'All' },
            { key: 'available', label: 'Available' },
            { key: 'booked', label: 'Booked' },
            { key: 'on-leave', label: 'On Leave' },
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
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0B0B0B] text-xs font-medium shadow-lg shadow-[#5C4406]/25 hover:bg-[#FCA311] transition-colors flex-shrink-0"
        >
          <Plus size={13} />
          Add Photographer
        </motion.button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Team', value: mockPhotographers.length, color: isDark ? 'text-white' : 'text-gray-900' },
          { label: 'Available', value: mockPhotographers.filter(p => p.availability === 'available').length, color: 'text-emerald-400' },
          { label: 'Booked', value: mockPhotographers.filter(p => p.availability === 'booked').length, color: 'text-amber-400' },
          { label: 'Projects Done', value: mockPhotographers.reduce((a, p) => a + p.projectsCompleted, 0), color: isDark ? 'text-white' : 'text-gray-900' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`px-4 py-3 rounded-2xl ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white border border-gray-200/60 shadow-sm'}`}
          >
            <p className={`text-[10px] uppercase tracking-wider mb-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`} style={{ fontFamily: 'Playfair Display, serif' }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Photographer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filtered.map((photographer, i) => (
            <motion.div
              key={photographer.id}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelected(photographer)}
              className={`group rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                isDark
                  ? 'bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.06]'
                  : 'bg-white border border-gray-200/60 hover:border-gray-300 hover:shadow-lg shadow-sm'
              }`}
            >
              {/* Avatar & Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <img
                    src={photographer.avatar}
                    alt={photographer.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/10"
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 ${isDark ? 'border-[#181818]' : 'border-white'} ${
                    photographer.availability === 'available' ? 'bg-emerald-400' :
                    photographer.availability === 'booked' ? 'bg-amber-400' : 'bg-gray-400'
                  }`} />
                </div>
                <StatusBadge status={photographer.availability} size="sm" />
              </div>

              {/* Info */}
              <div className="mb-4">
                <h4 className={`text-sm font-bold mb-0.5 ${isDark ? 'text-white/90' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                  {photographer.name}
                </h4>
                <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{photographer.role}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-2">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className={`text-xs font-semibold ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{photographer.rating}</span>
                  <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>rating</span>
                </div>
              </div>

              {/* Stats */}
              <div className={`grid grid-cols-2 gap-2 mb-4 pb-4 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}`}>
                <div className={`text-center p-2 rounded-xl ${isDark ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
                  <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{photographer.projectsCompleted}</p>
                  <p className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Projects</p>
                </div>
                <div className={`text-center p-2 rounded-xl ${isDark ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
                  <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{photographer.specialization.length}</p>
                  <p className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Specialties</p>
                </div>
              </div>

              {/* Specializations */}
              <div className="flex flex-wrap gap-1 mb-4">
                {photographer.specialization.slice(0, 3).map(spec => (
                  <span key={spec} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${isDark ? 'bg-white/[0.06] text-white/50 border border-white/[0.08]' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                    {spec}
                  </span>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={e => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium transition-all bg-[#D4AF37]/10 text-[#E8C87A] border border-[#FCA311]/20 hover:bg-[#D4AF37]/20"
                >
                  <Phone size={11} />
                  Call
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={e => e.stopPropagation()}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium transition-all border ${
                    isDark ? 'border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.06]' : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Mail size={11} />
                  Email
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col backdrop-blur-2xl overflow-y-auto ${
                isDark ? 'bg-[#0D0D0D]/98 border-l border-white/[0.08]' : 'bg-white/98 border-l border-gray-200'
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                  Photographer Profile
                </h3>
                <button onClick={() => setSelected(null)} className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.08]' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}>
                  <X size={15} />
                </button>
              </div>

              <div className="flex-1 px-6 py-5 space-y-5">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <img src={selected.avatar} alt={selected.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10" />
                  <div>
                    <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                      {selected.name}
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{selected.role}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge status={selected.availability} size="sm" />
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className={`text-xs font-semibold ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{selected.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: <Phone size={14} />, label: 'Call', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
                    { icon: <Camera size={14} />, label: 'Portfolio', color: 'bg-pink-500/15 text-pink-400 border border-pink-500/20' },
                    { icon: <Mail size={14} />, label: 'Email', color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20' },
                  ].map((a, i) => (
                    <button key={i} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium hover:scale-105 transition-transform ${a.color}`}>
                      {a.icon}
                      {a.label}
                    </button>
                  ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Projects', value: selected.projectsCompleted, icon: <Camera size={14} /> },
                    { label: 'Rating', value: selected.rating, icon: <Star size={14} /> },
                    { label: 'Specialties', value: selected.specialization.length, icon: <Award size={14} /> },
                  ].map((s, i) => (
                    <div key={i} className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200/60'}`}>
                      <div className={`flex justify-center mb-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{s.icon}</div>
                      <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
                      <p className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Contact & Details */}
                <div className={`rounded-2xl p-4 space-y-3 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200/60'}`}>
                  {[
                    { icon: <Phone size={12} />, label: 'Phone', value: selected.phone },
                    { icon: <Mail size={12} />, label: 'Email', value: selected.email },
                    { icon: <MapPin size={12} />, label: 'Instagram', value: selected.instagram },
                    { icon: <MapPin size={12} />, label: 'Location', value: selected.location },
                    { icon: <Calendar size={12} />, label: 'Joined', value: selected.joinDate },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className={isDark ? 'text-white/30' : 'text-gray-400'}>{row.icon}</span>
                      <span className={`text-[10px] flex-shrink-0 w-20 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{row.label}</span>
                      <span className={`text-xs font-medium truncate ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Specializations */}
                <div>
                  <p className={`text-[10px] uppercase tracking-widest mb-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Specializations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.specialization.map(spec => (
                      <span key={spec} className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${isDark ? 'bg-[#FCA311]/10 text-[#E8C87A] border border-[#FCA311]/20' : 'bg-[#FDF6E3] text-[#D4AF37] border border-[#E8C87A]'}`}>
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`px-6 py-4 border-t ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B0B0B] text-xs font-medium hover:bg-[#FCA311] transition-colors">
                  <Calendar size={13} /> Assign to Booking
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

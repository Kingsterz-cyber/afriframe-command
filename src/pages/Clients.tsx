import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Phone, Mail, X, Calendar, MapPin,
  DollarSign, Star, ChevronRight,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';
import { mockClients, Client } from '@/data/mockData';

export const Clients: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Client | null>(null);
  const [filter, setFilter] = useState<'all' | 'vip' | 'active' | 'inactive'>('all');

  const filtered = mockClients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
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
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { key: 'all', label: 'All' },
            { key: 'vip', label: 'VIP' },
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Inactive' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.key
                  ? 'bg-red-600 text-white'
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
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-500 transition-colors flex-shrink-0"
        >
          <Plus size={13} />
          Add Client
        </motion.button>
      </div>

      {/* CRM Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Clients', value: mockClients.length },
          { label: 'VIP Clients', value: mockClients.filter(c => c.status === 'vip').length },
          { label: 'Total Revenue', value: 'GH₵' + mockClients.reduce((a, c) => a + c.totalSpent, 0).toLocaleString() },
          { label: 'Avg. Spend', value: 'GH₵' + Math.round(mockClients.reduce((a, c) => a + c.totalSpent, 0) / mockClients.length).toLocaleString() },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`px-4 py-3 rounded-2xl ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white border border-gray-200/60 shadow-sm'}`}
          >
            <p className={`text-[10px] uppercase tracking-wider mb-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{s.label}</p>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Client Table */}
      <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white border border-gray-200/60 shadow-sm'}`}>
        {/* Table Header */}
        <div className={`hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}`}>
          {['Client', 'Contact', 'Bookings', 'Total Spent', 'Status', ''].map((h, i) => (
            <p key={i} className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{h}</p>
          ))}
        </div>

        <div className="divide-y divide-white/[0.04]">
          <AnimatePresence>
            {filtered.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(client)}
                className={`grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-3 items-center px-5 py-4 cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50/80'
                }`}
              >
                {/* Client */}
                <div className="flex items-center gap-3">
                  <img src={client.avatar} alt={client.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className={`text-xs font-semibold ${isDark ? 'text-white/90' : 'text-gray-900'}`}>{client.name}</p>
                      {client.status === 'vip' && <Star size={10} className="text-amber-400 fill-amber-400" />}
                    </div>
                    <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{client.location}</p>
                  </div>
                </div>
                {/* Contact */}
                <div>
                  <p className={`text-xs ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{client.email}</p>
                  <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{client.phone}</p>
                </div>
                {/* Bookings */}
                <p className={`text-xs font-medium ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{client.totalBookings}</p>
                {/* Spent */}
                <p className={`text-xs font-semibold ${isDark ? 'text-white/90' : 'text-gray-900'}`}>GH₵{client.totalSpent.toLocaleString()}</p>
                {/* Status */}
                <StatusBadge status={client.status} />
                <ChevronRight size={13} className={`hidden md:block ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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
              <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>Client Profile</h3>
                <button onClick={() => setSelected(null)} className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.08]' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}>
                  <X size={15} />
                </button>
              </div>

              <div className="flex-1 px-6 py-5 space-y-5">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <img src={selected.avatar} alt={selected.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>{selected.name}</h4>
                      {selected.status === 'vip' && <Star size={13} className="text-amber-400 fill-amber-400" />}
                    </div>
                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{selected.email}</p>
                    <StatusBadge status={selected.status} size="sm" />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: <Phone size={14} />, label: 'Call', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
                    { icon: <Mail size={14} />, label: 'Email', color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20' },
                    { icon: <Calendar size={14} />, label: 'Book', color: 'bg-red-500/15 text-red-400 border border-red-500/20' },
                  ].map((a, i) => (
                    <button key={i} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium hover:scale-105 transition-transform ${a.color}`}>
                      {a.icon}
                      {a.label}
                    </button>
                  ))}
                </div>

                {/* Revenue Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Bookings', value: selected.totalBookings, icon: <Calendar size={13} /> },
                    { label: 'Total Spent', value: 'GH₵' + selected.totalSpent.toLocaleString(), icon: <DollarSign size={13} /> },
                  ].map((s, i) => (
                    <div key={i} className={`p-3 rounded-xl ${isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200/60'}`}>
                      <div className={`flex items-center gap-1.5 mb-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        {s.icon}
                        <span className="text-[10px] uppercase tracking-wider">{s.label}</span>
                      </div>
                      <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Contact Details */}
                <div className={`rounded-2xl p-4 space-y-3 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200/60'}`}>
                  {[
                    { icon: <Phone size={12} />, label: 'Phone', value: selected.phone },
                    { icon: <Mail size={12} />, label: 'Email', value: selected.email },
                    { icon: <MapPin size={12} />, label: 'Location', value: selected.location },
                    { icon: <Calendar size={12} />, label: 'Last Booking', value: selected.lastBooking },
                    { icon: <Calendar size={12} />, label: 'Joined', value: selected.joinDate },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className={isDark ? 'text-white/30' : 'text-gray-400'}>{row.icon}</span>
                      <span className={`text-[10px] flex-shrink-0 w-24 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{row.label}</span>
                      <span className={`text-xs font-medium truncate ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {selected.notes && (
                  <div className={`rounded-2xl p-4 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200/60'}`}>
                    <p className={`text-[10px] uppercase tracking-widest mb-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Notes</p>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{selected.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

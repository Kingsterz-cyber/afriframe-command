import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, FolderOpen, Image, Calendar, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';
import { mockCollections } from '@/data/mockData';

const categoryColors: Record<string, string> = {
  Weddings:   'from-rose-900/60 to-rose-600/30',
  Portraits:  'from-purple-900/60 to-purple-600/30',
  Commercial: 'from-blue-900/60 to-blue-600/30',
  Events:     'from-amber-900/60 to-amber-600/30',
  Fashion:    'from-pink-900/60 to-pink-600/30',
  Graduation: 'from-emerald-900/60 to-emerald-600/30',
  Church:     'from-orange-900/60 to-orange-600/30',
  Corporate:  'from-cyan-900/60 to-cyan-600/30',
};

export const Collections: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');

  const filtered = mockCollections.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <input
            className={`w-full h-9 pl-8 pr-4 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
            placeholder="Search collections..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="ml-auto flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0B0B0B] text-xs font-medium shadow-lg shadow-[#5C4406]/25 hover:bg-[#FCA311] transition-colors"
          >
            <Plus size={13} />
            New Collection
          </motion.button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={`flex items-center gap-6 px-5 py-3 rounded-2xl ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-200/60 shadow-sm'}`}>
        {[
          { label: 'Total Collections', value: mockCollections.length },
          { label: 'Total Items', value: mockCollections.reduce((a, b) => a + b.itemCount, 0).toLocaleString() },
          { label: 'Active', value: mockCollections.filter(c => c.status === 'active').length },
        ].map((s, i) => (
          <div key={i} className={i > 0 ? `pl-6 border-l ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}` : ''}>
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{s.label}</p>
            <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Collection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((collection, i) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4, scale: 1.01 }}
            className={`group rounded-2xl overflow-hidden cursor-pointer ${
              isDark
                ? 'bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15]'
                : 'bg-white border border-gray-200/60 hover:border-gray-300 shadow-sm hover:shadow-md'
            } transition-all duration-300`}
          >
            {/* Cover Image */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={collection.coverImage}
                alt={collection.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${categoryColors[collection.category] || 'from-black/60 to-transparent'}`} />

              {/* Category */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider">
                  {collection.category}
                </span>
              </div>

              {/* Actions on hover */}
              <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {[
                  { icon: <ExternalLink size={11} />, label: 'Open' },
                  { icon: <Edit2 size={11} />, label: 'Edit' },
                  { icon: <Trash2 size={11} />, label: 'Delete' },
                ].map((action, j) => (
                  <motion.button
                    key={j}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-6 h-6 rounded-lg bg-black/60 backdrop-blur-sm text-white/80 hover:text-white flex items-center justify-center"
                    title={action.label}
                  >
                    {action.icon}
                  </motion.button>
                ))}
              </div>

              {/* Item Count Badge */}
              <div className="absolute bottom-3 right-3">
                <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-1.5">
                  <Image size={10} className="text-white/70" />
                  <span className="text-white text-[10px] font-semibold">{collection.itemCount}</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className={`text-sm font-bold mb-0.5 ${isDark ? 'text-white/90' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                    {collection.name}
                  </h4>
                  <p className={`text-[11px] line-clamp-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{collection.description}</p>
                </div>
                <StatusBadge status={collection.status} size="sm" />
              </div>

              <div className={`flex items-center gap-3 pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}`}>
                <div className={`flex items-center gap-1 text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                  <FolderOpen size={10} />
                  {collection.itemCount} items
                </div>
                <div className={`flex items-center gap-1 text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                  <Calendar size={10} />
                  {collection.updatedAt}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add New Collection Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: filtered.length * 0.05 }}
          whileHover={{ scale: 1.02 }}
          className={`rounded-2xl h-72 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed transition-all duration-300 ${
            isDark
              ? 'border-white/[0.1] hover:border-[#FCA311]/40 hover:bg-[#5C4406]/5'
              : 'border-gray-200 hover:border-[#E8C87A] hover:bg-[#FDF6E3]/30'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${isDark ? 'bg-white/[0.05]' : 'bg-gray-100'}`}>
            <Plus size={20} className={isDark ? 'text-white/40' : 'text-gray-400'} />
          </div>
          <p className={`text-sm font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>New Collection</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Create a new album</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

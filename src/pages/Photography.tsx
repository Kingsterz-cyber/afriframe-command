import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Filter, Download, Share2, Trash2, Eye,
  Image as ImageIcon, Calendar as CalendarIcon, User,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useApp } from '@/context/AppContext';

interface PhotoShoot {
  id: string;
  title: string;
  date: string;
  client: string;
  imagesCount: number;
  location: string;
  status: 'completed' | 'in-progress' | 'planned';
  thumbUrl: string;
}

const mockPhotoShoots: PhotoShoot[] = [
  {
    id: '1',
    title: 'Nana Adjei Fashion Editorial',
    date: 'Jan 28, 2025',
    client: 'Nana Adjei',
    imagesCount: 247,
    location: 'Studio A',
    status: 'completed',
    thumbUrl: 'https://images.pexels.com/photos/3861949/pexels-photo-3861949.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    title: 'Kwame Asante Corporate Event',
    date: 'Jan 22, 2025',
    client: 'Kwame Asante',
    imagesCount: 156,
    location: 'Events Venue',
    status: 'completed',
    thumbUrl: 'https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    title: 'Graduation Portraits - Abena',
    date: 'Jan 15, 2025',
    client: 'Abena Frimpong',
    imagesCount: 89,
    location: 'Campus',
    status: 'completed',
    thumbUrl: 'https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '4',
    title: 'Portrait Session - Zara',
    date: 'Feb 5, 2025',
    client: 'Zara Mensah',
    imagesCount: 0,
    location: 'Studio B',
    status: 'planned',
    thumbUrl: 'https://images.pexels.com/photos/3531446/pexels-photo-3531446.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

const statusConfig = {
  completed: { color: 'emerald', label: 'Completed' },
  'in-progress': { color: 'blue', label: 'In Progress' },
  planned: { color: 'amber', label: 'Planned' },
};

export const Photography: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'planned'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = mockPhotoShoots.filter(shoot => {
    const matchSearch = shoot.title.toLowerCase().includes(search.toLowerCase()) ||
      shoot.client.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || shoot.status === filter;
    return matchSearch && matchFilter;
  });

  const inputBg = isDark
    ? 'bg-white/[0.05] border-white/[0.08] text-white/80 placeholder-white/30 focus:border-white/20'
    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-gray-300';

  const filterButtons = [
    { id: 'all', label: 'All Shoots' },
    { id: 'completed', label: 'Completed' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'planned', label: 'Planned' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
            style={{ fontFamily: 'Playfair Display, serif' }}>
            Photography
          </h1>
          <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            Manage all photo shoots and galleries
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0B0B0B] text-xs font-medium shadow-lg hover:bg-[#FCA311] transition-colors"
        >
          <Plus size={14} />
          New Shoot
        </motion.button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <input
            className={`w-full h-9 pl-8 pr-4 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
            placeholder="Search shoots or clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map(btn => (
            <motion.button
              key={btn.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(btn.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filter === btn.id
                  ? 'bg-[#D4AF37] text-[#0B0B0B] shadow-lg'
                  : isDark
                    ? 'bg-white/[0.05] text-white/50 hover:text-white border border-white/[0.06]'
                    : 'bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200'
              }`}
            >
              {btn.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Grid/List View Toggle */}
      <div className="flex justify-end gap-2">
        {[
          { mode: 'grid' as const, label: 'Grid' },
          { mode: 'list' as const, label: 'List' },
        ].map(({ mode, label }) => (
          <motion.button
            key={mode}
            whileHover={{ scale: 1.02 }}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === mode
                ? 'bg-[#D4AF37] text-[#0B0B0B]'
                : isDark
                  ? 'bg-white/[0.05] text-white/50 hover:text-white'
                  : 'bg-gray-100 text-gray-500 hover:text-gray-900'
            }`}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((shoot, idx) => {
              const statusInfo = statusConfig[shoot.status];
              return (
                <motion.div
                  key={shoot.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group"
                >
                  <GlassCard delay={0.1 + idx * 0.05} className="overflow-hidden h-full flex flex-col">
                    <div className="relative overflow-hidden bg-gray-900 aspect-video">
                      <img
                        src={shoot.thumbUrl}
                        alt={shoot.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                      <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-lg text-[11px] font-medium text-white flex items-center gap-1 bg-black/50 backdrop-blur-sm`}>
                        <ImageIcon size={11} />
                        {shoot.imagesCount}
                      </div>
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className={`font-semibold text-sm mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {shoot.title}
                      </h3>
                      <div className="space-y-1.5 flex-1 mb-3">
                        <div className="flex items-center gap-2 text-[11px]">
                          <User size={12} className={isDark ? 'text-white/40' : 'text-gray-400'} />
                          <span className={isDark ? 'text-white/70' : 'text-gray-600'}>{shoot.client}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <CalendarIcon size={12} className={isDark ? 'text-white/40' : 'text-gray-400'} />
                          <span className={isDark ? 'text-white/70' : 'text-gray-600'}>{shoot.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                        <span className={`text-[10px] px-2 py-1 rounded-lg font-medium bg-${statusInfo.color}-500/10 text-${statusInfo.color}-500`}>
                          {statusInfo.label}
                        </span>
                        <div className="flex gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-white/[0.1] text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}
                          >
                            <Eye size={13} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-white/[0.1] text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}
                          >
                            <Share2 size={13} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-red-500/20 text-red-500/50 hover:text-red-500' : 'hover:bg-red-100 text-red-400'}`}
                          >
                            <Trash2 size={13} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {filtered.map((shoot, idx) => {
              const statusInfo = statusConfig[shoot.status];
              return (
                <motion.div
                  key={shoot.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <GlassCard delay={0.1 + idx * 0.03} className="p-3 flex items-center gap-3">
                    <img
                      src={shoot.thumbUrl}
                      alt={shoot.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {shoot.title}
                      </h3>
                      <div className="flex gap-4 text-[11px] mt-1">
                        <span className={isDark ? 'text-white/50' : 'text-gray-500'}>{shoot.client}</span>
                        <span className={isDark ? 'text-white/50' : 'text-gray-500'}>{shoot.date}</span>
                        <span className={isDark ? 'text-white/50' : 'text-gray-500'}>{shoot.imagesCount} photos</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-medium flex-shrink-0 bg-${statusInfo.color}-500/10 text-${statusInfo.color}-500`}>
                      {statusInfo.label}
                    </span>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-white/[0.1] text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}
                      >
                        <Eye size={13} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-white/[0.1] text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}
                      >
                        <Download size={13} />
                      </motion.button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

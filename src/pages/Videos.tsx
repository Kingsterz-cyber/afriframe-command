import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Play, X, Eye, Download,
  Tag, User, Calendar as CalendarIcon, Clock, HardDrive,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';
import { mockVideos, VideoItem } from '@/data/mockData';

const CATEGORIES = ['All', 'Weddings', 'Fashion', 'Corporate', 'Graduation', 'Church', 'Portraits'];

export const Videos: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<VideoItem | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const filtered = mockVideos.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || item.category === category;
    return matchSearch && matchCat;
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
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <input
            className={`w-full h-9 pl-8 pr-4 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
            placeholder="Search videos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap flex-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                category === cat
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/25'
                  : isDark
                    ? 'bg-white/[0.05] text-white/50 hover:text-white border border-white/[0.06]'
                    : 'bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-medium shadow-lg shadow-red-900/25 hover:bg-red-500 transition-colors flex-shrink-0"
        >
          <Plus size={13} />
          Upload Video
        </motion.button>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-3 gap-3`}>
        {[
          { label: 'Total Videos', value: mockVideos.length },
          { label: 'Total Views', value: mockVideos.reduce((a, b) => a + b.views, 0).toLocaleString() },
          { label: 'Storage Used', value: '14.2 GB' },
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

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className={`group rounded-2xl overflow-hidden cursor-pointer ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white border border-gray-200/60 shadow-sm'}`}
              onClick={() => setSelected(video)}
              whileHover={{ y: -3 }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

                {/* Play Button */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <div
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300"
                    onClick={(e) => { e.stopPropagation(); setPlaying(playing === video.id ? null : video.id); }}
                  >
                    <Play size={18} className="text-white ml-0.5" fill="white" />
                  </div>
                </motion.div>

                {/* Duration */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm">
                  <span className="text-white text-[10px] font-medium">{video.duration}</span>
                </div>

                {/* Category */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white/80 text-[10px] font-medium">
                    {video.category}
                  </span>
                </div>

                {/* Visibility */}
                <div className="absolute top-2.5 right-2.5">
                  <StatusBadge status={video.visibility} size="sm" />
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h4 className={`text-sm font-semibold mb-1 line-clamp-1 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                  {video.title}
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={video.photographerAvatar}
                      alt={video.photographer}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <span className={`text-[11px] ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{video.photographer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 text-[10px] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                      <Eye size={10} />
                      {video.views.toLocaleString()}
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{video.size}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Video Detail Drawer */}
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
              className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col backdrop-blur-2xl ${
                isDark ? 'bg-[#0D0D0D]/98 border-l border-white/[0.08]' : 'bg-white/98 border-l border-gray-200'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative h-48 flex-shrink-0 overflow-hidden">
                <img src={selected.thumbnailUrl} alt={selected.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                    <Play size={22} className="text-white ml-1" fill="white" />
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-black/50 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <X size={15} />
                </button>
                <div className="absolute bottom-3 left-4">
                  <div className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm">
                    <span className="text-white text-xs font-medium">{selected.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 px-5 py-5 space-y-5 overflow-y-auto">
                <div>
                  <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                    {selected.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-400'}`}>{selected.category}</span>
                    <StatusBadge status={selected.visibility} size="sm" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Views', value: selected.views.toLocaleString(), icon: <Eye size={13} /> },
                    { label: 'File Size', value: selected.size, icon: <HardDrive size={13} /> },
                  ].map((stat, i) => (
                    <div key={i} className={`p-3 rounded-xl ${isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200/60'}`}>
                      <div className={`flex items-center gap-1.5 mb-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        {stat.icon}
                        <span className="text-[10px] uppercase tracking-wider">{stat.label}</span>
                      </div>
                      <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className={`rounded-2xl p-4 space-y-3 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200/60'}`}>
                  {[
                    { icon: <User size={12} />, label: 'Photographer', value: selected.photographer },
                    { icon: <CalendarIcon size={12} />, label: 'Upload Date', value: selected.uploadDate },
                    { icon: <Clock size={12} />, label: 'Duration', value: selected.duration },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className={isDark ? 'text-white/30' : 'text-gray-400'}>{row.icon}</span>
                      <span className={`text-[10px] flex-shrink-0 w-20 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{row.label}</span>
                      <span className={`text-xs font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div>
                  <div className={`flex items-center gap-1.5 mb-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    <Tag size={12} />
                    <span className="text-[10px] uppercase tracking-wider">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map(tag => (
                      <span key={tag} className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${isDark ? 'bg-white/[0.06] text-white/60 border border-white/[0.08]' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`px-5 py-4 border-t flex-shrink-0 ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-500 transition-colors">
                    <Play size={12} fill="white" /> Preview
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-colors ${isDark ? 'border-white/[0.08] text-white/60 hover:text-white' : 'border-gray-200 text-gray-600 hover:text-gray-900'}`}>
                    <Download size={12} /> Download
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

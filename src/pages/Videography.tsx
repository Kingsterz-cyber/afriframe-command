import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Play, Download, Trash2, Eye, MoreVertical,
  Video as VideoIcon, Calendar as CalendarIcon, User, Clock, Activity,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useApp } from '@/context/AppContext';

interface VideoProject {
  id: string;
  title: string;
  date: string;
  client: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'planned';
  thumbnail: string;
  views?: number;
}

const mockVideos: VideoProject[] = [
  {
    id: '1',
    title: 'Fashion Editorial - Behind the Scenes',
    date: 'Jan 28, 2025',
    client: 'Nana Adjei',
    duration: '3:45',
    status: 'completed',
    thumbnail: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400',
    views: 2480,
  },
  {
    id: '2',
    title: 'Corporate Event Highlights',
    date: 'Jan 22, 2025',
    client: 'Kwame Asante',
    duration: '5:20',
    status: 'completed',
    thumbnail: 'https://images.pexels.com/photos/3532557/pexels-photo-3532557.jpeg?auto=compress&cs=tinysrgb&w=400',
    views: 1856,
  },
  {
    id: '3',
    title: 'Graduation Ceremony 2025',
    date: 'Jan 15, 2025',
    client: 'Abena Frimpong',
    duration: '8:10',
    status: 'completed',
    thumbnail: 'https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg?auto=compress&cs=tinysrgb&w=400',
    views: 3120,
  },
  {
    id: '4',
    title: 'Wedding Teaser - Zara & John',
    date: 'Feb 10, 2025',
    client: 'Zara Mensah',
    duration: '0:00',
    status: 'in-progress',
    thumbnail: 'https://images.pexels.com/photos/3721656/pexels-photo-3721656.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

const statusConfig = {
  completed: { color: 'emerald', label: 'Completed' },
  'in-progress': { color: 'blue', label: 'In Progress' },
  planned: { color: 'amber', label: 'Planned' },
};

export const Videography: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'planned'>('all');

  const filtered = mockVideos.filter(video => {
    const matchSearch = video.title.toLowerCase().includes(search.toLowerCase()) ||
      video.client.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || video.status === filter;
    return matchSearch && matchFilter;
  });

  const inputBg = isDark
    ? 'bg-white/[0.05] border-white/[0.08] text-white/80 placeholder-white/30 focus:border-white/20'
    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-gray-300';

  const filterButtons = [
    { id: 'all', label: 'All Videos' },
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
            Videography
          </h1>
          <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            Manage all video projects and productions
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0B0B0B] text-xs font-medium shadow-lg hover:bg-[#FCA311] transition-colors"
        >
          <Plus size={14} />
          New Project
        </motion.button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <input
            className={`w-full h-9 pl-8 pr-4 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
            placeholder="Search videos or clients..."
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

      {/* Videos Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filtered.map((video, idx) => {
          const statusInfo = statusConfig[video.status];
          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group"
            >
              <GlassCard delay={0.1 + idx * 0.05} className="overflow-hidden h-full flex flex-col">
                {/* Video Thumbnail */}
                <div className="relative overflow-hidden bg-gray-900 aspect-video">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                        isDark ? 'bg-white/20 backdrop-blur-sm' : 'bg-black/40 backdrop-blur-sm'
                      }`}
                    >
                      <Play size={20} className="text-white fill-white ml-1" />
                    </motion.div>
                  </div>

                  {/* Duration Badge */}
                  <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-[10px] font-medium text-white flex items-center gap-1 ${
                    video.status === 'in-progress' ? 'bg-blue-500/80' : 'bg-black/60 backdrop-blur-sm'
                  }`}>
                    <Clock size={10} />
                    {video.duration}
                  </div>

                  {/* Status Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-medium bg-black/60 backdrop-blur-sm text-white`}>
                    {statusInfo.label}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-3 flex flex-col flex-1">
                  <h3 className={`font-semibold text-sm mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {video.title}
                  </h3>

                  <div className="space-y-1.5 flex-1 mb-3">
                    <div className="flex items-center gap-2 text-[11px]">
                      <User size={12} className={isDark ? 'text-white/40' : 'text-gray-400'} />
                      <span className={isDark ? 'text-white/70' : 'text-gray-600'}>{video.client}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <CalendarIcon size={12} className={isDark ? 'text-white/40' : 'text-gray-400'} />
                      <span className={isDark ? 'text-white/70' : 'text-gray-600'}>{video.date}</span>
                    </div>
                    {video.views && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <Activity size={12} className={isDark ? 'text-white/40' : 'text-gray-400'} />
                        <span className={isDark ? 'text-white/70' : 'text-gray-600'}>{video.views.toLocaleString()} views</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
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
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-white/[0.1] text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}
                      >
                        <MoreVertical size={13} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <GlassCard delay={0.2} className="py-12 text-center">
          <VideoIcon size={32} className={`mx-auto mb-3 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
          <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            No videos found
          </p>
        </GlassCard>
      )}
    </motion.div>
  );
};

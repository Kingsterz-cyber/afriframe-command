import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Grid3X3, LayoutGrid, X, Eye, Download,
  Edit2, Trash2, Copy, MoveRight, Tag, User, Calendar as CalendarIcon,
  Globe, Lock, FileImage, Camera, Loader2, Upload, AlertCircle,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['All', 'Weddings', 'Portraits', 'Fashion', 'Commercial', 'Events'];

export const Gallery: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'masonry' | 'grid'>('masonry');
  const [selected, setSelected] = useState<any | null>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');

  const resolveImageUrl = (row: any) => {
    const value = row.image_url ?? row.thumbnail_url ?? row.url ?? row.image_path ?? row.storage_path ?? '';
    if (!value || /^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
    const bucket = row.storage_bucket ?? row.bucket ?? 'photography';
    return supabase.storage.from(bucket).getPublicUrl(value.replace(/^\//, '')).data.publicUrl;
  };

  useEffect(() => {
    let active = true;
    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);
      let { data, error: queryError } = await supabase
        .from('photography_gallery')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false });

      if (queryError?.code === '42703') {
        const fallback = await supabase
          .from('photography_gallery')
          .select('*')
          .order('created_at', { ascending: false });
        data = fallback.data;
        queryError = fallback.error;
      }

      if (!active) return;
      if (queryError) {
        setError(queryError.message);
        setPortfolio([]);
      } else {
        setPortfolio(
          (data ?? []).map((row: any) => {
            const imageUrl = resolveImageUrl(row);
            return {
              id: row.id,
              title: row.title ?? row.name ?? 'Untitled',
              description: row.description ?? '',
              imageUrl,
              thumbnailUrl: resolveImageUrl({ ...row, image_url: row.thumbnail_url ?? row.image_url }),
              category: row.category ?? 'Gallery',
              tags: Array.isArray(row.tags) ? row.tags : typeof row.tags === 'string' ? row.tags.split(',').map((tag: string) => tag.trim()) : [],
              visibility: row.visibility ?? (row.is_published === false || row.published === false ? 'private' : 'public'),
              views: Number(row.views ?? row.view_count ?? 0),
              downloads: Number(row.downloads ?? row.download_count ?? 0),
              uploadDate: row.uploaded_at ?? row.created_at ?? '',
              width: Number(row.width ?? row.image_width ?? 1200),
              height: Number(row.height ?? row.image_height ?? 900),
            };
          }),
        );
      }
      setLoading(false);
    };

    fetchPortfolio();
    return () => { active = false; };
  }, []);

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadMessage(null);
    const safeName = uploadFile.name.replace(/[^a-z0-9._-]/gi, '-');
    const path = `gallery/${crypto.randomUUID()}-${safeName}`;
    const bucket = 'photography';
    const { error: storageError } = await supabase.storage.from(bucket).upload(path, uploadFile, { upsert: false, contentType: uploadFile.type });
    if (storageError) {
      setUploadMessage(storageError.message);
      setUploading(false);
      return;
    }
    const { data: inserted, error: insertError } = await supabase.from('photography_gallery').insert({
      title: uploadTitle.trim() || uploadFile.name.replace(/\.[^.]+$/, ''),
      image_path: path,
      image_url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl,
      storage_bucket: bucket,
      visibility: 'public',
      tags: [],
    }).select('*').single();
    if (insertError) {
      await supabase.storage.from(bucket).remove([path]);
      setUploadMessage(insertError.message);
    } else if (inserted) {
      const imageUrl = resolveImageUrl(inserted);
      setPortfolio(current => [{ ...inserted, id: inserted.id, title: inserted.title, imageUrl, thumbnailUrl: imageUrl, category: inserted.category ?? 'Gallery', tags: [], visibility: inserted.visibility ?? 'public', views: 0, downloads: 0, uploadDate: inserted.created_at ?? '', width: 1200, height: 900 }, ...current]);
      setUploadOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadMessage('Photo uploaded.');
    }
    setUploading(false);
  };

  const filtered = portfolio.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t: string) => t.includes(search.toLowerCase()));
    const matchCat = category === 'All' || item.category === category;
    return matchSearch && matchCat;
  });

  const inputBg = isDark
    ? 'bg-white/[0.05] border-white/[0.08] text-white/80 placeholder-white/30 focus:border-white/20'
    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-gray-300';

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#D4AF37]" />
        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Loading gallery…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-600'}`}>Unable to load photography gallery</p>
        <p className={`mt-2 text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{error}</p>
      </div>
    );
  }

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
            placeholder="Search gallery..."
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
                  ? 'bg-[#D4AF37] text-[#0B0B0B] shadow-lg shadow-[#5C4406]/25'
                  : isDark
                    ? 'bg-white/[0.05] text-white/50 hover:text-white border border-white/[0.06]'
                    : 'bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <div className={`flex rounded-xl border overflow-hidden ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
            {[
              { mode: 'masonry' as const, icon: <LayoutGrid size={13} /> },
              { mode: 'grid' as const, icon: <Grid3X3 size={13} /> },
            ].map(({ mode, icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-2 transition-colors ${
                  viewMode === mode
                    ? isDark ? 'bg-white/[0.1] text-white' : 'bg-gray-100 text-gray-900'
                    : isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setUploadOpen(true); setUploadMessage(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0B0B0B] text-xs font-medium shadow-lg shadow-[#5C4406]/25 hover:bg-[#FCA311] transition-colors"
          >
            <Plus size={13} />
            Upload
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {uploadOpen && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={`w-full max-w-md rounded-2xl p-5 ${isDark ? 'bg-[#151515] text-white' : 'bg-white text-gray-900'}`} initial={{ scale: 0.96 }} animate={{ scale: 1 }}>
              <div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">Upload photo</h2><button onClick={() => setUploadOpen(false)} aria-label="Close upload dialog"><X size={16} /></button></div>
              <input className={`mb-3 w-full rounded-xl border p-2 text-xs ${inputBg}`} placeholder="Photo title" value={uploadTitle} onChange={event => setUploadTitle(event.target.value)} />
              <input className="w-full text-xs" type="file" accept="image/*" onChange={event => setUploadFile(event.target.files?.[0] ?? null)} />
              {uploadMessage && <p className="mt-3 flex items-center gap-2 text-xs text-amber-500"><AlertCircle size={13} />{uploadMessage}</p>}
              <button disabled={!uploadFile || uploading} onClick={handleUpload} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-medium text-[#0B0B0B] disabled:opacity-50">{uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}{uploading ? 'Uploading…' : 'Upload photo'}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery */}
      {portfolio.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <EmptyState icon={Camera} title="Gallery is empty" description="No photography records were returned from photography_gallery." />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`rounded-2xl border border-dashed p-8 text-center text-sm ${isDark ? 'border-white/10 text-white/50' : 'border-gray-200 text-gray-500'}`}>
          No photos match the current search or category.
        </div>
      ) : viewMode === 'masonry' ? (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group relative"
                style={{ marginBottom: '12px' }}
                onClick={() => setSelected(item)}
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={item.imageUrl || item.thumbnailUrl}
                  alt={item.title}
                  onError={(event) => {
                    if (event.currentTarget.src !== item.thumbnailUrl && item.thumbnailUrl) event.currentTarget.src = item.thumbnailUrl;
                  }}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ aspectRatio: `${item.width}/${item.height}` }}
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Actions */}
                <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  {[
                    { icon: <Edit2 size={11} />, label: 'Edit' },
                    { icon: <Download size={11} />, label: 'Download' },
                    { icon: <Trash2 size={11} />, label: 'Delete' },
                  ].map((action, j) => (
                    <motion.button
                      key={j}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={e => e.stopPropagation()}
                      className="w-6 h-6 rounded-lg bg-black/60 backdrop-blur-sm text-white/80 hover:text-white flex items-center justify-center transition-colors"
                      title={action.label}
                    >
                      {action.icon}
                    </motion.button>
                  ))}
                </div>
                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <p className="text-white text-xs font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={item.visibility} size="sm" />
                    <span className="text-white/50 text-[10px]">{item.views.toLocaleString()} views</span>
                  </div>
                </div>
                {/* Category badge top-left */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/80 text-[10px] font-medium">
                    {item.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => setSelected(item)}
                whileHover={{ scale: 1.02 }}
              >
                <img src={item.imageUrl || item.thumbnailUrl} alt={item.title} onError={(event) => { if (event.currentTarget.src !== item.thumbnailUrl && item.thumbnailUrl) event.currentTarget.src = item.thumbnailUrl; }} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-[11px] font-medium truncate">{item.title}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Image Detail Drawer */}
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
              {/* Image Preview */}
              <div className="relative h-52 sm:h-64 flex-shrink-0 overflow-hidden">
                <img src={selected.imageUrl || selected.thumbnailUrl} alt={selected.title} onError={(event) => { if (event.currentTarget.src !== selected.thumbnailUrl && selected.thumbnailUrl) event.currentTarget.src = selected.thumbnailUrl; }} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <StatusBadge status={selected.visibility} size="md" />
                </div>
              </div>

              {/* Metadata */}
              <div className="flex-1 px-5 py-5 space-y-5">
                <div>
                  <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                    {selected.title}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-400'}`}>{selected.category}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Views', value: selected.views.toLocaleString(), icon: <Eye size={13} /> },
                    { label: 'Downloads', value: selected.downloads, icon: <Download size={13} /> },
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
                    { icon: <CalendarIcon size={12} />, label: 'Upload Date', value: selected.uploadDate },
                    { icon: <FileImage size={12} />, label: 'Dimensions', value: `${selected.width} × ${selected.height}` },
                    { icon: selected.visibility === 'public' ? <Globe size={12} /> : <Lock size={12} />, label: 'Visibility', value: selected.visibility },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className={isDark ? 'text-white/30' : 'text-gray-400'}>{row.icon}</span>
                      <span className={`text-[10px] flex-shrink-0 w-20 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{row.label}</span>
                      <span className={`text-xs font-medium capitalize ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{row.value}</span>
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
                    {selected.tags.map((tag: string) => (
                      <span key={tag} className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${isDark ? 'bg-white/[0.06] text-white/60 border border-white/[0.08]' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className={`px-5 py-4 border-t flex-shrink-0 ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B0B0B] text-xs font-medium hover:bg-[#FCA311] transition-colors">
                    <Edit2 size={12} /> Edit
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-colors ${isDark ? 'border-white/[0.08] text-white/60 hover:text-white' : 'border-gray-200 text-gray-600 hover:text-gray-900'}`}>
                    <Download size={12} /> Download
                  </motion.button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-colors ${isDark ? 'border-white/[0.08] text-white/60 hover:text-white' : 'border-gray-200 text-gray-600 hover:text-gray-900'}`}>
                    <Copy size={12} /> Copy Link
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-colors ${isDark ? 'border-white/[0.08] text-white/60 hover:text-white' : 'border-gray-200 text-gray-600 hover:text-gray-900'}`}>
                    <MoveRight size={12} /> Move
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

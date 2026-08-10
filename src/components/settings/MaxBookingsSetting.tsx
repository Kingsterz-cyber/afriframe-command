import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, Minus, Plus, Info, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { fetchStudioSettings, updateStudioSettings, DEFAULT_MAX_BOOKINGS_PER_DAY } from '@/lib/availability';
import { supabase } from '@/lib/supabase';

const MIN = 1;
const MAX = 12;
const PRESETS = [2, 3, 4, 6];

export const MaxBookingsSetting: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [value, setValue] = useState(DEFAULT_MAX_BOOKINGS_PER_DAY);
  const [autoWaitlist, setAutoWaitlist] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the live global default.
  useEffect(() => {
    let active = true;
    void fetchStudioSettings().then((s) => {
      if (!active) return;
      setValue(s.default_max_bookings_per_day);
      setAutoWaitlist(s.auto_waitlist);
      setLoaded(true);
    });

    const channel = supabase
      .channel('studio-settings-capacity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'studio_settings' }, (payload) => {
        const row = payload.new as Record<string, unknown> | null;
        if (!row) return;
        setValue(Number(row['default_max_bookings_per_day'] ?? DEFAULT_MAX_BOOKINGS_PER_DAY));
        setAutoWaitlist(Boolean(row['auto_waitlist']));
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Persist changes (debounced) so the global default updates every non-overridden date.
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState('saving');
    saveTimer.current = setTimeout(async () => {
      const { error } = await updateStudioSettings({
        default_max_bookings_per_day: value,
        auto_waitlist: autoWaitlist,
      });
      setSaveState(error ? 'error' : 'saved');
      if (!error) setTimeout(() => setSaveState('idle'), 2000);
    }, 500);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [value, autoWaitlist, loaded]);

  const clamp = (n: number) => Math.min(MAX, Math.max(MIN, n));
  const pct = ((value - MIN) / (MAX - MIN)) * 100;
  const heavy = value >= 8;

  const cardBg = isDark
    ? 'bg-white/[0.04] border border-white/[0.08]'
    : 'bg-white border border-gray-200/60 shadow-sm';
  const titleCls = isDark ? 'text-white/90' : 'text-gray-900';
  const subCls = isDark ? 'text-white/40' : 'text-gray-500';


  return (
    <div className={`p-6 rounded-3xl ${cardBg}`}>
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/12 border border-[#D4AF37]/25 flex items-center justify-center flex-shrink-0">
          <CalendarCheck size={16} className="text-[#E8C87A]" />
        </div>
        <div>
          <h4 className={`text-sm font-semibold ${titleCls}`} style={{ fontFamily: 'Playfair Display, serif' }}>
            Maximum Bookings Per Day
          </h4>
          <p className={`text-[11px] mt-0.5 ${subCls}`}>
            Protect the studio's calendar. New requests beyond this limit are blocked or waitlisted.
          </p>
        </div>
      </div>

      {/* Stepper + live value */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setValue((v) => clamp(v - 1))}
          disabled={value <= MIN}
          aria-label="Decrease maximum bookings"
          className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors disabled:opacity-30 ${
            isDark
              ? 'border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]'
              : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Minus size={15} />
        </motion.button>

        <div className="text-center min-w-[7rem]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={value}
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="text-5xl font-bold bg-gradient-to-b from-[#F2ECDD] via-[#E8C87A] to-[#D4AF37] bg-clip-text text-transparent"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {value}
            </motion.p>
          </AnimatePresence>
          <p className={`text-[10px] uppercase tracking-widest mt-1 ${subCls}`}>shoots / day</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setValue((v) => clamp(v + 1))}
          disabled={value >= MAX}
          aria-label="Increase maximum bookings"
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#E8C87A] to-[#D4AF37] text-[#0B0B0B] shadow-lg shadow-[#D4AF37]/25 disabled:opacity-30"
        >
          <Plus size={15} />
        </motion.button>
      </div>

      {/* Slider */}
      <div className="mb-5">
        <label htmlFor="max-bookings" className="sr-only">Maximum bookings per day</label>
        <div className="relative h-2 rounded-full mb-2 bg-white/[0.08]">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#D4AF37] to-[#FCA311]"
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            style={{ borderRadius: 9999 }}
          />
          <motion.span
            className="absolute top-1/2 w-4 h-4 -mt-2 -ml-2 rounded-full bg-[#F2ECDD] shadow-lg shadow-[#D4AF37]/40 pointer-events-none"
            animate={{ left: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          />
        <input
          id="max-bookings"
          type="range"
          min={MIN}
          max={MAX}
          step={1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={value}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className={`flex justify-between text-[10px] mt-1 ${subCls}`}>
          <span>{MIN} (boutique)</span>
          <span>{MAX} (max capacity)</span>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setValue(p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              value === p
                ? 'bg-[#D4AF37]/15 text-[#E8C87A] border-[#D4AF37]/30'
                : isDark
                  ? 'bg-white/[0.04] text-white/50 border-white/[0.06] hover:text-white'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:text-gray-900'
            }`}
          >
            {p} per day
          </button>
        ))}
      </div>

      {/* Waitlist toggle */}
      <div className={`flex items-center justify-between rounded-2xl p-4 mb-4 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200/60'}`}>
        <div className="pr-4">
          <p className={`text-xs font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Auto-waitlist overflow</p>
          <p className={`text-[11px] ${subCls}`}>Keep extra requests as pending instead of rejecting them.</p>
        </div>
        <label className="relative inline-flex cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={autoWaitlist}
            onChange={(e) => setAutoWaitlist(e.target.checked)}
            aria-label="Auto-waitlist overflow bookings"
            className="sr-only peer"
          />
          <div className={`w-10 h-5 rounded-full peer-checked:bg-[#D4AF37] peer-focus-visible:ring-2 peer-focus-visible:ring-[#D4AF37]/40 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
        </label>
      </div>

      {/* Contextual hint */}
      <div className={`flex items-start gap-2 rounded-2xl p-3 text-[11px] ${
        heavy
          ? 'bg-[#FCA311]/10 border border-[#FCA311]/25 text-[#E8C87A]'
          : isDark ? 'bg-white/[0.03] border border-white/[0.06] text-white/45' : 'bg-gray-50 border border-gray-200/60 text-gray-500'
      }`}>
        {heavy ? <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" /> : <Info size={13} className="mt-0.5 flex-shrink-0" />}
        <p>
          {heavy
            ? 'High load: more than 7 shoots a day may compromise editing turnaround and studio quality.'
            : `Clients will see up to ${value} available slot${value > 1 ? 's' : ''} per calendar day.`}
        </p>
      </div>
    </div>
  );
};

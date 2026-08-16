import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Lock, Unlock, Check, X, CalendarDays,
  Clock, User, Info, Minus, Plus, RotateCcw, Loader2, Mail, Phone,
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, startOfDay, getDay, addDays,
} from 'date-fns';
import { GlassCard } from '@/components/ui/GlassCard';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  DateOverride, DayAvailability, DayStatus, StudioSettings, FALLBACK_SETTINGS,
  bookingConsumesCapacity, clearDateOverride, fetchDateOverrides, fetchStudioSettings,
  resolveDayStatus, updateGlobalCapacity, upsertDateOverride,
} from '@/lib/availability';
import { useServerFn } from '@tanstack/react-start';
import { sendBookingConfirmation } from '@/lib/notifications.functions';


const iso = (d: Date) => format(d, 'yyyy-MM-dd');

interface CalendarBooking {
  id: string;
  date: string;
  time: string | null;
  status: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  service: string;
  message: string | null;
}

const STATUS_META: Record<DayStatus, { label: string; dot: string; chip: string; cell: string }> = {
  available: {
    label: 'Available',
    dot: 'bg-emerald-400',
    chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25',
    cell: 'border-emerald-400/20 hover:border-emerald-400/50',
  },
  fully_booked: {
    label: 'Fully Booked',
    dot: 'bg-amber-400',
    chip: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    cell: 'border-amber-400/25 hover:border-amber-400/60',
  },
  blocked: {
    label: 'Blocked',
    dot: 'bg-rose-500',
    chip: 'bg-rose-500/15 text-rose-300 border-rose-400/25',
    cell: 'border-rose-500/25 hover:border-rose-500/60',
  },
  past: {
    label: 'Past',
    dot: 'bg-white/15',
    chip: 'bg-white/[0.06] text-white/40 border-white/10',
    cell: 'border-white/[0.05]',
  },
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AvailabilityCalendar: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const { session } = useAuth();

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayISO = iso(today);

  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const [settings, setSettings] = useState<StudioSettings>(FALLBACK_SETTINGS);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [draftSlots, setDraftSlots] = useState<string[]>([]);
  const [newSlot, setNewSlot] = useState('');

  // ----- date range covered by the visible month (+ padding weeks) -----
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const rangeStart = addDays(monthStart, -getDay(monthStart));
  const rangeEnd = addDays(monthEnd, 6 - getDay(monthEnd));

  const loadAll = useCallback(async () => {
    setLoadingError(null);
    const from = iso(rangeStart);
    const to = iso(rangeEnd);

    const [settingsResult, overrideResult, bookingResult] = await Promise.all([
      fetchStudioSettings(),
      fetchDateOverrides(from, to),
      supabase
        .from('bookings')
        .select(
          'id, booking_date, booking_time, status, message, client:clients(full_name, email, phone), service:services(name)',
        )
        .gte('booking_date', from)
        .lte('booking_date', to),
    ]);

    setSettings(settingsResult);
    setOverrides(overrideResult);

    if (bookingResult.error) {
      setLoadingError(bookingResult.error.message);
    } else {
      const rows = (bookingResult.data ?? []) as any[];
      setBookings(
        rows.map((row) => ({
          id: String(row.id),
          date: String(row.booking_date ?? ''),
          time: row.booking_time ?? null,
          status: String(row.status ?? 'pending').toLowerCase(),
          clientName: row.client?.full_name ?? 'Unnamed client',
          clientEmail: row.client?.email ?? null,
          clientPhone: row.client?.phone ?? null,
          service: row.service?.name ?? 'Session',
          message: row.message ?? null,
        })),
      );
    }
    setLoading(false);
  }, [rangeStart.getTime(), rangeEnd.getTime()]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // ----- realtime: bookings, overrides and the global setting -----
  useEffect(() => {
    const channel = supabase
      .channel('availability-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => void loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'availability' }, () => void loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'studio_settings' }, () => void loadAll())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAll]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // ----- derived maps -----
  const overrideByDate = useMemo(() => {
    const map = new Map<string, DateOverride>();
    overrides.forEach((o) => map.set(o.date, o));
    return map;
  }, [overrides]);

  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => {
      if (!bookingConsumesCapacity(b.status)) return;
      map.set(b.date, (map.get(b.date) ?? 0) + 1);
    });
    return map;
  }, [bookings]);

  const days = useMemo(
    () => eachDayOfInterval({ start: rangeStart, end: rangeEnd }),
    [rangeStart.getTime(), rangeEnd.getTime()],
  );

  const availabilityFor = useCallback(
    (dateISO: string): DayAvailability =>
      resolveDayStatus(dateISO, settings, overrideByDate.get(dateISO), countByDate.get(dateISO) ?? 0, todayISO),
    [settings, overrideByDate, countByDate, todayISO],
  );

  const selectedISO = iso(selectedDate);
  const selectedInfo = availabilityFor(selectedISO);
  const selectedOverride = overrideByDate.get(selectedISO);
  const selectedBookings = bookings.filter((b) => b.date === selectedISO);
  const inheritedSlots = settings.default_time_slots?.filter(Boolean).map((slot) => slot.slice(0, 5)) ?? [];
  const selectedSlots = selectedOverride?.time_slots?.filter(Boolean).map((slot) => slot.slice(0, 5)) ?? inheritedSlots;
  const isPast = selectedISO < todayISO;

  useEffect(() => {
    setDraftSlots(selectedSlots);
  }, [selectedISO, selectedOverride?.id, selectedOverride?.time_slots, settings.default_time_slots]);

  // ----- monthly summary -----
  const monthSummary = useMemo(() => {
    const inMonth = days.filter((d) => d >= monthStart && d <= monthEnd).map((d) => availabilityFor(iso(d)));
    return {
      available: inMonth.filter((d) => d.status === 'available').length,
      full: inMonth.filter((d) => d.status === 'fully_booked').length,
      blocked: inMonth.filter((d) => d.status === 'blocked').length,
      overrides: inMonth.filter((d) => d.isOverride && d.status !== 'past').length,
    };
  }, [days, availabilityFor, monthStart.getTime(), monthEnd.getTime()]);

  // ----- actions -----
  const guard = () => {
    if (!session) {
      setNotice({ kind: 'err', text: 'Sign in to change availability.' });
      return false;
    }
    return true;
  };

  const saveGlobalCapacity = async (value: number) => {
    if (!guard()) return;
    const next = Math.max(0, Math.min(24, value));
    setSaving(true);
    const { error } = await updateGlobalCapacity(next);
    setSaving(false);
    if (error) {
      setNotice({ kind: 'err', text: error.message });
      return;
    }
    setSettings((s) => ({ ...s, default_max_bookings_per_day: next }));
    setNotice({ kind: 'ok', text: `Global capacity is now ${next} booking${next === 1 ? '' : 's'} per day.` });
  };

  const saveOverride = async (patch: Partial<Omit<DateOverride, 'date'>>) => {
    if (!guard()) return;
    setSaving(true);
    const base: Omit<DateOverride, 'id'> = {
      date: selectedISO,
      available: selectedOverride?.available ?? true,
      max_bookings: selectedOverride?.max_bookings ?? null,
      time_slots: selectedOverride?.time_slots ?? null,
      start_time: selectedOverride?.start_time ?? null,
      end_time: selectedOverride?.end_time ?? null,
      notes: selectedOverride?.notes ?? null,
      ...patch,
    };
    const { error } = await upsertDateOverride(base);
    if (error) {
      setSaving(false);
      setNotice({ kind: 'err', text: error.message });
      return;
    }

    const refreshed = await fetchDateOverrides(selectedISO, selectedISO);
    setSaving(false);
    if (refreshed.length === 0) {
      setNotice({ kind: 'err', text: 'The availability saved but could not be reloaded from Supabase.' });
      return;
    }
    setOverrides((prev) => [...prev.filter((o) => o.date !== selectedISO), ...refreshed]);
    setDraftSlots(refreshed[0].time_slots ?? []);
    setNotice({ kind: 'ok', text: `${format(selectedDate, 'MMM d')} override saved to Supabase.` });
  };

  const resetToGlobal = async () => {
    if (!guard()) return;
    setSaving(true);
    const { error } = await clearDateOverride(selectedISO);
    setSaving(false);
    if (error) {
      setNotice({ kind: 'err', text: error.message });
      return;
    }
    setOverrides((prev) => prev.filter((o) => o.date !== selectedISO));
    setNotice({ kind: 'ok', text: `${format(selectedDate, 'MMM d')} now follows the global default.` });
  };

  const sendConfirmation = useServerFn(sendBookingConfirmation);

  const setBookingStatus = async (id: string, status: 'confirmed' | 'cancelled') => {

    if (!guard()) return;
    const stamp = new Date().toISOString();
    const patch: Record<string, unknown> =
      status === 'confirmed'
        ? { status, confirmed_at: stamp, confirmed_by: session?.user?.id ?? null }
        : { status, cancelled_at: stamp, cancelled_by: session?.user?.id ?? null };

    const { error } = await supabase.from('bookings').update(patch).eq('id', id);
    if (error) {
      setNotice({ kind: 'err', text: error.message });
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    setNotice({ kind: 'ok', text: `Booking ${status}.` });

    if (status === 'confirmed') {
      try {
        const res = await sendConfirmation({ data: { bookingId: id } });
        setNotice(
          res.sent
            ? { kind: 'ok', text: 'Booking confirmed — confirmation email sent to the client.' }
            : { kind: 'err', text: `Booking confirmed, but the email was not sent (${res.reason}).` },
        );
      } catch (err) {
        setNotice({ kind: 'err', text: `Booking confirmed, but the email failed: ${String(err)}` });
      }
    }
  };


  const cardBg = isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]';
  const textMain = isDark ? 'text-white' : 'text-[#111]';
  const textSoft = isDark ? 'text-white/55' : 'text-black/55';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={`font-[Playfair_Display] text-3xl font-semibold ${textMain}`}>Availability</h1>
          <p className={`mt-1 text-sm ${textSoft}`}>
            Every upcoming date inherits the global capacity unless you override it.
          </p>
        </div>

        {/* Global default capacity */}
        <GlassCard className="px-5 py-4">
          <div className="flex items-center gap-4">
            <div>
              <p className={`text-[11px] uppercase tracking-[0.18em] ${textSoft}`}>Global capacity</p>
              <p className={`text-sm ${textMain}`}>Applies to all dates without an override</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Decrease global capacity"
                onClick={() => saveGlobalCapacity(settings.default_max_bookings_per_day - 1)}
                disabled={saving}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#D4AF37]/30 text-[#E8C87A] transition hover:bg-[#D4AF37]/10 disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className={`w-14 text-center font-[Playfair_Display] text-2xl ${textMain}`}>
                {settings.default_max_bookings_per_day}
              </span>
              <button
                type="button"
                aria-label="Increase global capacity"
                onClick={() => saveGlobalCapacity(settings.default_max_bookings_per_day + 1)}
                disabled={saving}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#D4AF37]/30 text-[#E8C87A] transition hover:bg-[#D4AF37]/10 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`rounded-2xl border px-4 py-3 text-sm ${
              notice.kind === 'ok'
                ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-400/25 bg-rose-500/10 text-rose-300'
            }`}
          >
            {notice.text}
          </motion.div>
        )}
      </AnimatePresence>

      {loadingError && (
        <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {loadingError}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Calendar */}
        <GlassCard className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-[#D4AF37]/40 hover:text-[#E8C87A]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <h2 className={`font-[Playfair_Display] text-xl ${textMain}`}>{format(currentMonth, 'MMMM yyyy')}</h2>
              <p className={`text-xs ${textSoft}`}>
                {monthSummary.available} available · {monthSummary.full} full · {monthSummary.blocked} blocked ·{' '}
                {monthSummary.overrides} custom
              </p>
            </div>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-[#D4AF37]/40 hover:text-[#E8C87A]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((d) => (
              <div key={d} className={`py-1 text-center text-[11px] uppercase tracking-[0.14em] ${textSoft}`}>
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="grid h-64 place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day) => {
                const key = iso(day);
                const info = availabilityFor(key);
                const meta = STATUS_META[info.status];
                const inMonth = day >= monthStart && day <= monthEnd;
                const isSelected = key === selectedISO;

                return (
                  <motion.button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    whileHover={{ scale: info.status === 'past' ? 1 : 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                    aria-label={`${format(day, 'MMMM d, yyyy')} — ${meta.label}, ${info.bookingCount} of ${info.capacity} bookings`}
                    aria-pressed={isSelected}
                    className={`relative flex min-h-[74px] flex-col items-center justify-center gap-1 rounded-[18px] border p-2 transition ${
                      meta.cell
                    } ${inMonth ? cardBg : 'bg-transparent opacity-40'} ${
                      isSelected ? 'border-sky-400/70 ring-2 ring-sky-400/40' : ''
                    }`}
                  >
                    <span className={`text-sm font-medium ${info.status === 'past' ? 'text-white/30' : textMain}`}>
                      {format(day, 'd')}
                    </span>
                    {info.status === 'blocked' ? (
                      <span className="text-[10px] font-medium uppercase tracking-wide text-rose-300">Blocked</span>
                    ) : info.status === 'past' ? (
                      <span className="text-[10px] text-white/25">—</span>
                    ) : (
                      <span className={`text-[10px] ${textSoft}`}>
                        {info.bookingCount}/{info.capacity}
                      </span>
                    )}
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {info.isOverride && info.status !== 'past' && (
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-white/[0.06] pt-4">
            {(['available', 'fully_booked', 'blocked'] as DayStatus[]).map((s) => (
              <span key={s} className={`flex items-center gap-2 text-xs ${textSoft}`}>
                <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
                {STATUS_META[s].label}
              </span>
            ))}
            <span className={`flex items-center gap-2 text-xs ${textSoft}`}>
              <span className="h-2 w-2 rounded-full bg-sky-400" /> Selected
            </span>
            <span className={`flex items-center gap-2 text-xs ${textSoft}`}>
              <span className="h-2 w-2 rounded-full bg-[#D4AF37]" /> Custom override
            </span>
          </div>
        </GlassCard>

        {/* Detail panel */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`text-[11px] uppercase tracking-[0.18em] ${textSoft}`}>Selected date</p>
              <h3 className={`font-[Playfair_Display] text-xl ${textMain}`}>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
            </div>
            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium ${
                STATUS_META[selectedInfo.status].chip
              }`}
            >
              {STATUS_META[selectedInfo.status].label}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
            <CalendarDays className="h-4 w-4 text-[#E8C87A]" />
            <div className="flex-1">
              <p className={`text-sm ${textMain}`}>
                {selectedInfo.bookingCount} / {selectedInfo.capacity} bookings
              </p>
              <p className={`text-xs ${textSoft}`}>
                {selectedInfo.isOverride ? 'Custom override for this date' : 'Inheriting the global default'}
              </p>
            </div>
          </div>

          {!isPast && (
            <div className="mt-5 space-y-4">
              {/* Per-date capacity */}
              <div>
                <label className={`text-[11px] uppercase tracking-[0.16em] ${textSoft}`}>Capacity for this date</label>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Decrease capacity for this date"
                    disabled={saving}
                    onClick={() => saveOverride({ max_bookings: Math.max(0, selectedInfo.capacity - 1), available: true })}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-[#D4AF37]/40 hover:text-[#E8C87A] disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className={`w-12 text-center text-lg ${textMain}`}>{selectedInfo.capacity}</span>
                  <button
                    type="button"
                    aria-label="Increase capacity for this date"
                    disabled={saving}
                    onClick={() => saveOverride({ max_bookings: selectedInfo.capacity + 1, available: true })}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-[#D4AF37]/40 hover:text-[#E8C87A] disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>

                  {selectedInfo.isOverride && (
                    <button
                      type="button"
                      onClick={resetToGlobal}
                      disabled={saving}
                      className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-[#D4AF37]/40 hover:text-[#E8C87A] disabled:opacity-40"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Use global
                    </button>
                  )}
                </div>
              </div>

              {/* Custom time slots */}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className={`text-[11px] uppercase tracking-[0.16em] ${textSoft}`}>Time slots</label>
                  <span className={`text-[11px] ${textSoft}`}>{selectedOverride?.time_slots ? 'Custom override' : 'Default slots'}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {draftSlots.map((slot, index) => (
                    <span key={`${slot}-${index}`} className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2 py-1 text-xs text-[#E8C87A]">
                      <input
                        type="time"
                        aria-label={`Edit time slot ${slot}`}
                        value={slot}
                        onChange={(event) => setDraftSlots((slots) => slots.map((value, i) => i === index ? event.target.value : value))}
                        className="bg-transparent text-xs text-[#E8C87A] outline-none"
                      />
                      <button type="button" aria-label={`Remove ${slot}`} onClick={() => setDraftSlots((slots) => slots.filter((_, i) => i !== index))} className="px-1 text-[#E8C87A]/70 hover:text-white">×</button>
                    </span>
                  ))}
                  {draftSlots.length === 0 && <span className={`text-xs ${textSoft}`}>No configured slots.</span>}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="time"
                    value={newSlot}
                    onChange={(event) => setNewSlot(event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white"
                  />
                  <button type="button" disabled={!newSlot || saving} onClick={() => { if (!draftSlots.includes(newSlot)) setDraftSlots((slots) => [...slots, newSlot].sort()); setNewSlot(''); }} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 hover:border-[#D4AF37]/40 hover:text-[#E8C87A] disabled:opacity-40">Add slot</button>
                  <button type="button" disabled={saving} onClick={() => void saveOverride({ time_slots: draftSlots, start_time: null, end_time: null })} className="rounded-xl bg-[#D4AF37] px-3 py-2 text-xs font-medium text-[#0B0B0B] hover:bg-[#FCA311] disabled:opacity-40">Save slots</button>
                </div>
              </div>

              {/* Block / unblock */}
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  selectedOverride?.available === false
                    ? saveOverride({ available: true })
                    : saveOverride({ available: false })
                }
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition disabled:opacity-40 ${
                  selectedOverride?.available === false
                    ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                    : 'border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                }`}
              >
                {selectedOverride?.available === false ? (
                  <>
                    <Unlock className="h-4 w-4" /> Unblock this date
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Block this date
                  </>
                )}
              </button>
            </div>
          )}

          {/* Bookings for the date */}
          <div className="mt-6">
            <p className={`mb-3 text-[11px] uppercase tracking-[0.16em] ${textSoft}`}>
              Bookings ({selectedBookings.length})
            </p>

            {selectedBookings.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/10 px-4 py-6">
                <Info className="h-4 w-4 text-white/30" />
                <p className={`text-sm ${textSoft}`}>No bookings on this date yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedBookings.map((b) => (
                  <div key={b.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`flex items-center gap-2 truncate text-sm font-medium ${textMain}`}>
                          <User className="h-3.5 w-3.5 text-[#E8C87A]" /> {b.clientName}
                        </p>
                        <p className={`mt-1 truncate text-xs ${textSoft}`}>{b.service}</p>
                        <p className={`mt-1 flex items-center gap-2 text-xs ${textSoft}`}>
                          <Clock className="h-3 w-3" /> {b.time ? b.time.slice(0, 5) : 'Time TBC'}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wide ${
                          b.status === 'confirmed'
                            ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
                            : b.status === 'cancelled'
                              ? 'border-rose-400/25 bg-rose-500/10 text-rose-300'
                              : 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#E8C87A]'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {b.clientEmail && (
                        <a
                          href={`mailto:${b.clientEmail}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-[#D4AF37]/40 hover:text-[#E8C87A]"
                        >
                          <Mail className="h-3 w-3" /> Email
                        </a>
                      )}
                      {b.clientPhone && (
                        <a
                          href={`tel:${b.clientPhone}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-[#D4AF37]/40 hover:text-[#E8C87A]"
                        >
                          <Phone className="h-3 w-3" /> Call
                        </a>
                      )}
                      {b.status !== 'confirmed' && b.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => setBookingStatus(b.id, 'confirmed')}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          <Check className="h-3 w-3" /> Confirm
                        </button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => setBookingStatus(b.id, 'cancelled')}
                          className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300 transition hover:bg-rose-500/20"
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;

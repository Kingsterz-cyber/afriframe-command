import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Lock, Unlock, Check, X, CalendarDays,
  Clock, User, Info, Minus, Plus,
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay,
  addMonths, subMonths, startOfDay, getDay,
} from 'date-fns';
import { GlassCard } from '@/components/ui/GlassCard';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type DayStatus =
  | 'available'
  | 'limited'
  | 'full'
  | 'blocked'
  | 'past'
  | 'past-booking';

interface CalendarBooking {
  id: string;
  date: string;
  clientName: string;
  service: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface BookingRow {
  id: string | number;
  booking_date?: string | null;
  service?: string | null;
  slot_time?: string | null;
  status?: string | null;
  name?: string | null;
}

interface AvailabilityRecord {
  id: string;
  date: string;
  available: boolean;
  max_bookings: number;
  time_slots: string[] | null;
  notes: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface AvailabilityFormState {
  available: boolean;
  max_bookings: number;
  notes: string;
  time_slots: string[];
}

const DEFAULT_TIME_SLOTS: TimeSlot[] = ['09:00', '11:00', '14:00', '16:00'];
const TIME_SLOT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const TIME_SLOT_INPUT_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)(?:\s*(AM|PM))?$/i;
const CUSTOM_TIME_REGEX = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

type TimeSlot = `${number}:${number}` & string;

const normalizeTimeSlot = (value: string): string | null => {
  const match = String(value).trim().match(TIME_SLOT_REGEX);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : null;
};

const normalizeTimeSlotInput = (value: string): string | null => {
  const raw = String(value).trim();
  if (!raw) return null;

  const textMatch = raw.match(CUSTOM_TIME_REGEX);
  if (textMatch) {
    const hour = Number(textMatch[1]);
    const minute = Number(textMatch[2]);
    const meridiem = textMatch[3].toLowerCase();

    if (minute > 59 || hour < 1 || hour > 12) return null;

    const normalizedHour = meridiem === 'pm' ? (hour % 12) + 12 : hour % 12;
    return `${String(normalizedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  const match = raw.match(TIME_SLOT_INPUT_REGEX);
  if (match) {
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (minute > 59 || hour < 0 || hour > 23) return null;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  return null;
};

const formatSlotLabel = (slot: string) => {
  const [hour, minute] = slot.split(':').map(Number);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour % 12 || 12;
  return `${String(normalizedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${suffix}`;
};

const compareSlotStrings = (a: string, b: string) => a.localeCompare(b);

const getDayStatus = (available: boolean, maxBookings: number, bookingsCount: number, isPast: boolean): DayStatus => {
  if (isPast) return bookingsCount > 0 ? 'past-booking' : 'past';
  if (!available) return 'blocked';
  if (maxBookings <= 0 || bookingsCount >= maxBookings) return 'full';
  if (maxBookings - bookingsCount <= 2) return 'limited';
  return 'available';
};

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

const STATUS_META: Record<DayStatus, { label: string; dot: string; chip: string }> = {
  available: { label: 'Available', dot: 'bg-emerald-400', chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25' },
  limited: { label: 'Limited', dot: 'bg-[#E8C87A]', chip: 'bg-[#D4AF37]/15 text-[#E8C87A] border-[#D4AF37]/30' },
  full: { label: 'Fully Booked', dot: 'bg-rose-400', chip: 'bg-rose-500/15 text-rose-300 border-rose-400/25' },
  blocked: { label: 'Blocked', dot: 'bg-white/35', chip: 'bg-white/10 text-white/60 border-white/15' },
  past: { label: 'Past Date', dot: 'bg-white/15', chip: 'bg-white/[0.06] text-white/40 border-white/10' },
  'past-booking': { label: 'Has Booking', dot: 'bg-sky-400', chip: 'bg-sky-500/15 text-sky-300 border-sky-400/25' },
};

export const AvailabilityCalendar: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const { session } = useAuth();

  const today = useMemo(() => startOfDay(new Date()), []);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [availabilityRecords, setAvailabilityRecords] = useState<AvailabilityRecord[]>([]);
  const [maxBookings, setMaxBookings] = useState<number>(3);
  const [availabilityForm, setAvailabilityForm] = useState<AvailabilityFormState>({
    available: true,
    max_bookings: 3,
    notes: '',
    time_slots: [...DEFAULT_TIME_SLOTS],
  });
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const selectedAvailability = useMemo(
    () => availabilityRecords.find((record) => record.date === iso(selectedDate)) ?? null,
    [availabilityRecords, selectedDate]
  );

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase.from('bookings').select('id, booking_date, service, slot_time, status, name');
      if (error) {
        console.error('Unable to load bookings', error);
      } else if (data) {
        const bookingRows = data as BookingRow[];
        setBookings(
          bookingRows.map((row) => ({
            id: String(row.id),
            date: String(row.booking_date ?? ''),
            clientName: String(row.name ?? 'Guest'),
            service: String(row.service ?? 'Service'),
            time: String(row.slot_time ?? ''),
            status: (String(row.status ?? 'pending').toLowerCase() as CalendarBooking['status']),
          }))
        );
      }
      setLoadingBookings(false);
    };

    fetchBookings();
  }, []);

  const setBookingStatus = (id: string, status: CalendarBooking['status']) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoadingAvailabilities(true);
      setLoadingError(null);

      const { data, error } = await supabase
        .from('availability')
        .select('id, date, available, max_bookings, time_slots, notes, created_at, updated_at');

      if (error) {
        console.error('Availability fetch failed', error);
        setLoadingError('Unable to load availability from Supabase. Check the database access and RLS settings.');
      } else if (data) {
        const normalizedRecords: AvailabilityRecord[] = data.map((row) => ({
          id: String(row.id),
          date: String(row.date),
          available: Boolean(row.available),
          max_bookings: Number(row.max_bookings ?? 3),
          time_slots: Array.isArray(row.time_slots) ? row.time_slots.map((slot) => String(slot)) : [...DEFAULT_TIME_SLOTS],
          notes: row.notes ? String(row.notes) : '',
          created_at: row.created_at ? String(row.created_at) : null,
          updated_at: row.updated_at ? String(row.updated_at) : null,
        }));

        setAvailabilityRecords(normalizedRecords);
      }

      setLoadingAvailabilities(false);
    };

    fetchAvailability();
  }, []);

  useEffect(() => {
    const record = selectedAvailability;
    if (record) {
      const nextTimeSlots = Array.isArray(record.time_slots) && record.time_slots.length > 0
        ? record.time_slots.map(String)
        : [...DEFAULT_TIME_SLOTS];

      setAvailabilityForm({
        available: Boolean(record.available),
        max_bookings: Number(record.max_bookings ?? 0),
        notes: record.notes ?? '',
        time_slots: nextTimeSlots,
      });
    } else {
      setAvailabilityForm({
        available: true,
        max_bookings: 3,
        notes: '',
        time_slots: [...DEFAULT_TIME_SLOTS],
      });
    }
  }, [selectedAvailability]);

  const activeBookingsFor = (date: Date) =>
    bookings.filter((b) => b.date === iso(date) && b.status !== 'cancelled');

  const bookingsFor = (date: Date) => bookings.filter((b) => b.date === iso(date));

  const getStatus = (date: Date): DayStatus => {
    const isPast = startOfDay(date) < today;
    const selectedRecord = availabilityRecords.find((record) => record.date === iso(date));
    const count = activeBookingsFor(date).length;

    if (isPast) return count > 0 ? 'past-booking' : 'past';
    if (selectedRecord && selectedRecord.available === false) return 'blocked';
    const capacity = selectedRecord?.max_bookings ?? maxBookings;
    if (selectedRecord && selectedRecord.available === false) return 'blocked';
    if (capacity <= 0 || count >= capacity) return 'full';
    if (capacity - count <= 2) return 'limited';
    return 'available';
  };

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    return eachDayOfInterval({ start, end: endOfMonth(currentMonth) });
  }, [currentMonth]);

  const leadingBlanks = getDay(startOfMonth(currentMonth));

  const selectedStatus = getStatus(selectedDate);
  const selectedIsPast = startOfDay(selectedDate) < today;
  const selectedBookings = bookingsFor(selectedDate);
  const selectedActive = selectedBookings.filter((b) => b.status !== 'cancelled');

  const selectedRecordCapacity = selectedAvailability?.max_bookings ?? availabilityForm.max_bookings;
  const selectedBlocked = Boolean(selectedAvailability && selectedAvailability.available === false);

  const toggleAvailability = () => {
    const dateKey = iso(selectedDate);
    const existingRecord = availabilityRecords.find((record) => record.date === dateKey);
    if (existingRecord) {
      const updated = { ...existingRecord, available: !existingRecord.available };
      setAvailabilityRecords((prev) => prev.map((record) => record.date === dateKey ? updated : record));
    }
  };

  const saveAvailability = async () => {
    if (!session) {
      setSaveError('Authenticate as an admin before saving availability.');
      return;
    }

    const dateKey = iso(selectedDate);
    const normalizedTimeSlots = Array.from(new Set(availabilityForm.time_slots.map((slot) => normalizeTimeSlot(slot) ?? slot))).filter(Boolean) as string[];

    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    const payload = {
      date: dateKey,
      available: availabilityForm.available,
      max_bookings: Number(availabilityForm.max_bookings),
      time_slots: normalizedTimeSlots.length > 0 ? normalizedTimeSlots : [...DEFAULT_TIME_SLOTS],
      notes: availabilityForm.notes ?? '',
    };

    try {
      const { data, error } = await supabase
        .from('availability')
        .upsert(payload, { onConflict: 'date' })
        .select()
        .single();

      if (error) {
        console.error('Supabase availability error:', error);
        throw new Error(error.message);
      }

      if (data) {
        const mergedRecord: AvailabilityRecord = {
          id: String(data.id),
          date: String(data.date),
          available: Boolean(data.available),
          max_bookings: Number(data.max_bookings ?? 3),
          time_slots: Array.isArray(data.time_slots) ? data.time_slots.map((slot) => String(slot)) : [...DEFAULT_TIME_SLOTS],
          notes: data.notes ? String(data.notes) : '',
          created_at: data.created_at ? String(data.created_at) : null,
          updated_at: data.updated_at ? String(data.updated_at) : null,
        };

        setAvailabilityRecords((prev) => {
          const next = [...prev];
          const index = next.findIndex((record) => record.date === dateKey);
          if (index >= 0) {
            next[index] = mergedRecord;
          } else {
            next.push(mergedRecord);
          }
          return next;
        });
      }

      setSaveMessage('Availability saved to Supabase.');
    } catch (error) {
      console.error('Supabase availability save failed:', error);
      setSaveError(error instanceof Error ? error.message : 'Unable to save availability.');
    } finally {
      setSaving(false);
    }
  };

  const monthStats = useMemo(() => {
    let open = 0, full = 0, blocked = 0;
    monthDays.forEach((d) => {
      const s = getStatus(d);
      if (s === 'available' || s === 'limited') open += 1;
      if (s === 'full') full += 1;
      if (s === 'blocked') blocked += 1;
    });
    return { open, full, blocked };
  }, [monthDays, bookings, availabilityRecords, selectedAvailability]);

  const panelText = isDark ? 'text-white' : 'text-gray-900';
  const subText = isDark ? 'text-white/50' : 'text-gray-500';
  const divider = isDark ? 'border-white/[0.06]' : 'border-gray-200/60';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold mb-1 ${panelText}`} style={{ fontFamily: 'Playfair Display, serif' }}>
            Availability Calendar
          </h1>
          <p className={`text-sm ${subText}`}>Control which dates the website can accept bookings on</p>
        </div>

        <div className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${
          isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-white border-gray-200'
        }`}>
          <div className="leading-tight">
            <p className={`text-[10px] uppercase tracking-wider ${subText}`}>Max bookings / day</p>
            <p className={`text-sm font-semibold ${panelText}`}>{availabilityForm.max_bookings} slots</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              aria-label="Decrease maximum bookings per day"
              onClick={() => setAvailabilityForm((current) => ({ ...current, max_bookings: Math.max(1, current.max_bookings - 1) }))}
              className={`w-7 h-7 rounded-lg grid place-items-center transition-colors ${
                isDark ? 'bg-white/[0.06] text-white/70 hover:bg-white/[0.12]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Minus size={13} />
            </button>
            <button
              aria-label="Increase maximum bookings per day"
              onClick={() => setAvailabilityForm((current) => ({ ...current, max_bookings: Math.min(12, current.max_bookings + 1) }))}
              className="w-7 h-7 rounded-lg grid place-items-center bg-[#D4AF37] text-[#0B0B0B] hover:bg-[#FCA311] transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2">
          <GlassCard delay={0.1} className="overflow-hidden">
            <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Previous month"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className={`w-8 h-8 rounded-lg grid place-items-center transition-colors ${
                    isDark ? 'text-white/60 hover:bg-white/[0.08]' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>
                <h2 className={`text-sm font-bold min-w-[9rem] text-center ${panelText}`}
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <button
                  aria-label="Next month"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className={`w-8 h-8 rounded-lg grid place-items-center transition-colors ${
                    isDark ? 'text-white/60 hover:bg-white/[0.08]' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <button
                onClick={() => { setCurrentMonth(startOfMonth(today)); setSelectedDate(today); }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#D4AF37]/15 text-[#E8C87A] border border-[#D4AF37]/25 hover:bg-[#D4AF37]/25 transition-colors"
              >
                Today
              </button>
            </div>

            <div className={`grid grid-cols-7 px-3 pt-3 pb-1`}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className={`text-center text-[10px] uppercase tracking-wider ${subText}`}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 p-3">
              {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`b${i}`} />)}
              {monthDays.map((day) => {
                const record = availabilityRecords.find((item) => item.date === iso(day));
                const status = getStatus(day);
                const meta = STATUS_META[status];
                const count = activeBookingsFor(day).length;
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, today);
                const disabled = status === 'past';

                return (
                  <button
                    key={iso(day)}
                    disabled={disabled}
                    onClick={() => setSelectedDate(day)}
                    aria-label={`${format(day, 'EEEE, MMMM d, yyyy')} — ${meta.label}`}
                    className={`relative aspect-square rounded-xl border text-left p-1.5 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 ${
                      disabled ? 'cursor-not-allowed opacity-35' : 'hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.35)]'
                    } ${
                      isSelected
                        ? 'border-[#D4AF37]/70 bg-[#D4AF37]/15'
                        : isDark
                          ? 'border-white/[0.06] bg-white/[0.03] hover:border-white/15'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${status === 'blocked' ? 'opacity-60' : ''}`}
                  >
                    <span className={`text-[11px] font-semibold ${
                      isToday ? 'text-[#E8C87A]' : isDark ? 'text-white/80' : 'text-gray-800'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    {status === 'blocked' && (
                      <Lock size={10} className="absolute bottom-1.5 right-1.5 text-white/40" />
                    )}
                    {status !== 'blocked' && count > 0 && (
                      <span className={`absolute bottom-1 left-1.5 text-[9px] font-medium ${
                        status === 'past-booking' ? 'text-sky-300' : isDark ? 'text-white/45' : 'text-gray-500'
                      }`}>
                        {status === 'past-booking' ? `${count} booked` : `${count}/${record?.max_bookings ?? maxBookings}`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className={`flex flex-wrap gap-x-4 gap-y-2 px-4 py-3 border-t ${divider}`}>
              {(Object.keys(STATUS_META) as DayStatus[]).map((k) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[k].dot}`} />
                  <span className={`text-[10px] ${subText}`}>{STATUS_META[k].label}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Open days', value: monthStats.open },
              { label: 'Fully booked', value: monthStats.full },
              { label: 'Blocked', value: monthStats.blocked },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl border px-4 py-3 ${
                isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-200'
              }`}>
                <p className={`text-lg font-bold ${panelText}`}>{s.value}</p>
                <p className={`text-[11px] ${subText}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <GlassCard delay={0.15} className="p-5 space-y-4">
          <div>
            <p className={`text-[10px] uppercase tracking-wider ${subText}`}>Selected date</p>
            <h3 className={`text-base font-bold ${panelText}`} style={{ fontFamily: 'Playfair Display, serif' }}>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${STATUS_META[selectedStatus].chip}`}
            >
              {selectedStatus === 'limited'
                ? `Limited (${Math.max(0, selectedRecordCapacity - selectedActive.length)} left)`
                : STATUS_META[selectedStatus].label}
            </span>
            {!selectedIsPast && (
              <span className={`text-[11px] ${subText}`}> 
                {selectedActive.length} / {selectedAvailability?.max_bookings ?? selectedRecordCapacity ?? '—'} booked
              </span>
            )}
          </div>

          {selectedIsPast && (
            <div className={`flex gap-2 items-start rounded-xl px-3 py-2 border ${
              isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-gray-50 border-gray-200'
            }`}> 
              <Info size={13} className="mt-0.5 text-sky-300 flex-shrink-0" />
              <p className={`text-[11px] leading-relaxed ${subText}`}>This date has passed. Bookings are for reference only.</p>
            </div>
          )}

          {loadingAvailabilities && (
            <div className={`rounded-xl border px-3 py-3 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white'}`}> 
              <span className={`text-[11px] ${subText}`}>Loading availability...</span>
            </div>
          )}

          {loadingError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-3 text-[11px] text-rose-200">
              {loadingError}
            </div>
          )}

          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${subText}`}>Bookings ({selectedBookings.length})</p>
            <AnimatePresence initial={false}>
              {selectedBookings.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={`text-[11px] py-4 text-center ${subText}`}
                >
                  No bookings on this date.
                </motion.p>
              )}
              {selectedBookings.map((b) => (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`rounded-xl border p-3 space-y-2 ${
                    isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-200'
                  } ${b.status === 'cancelled' ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${panelText}`}> 
                        <User size={11} className="inline mr-1 -mt-0.5 opacity-50" />
                        {b.clientName}
                      </p>
                      <p className={`text-[11px] truncate ${subText}`}>{b.service}</p>
                      <p className={`text-[10px] mt-0.5 ${subText}`}> 
                        <Clock size={10} className="inline mr-1 -mt-0.5" />{b.time}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-medium border flex-shrink-0 ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25'
                        : b.status === 'pending'
                          ? 'bg-[#D4AF37]/15 text-[#E8C87A] border-[#D4AF37]/30'
                          : 'bg-white/10 text-white/50 border-white/15'
                    }`}> 
                      {b.status}
                    </span>
                  </div>

                  {!selectedIsPast && b.status !== 'cancelled' && (
                    <div className="flex gap-2">
                      {b.status === 'pending' && (
                        <button
                          onClick={() => setBookingStatus(b.id, 'confirmed')}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium bg-[#D4AF37] text-[#0B0B0B] hover:bg-[#FCA311] transition-colors"
                        >
                          <Check size={11} /> Confirm
                        </button>
                      )}
                      <button
                        onClick={() => setBookingStatus(b.id, 'cancelled')}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                          isDark ? 'bg-white/[0.06] text-white/60 hover:bg-white/[0.12]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <X size={11} /> Cancel
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className={`rounded-2xl border p-4 space-y-4 ${isDark ? 'border-white/[0.08] bg-white/[0.02]' : 'border-gray-200 bg-white'}`}> 
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] uppercase tracking-wider ${subText}`}>Studio availability</p>
                <h4 className={`font-semibold ${panelText}`}>Day settings</h4>
              </div>
              <span className={`rounded-full px-2 py-1 text-[9px] ${availabilityForm.available ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-white/60'}`}> 
                {availabilityForm.available ? 'Open' : 'Blocked'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[11px] font-medium">
                <input
                  type="checkbox"
                  checked={availabilityForm.available}
                  onChange={(event) => setAvailabilityForm((current) => ({ ...current, available: event.target.checked }))}
                  className="h-4 w-4 accent-[#D4AF37]"
                />
                Available
              </label>
              <button
                className="text-[10px] underline decoration-dashed opacity-80 disabled:opacity-60"
                disabled={saving}
                onClick={() => {
                  setAvailabilityForm((current) => ({ ...current, available: false }));
                  setSaveMessage(null);
                  setSaveError(null);
                }}
              >
                Block date
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <label className="space-y-1">
                <span className={`text-[10px] uppercase tracking-wider ${subText}`}>Daily capacity</span>
                <input
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${isDark ? 'bg-black/20 border-white/[0.08] text-white focus:border-[#D4AF37]' : 'bg-white border-gray-200 text-gray-900 focus:border-[#D4AF37]'}`}
                  type="number"
                  min={0}
                  value={availabilityForm.max_bookings}
                  onChange={(event) => setAvailabilityForm((current) => ({ ...current, max_bookings: Number(event.target.value) }))}
                />
              </label>

              <label className="space-y-1">
                <span className={`text-[10px] uppercase tracking-wider ${subText}`}>Notes</span>
                <textarea
                  value={availabilityForm.notes}
                  onChange={(event) => setAvailabilityForm((current) => ({ ...current, notes: event.target.value }))}
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${isDark ? 'bg-black/20 border-white/[0.08] text-white focus:border-[#D4AF37]' : 'bg-white border-gray-200 text-gray-900 focus:border-[#D4AF37]'}`}
                  rows={3}
                  placeholder="Studio notes for this date"
                />
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase tracking-wider ${subText}`}>Configured time slots</span>
                  <button
                    className="text-[10px] px-2 py-1 rounded-lg border border-[#D4AF37]/30 text-[#E8C87A] hover:bg-[#D4AF37]/15"
                    onClick={() => {
                      setAvailabilityForm((current) => ({ ...current, time_slots: [...DEFAULT_TIME_SLOTS] }));
                      setSaveMessage(null);
                    }}
                  >
                    Reset to default
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availabilityForm.time_slots.map((slot) => (
                    <span key={slot} className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/40 px-2 py-1 text-[10px] bg-[#D4AF37]/10 text-[#E8C87A]">
                      {formatSlotLabel(slot)}
                      <button
                        type="button"
                        aria-label={`Remove ${slot}`}
                        className="opacity-80 hover:opacity-100"
                        onClick={() => setAvailabilityForm((current) => ({
                          ...current,
                          time_slots: current.time_slots.filter((candidate) => candidate !== slot),
                        }))}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTimeSlot}
                    onChange={(event) => setNewTimeSlot(event.target.value)}
                    placeholder="e.g. 06:30 PM"
                    className={`flex-1 rounded-xl border px-3 py-2 text-xs outline-none ${isDark ? 'bg-black/20 border-white/[0.08] text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                  <button
                    className="rounded-xl bg-[#D4AF37] px-3 py-2 text-[11px] font-semibold text-[#0B0B0B] hover:bg-[#FCA311]"
                    onClick={() => {
                      const normalized = normalizeTimeSlotInput(newTimeSlot);
                      if (!normalized) {
                        setSaveError('Enter a valid time such as 06:30 PM or 18:30.');
                        return;
                      }
                      if (availabilityForm.time_slots.includes(normalized)) {
                        setSaveError('That time slot is already configured.');
                        return;
                      }
                      setAvailabilityForm((current) => ({
                        ...current,
                        time_slots: [...current.time_slots, normalized].sort(compareSlotStrings),
                      }));
                      setNewTimeSlot('');
                      setSaveError(null);
                    }}
                  >
                    Add custom time
                  </button>
                </div>
              </div>
            </div>

            {(saveError || saveMessage) && (
              <div className={`rounded-xl border px-3 py-3 text-[11px] ${saveError ? 'border-rose-500/20 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}> 
                {saveError ?? saveMessage}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                className="flex-1 rounded-xl bg-[#D4AF37] px-4 py-2 text-[11px] font-bold text-[#0B0B0B] hover:bg-[#FCA311] disabled:opacity-60"
                disabled={saving || loadingAvailabilities}
                onClick={saveAvailability}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {!selectedIsPast && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!availabilityForm.available) {
                  setAvailabilityForm((current) => ({ ...current, available: true }));
                } else {
                  setAvailabilityForm((current) => ({ ...current, available: false }));
                }
                setSaveMessage(null);
                setSaveError(null);
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                availabilityForm.available
                  ? 'bg-[#D4AF37] text-[#0B0B0B] hover:bg-[#FCA311]'
                  : isDark
                    ? 'bg-white/[0.06] text-white/80 hover:bg-white/[0.12] border border-white/[0.08]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {availabilityForm.available ? <><Unlock size={13} /> Unblock Date</> : <><Lock size={13} /> Block Date</>}
            </motion.button>
          )}

          <div className={`flex items-center gap-2 pt-1 ${subText}`}> 
            <CalendarDays size={12} />
            <span className="text-[10px]">Availability is read from the studio calendar database.</span>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

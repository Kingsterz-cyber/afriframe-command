import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Check,
  XCircle,
  Download,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { handleBookingStatusChange } from '@/lib/notifications.functions';

const FILTERS = [
  'All',
  'Confirmed',
  'Pending',
  'Upcoming',
  'Completed',
  'Cancelled',
];

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  instagram_handle?: string | null;
  company?: string | null;
  notes?: string | null;
}

interface Service {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  short_description?: string | null;
  cover_image_url?: string | null;
  duration_minutes?: number | null;
  price?: number | string | null;
  booking_enabled?: boolean;
  active?: boolean;
}

interface BookingRow {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
  service_id: string;
  client_id: string;
  booking_date: string;
  booking_time: string;
  message?: string | null;
  status?: string | null;
  admin_notes?: string | null;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  completed_at?: string | null;
  total_amount?: number | string | null;
  payment_status?: string | null;
  payment_id?: string | null;
}

interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAvatar: string;

  serviceId: string;
  service: string;
  package: string;
  duration: string;

  date: string;
  time: string;

  amount: number;
  status: string;

  location: string;
  notes: string;
  adminNotes: string;

  paymentStatus: string;

  createdAt: string;
}

function getAvatar(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'Client'
  )}&background=D4AF37&color=0B0B0B&bold=true`;
}

function normalizeStatus(status?: string | null) {
  return String(status || 'pending').toLowerCase();
}

function formatDate(date?: string | null) {
  if (!date) return '—';

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(time?: string | null) {
  if (!time) return '—';

  const [hoursString, minutesString] = time.split(':');

  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (Number.isNaN(hours)) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes || 0, 0, 0);

  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const Bookings: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load bookings.
   *
   * IMPORTANT:
   * We do NOT ask Supabase for:
   *
   * bookings.name
   * bookings.email
   * bookings.phone
   *
   * because those columns do not exist.
   *
   * Instead:
   * 1. Get bookings
   * 2. Get clients using client_id
   * 3. Get services using service_id
   * 4. Combine everything in React
   */
  const fetchBookings = useCallback(async () => {
    try {
      setError(null);

      const { data: bookingRows, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });

      if (bookingError) {
        throw bookingError;
      }

      const rows = (bookingRows || []) as BookingRow[];

      if (rows.length === 0) {
        setBookings([]);
        return;
      }

      const clientIds = [
        ...new Set(rows.map((row) => row.client_id).filter(Boolean)),
      ];

      const serviceIds = [
        ...new Set(rows.map((row) => row.service_id).filter(Boolean)),
      ];

      const [
        { data: clientRows, error: clientsError },
        { data: serviceRows, error: servicesError },
      ] = await Promise.all([
        clientIds.length
          ? supabase
              .from('clients')
              .select('*')
              .in('id', clientIds)
          : Promise.resolve({ data: [], error: null }),

        serviceIds.length
          ? supabase
              .from('services')
              .select('*')
              .in('id', serviceIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (clientsError) {
        throw clientsError;
      }

      if (servicesError) {
        throw servicesError;
      }

      const clientsMap = new Map<string, Client>();

      (clientRows || []).forEach((client: Client) => {
        clientsMap.set(client.id, client);
      });

      const servicesMap = new Map<string, Service>();

      (serviceRows || []).forEach((service: Service) => {
        servicesMap.set(service.id, service);
      });

      const mappedBookings: Booking[] = rows.map((row) => {
        const client = clientsMap.get(row.client_id);
        const service = servicesMap.get(row.service_id);

        const clientName =
          client?.full_name ||
          client?.email ||
          'Unknown Client';

        const serviceName =
          service?.name ||
          'Unknown Service';

        const amount =
          row.total_amount !== null &&
          row.total_amount !== undefined
            ? Number(row.total_amount)
            : Number(service?.price || 0);

        const duration = service?.duration_minutes
          ? `${service.duration_minutes} mins`
          : 'Custom';

        return {
          id: row.id,

          clientId: row.client_id,
          clientName,
          clientEmail: client?.email || '—',
          clientPhone: client?.phone || '—',
          clientAvatar: getAvatar(clientName),

          serviceId: row.service_id,
          service: serviceName,
          package: serviceName,
          duration,

          date: row.booking_date,
          time: row.booking_time,

          amount,
          status: normalizeStatus(row.status),

          location: 'Studio',
          notes: row.message || '',
          adminNotes: row.admin_notes || '',

          paymentStatus: row.payment_status || 'pending',

          createdAt: row.created_at || '',
        };
      });

      setBookings(mappedBookings);

      // Keep selected drawer synchronized after realtime updates.
      setSelectedBooking((current) => {
        if (!current) return null;

        return (
          mappedBookings.find((booking) => booking.id === current.id) ||
          null
        );
      });
    } catch (err: any) {
      console.error('Unable to load bookings:', err);

      setError(
        err?.message ||
          'Unable to load bookings. Please check your Supabase connection and permissions.'
      );
    }
  }, []);

  /**
   * Initial load + realtime updates.
   */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (mounted) {
        setLoading(true);
      }

      await fetchBookings();

      if (mounted) {
        setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel('cms-bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  /**
   * Confirm booking.
   */
  const confirmBooking = async (booking: Booking) => {
    try {
      setUpdating(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          confirmed_by: user?.id || null,
          cancelled_at: null,
          cancelled_by: null,
        })
        .eq('id', booking.id);

      if (updateError) {
        throw updateError;
      }

      await fetchBookings();
      await handleBookingStatusChange({ data: { bookingId: booking.id, status: 'confirmed' } });
    } catch (err: any) {
      console.error('Unable to confirm booking:', err);

      setError(
        err?.message || 'Unable to confirm this booking.'
      );
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Cancel booking.
   */
  const cancelBooking = async (booking: Booking) => {
    try {
      setUpdating(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: user?.id || null,
        })
        .eq('id', booking.id);

      if (updateError) {
        throw updateError;
      }

      await fetchBookings();
      await handleBookingStatusChange({ data: { bookingId: booking.id, status: 'cancelled' } });
    } catch (err: any) {
      console.error('Unable to cancel booking:', err);

      setError(
        err?.message || 'Unable to cancel this booking.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings.filter((booking) => {
      const searchValue = search.toLowerCase();

      const matchSearch =
        booking.clientName.toLowerCase().includes(searchValue) ||
        booking.clientEmail.toLowerCase().includes(searchValue) ||
        booking.service.toLowerCase().includes(searchValue) ||
        booking.id.toLowerCase().includes(searchValue);

      const bookingDate = new Date(
        `${booking.date}T00:00:00`
      );

      let matchFilter = true;

      if (activeFilter === 'Confirmed') {
        matchFilter = booking.status === 'confirmed';
      }

      if (activeFilter === 'Pending') {
        matchFilter = booking.status === 'pending';
      }

      if (activeFilter === 'Cancelled') {
        matchFilter = booking.status === 'cancelled';
      }

      if (activeFilter === 'Completed') {
        matchFilter = booking.status === 'completed';
      }

      if (activeFilter === 'Upcoming') {
        matchFilter =
          bookingDate >= today &&
          booking.status !== 'cancelled' &&
          booking.status !== 'completed';
      }

      return matchSearch && matchFilter;
    });
  }, [bookings, search, activeFilter]);

  const totalRevenue = bookings.reduce(
    (total, booking) => total + Number(booking.amount || 0),
    0
  );

  const inputBg = isDark
    ? 'bg-white/[0.05] border-white/[0.08] text-white/80 placeholder-white/30 focus:border-white/20'
    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-gray-300';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
          <p
            className={`text-sm ${
              isDark ? 'text-white/60' : 'text-gray-500'
            }`}
          >
            Loading bookings…
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2
            className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Bookings
          </h2>

          <p
            className={`text-xs mt-1 ${
              isDark ? 'text-white/40' : 'text-gray-400'
            }`}
          >
            Manage client bookings and appointments.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs border ${
            isDark
              ? 'border-white/[0.08] text-white/60 hover:bg-white/[0.05]'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs text-red-400">
              {error}
            </p>

            <button
              onClick={() => setError(null)}
              className="text-red-400"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          size={13}
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            isDark ? 'text-white/30' : 'text-gray-400'
          }`}
        />

        <input
          className={`w-full h-9 pl-8 pr-4 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
          placeholder="Search by client, email, service or booking ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === filter
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#FCA311] text-[#0B0B0B] shadow-lg'
                : isDark
                ? 'bg-white/[0.05] text-white/50 hover:text-white border border-white/[0.06]'
                : 'bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total',
            value: bookings.length,
          },
          {
            label: 'Confirmed',
            value: bookings.filter(
              (b) => b.status === 'confirmed'
            ).length,
          },
          {
            label: 'Pending',
            value: bookings.filter(
              (b) => b.status === 'pending'
            ).length,
          },
          {
            label: 'Revenue',
            value: `GH₵${totalRevenue.toLocaleString()}`,
          },
        ].map((stat, index) => (
          <GlassCard
            key={index}
            delay={index * 0.04}
            className="px-4 py-3"
          >
            <p
              className={`text-xs ${
                isDark ? 'text-white/40' : 'text-gray-400'
              } mb-0.5`}
            >
              {stat.label}
            </p>

            <p
              className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              style={{
                fontFamily: 'Playfair Display, serif',
              }}
            >
              {stat.value}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Table */}
      <GlassCard
        delay={0.15}
        className="overflow-hidden"
      >
        <div
          className={`hidden md:grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b ${
            isDark
              ? 'border-white/[0.06]'
              : 'border-gray-200/60'
          }`}
        >
          {[
            'Client',
            'Service',
            'Date & Time',
            'Duration',
            'Status',
            '',
          ].map((heading) => (
            <p
              key={heading}
              className={`text-[11px] font-medium uppercase tracking-wider ${
                isDark ? 'text-white/30' : 'text-gray-400'
              }`}
            >
              {heading}
            </p>
          ))}
        </div>

        <div
          className={`divide-y ${
            isDark
              ? 'divide-white/[0.04]'
              : 'divide-gray-100'
          }`}
        >
          <AnimatePresence>
            {filtered.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{
                  opacity: 0,
                  y: 4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -4,
                }}
                transition={{
                  delay: index * 0.03,
                }}
                onClick={() =>
                  setSelectedBooking(booking)
                }
                className={`grid grid-cols-1 md:grid-cols-[2fr_2fr_1.5fr_1fr_1fr_auto] gap-3 items-center px-5 py-4 cursor-pointer transition-colors ${
                  isDark
                    ? 'hover:bg-white/[0.03]'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Client */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={booking.clientAvatar}
                    alt={booking.clientName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0"
                  />

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isDark
                          ? 'text-white/90'
                          : 'text-gray-900'
                      }`}
                    >
                      {booking.clientName}
                    </p>

                    <p
                      className={`text-[10px] truncate ${
                        isDark
                          ? 'text-white/40'
                          : 'text-gray-400'
                      }`}
                    >
                      {booking.clientEmail}
                    </p>
                  </div>
                </div>

                {/* Service */}
                <div>
                  <p
                    className={`text-xs font-medium ${
                      isDark
                        ? 'text-white/80'
                        : 'text-gray-700'
                    }`}
                  >
                    {booking.service}
                  </p>

                  <p
                    className={`text-[10px] ${
                      isDark
                        ? 'text-white/40'
                        : 'text-gray-400'
                    }`}
                  >
                    {booking.package}
                  </p>
                </div>

                {/* Date */}
                <div>
                  <p
                    className={`text-xs ${
                      isDark
                        ? 'text-white/70'
                        : 'text-gray-700'
                    }`}
                  >
                    {formatDate(booking.date)}
                  </p>

                  <p
                    className={`text-[10px] ${
                      isDark
                        ? 'text-white/40'
                        : 'text-gray-400'
                    }`}
                  >
                    {formatTime(booking.time)}
                  </p>
                </div>

                {/* Duration */}
                <p
                  className={`text-xs ${
                    isDark
                      ? 'text-white/60'
                      : 'text-gray-600'
                  }`}
                >
                  {booking.duration}
                </p>

                {/* Status */}
                <StatusBadge status={booking.status} />

                <ChevronRight
                  size={14}
                  className={`hidden md:block ${
                    isDark
                      ? 'text-white/20'
                      : 'text-gray-300'
                  }`}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {bookings.length === 0 && (
            <div className="px-5 py-12">
              <EmptyState
                icon={Calendar}
                title="📋 No bookings yet"
                description="Bookings created from your booking page will appear here automatically."
              />
            </div>
          )}

          {bookings.length > 0 &&
            filtered.length === 0 && (
              <div className="px-5 py-12 text-center">
                <p
                  className={`text-sm ${
                    isDark
                      ? 'text-white/40'
                      : 'text-gray-400'
                  }`}
                >
                  No bookings match your search.
                </p>
              </div>
            )}
        </div>
      </GlassCard>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() =>
                setSelectedBooking(null)
              }
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 280,
              }}
              className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col backdrop-blur-2xl overflow-y-auto ${
                isDark
                  ? 'bg-[#0D0D0D]/98 border-l border-white/[0.08]'
                  : 'bg-white border-l border-gray-200'
              }`}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between px-6 py-5 border-b flex-shrink-0 ${
                  isDark
                    ? 'border-white/[0.08]'
                    : 'border-gray-200'
                }`}
              >
                <div>
                  <p
                    className={`text-[10px] uppercase tracking-widest mb-0.5 ${
                      isDark
                        ? 'text-white/40'
                        : 'text-gray-400'
                    }`}
                  >
                    Booking
                  </p>

                  <h3
                    className={`text-base font-bold ${
                      isDark
                        ? 'text-white'
                        : 'text-gray-900'
                    }`}
                    style={{
                      fontFamily:
                        'Playfair Display, serif',
                    }}
                  >
                    Booking Details
                  </h3>
                </div>

                <button
                  onClick={() =>
                    setSelectedBooking(null)
                  }
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isDark
                      ? 'text-white/40 hover:text-white hover:bg-white/[0.08]'
                      : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 px-6 py-5 space-y-6 overflow-y-auto">
                {/* Client */}
                <div>
                  <p
                    className={`text-[10px] uppercase tracking-widest mb-3 ${
                      isDark
                        ? 'text-white/30'
                        : 'text-gray-400'
                    }`}
                  >
                    Client
                  </p>

                  <div className="flex items-center gap-3">
                    <img
                      src={selectedBooking.clientAvatar}
                      alt={selectedBooking.clientName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/10"
                    />

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-bold ${
                          isDark
                            ? 'text-white'
                            : 'text-gray-900'
                        }`}
                      >
                        {selectedBooking.clientName}
                      </p>

                      <p
                        className={`text-xs truncate ${
                          isDark
                            ? 'text-white/50'
                            : 'text-gray-500'
                        }`}
                      >
                        {selectedBooking.clientEmail}
                      </p>

                      <p
                        className={`text-xs ${
                          isDark
                            ? 'text-white/40'
                            : 'text-gray-400'
                        }`}
                      >
                        {selectedBooking.clientPhone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={
                      selectedBooking.clientPhone !== '—'
                        ? `tel:${selectedBooking.clientPhone.replace(
                            /[^+\d]/g,
                            ''
                          )}`
                        : undefined
                    }
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium bg-[#D4AF37]/12 text-[#D4AF37] border border-[#D4AF37]/25"
                  >
                    <Phone size={14} />
                    Call
                  </a>

                  <a
                    href={
                      selectedBooking.clientPhone !== '—'
                        ? `https://wa.me/${selectedBooking.clientPhone.replace(
                            /[^\d]/g,
                            ''
                          )}?text=${encodeURIComponent(
                            `Hello ${selectedBooking.clientName}, regarding your ${selectedBooking.service} booking.`
                          )}`
                        : undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium bg-[#25D366]/12 text-[#25D366] border border-[#25D366]/25"
                  >
                    <MessageSquare size={14} />
                    WhatsApp
                  </a>

                  <a
                    href={
                      selectedBooking.clientEmail !== '—'
                        ? `mailto:${selectedBooking.clientEmail}`
                        : undefined
                    }
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  >
                    <Mail size={14} />
                    Email
                  </a>
                </div>

                {/* Booking information */}
                <div
                  className={`rounded-2xl p-4 space-y-3 ${
                    isDark
                      ? 'bg-white/[0.03] border border-white/[0.06]'
                      : 'bg-gray-50 border border-gray-200/60'
                  }`}
                >
                  <p
                    className={`text-[10px] uppercase tracking-widest ${
                      isDark
                        ? 'text-white/30'
                        : 'text-gray-400'
                    }`}
                  >
                    Booking Info
                  </p>

                  {[
                    {
                      icon: <Calendar size={13} />,
                      label: 'Date',
                      value: formatDate(
                        selectedBooking.date
                      ),
                    },
                    {
                      icon: <Clock size={13} />,
                      label: 'Time',
                      value: `${formatTime(
                        selectedBooking.time
                      )} · ${selectedBooking.duration}`,
                    },
                    {
                      icon: <MapPin size={13} />,
                      label: 'Location',
                      value:
                        selectedBooking.location,
                    },
                    {
                      icon: <Calendar size={13} />,
                      label: 'Created',
                      value:
                        selectedBooking.createdAt
                          ? new Date(
                              selectedBooking.createdAt
                            ).toLocaleString()
                          : '—',
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-start gap-2.5"
                    >
                      <span
                        className={`flex-shrink-0 mt-0.5 ${
                          isDark
                            ? 'text-white/30'
                            : 'text-gray-400'
                        }`}
                      >
                        {row.icon}
                      </span>

                      <div>
                        <p
                          className={`text-[10px] ${
                            isDark
                              ? 'text-white/30'
                              : 'text-gray-400'
                          }`}
                        >
                          {row.label}
                        </p>

                        <p
                          className={`text-xs font-medium ${
                            isDark
                              ? 'text-white/80'
                              : 'text-gray-700'
                          }`}
                        >
                          {row.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Service */}
                <div
                  className={`rounded-2xl p-4 ${
                    isDark
                      ? 'bg-[#D4AF37]/[0.08] border border-[#D4AF37]/20'
                      : 'bg-[#FDF6E3] border border-[#D4AF37]/30'
                  }`}
                >
                  <p
                    className={`text-[10px] uppercase tracking-widest mb-1 ${
                      isDark
                        ? 'text-[#D4AF37]/70'
                        : 'text-[#B8860B]'
                    }`}
                  >
                    Service
                  </p>

                  <p
                    className={`text-sm font-semibold ${
                      isDark
                        ? 'text-white/90'
                        : 'text-gray-900'
                    }`}
                  >
                    {selectedBooking.service}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p
                        className={`text-[10px] ${
                          isDark
                            ? 'text-white/40'
                            : 'text-gray-400'
                        }`}
                      >
                        Duration
                      </p>

                      <p
                        className={`text-xs ${
                          isDark
                            ? 'text-white/80'
                            : 'text-gray-700'
                        }`}
                      >
                        {selectedBooking.duration}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-[10px] ${
                          isDark
                            ? 'text-white/40'
                            : 'text-gray-400'
                        }`}
                      >
                        Amount
                      </p>

                      <p
                        className={`text-base font-bold ${
                          isDark
                            ? 'text-white'
                            : 'text-gray-900'
                        }`}
                      >
                        GH₵
                        {selectedBooking.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs ${
                      isDark
                        ? 'text-white/50'
                        : 'text-gray-500'
                    }`}
                  >
                    Current Status
                  </p>

                  <StatusBadge
                    status={selectedBooking.status}
                    size="md"
                  />
                </div>

                {/* Payment */}
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs ${
                      isDark
                        ? 'text-white/50'
                        : 'text-gray-500'
                    }`}
                  >
                    Payment
                  </p>

                  <span className="text-xs font-medium capitalize">
                    {selectedBooking.paymentStatus}
                  </span>
                </div>

                {/* Message */}
                {selectedBooking.notes && (
                  <div
                    className={`rounded-2xl p-4 ${
                      isDark
                        ? 'bg-white/[0.03] border border-white/[0.06]'
                        : 'bg-gray-50 border border-gray-200/60'
                    }`}
                  >
                    <p
                      className={`text-[10px] uppercase tracking-widest mb-2 ${
                        isDark
                          ? 'text-white/30'
                          : 'text-gray-400'
                      }`}
                    >
                      Client Message
                    </p>

                    <p
                      className={`text-xs leading-relaxed ${
                        isDark
                          ? 'text-white/60'
                          : 'text-gray-600'
                      }`}
                    >
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div
                className={`px-6 py-5 border-t flex-shrink-0 space-y-2 ${
                  isDark
                    ? 'border-white/[0.08]'
                    : 'border-gray-200'
                }`}
              >
                {selectedBooking.status ===
                  'pending' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={updating}
                      onClick={() =>
                        confirmBooking(
                          selectedBooking
                        )
                      }
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {updating ? (
                        <Loader2
                          size={13}
                          className="animate-spin"
                        />
                      ) : (
                        <Check size={13} />
                      )}
                      Confirm Booking
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={updating}
                      onClick={() =>
                        cancelBooking(
                          selectedBooking
                        )
                      }
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50"
                    >
                      <XCircle size={13} />
                      Cancel Booking
                    </motion.button>
                  </>
                )}

                <button
                  onClick={() =>
                    window.print()
                  }
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border ${
                    isDark
                      ? 'border-white/[0.06] text-white/40 hover:text-white/60'
                      : 'border-gray-200 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Download size={13} />
                  Export Details
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

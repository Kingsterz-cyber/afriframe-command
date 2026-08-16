import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import {
  Search,
  Phone,
  Mail,
  X,
  Calendar,
  MapPin,
  DollarSign,
  Star,
  ChevronRight,
  Users,
  Loader2,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

interface ClientRow {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  instagram_handle?: string | null;
  company?: string | null;
  notes?: string | null;
  marketing_opt_in?: boolean | null;
  source?: string | null;
  user_id?: string | null;
}

interface BookingRow {
  id: string;
  client_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  status?: string | null;
  total_amount?: number | string | null;
  created_at?: string | null;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  company: string;

  avatar: string;

  status: 'active' | 'inactive' | 'vip';

  totalBookings: number;
  totalSpent: number;

  location: string;
  joinDate: string;
  lastBooking: string;

  notes: string;
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

export const Clients: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');

  const [selected, setSelected] =
    useState<Client | null>(null);

  const [filter, setFilter] = useState<
    'all' | 'vip' | 'active' | 'inactive'
  >('all');

  const [clients, setClients] =
    useState<Client[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  /**
   * Fetch clients + their REAL bookings.
   */
  const fetchClients = useCallback(async () => {
    try {
      setError(null);

      /**
       * Get clients.
       */
      const {
        data: clientRows,
        error: clientsError,
      } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', {
          ascending: false,
        });

      if (clientsError) {
        throw clientsError;
      }

      /**
       * Get bookings.
       *
       * We intentionally fetch the booking table
       * separately rather than depending on a nested
       * Supabase relationship.
       */
      const {
        data: bookingRows,
        error: bookingsError,
      } = await supabase
        .from('bookings')
        .select(
          'id, client_id, service_id, booking_date, booking_time, status, total_amount, created_at'
        );

      if (bookingsError) {
        throw bookingsError;
      }

      const rows =
        (clientRows || []) as ClientRow[];

      const bookings =
        (bookingRows || []) as BookingRow[];

      /**
       * Create booking statistics for each client.
       */
      const bookingStats = new Map<
        string,
        {
          count: number;
          spent: number;
          lastBooking: string | null;
        }
      >();

      bookings.forEach((booking) => {
        if (!booking.client_id) return;

        const existing =
          bookingStats.get(booking.client_id) || {
            count: 0,
            spent: 0,
            lastBooking: null,
          };

        const amount =
          booking.total_amount !== null &&
          booking.total_amount !== undefined
            ? Number(booking.total_amount)
            : 0;

        existing.count += 1;

        /**
         * Only count actual completed/confirmed/
         * pending booking amounts.
         *
         * Cancelled bookings are not counted as
         * revenue.
         */
        if (
          normalizeStatus(booking.status) !==
          'cancelled'
        ) {
          existing.spent += amount;
        }

        if (
          !existing.lastBooking ||
          booking.booking_date >
            existing.lastBooking
        ) {
          existing.lastBooking =
            booking.booking_date;
        }

        bookingStats.set(
          booking.client_id,
          existing
        );
      });

      /**
       * Build the client objects.
       */
      const mappedClients: Client[] =
        rows.map((row) => {
          const stats =
            bookingStats.get(row.id) || {
              count: 0,
              spent: 0,
              lastBooking: null,
            };

          /**
           * VIP rule:
           *
           * A client becomes VIP after 2+ bookings.
           *
           * You can change this later if you want
           * a different business rule.
           */
          let clientStatus:
            | 'active'
            | 'inactive'
            | 'vip';

          if (stats.count >= 2) {
            clientStatus = 'vip';
          } else if (stats.count >= 1) {
            clientStatus = 'active';
          } else {
            clientStatus = 'inactive';
          }

          return {
            id: row.id,

            name: row.full_name,

            email: row.email,

            phone: row.phone || '—',

            instagram:
              row.instagram_handle || '',

            company: row.company || '',

            avatar: getAvatar(row.full_name),

            status: clientStatus,

            totalBookings: stats.count,

            totalSpent: stats.spent,

            location:
              row.company ||
              '—',

            joinDate:
              row.created_at
                ? formatDate(
                    row.created_at.split('T')[0]
                  )
                : '—',

            lastBooking:
              stats.lastBooking
                ? formatDate(
                    stats.lastBooking
                  )
                : 'N/A',

            notes: row.notes || '',
          };
        });

      setClients(mappedClients);

      /**
       * Keep drawer updated if the client is
       * currently selected.
       */
      setSelected((current) => {
        if (!current) return null;

        return (
          mappedClients.find(
            (client) =>
              client.id === current.id
          ) || null
        );
      });
    } catch (err: any) {
      console.error(
        'Unable to load clients:',
        err
      );

      setError(
        err?.message ||
          'Unable to load clients. Please check your Supabase connection and permissions.'
      );
    }
  }, []);

  /**
   * Initial load + realtime.
   */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (mounted) {
        setLoading(true);
      }

      await fetchClients();

      if (mounted) {
        setLoading(false);
      }
    };

    load();

    /**
     * Listen for changes to clients.
     */
    const clientsChannel = supabase
      .channel('cms-clients-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
        },
        () => {
          fetchClients();
        }
      )
      .subscribe();

    /**
     * Listen for booking changes.
     *
     * This is essential because booking a new
     * session should immediately increase the
     * client's booking count.
     */
    const bookingsChannel = supabase
      .channel('cms-client-bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      mounted = false;

      supabase.removeChannel(
        clientsChannel
      );

      supabase.removeChannel(
        bookingsChannel
      );
    };
  }, [fetchClients]);

  const filtered = useMemo(() => {
    const searchValue =
      search.toLowerCase();

    return clients.filter((client) => {
      const matchSearch =
        client.name
          .toLowerCase()
          .includes(searchValue) ||
        client.email
          .toLowerCase()
          .includes(searchValue) ||
        client.phone
          .toLowerCase()
          .includes(searchValue) ||
        client.company
          .toLowerCase()
          .includes(searchValue);

      const matchFilter =
        filter === 'all' ||
        client.status === filter;

      return matchSearch && matchFilter;
    });
  }, [clients, search, filter]);

  const totalRevenue = clients.reduce(
    (total, client) =>
      total + Number(client.totalSpent || 0),
    0
  );

  const averageSpend =
    clients.length > 0
      ? Math.round(
          totalRevenue / clients.length
        )
      : 0;

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
              isDark
                ? 'text-white/60'
                : 'text-gray-500'
            }`}
          >
            Loading clients…
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
      className="p-4 md:p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={`text-xl font-bold ${
              isDark
                ? 'text-white'
                : 'text-gray-900'
            }`}
            style={{
              fontFamily:
                'Playfair Display, serif',
            }}
          >
            Clients
          </h2>

          <p
            className={`text-xs mt-1 ${
              isDark
                ? 'text-white/40'
                : 'text-gray-400'
            }`}
          >
            Your client relationships and booking
            history.
          </p>
        </div>

        <button
          onClick={fetchClients}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border ${
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
            isDark
              ? 'text-white/30'
              : 'text-gray-400'
          }`}
        />

        <input
          className={`w-full h-9 pl-8 pr-4 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
          placeholder="Search clients..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          {
            key: 'all',
            label: 'All',
          },
          {
            key: 'vip',
            label: 'VIP',
          },
          {
            key: 'active',
            label: 'Active',
          },
          {
            key: 'inactive',
            label: 'No Bookings',
          },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() =>
              setFilter(
                item.key as
                  | 'all'
                  | 'vip'
                  | 'active'
                  | 'inactive'
              )
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === item.key
                ? 'bg-[#D4AF37] text-[#0B0B0B]'
                : isDark
                ? 'bg-white/[0.05] text-white/50 border border-white/[0.06] hover:text-white'
                : 'bg-gray-100 text-gray-500 border border-gray-200 hover:text-gray-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Clients',
            value: clients.length,
          },
          {
            label: 'VIP Clients',
            value: clients.filter(
              (client) =>
                client.status === 'vip'
            ).length,
          },
          {
            label: 'Total Revenue',
            value: `GH₵${totalRevenue.toLocaleString()}`,
          },
          {
            label: 'Avg. Spend',
            value: `GH₵${averageSpend.toLocaleString()}`,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.05,
            }}
            className={`px-4 py-3 rounded-2xl ${
              isDark
                ? 'bg-white/[0.04] border border-white/[0.08]'
                : 'bg-white border border-gray-200/60 shadow-sm'
            }`}
          >
            <p
              className={`text-[10px] uppercase tracking-wider mb-0.5 ${
                isDark
                  ? 'text-white/30'
                  : 'text-gray-400'
              }`}
            >
              {stat.label}
            </p>

            <p
              className={`text-lg font-bold ${
                isDark
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
              style={{
                fontFamily:
                  'Playfair Display, serif',
              }}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Client Table */}
      <div
        className={`rounded-2xl overflow-hidden ${
          isDark
            ? 'bg-white/[0.04] border border-white/[0.08]'
            : 'bg-white border border-gray-200/60 shadow-sm'
        }`}
      >
        {/* Header */}
        <div
          className={`hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b ${
            isDark
              ? 'border-white/[0.06]'
              : 'border-gray-200/60'
          }`}
        >
          {[
            'Client',
            'Contact',
            'Bookings',
            'Total Spent',
            'Status',
            '',
          ].map((heading) => (
            <p
              key={heading}
              className={`text-[11px] font-medium uppercase tracking-wider ${
                isDark
                  ? 'text-white/30'
                  : 'text-gray-400'
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
          {clients.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title="👥 No clients yet"
                description="Clients will appear here automatically when someone books a session."
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <p
                className={`text-sm ${
                  isDark
                    ? 'text-white/40'
                    : 'text-gray-400'
                }`}
              >
                No clients match your search.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map(
                (client, index) => (
                  <motion.div
                    key={client.id}
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
                    }}
                    transition={{
                      delay:
                        index * 0.04,
                    }}
                    onClick={() =>
                      setSelected(client)
                    }
                    className={`grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-3 items-center px-5 py-4 cursor-pointer transition-colors ${
                      isDark
                        ? 'hover:bg-white/[0.03]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Client */}
                    <div className="flex items-center gap-3">
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isDark
                                ? 'text-white/90'
                                : 'text-gray-900'
                            }`}
                          >
                            {client.name}
                          </p>

                          {client.status ===
                            'vip' && (
                            <Star
                              size={10}
                              className="text-amber-400 fill-amber-400"
                            />
                          )}
                        </div>

                        <p
                          className={`text-[10px] truncate ${
                            isDark
                              ? 'text-white/40'
                              : 'text-gray-400'
                          }`}
                        >
                          {client.company ||
                            client.email}
                        </p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="min-w-0">
                      <p
                        className={`text-xs truncate ${
                          isDark
                            ? 'text-white/70'
                            : 'text-gray-700'
                        }`}
                      >
                        {client.email}
                      </p>

                      <p
                        className={`text-[10px] ${
                          isDark
                            ? 'text-white/40'
                            : 'text-gray-400'
                        }`}
                      >
                        {client.phone}
                      </p>
                    </div>

                    {/* Bookings */}
                    <p
                      className={`text-xs font-medium ${
                        isDark
                          ? 'text-white/70'
                          : 'text-gray-700'
                      }`}
                    >
                      {client.totalBookings}
                    </p>

                    {/* Spent */}
                    <p
                      className={`text-xs font-semibold ${
                        isDark
                          ? 'text-white/90'
                          : 'text-gray-900'
                      }`}
                    >
                      GH₵
                      {client.totalSpent.toLocaleString()}
                    </p>

                    {/* Status */}
                    <StatusBadge
                      status={client.status}
                    />

                    <ChevronRight
                      size={13}
                      className={`hidden md:block ${
                        isDark
                          ? 'text-white/20'
                          : 'text-gray-300'
                      }`}
                    />
                  </motion.div>
                )
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Client Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() =>
                setSelected(null)
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
              className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col backdrop-blur-2xl overflow-y-auto ${
                isDark
                  ? 'bg-[#0D0D0D]/98 border-l border-white/[0.08]'
                  : 'bg-white border-l border-gray-200'
              }`}
            >
              {/* Drawer header */}
              <div
                className={`px-6 py-5 border-b flex items-center justify-between ${
                  isDark
                    ? 'border-white/[0.08]'
                    : 'border-gray-200'
                }`}
              >
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
                  Client Profile
                </h3>

                <button
                  onClick={() =>
                    setSelected(null)
                  }
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isDark
                      ? 'text-white/40 hover:text-white hover:bg-white/[0.08]'
                      : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex-1 px-6 py-5 space-y-5">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <img
                    src={selected.avatar}
                    alt={selected.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4
                        className={`text-base font-bold truncate ${
                          isDark
                            ? 'text-white'
                            : 'text-gray-900'
                        }`}
                        style={{
                          fontFamily:
                            'Playfair Display, serif',
                        }}
                      >
                        {selected.name}
                      </h4>

                      {selected.status ===
                        'vip' && (
                        <Star
                          size={13}
                          className="text-amber-400 fill-amber-400"
                        />
                      )}
                    </div>

                    <p
                      className={`text-xs truncate ${
                        isDark
                          ? 'text-white/50'
                          : 'text-gray-500'
                      }`}
                    >
                      {selected.email}
                    </p>

                    <StatusBadge
                      status={selected.status}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={
                      selected.phone !== '—'
                        ? `tel:${selected.phone.replace(
                            /[^+\d]/g,
                            ''
                          )}`
                        : undefined
                    }
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  >
                    <Phone size={14} />
                    Call
                  </a>

                  <a
                    href={
                      selected.email !==
                      '—'
                        ? `mailto:${selected.email}`
                        : undefined
                    }
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  >
                    <Mail size={14} />
                    Email
                  </a>

                  <a
                    href={
                      selected.phone !== '—'
                        ? `https://wa.me/${selected.phone.replace(
                            /[^\d]/g,
                            ''
                          )}`
                        : undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20"
                  >
                    <MessageSquare
                      size={14}
                    />
                    WhatsApp
                  </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      isDark
                        ? 'bg-white/[0.04] border border-white/[0.06]'
                        : 'bg-gray-50 border border-gray-200/60'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1.5 mb-1 ${
                        isDark
                          ? 'text-white/40'
                          : 'text-gray-400'
                      }`}
                    >
                      <Calendar size={13} />

                      <span className="text-[10px] uppercase tracking-wider">
                        Bookings
                      </span>
                    </div>

                    <p
                      className={`text-base font-bold ${
                        isDark
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}
                    >
                      {selected.totalBookings}
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-xl ${
                      isDark
                        ? 'bg-white/[0.04] border border-white/[0.06]'
                        : 'bg-gray-50 border border-gray-200/60'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1.5 mb-1 ${
                        isDark
                          ? 'text-white/40'
                          : 'text-gray-400'
                      }`}
                    >
                      <DollarSign
                        size={13}
                      />

                      <span className="text-[10px] uppercase tracking-wider">
                        Spent
                      </span>
                    </div>

                    <p
                      className={`text-base font-bold ${
                        isDark
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}
                    >
                      GH₵
                      {selected.totalSpent.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Contact details */}
                <div
                  className={`rounded-2xl p-4 space-y-3 ${
                    isDark
                      ? 'bg-white/[0.03] border border-white/[0.06]'
                      : 'bg-gray-50 border border-gray-200/60'
                  }`}
                >
                  {[
                    {
                      icon: <Phone size={12} />,
                      label: 'Phone',
                      value: selected.phone,
                    },
                    {
                      icon: <Mail size={12} />,
                      label: 'Email',
                      value: selected.email,
                    },
                    {
                      icon: <MapPin size={12} />,
                      label: 'Company',
                      value:
                        selected.company ||
                        '—',
                    },
                    {
                      icon: <Calendar size={12} />,
                      label: 'Last Booking',
                      value:
                        selected.lastBooking,
                    },
                    {
                      icon: <Calendar size={12} />,
                      label: 'Joined',
                      value:
                        selected.joinDate,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center gap-2.5"
                    >
                      <span
                        className={
                          isDark
                            ? 'text-white/30'
                            : 'text-gray-400'
                        }
                      >
                        {row.icon}
                      </span>

                      <span
                        className={`text-[10px] flex-shrink-0 w-24 ${
                          isDark
                            ? 'text-white/40'
                            : 'text-gray-400'
                        }`}
                      >
                        {row.label}
                      </span>

                      <span
                        className={`text-xs font-medium truncate ${
                          isDark
                            ? 'text-white/80'
                            : 'text-gray-700'
                        }`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {selected.notes && (
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
                      Notes
                    </p>

                    <p
                      className={`text-xs leading-relaxed ${
                        isDark
                          ? 'text-white/60'
                          : 'text-gray-600'
                      }`}
                    >
                      {selected.notes}
                    </p>
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
import { supabase } from '@/lib/supabase';

/** Fallback used only until the studio_settings row is read. */
export const DEFAULT_MAX_BOOKINGS_PER_DAY = 3;
export const DEFAULT_BOOKING_HORIZON_DAYS = 90;

export interface StudioSettings {
  default_max_bookings_per_day: number;
  default_start_time: string;
  default_end_time: string;
  default_time_slots?: string[] | null;
  booking_horizon_days: number;
  auto_waitlist: boolean;
  admin_email: string | null;
  admin_whatsapp: string | null;
}

export const FALLBACK_SETTINGS: StudioSettings = {
  default_max_bookings_per_day: DEFAULT_MAX_BOOKINGS_PER_DAY,
  default_start_time: '09:00',
  default_end_time: '17:00',
  default_time_slots: null,
  booking_horizon_days: DEFAULT_BOOKING_HORIZON_DAYS,
  auto_waitlist: false,
  admin_email: null,
  admin_whatsapp: null,
};

/** A row exists ONLY when the admin explicitly overrode that date. */
export interface DateOverride {
  id?: string;
  date: string;
  available: boolean;
  max_bookings: number | null;
  time_slots: string[] | null;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
}

export type DayStatus = 'available' | 'fully_booked' | 'blocked' | 'past';

export interface DayAvailability {
  date: string;
  capacity: number;
  bookingCount: number;
  isOverride: boolean;
  status: DayStatus;
}

/** Cancelled bookings never consume capacity. */
const NON_CONSUMING = ['cancelled', 'canceled', 'declined', 'rejected'];

export const bookingConsumesCapacity = (status?: string | null) =>
  !NON_CONSUMING.includes(String(status ?? 'pending').toLowerCase());

/**
 * The single source of truth for a date's status.
 *   GLOBAL DEFAULT -> DATE OVERRIDE (if any) -> REAL BOOKING COUNT -> STATUS
 */
export function resolveDayStatus(
  dateISO: string,
  settings: StudioSettings,
  override: DateOverride | undefined,
  bookingCount: number,
  todayISO: string,
): DayAvailability {
  const capacity = override?.max_bookings ?? settings.default_max_bookings_per_day;

  let status: DayStatus;
  if (dateISO < todayISO) {
    status = 'past';
  } else if (override?.available === false) {
    status = 'blocked';
  } else if (bookingCount >= capacity) {
    status = 'fully_booked';
  } else {
    status = 'available';
  }

  return { date: dateISO, capacity, bookingCount, isOverride: Boolean(override), status };
}

export async function fetchStudioSettings(): Promise<StudioSettings> {
  const { data, error } = await supabase
    .from('studio_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error || !data) return FALLBACK_SETTINGS;
  return { ...FALLBACK_SETTINGS, ...(data as Partial<StudioSettings>) };
}

export async function updateGlobalCapacity(value: number) {
  return supabase
    .from('studio_settings')
    .update({ default_max_bookings_per_day: value, updated_at: new Date().toISOString() })
    .eq('id', 1);
}

export async function updateStudioSettings(patch: Partial<StudioSettings>) {
  return supabase
    .from('studio_settings')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', 1);
}

/** Only fetches explicit overrides in the range — never generates rows. */
export async function fetchDateOverrides(fromISO: string, toISO: string): Promise<DateOverride[]> {
  const { data, error } = await supabase
    .from('availability')
    .select('id, date, available, max_bookings, time_slots, start_time, end_time, notes')
    .gte('date', fromISO)
    .lte('date', toISO);

  if (error || !data) return [];
  return data as DateOverride[];
}

export async function upsertDateOverride(payload: Omit<DateOverride, 'id'>) {
  return supabase
    .from('availability')
    .upsert({ ...payload, updated_at: new Date().toISOString() }, { onConflict: 'date' })
    .select()
    .maybeSingle();
}

/** Removing the override makes the date inherit the global defaults again. */
export async function clearDateOverride(dateISO: string) {
  return supabase.from('availability').delete().eq('date', dateISO);
}

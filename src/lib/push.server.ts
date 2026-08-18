// Server-only Web Push delivery for Afriframe Studio.
// Uses WebCrypto (Cloudflare Workers compatible) — never import from client code.
import webpush from 'web-push';
import { studioAdmin } from './notifications.server';

export interface StoredSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  [key: string]: string | undefined;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  eventType?: BookingEvent;
}

function vapid() {
  return {
    subject: process.env['VAPID_SUBJECT'],
    publicKey: process.env['VAPID_PUBLIC_KEY'],
    privateKey: process.env['VAPID_PRIVATE_KEY'],
  };
}

export function pushConfigStatus() {
  const keys = vapid();
  return {
    configured: Boolean(keys.subject && keys.publicKey && keys.privateKey),
    subject: Boolean(keys.subject),
    publicKey: Boolean(keys.publicKey),
    privateKey: Boolean(keys.privateKey),
  };
}

export function pushPublicKey() {
  return process.env['VAPID_PUBLIC_KEY'] ?? null;
}

export function pushDispatchUrl() {
  return process.env['AFRIFRAME_PUSH_DISPATCH_URL']?.trim() || null;
}

export async function listSubscriptions(audience: 'admin' | 'all' = 'admin') {
  const db = studioAdmin();
  let query = db.from('push_subscriptions').select('id, endpoint, p256dh, auth');
  if (audience === 'admin') query = query.eq('role', 'admin');
  const { data, error } = await query;
  if (error) {
    console.error('[push] failed to load subscriptions', error);
    return [] as StoredSubscription[];
  }
  return (data ?? []) as StoredSubscription[];
}

export async function removeSubscription(endpoint: string) {
  const db = studioAdmin();
  await db.from('push_subscriptions').delete().eq('endpoint', endpoint);
}

/** Sends one notification to every stored device. Prunes dead subscriptions. */
export async function sendPush(payload: PushPayload, audience: 'admin' | 'all' = 'admin') {
  const keys = vapid();
  if (!keys.publicKey || !keys.privateKey) {
    return { sent: 0, failed: 0, devices: 0, reason: 'vapid_not_configured' as const };
  }

  const subscriptions = await listSubscriptions(audience);
  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0, devices: 0, reason: 'no_subscribed_devices' as const };
  }
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        webpush.setVapidDetails(keys.subject ?? 'mailto:admin@afriframe.studio', keys.publicKey, keys.privateKey);
        const res = await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            expirationTime: null,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
          { TTL: 60 * 60 * 12, urgency: 'high' },
        );

        if (res.statusCode === 404 || res.statusCode === 410) {
          await removeSubscription(sub.endpoint);
          failed += 1;
          return;
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.error('[push] provider rejected', res.statusCode, res.body);
          failed += 1;
          return;
        }
        sent += 1;
      } catch (err) {
        console.error('[push] send failed', err);
        failed += 1;
      }
    }),
  );

  return { sent, failed, devices: subscriptions.length };
}

const fmtDate = (date: string, time?: string | null) => {
  let label = date;
  try {
    label = new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
      month: 'long',
      day: 'numeric',
    });
  } catch {
    /* keep raw */
  }
  if (!time) return label;
  const [h, m] = time.split(':');
  const hour = Number(h ?? 0);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${label} · ${hour12}:${m ?? '00'} ${suffix}`;
};

export type BookingEvent = 'booking.created' | 'booking.confirmed' | 'booking.cancelled';

export function buildBookingPush(
  event: BookingEvent,
  booking: {
    id: string;
    client_name: string;
    service_name: string;
    booking_date: string;
    booking_time: string | null;
  },
): PushPayload {
  const when = fmtDate(booking.booking_date, booking.booking_time);
  const url = `/bookings?bookingId=${encodeURIComponent(booking.id)}`;

  if (event === 'booking.confirmed') {
    return {
      title: 'Afriframe',
      body: `✅ Booking confirmed\n${booking.client_name} · ${booking.service_name}\n${when}`,
      url,
      tag: `booking-${booking.id}`,
      bookingId: booking.id,
      eventType: event,
    };
  }
  if (event === 'booking.cancelled') {
    return {
      title: 'Afriframe',
      body: `⚠️ Booking cancelled\n${booking.client_name} · ${booking.service_name}\n${when}`,
      url,
      tag: `booking-${booking.id}`,
      bookingId: booking.id,
      eventType: event,
    };
  }
  return {
    title: 'Afriframe',
    body: `🔔 New Booking\n${booking.client_name} just booked a ${booking.service_name}.\n${when}`,
    url,
    tag: `booking-${booking.id}`,
  };
}

/** Mirrors the push into the in-CMS notification history table. */
export async function recordNotification(
  type: string,
  title: string,
  message: string,
  bookingId?: string,
) {
  const db = studioAdmin();
  const { error } = await db.from('notifications').upsert({
    type,
    title,
    message,
    is_read: false,
    booking_id: bookingId ?? null,
  }, { onConflict: 'booking_id,type', ignoreDuplicates: true });
  if (error) console.error('[push] notification history insert failed', error);
}

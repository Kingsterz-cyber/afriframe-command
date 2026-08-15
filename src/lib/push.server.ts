// Server-only Web Push delivery for Afriframe Studio.
// Uses WebCrypto (Cloudflare Workers compatible) — never import from client code.
import { buildPushPayload } from '@block65/webcrypto-web-push';
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
}

function vapid() {
  return {
    subject: process.env['VAPID_SUBJECT'] ?? 'mailto:hello@afriframestudio.com',
    publicKey: process.env['VAPID_PUBLIC_KEY'],
    privateKey: process.env['VAPID_PRIVATE_KEY'],
  };
}

export function pushPublicKey() {
  return process.env['VAPID_PUBLIC_KEY'] ?? null;
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
    return { sent: 0, failed: 0, reason: 'vapid_not_configured' as const };
  }

  const subscriptions = await listSubscriptions(audience);
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        const request = await buildPushPayload(
          { data: payload, options: { ttl: 60 * 60 * 12, urgency: 'high' } },
          {
            endpoint: sub.endpoint,
            expirationTime: null,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          keys,
        );

        const res = await fetch(sub.endpoint, {
          method: request.method,
          headers: request.headers,
          body: request.body as BodyInit,
        });

        if (res.status === 404 || res.status === 410) {
          await removeSubscription(sub.endpoint);
          failed += 1;
          return;
        }
        if (!res.ok) {
          console.error('[push] provider rejected', res.status, await res.text());
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

  return { sent, failed };
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
  const url = `/bookings?booking=${booking.id}`;

  if (event === 'booking.confirmed') {
    return {
      title: 'Afriframe',
      body: `✅ Booking confirmed\n${booking.client_name} · ${booking.service_name}\n${when}`,
      url,
      tag: `booking-${booking.id}`,
    };
  }
  if (event === 'booking.cancelled') {
    return {
      title: 'Afriframe',
      body: `⚠️ Booking cancelled\n${booking.client_name} · ${booking.service_name}\n${when}`,
      url,
      tag: `booking-${booking.id}`,
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

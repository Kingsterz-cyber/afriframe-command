import { createServerFn } from '@tanstack/react-start';

interface SubscriptionInput {
  accessToken: string;
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
  userAgent?: string;
}

/** Public VAPID key so the browser can create a push subscription. */
export const getPushPublicKey = createServerFn({ method: 'GET' }).handler(async () => {
  const { pushPublicKey } = await import('./push.server');
  return { publicKey: pushPublicKey() };
});

/** Stores (or refreshes) one device's push subscription for the signed-in admin. */
export const savePushSubscription = createServerFn({ method: 'POST' })
  .inputValidator((data: SubscriptionInput) => {
    if (!data?.accessToken) throw new Error('Not signed in');
    if (!data?.subscription?.endpoint || !data.subscription.keys?.p256dh || !data.subscription.keys?.auth) {
      throw new Error('Invalid push subscription');
    }
    return data;
  })
  .handler(async ({ data }) => {
    const { studioAdmin } = await import('./notifications.server');
    const db = studioAdmin();

    const { data: userData, error: authError } = await db.auth.getUser(data.accessToken);
    if (authError || !userData?.user) return { saved: false, reason: 'unauthorized' as const };

    const { error } = await db.from('push_subscriptions').upsert(
      {
        user_id: userData.user.id,
        role: 'admin',
        endpoint: data.subscription.endpoint,
        p256dh: data.subscription.keys.p256dh,
        auth: data.subscription.keys.auth,
        user_agent: data.userAgent ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' },
    );

    if (error) {
      console.error('[push] subscription upsert failed', error);
      return { saved: false, reason: 'db_error' as const };
    }
    return { saved: true as const };
  });

/** Removes a device when the admin turns notifications off. */
export const deletePushSubscription = createServerFn({ method: 'POST' })
  .inputValidator((data: { endpoint: string }) => {
    if (!data?.endpoint) throw new Error('endpoint is required');
    return data;
  })
  .handler(async ({ data }) => {
    const { removeSubscription } = await import('./push.server');
    await removeSubscription(data.endpoint);
    return { removed: true as const };
  });

/** Sends a test notification to every registered admin device. */
export const sendTestPush = createServerFn({ method: 'POST' })
  .inputValidator((data: { accessToken: string }) => {
    if (!data?.accessToken) throw new Error('Not signed in');
    return data;
  })
  .handler(async ({ data }) => {
    const { studioAdmin } = await import('./notifications.server');
    const { sendPush } = await import('./push.server');

    const db = studioAdmin();
    const { data: userData, error } = await db.auth.getUser(data.accessToken);
    if (error || !userData?.user) return { sent: 0, failed: 0, reason: 'unauthorized' as const };

    return sendPush({
      title: 'Afriframe',
      body: '🔔 Push notifications are live on this device.',
      url: '/notifications',
      tag: 'afriframe-test',
    });
  });

/** Fires the push for a booking event from inside the CMS (admin actions). */
export const pushBookingEvent = createServerFn({ method: 'POST' })
  .inputValidator((data: { bookingId: string; event: 'booking.confirmed' | 'booking.cancelled' }) => {
    if (!data?.bookingId) throw new Error('bookingId is required');
    return data;
  })
  .handler(async ({ data }) => {
    const { loadBooking } = await import('./notifications.server');
    const { sendPush, buildBookingPush } = await import('./push.server');

    const booking = await loadBooking(data.bookingId);
    if (!booking) return { sent: 0, failed: 0, reason: 'booking_not_found' as const };

    return sendPush(buildBookingPush(data.event, booking));
  });

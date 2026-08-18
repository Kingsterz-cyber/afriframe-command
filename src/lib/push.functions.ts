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

/** Sends the diagnostic push and returns the first failing stage without exposing secrets. */
export const sendTestPush = createServerFn({ method: 'POST' })
  .inputValidator((data: { accessToken: string; endpoint: string }) => {
    if (!data?.accessToken) throw new Error('Not signed in');
    if (!data?.endpoint) throw new Error('Push subscription endpoint is missing');
    return data;
  })
  .handler(async ({ data }) => {
    const { studioAdmin } = await import('./notifications.server');
    const { pushConfigStatus, sendPush } = await import('./push.server');
    const db = studioAdmin();
    const { data: userData, error: authError } = await db.auth.getUser(data.accessToken);
    if (authError || !userData?.user) return { sent: 0, failed: 0, stage: 'supabase_save' as const, reason: 'unauthorized' };

    const { data: record, error: recordError } = await db
      .from('push_subscriptions')
      .select('user_id, role, endpoint')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .eq('endpoint', data.endpoint)
      .maybeSingle();
    if (recordError) return { sent: 0, failed: 0, stage: 'database_record' as const, reason: 'Database subscription lookup failed' };
    if (!record) return { sent: 0, failed: 0, stage: 'database_record' as const, reason: 'Database subscription: NOT FOUND' };

    const vapid = pushConfigStatus();
    if (!vapid.configured) return { sent: 0, failed: 0, stage: 'vapid' as const, reason: 'VAPID configuration is incomplete' };

    const result = await sendPush({
      title: 'Afriframe',
      body: 'Hey admin! Your notification system works!',
      url: '/notifications',
      tag: 'afriframe-notification-test',
    });
    return { ...result, stage: result.sent > 0 && result.failed === 0 ? 'push_delivery' as const : 'push_delivery' as const, reason: result.sent > 0 && result.failed === 0 ? undefined : result.reason ?? 'Web Push delivery failed' };
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

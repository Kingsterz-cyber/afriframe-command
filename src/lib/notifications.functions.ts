import { createServerFn } from '@tanstack/react-start';

/**
 * Emails the client that their booking is confirmed, and records the outcome
 * on the booking row. Safe to call more than once — it will simply resend.
 */
export const sendBookingConfirmation = createServerFn({ method: 'POST' })
  .inputValidator((data: { bookingId: string }) => {
    if (!data?.bookingId || typeof data.bookingId !== 'string') {
      throw new Error('bookingId is required');
    }
    return { bookingId: data.bookingId };
  })
  .handler(async ({ data }) => {
    const {
      loadBooking,
      sendEmail,
      confirmationHtml,
      studioAdmin,
    } = await import('./notifications.server');

    const booking = await loadBooking(data.bookingId);
    if (!booking) return { sent: false, reason: 'booking_not_found' as const };
    if (!booking.client_email) return { sent: false, reason: 'no_client_email' as const };

    const db = studioAdmin();
    try {
      await sendEmail(
        booking.client_email,
        `Your Afriframe Studio session is confirmed — ${booking.booking_date}`,
        confirmationHtml(booking),
      );
      await db
        .from('bookings')
        .update({
          confirmation_email_sent_at: new Date().toISOString(),
          confirmation_email_status: 'sent',
        })
        .eq('id', booking.id);
      return { sent: true as const };
    } catch (err) {
      console.error('[email] confirmation failed', err);
      await db
        .from('bookings')
        .update({ confirmation_email_status: 'failed' })
        .eq('id', booking.id);
      return { sent: false, reason: 'send_failed' as const, error: String(err) };
    }
  });

/**
 * Alerts the studio about a new booking: email to admin_email and a
 * ready-to-open WhatsApp link built from admin_whatsapp.
 */
export const handleBookingStatusChange = createServerFn({ method: 'POST' })
  .inputValidator((data: { bookingId: string; status: 'confirmed' | 'cancelled' }) => {
    if (!data?.bookingId || !['confirmed', 'cancelled'].includes(data.status)) {
      throw new Error('bookingId and a valid status are required');
    }
    return data;
  })
  .handler(async ({ data }) => {
    const { loadBooking, sendEmail, confirmationHtml, cancellationHtml, studioAdmin, loadSettings, adminAlertHtml } = await import('./notifications.server');
    const { sendPush, buildBookingPush, recordNotification } = await import('./push.server');
    const booking = await loadBooking(data.bookingId);
    if (!booking) return { ok: false, reason: 'booking_not_found' as const };

    const db = studioAdmin();
    const settings = await loadSettings();
    const event = data.status === 'confirmed' ? 'booking.confirmed' as const : 'booking.cancelled' as const;
    const title = data.status === 'confirmed' ? 'Booking confirmed' : 'Booking cancelled';
    const message = `${booking.client_name} · ${booking.service_name} · ${booking.booking_date}${booking.booking_time ? ` at ${booking.booking_time.slice(0, 5)}` : ''}`;
    await recordNotification(event, title, message, booking.id);

    const push = await sendPush(buildBookingPush(event, booking));
    let clientEmail = false;
    if (booking.client_email) {
      try {
        await sendEmail(booking.client_email, `${title} — ${booking.booking_date}`, data.status === 'confirmed' ? confirmationHtml(booking) : cancellationHtml(booking));
        clientEmail = true;
      } catch (error) {
        console.error('[email] booking status email failed', error);
      }
    }

    let adminEmail = false;
    if (settings.admin_email) {
      try {
        await sendEmail(settings.admin_email, `${title} — ${booking.client_name}`, adminAlertHtml(booking));
        adminEmail = true;
      } catch (error) {
        console.error('[email] booking admin alert failed', error);
      }
    }
    if (data.status === 'confirmed') {
      await db.from('bookings').update({
        confirmation_email_status: clientEmail ? 'sent' : 'failed',
      }).eq('id', booking.id);
    }
    return { ok: true as const, clientEmail, adminEmail, push };
  });

export const testNotificationServices = createServerFn({ method: 'POST' })
  .inputValidator((data: { accessToken: string; email?: string }) => {
    if (!data?.accessToken) throw new Error('Not signed in');
    return data;
  })
  .handler(async ({ data }) => {
    const { studioAdmin, notificationConfig, sendEmail, shell } = await import('./notifications.server');
    const db = studioAdmin();
    const { data: authData, error: authError } = await db.auth.getUser(data.accessToken);
    if (authError || !authData.user) return { ok: false, reason: 'unauthorized' as const };
    const config = notificationConfig();
    const recipient = data.email ?? authData.user.email;
    if (!recipient) return { ok: false, reason: 'no_test_email' as const };
    await sendEmail(recipient, 'Afriframe notification test', shell('Notification services are connected', '<p>Your Afriframe email, Supabase, and server configuration test passed.</p>'));
    return { ok: true as const, checks: { supabase: Boolean(config.supabase), serviceRole: Boolean(config.serviceRole), resend: Boolean(config.resend), vapid: Boolean(config.vapidPublic && config.vapidPrivate && config.vapidSubject), email: true } };
  });

export const notifyAdminNewBooking = createServerFn({ method: 'POST' })
  .inputValidator((data: { bookingId: string }) => {
    if (!data?.bookingId) throw new Error('bookingId is required');
    return { bookingId: data.bookingId };
  })
  .handler(async ({ data }) => {
    const { loadBooking, loadSettings, sendEmail, adminAlertHtml, whatsappLink } =
      await import('./notifications.server');

    const booking = await loadBooking(data.bookingId);
    if (!booking) return { emailed: false, whatsappUrl: null as string | null };

    const settings = await loadSettings();
    let emailed = false;

    if (settings.admin_email) {
      try {
        await sendEmail(
          settings.admin_email,
          `New booking — ${booking.client_name}, ${booking.booking_date}`,
          adminAlertHtml(booking),
        );
        emailed = true;
      } catch (err) {
        console.error('[email] admin alert failed', err);
      }
    }

    return {
      emailed,
      whatsappUrl: settings.admin_whatsapp ? whatsappLink(settings.admin_whatsapp, booking) : null,
    };
  });

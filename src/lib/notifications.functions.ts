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

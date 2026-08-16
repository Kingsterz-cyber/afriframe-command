import { createFileRoute } from '@tanstack/react-router';

/**
 * Called by a Supabase database trigger (pg_net) whenever a booking is created
 * or changes status. Authenticated with a shared hook secret header.
 */
export const Route = createFileRoute('/api/public/push-dispatch')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env['AFRIFRAME_PUSH_HOOK_SECRET']?.trim();
        const provided = request.headers.get('x-afriframe-hook') ?? '';
        if (!expected || provided !== expected) {
          return new Response('Unauthorized', { status: 401 });
        }

        let payload: { event?: string; bookingId?: string };
        try {
          payload = (await request.json()) as { event?: string; bookingId?: string };
        } catch {
          return new Response('Invalid JSON', { status: 400 });
        }

        const event = payload.event;
        const bookingId = payload.bookingId;
        const allowed = ['booking.created', 'booking.confirmed', 'booking.cancelled'] as const;
        type Allowed = (typeof allowed)[number];

        if (!bookingId || !event || !allowed.includes(event as Allowed)) {
          return new Response('Invalid payload', { status: 400 });
        }

        const { loadBooking } = await import('@/lib/notifications.server');
        const { sendPush, buildBookingPush } = await import('@/lib/push.server');

        const booking = await loadBooking(bookingId);
        if (!booking) return Response.json({ ok: false, reason: 'booking_not_found' }, { status: 404 });

        const result = await sendPush(buildBookingPush(event as Allowed, booking));
        return Response.json({ ok: true, ...result });
      },
    },
  },
});

import { createFileRoute } from '@tanstack/react-router';

/**
 * Called by the service worker when the browser rotates a push subscription.
 * No user session is available at that point, so the request is validated by
 * requiring that the old endpoint already exists in the database.
 */
export const Route = createFileRoute('/api/public/push-resubscribe')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: {
          oldEndpoint?: string | null;
          subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
        };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return new Response('Invalid JSON', { status: 400 });
        }

        const next = payload.subscription;
        if (!next?.endpoint || !next.keys?.p256dh || !next.keys?.auth || !payload.oldEndpoint) {
          return new Response('Invalid payload', { status: 400 });
        }

        const { studioAdmin } = await import('@/lib/notifications.server');
        const db = studioAdmin();

        const { data: existing } = await db
          .from('push_subscriptions')
          .select('id, user_id, role')
          .eq('endpoint', payload.oldEndpoint)
          .maybeSingle();

        if (!existing) return new Response('Unknown subscription', { status: 404 });

        const { error } = await db
          .from('push_subscriptions')
          .update({
            endpoint: next.endpoint,
            p256dh: next.keys.p256dh,
            auth: next.keys.auth,
            last_seen_at: new Date().toISOString(),
          })
          .eq('id', (existing as { id: string }).id);

        if (error) return new Response('Update failed', { status: 500 });
        return Response.json({ ok: true });
      },
    },
  },
});

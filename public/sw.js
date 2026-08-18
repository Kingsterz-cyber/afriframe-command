/* Afriframe Studio CMS — push messaging service worker.
   This worker exists for Web Push delivery and app-launch handling only.
   It intentionally does NOT cache or intercept any network requests. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Afriframe", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Afriframe";
  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-maskable-512.png",
    tag: payload.tag || undefined,
    renotify: Boolean(payload.tag),
    timestamp: Date.now(),
    requireInteraction: payload.requireInteraction === true,
    data: {
      url: payload.url || "/bookings",
      bookingId: payload.bookingId || null,
      eventType: payload.eventType || null,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(
    (event.notification.data && event.notification.data.url) || "/bookings",
    self.location.origin,
  ).href;

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientList) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(target);
            } catch {
              /* focused window is enough */
            }
          }
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});

/* Chrome/Edge can rotate a subscription; re-subscribe and tell the server. */
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const applicationServerKey =
        event.oldSubscription && event.oldSubscription.options
          ? event.oldSubscription.options.applicationServerKey
          : undefined;
      if (!applicationServerKey) return;

      const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      await fetch("/api/public/push-resubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          oldEndpoint: event.oldSubscription ? event.oldSubscription.endpoint : null,
          subscription: subscription.toJSON(),
        }),
      });
    })(),
  );
});

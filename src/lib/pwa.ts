/**
 * Service-worker registration for Afriframe CMS.
 * The worker handles Web Push + notification clicks only — it never caches
 * or intercepts requests, so it cannot serve stale UI.
 * It is deliberately never registered inside the Lovable editor preview.
 */
const SW_PATH = "/sw.js";

export function pwaSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function blockedContext() {
  if (typeof window === "undefined") return true;
  const { hostname, search } = window.location;
  if (search.includes("sw=off")) return true;
  if (window.self !== window.top) return true;
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--")) return true;
  if (hostname === "lovableproject.com" || hostname.endsWith(".lovableproject.com")) return true;
  if (hostname === "lovableproject-dev.com" || hostname.endsWith(".lovableproject-dev.com")) return true;
  if (hostname === "beta.lovable.dev" || hostname.endsWith(".beta.lovable.dev")) return true;
  return false;
}

export function pwaBlocked() {
  return blockedContext();
}

async function unregisterExisting() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((r) => (r.active?.scriptURL ?? r.installing?.scriptURL ?? "").endsWith(SW_PATH))
      .map((r) => r.unregister()),
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!pwaSupported()) return null;

  if (blockedContext()) {
    await unregisterExisting();
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error("[pwa] service worker registration failed", error);
    return null;
  }
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}
